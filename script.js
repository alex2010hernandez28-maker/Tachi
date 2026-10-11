(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const CLAVE_HISTORIAL = "tachi_historial_v1";

  let ultimaRespuesta = "";
  let reconocimiento = null;

  const entradaUsuario = $("entradaUsuario");
  const respuestaVoz = $("respuestaVoz");
  const estadoTachi = $("estadoTachi");
  const preguntaInvestigacion = $("preguntaInvestigacion");
  const investigarBtn = $("investigar");
  const resultadoInvestigacion = $("resultadoInvestigacion");
  const abrirBusqueda = $("abrirBusqueda");
  const operacion = $("operacion");
  const resultadoCalculo = $("resultadoCalculo");
  const resultadoDiversion = $("resultadoDiversion");
  const listaHistorial = $("listaHistorial");

  function establecerEstado(texto, clase = "") {
    estadoTachi.textContent = texto;
    document.body.classList.remove("escuchando", "pensando");
    if (clase) document.body.classList.add(clase);
  }

  function leerHistorial() {
    try {
      const datos = JSON.parse(
        localStorage.getItem(CLAVE_HISTORIAL) || "[]"
      );
      return Array.isArray(datos) ? datos : [];
    } catch {
      return [];
    }
  }

  function guardarMensajeHistorial(autor, mensaje) {
    const texto = String(mensaje || "").trim();
    if (!texto) return;

    const historial = leerHistorial();

    historial.push({
      autor: autor === "usuario" ? "usuario" : "tachi",
      mensaje: texto.slice(0, 5000),
      fecha: new Date().toISOString()
    });

    try {
      localStorage.setItem(
        CLAVE_HISTORIAL,
        JSON.stringify(historial.slice(-200))
      );
      mostrarHistorial();
    } catch (error) {
      console.warn("No se pudo guardar el historial.", error);
    }
  }

  function mostrarHistorial() {
    listaHistorial.replaceChildren();
    const historial = leerHistorial();

    if (!historial.length) {
      const mensaje = document.createElement("p");
      mensaje.className = "suave";
      mensaje.textContent = "Todavía no hay mensajes guardados.";
      listaHistorial.appendChild(mensaje);
      return;
    }

    historial.slice().reverse().forEach((item) => {
      const tarjeta = document.createElement("div");
      tarjeta.className = "item-historial";

      const cabecera = document.createElement("div");
      cabecera.className = "item-historial-top";

      const autor = document.createElement("strong");
      autor.textContent = item.autor === "usuario" ? "Tú" : "Tachi";

      const fecha = document.createElement("time");
      const date = new Date(item.fecha);
      fecha.textContent = Number.isNaN(date.getTime())
        ? ""
        : date.toLocaleString("es-SV", {
            dateStyle: "short",
            timeStyle: "short"
          });

      const texto = document.createElement("p");
      texto.textContent = item.mensaje || "";

      cabecera.append(autor, fecha);
      tarjeta.append(cabecera, texto);
      listaHistorial.appendChild(tarjeta);
    });
  }

  function responder(mensaje, opciones = {}) {
    const texto = String(mensaje || "").trim();
    if (!texto) return;

    ultimaRespuesta = texto;
    respuestaVoz.textContent = texto;
    establecerEstado("Respuesta lista. ¿Qué más necesitas?");

    if (opciones.guardar !== false) {
      guardarMensajeHistorial("tachi", texto);
    }

    if (opciones.hablar) {
      hablarTexto(texto);
    }
  }

  function hablarTexto(texto) {
    if (!("speechSynthesis" in window)) {
      establecerEstado("Tu navegador no admite voz en este momento.");
      return;
    }

    window.speechSynthesis.cancel();
    const voz = new SpeechSynthesisUtterance(texto);
    voz.lang = "es-SV";
    voz.rate = 1;
    window.speechSynthesis.speak(voz);
  }

  function enviarMensaje() {
    const texto = entradaUsuario.value.trim();

    if (!texto) {
      entradaUsuario.focus();
      responder("Escribe un mensaje para que pueda ayudarte.", {
        guardar: false
      });
      return;
    }

    entradaUsuario.value = "";
    procesarComando(texto);
  }

  function procesarComando(texto) {
    const comando = texto.trim();
    const normalizado = comando.toLowerCase();

    guardarMensajeHistorial("usuario", comando);

    if (/^(hola|buenas|hey|buenos días|buenas tardes|buenas noches)\b/.test(normalizado)) {
      responder("¡Hola! Soy Tachi. Puedo ayudarte con cálculos, búsquedas y entretenimiento.");
      return;
    }

    if (
      normalizado.includes("cómo te llamas") ||
      normalizado.includes("quién eres")
    ) {
      responder("Me llamo Tachi, tu asistente personal.");
      return;
    }

    if (normalizado.includes("qué hora") || normalizado === "hora") {
      responder("La hora de tu dispositivo es " +
        new Date().toLocaleTimeString("es-SV", {
          hour: "2-digit",
          minute: "2-digit"
        }) + ".");
      return;
    }

    if (normalizado.includes("fecha") || normalizado.includes("qué día es")) {
      responder("Hoy es " +
        new Date().toLocaleDateString("es-SV", {
          dateStyle: "full"
        }) + ".");
      return;
    }

    if (normalizado.includes("chiste")) {
      contarChiste();
      return;
    }

    if (normalizado.includes("dato curioso")) {
      mostrarDato();
      return;
    }

    if (/^(investiga|busca|buscar)\s+/i.test(comando)) {
      const tema = comando.replace(/^(investiga|busca|buscar)\s+/i, "").trim();

      if (tema) {
        preguntaInvestigacion.value = tema;
        investigarTema(tema);
      } else {
        responder("Dime qué tema quieres investigar.");
      }
      return;
    }

    if (/^calcula\s+/i.test(comando)) {
      operacion.value = comando.replace(/^calcula\s+/i, "").trim();
      calcularOperacion();
      return;
    }

    if (
      normalizado.includes("ayuda") ||
      normalizado.includes("qué puedes hacer")
    ) {
      responder("Puedo investigar temas, calcular operaciones, decirte la fecha y la hora, contar chistes y darte datos curiosos.");
      return;
    }

    responder("No entendí el mensaje. Prueba con «calcula 12 * 5», «investiga planetas» o «cuéntame un chiste».");
  }

  // INVESTIGACIÓN EN INTERNET
  async function investigarTema(tema) {
    const consulta = String(tema || "").trim();

    if (!consulta) {
      resultadoInvestigacion.textContent = "Escribe un tema antes de buscar.";
      preguntaInvestigacion.focus();
      return;
    }

    investigarBtn.disabled = true;
    investigarBtn.textContent = "Buscando…";
    resultadoInvestigacion.replaceChildren();

    const cargando = document.createElement("p");
    cargando.className = "suave";
    cargando.textContent = "Buscando información en Wikipedia…";
    resultadoInvestigacion.appendChild(cargando);

    abrirBusqueda.href =
      "https://www.google.com/search?q=" + encodeURIComponent(consulta);

    establecerEstado("Estoy buscando información en internet…", "pensando");

    try {
      const url =
        "https://es.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=search&srlimit=5&srsearch=" +
        encodeURIComponent(consulta);

      const respuesta = await fetch(url);

      if (!respuesta.ok) {
        throw new Error("La búsqueda no respondió correctamente.");
      }

      const datos = await respuesta.json();
      const resultados = datos?.query?.search || [];

      resultadoInvestigacion.replaceChildren();

      if (!resultados.length) {
        const aviso = document.createElement("p");
        aviso.className = "suave";
        aviso.textContent =
          "No encontré resultados. Prueba otras palabras o abre Google.";
        resultadoInvestigacion.appendChild(aviso);

        responder("No encontré resultados en Wikipedia para «" + consulta + "».");
        return;
      }

      resultados.forEach((resultado) => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "resultado-item";

        const titulo = document.createElement("h3");
        titulo.textContent = resultado.title || "Resultado";

        const resumen = document.createElement("p");
        const temporal = document.createElement("div");
        temporal.innerHTML = resultado.snippet || "Resumen no disponible.";
        resumen.textContent = (
          temporal.textContent || temporal.innerText || ""
        ).replace(/\s+/g, " ").trim();

        const enlace = document.createElement("a");
        enlace.href =
          "https://es.wikipedia.org/?curid=" +
          encodeURIComponent(resultado.pageid);
        enlace.target = "_blank";
        enlace.rel = "noopener noreferrer";
        enlace.textContent = "Leer en Wikipedia ↗";

        tarjeta.append(titulo, resumen, enlace);
        resultadoInvestigacion.appendChild(tarjeta);
      });

      const nota = document.createElement("p");
      nota.className = "suave";
      nota.textContent =
        "Información de Wikipedia. Puedes ampliar la búsqueda en Google.";
      resultadoInvestigacion.appendChild(nota);

      responder(
        "Encontré " + resultados.length +
        " resultados para «" + consulta + "». Revisa las tarjetas."
      );
    } catch (error) {
      console.error("Error al investigar:", error);

      resultadoInvestigacion.replaceChildren();

      const aviso = document.createElement("p");
      aviso.className = "suave";
      aviso.textContent =
        "No pude conectar con Wikipedia. Comprueba internet o utiliza el enlace de Google.";
      resultadoInvestigacion.appendChild(aviso);

      responder(
        "No pude conectar con Wikipedia. Comprueba tu conexión a internet o busca en Google."
      );
    } finally {
      investigarBtn.disabled = false;
      investigarBtn.textContent = "Buscar";
      document.body.classList.remove("pensando");
    }
  }

  // CALCULADORA
  function calcularOperacion() {
    const expresion = operacion.value.trim();

    if (!expresion) {
      resultadoCalculo.textContent = "Escribe una operación matemática.";
      return;
    }

    if (!/^[0-9+\-*/().%\s]+$/.test(expresion)) {
      resultadoCalculo.textContent =
        "Utiliza números, +, -, *, /, %, puntos y paréntesis.";
      return;
    }

    try {
      const resultado = Function(
        '"use strict"; return (' + expresion + ');'
      )();

      if (typeof resultado !== "number" || !Number.isFinite(resultado)) {
        throw new Error("Resultado no válido");
      }

      const numero = Number.isInteger(resultado)
        ? String(resultado)
        : String(Number(resultado.toFixed(8)));

      resultadoCalculo.textContent = "Resultado: " + numero;
      responder("El resultado de " + expresion + " es " + numero + ".");
    } catch {
      resultadoCalculo.textContent =
        "No pude resolver la operación. Revisa los números y operadores.";
    }
  }

  // ENTRETENIMIENTO
  const chistes = [
    "¿Qué hace una abeja en el gimnasio? ¡Zum-ba!",
    "¿Por qué estaba triste el libro de matemáticas? Porque tenía muchos problemas.",
    "¿Qué le dijo un cero a un ocho? ¡Bonito cinturón!",
    "¿Qué hace una computadora cuando tiene frío? Cierra Windows."
  ];

  const datos = [
    "Los pulpos tienen tres corazones.",
    "La luz del Sol tarda aproximadamente 8 minutos y 20 segundos en llegar a la Tierra.",
    "Los tiburones existen desde antes que los árboles.",
    "En Venus, un día dura más que un año venusiano."
  ];

  const trivias = [
    {
      pregunta: "¿Cuál es el planeta más grande del sistema solar?",
      opciones: "A) Marte · B) Júpiter · C) Venus",
      respuesta: "Júpiter"
    },
    {
      pregunta: "¿Cuántos lados tiene un hexágono?",
      opciones: "A) 5 · B) 6 · C) 8",
      respuesta: "6 lados"
    },
    {
      pregunta: "¿Cuál es el océano más grande?",
      opciones: "A) Pacífico · B) Atlántico · C) Índico",
      respuesta: "El océano Pacífico"
    }
  ];

  function aleatorio(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
  }

  function contarChiste() {
    const chiste = aleatorio(chistes);
    resultadoDiversion.textContent = chiste;
    responder(chiste);
  }

  function mostrarDato() {
    const dato = aleatorio(datos);
    resultadoDiversion.textContent = dato;
    responder(dato);
  }

  function mostrarTrivia() {
    const trivia = aleatorio(trivias);
    resultadoDiversion.replaceChildren();

    const pregunta = document.createElement("p");
    pregunta.textContent = trivia.pregunta;

    const opciones = document.createElement("p");
    opciones.textContent = trivia.opciones;

    const boton = document.createElement("button");
    boton.className = "secundario";
    boton.textContent = "Mostrar respuesta";

    boton.addEventListener("click", () => {
      const respuesta = document.createElement("p");
      respuesta.textContent = "Respuesta: " + trivia.respuesta;
      resultadoDiversion.appendChild(respuesta);
      boton.disabled = true;

      guardarMensajeHistorial(
        "tachi",
        "Trivia: " + trivia.pregunta +
        " Respuesta: " + trivia.respuesta
      );
    });

    resultadoDiversion.append(pregunta, opciones, boton);

    guardarMensajeHistorial(
      "tachi",
      "Pregunta trivia: " + trivia.pregunta + " " + trivia.opciones
    );
  }

  // RECONOCIMIENTO DE VOZ
  function iniciarReconocimiento() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      responder(
        "Este navegador no admite reconocimiento de voz. Puedes escribir tu mensaje.",
        { guardar: false }
      );
      return;
    }

    if (reconocimiento) {
      try {
        reconocimiento.abort();
      } catch {}
    }

    reconocimiento = new SpeechRecognition();
    reconocimiento.lang = "es-SV";
    reconocimiento.interimResults = false;
    reconocimiento.maxAlternatives = 1;

    reconocimiento.onstart = () => {
      establecerEstado("Te estoy escuchando… habla ahora.", "escuchando");
      respuestaVoz.textContent = "Te estoy escuchando…";
    };

    reconocimiento.onresult = (evento) => {
      const texto = evento.results?.[0]?.[0]?.transcript || "";
      entradaUsuario.value = texto;

      if (texto.trim()) {
        procesarComando(texto);
      }
    };

    reconocimiento.onerror = (evento) => {
      let mensaje = "No pude reconocer tu voz. Inténtalo otra vez.";

      if (
        evento.error === "not-allowed" ||
        evento.error === "service-not-allowed"
      ) {
        mensaje = "Permite el acceso al micrófono en tu navegador.";
      } else if (evento.error === "no-speech") {
        mensaje = "No detecté voz. Pulsa Hablar e inténtalo de nuevo.";
      }

      responder(mensaje, { guardar: false });
    };

    reconocimiento.onend = () => {
      document.body.classList.remove("escuchando");

      if (estadoTachi.textContent === "Te estoy escuchando… habla ahora.") {
        establecerEstado("Tu asistente está listo para ayudarte.");
      }
    };

    try {
      reconocimiento.start();
    } catch {
      responder(
        "No pude activar el micrófono. Espera un momento e inténtalo de nuevo.",
        { guardar: false }
      );
    }
  }

  // BOTONES Y EVENTOS
  $("enviarMensaje").addEventListener("click", enviarMensaje);

  entradaUsuario.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") enviarMensaje();
  });

  $("hablar").addEventListener("click", iniciarReconocimiento);

  $("detenerVoz").addEventListener("click", () => {
    if (reconocimiento) {
      try {
        reconocimiento.stop();
      } catch {}
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    document.body.classList.remove("escuchando");
    establecerEstado("Voz detenida. Puedes seguir escribiendo.");
  });

  $("repetirRespuesta").addEventListener("click", () => {
    if (ultimaRespuesta) {
      hablarTexto(ultimaRespuesta);
    } else {
      responder("Todavía no tengo una respuesta para repetir.", {
        guardar: false
      });
    }
  });

  investigarBtn.addEventListener("click", () => {
    investigarTema(preguntaInvestigacion.value);
  });

  preguntaInvestigacion.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
      investigarTema(preguntaInvestigacion.value);
    }
  });

  abrirBusqueda.addEventListener("click", () => {
    const tema = preguntaInvestigacion.value.trim();

    if (tema) {
      abrirBusqueda.href =
        "https://www.google.com/search?q=" + encodeURIComponent(tema);
    }
  });

  $("calcular").addEventListener("click", calcularOperacion);

  operacion.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") calcularOperacion();
  });

  $("botonChiste").addEventListener("click", contarChiste);
  $("botonTrivia").addEventListener("click", mostrarTrivia);
  $("botonDato").addEventListener("click", mostrarDato);
  $("actualizarHistorial").addEventListener("click", mostrarHistorial);

  $("borrarHistorial").addEventListener("click", () => {
    if (!confirm("¿Quieres borrar todo el historial de Tachi?")) return;

    try {
      localStorage.removeItem(CLAVE_HISTORIAL);
      mostrarHistorial();
      establecerEstado("Historial borrado correctamente.");
    } catch {
      establecerEstado("No pude borrar el historial de este navegador.");
    }
  });

  mostrarHistorial();
})();
