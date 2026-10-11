(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const CLAVE_HISTORIAL = "tachi_historial_v1";

  let ultimaRespuesta = "";
  let reconocimiento = null;
  let escuchando = false;
  let conversacionActiva = false;
  let procesando = false;
  let temporizadorEscucha = null;
  let numeroPregunta = 0;

  const estadoTachi = $("estadoTachi");
  const rostroTachi = $("rostroTachi");
  const entradaUsuario = $("entradaUsuario");
  const respuestaVoz = $("respuestaVoz");
  const listaHistorial = $("listaHistorial");

  function establecerEstado(texto, clase = "") {
    if (estadoTachi) estadoTachi.textContent = texto;

    if (rostroTachi) {
      rostroTachi.classList.remove(
        "escuchando",
        "pensando",
        "hablando"
      );

      if (clase) rostroTachi.classList.add(clase);
    }
  }

  function guardarMensajeHistorial(tipo, texto) {
    try {
      const historial = JSON.parse(
        localStorage.getItem(CLAVE_HISTORIAL) || "[]"
      );

      historial.push({
        tipo,
        texto,
        fecha: new Date().toLocaleString("es-SV")
      });

      localStorage.setItem(
        CLAVE_HISTORIAL,
        JSON.stringify(historial.slice(-100))
      );

      mostrarHistorial();
    } catch (error) {
      console.error("Error guardando historial:", error);
    }
  }

  function mostrarHistorial() {
    if (!listaHistorial) return;

    listaHistorial.replaceChildren();

    try {
      const historial = JSON.parse(
        localStorage.getItem(CLAVE_HISTORIAL) || "[]"
      );

      historial.slice().reverse().forEach((item) => {
        const elemento = document.createElement("div");
        elemento.className = "item-historial";

        const titulo = document.createElement("strong");
        titulo.textContent =
          item.tipo === "usuario" ? "Tú: " : "Tachi: ";

        const contenido = document.createElement("span");
        contenido.textContent = item.texto;

        elemento.append(titulo, contenido);

        if (item.fecha) {
          const fecha = document.createElement("small");
          fecha.textContent = item.fecha;
          elemento.appendChild(fecha);
        }

        listaHistorial.appendChild(elemento);
      });
    } catch (error) {
      console.error("Error mostrando historial:", error);
    }
  }

  // RESPUESTA AUTOMÁTICA DE TACHI
  function responder(mensaje, opciones = {}) {
    const texto = String(mensaje || "").trim();
    if (!texto) return;

    ultimaRespuesta = texto;

    if (respuestaVoz) {
      respuestaVoz.textContent = texto;
    }

    if (opciones.guardar !== false) {
      guardarMensajeHistorial("tachi", texto);
    }

    if (opciones.hablar === false) {
      terminarRespuesta(false);
      return;
    }

    hablarTexto(texto);
  }

  function hablarTexto(texto) {
    if (!("speechSynthesis" in window)) {
      establecerEstado(
        "No se puede reproducir voz en este navegador."
      );
      terminarRespuesta(false);
      return;
    }

    // Evita que una respuesta anterior se mezcle con la nueva.
    window.speechSynthesis.cancel();

    const voz = new SpeechSynthesisUtterance(String(texto));
    voz.lang = "es-SV";
    voz.rate = 1;
    voz.pitch = 1;
    voz.volume = 1;

    voz.onstart = () => {
      establecerEstado("Tachi está hablando…", "hablando");
    };

    voz.onend = () => {
      terminarRespuesta(true);
    };

    voz.onerror = (evento) => {
      console.error("Error de voz:", evento.error);
      terminarRespuesta(true);
    };

    window.speechSynthesis.speak(voz);
  }

  function terminarRespuesta(reanudar = true) {
    procesando = false;

    document.body.classList.remove("pensando");

    if (conversacionActiva && reanudar) {
      establecerEstado(
        "Puedes preguntarme otra cosa. Te escucho.",
        "escuchando"
      );

      programarEscucha();
    } else if (!conversacionActiva) {
      establecerEstado("Tachi está listo para ayudarte.");
    }
  }

  // ESCUCHA AUTOMÁTICA DESPUÉS DE CADA RESPUESTA
  function programarEscucha() {
    if (!conversacionActiva) return;

    clearTimeout(temporizadorEscucha);

    temporizadorEscucha = setTimeout(() => {
      if (!conversacionActiva || procesando || escuchando) return;

      iniciarEscucha();
    }, 900);
  }

  function iniciarEscucha() {
    if (!reconocimiento || !conversacionActiva) return;
    if (escuchando || procesando) return;

    try {
      reconocimiento.start();
    } catch (error) {
      console.warn("No se pudo iniciar el micrófono:", error);
      establecerEstado(
        "Pulsa Hablar para activar de nuevo el micrófono."
      );
    }
  }

  function activarConversacion() {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      responder(
        "Tu navegador no admite reconocimiento de voz. Prueba con Google Chrome o Microsoft Edge.",
        { guardar: false }
      );
      return;
    }

    if (conversacionActiva) {
      if (!escuchando && !procesando) iniciarEscucha();
      return;
    }

    conversacionActiva = true;

    reconocimiento = new SpeechRecognition();
    reconocimiento.lang = "es-SV";
    reconocimiento.continuous = false;
    reconocimiento.interimResults = false;
    reconocimiento.maxAlternatives = 1;

    reconocimiento.onstart = () => {
      escuchando = true;

      establecerEstado(
        "Te estoy escuchando… habla cuando quieras.",
        "escuchando"
      );

      if (respuestaVoz) {
        respuestaVoz.textContent = "Te estoy escuchando…";
      }
    };

    reconocimiento.onresult = async (evento) => {
      const texto =
        evento.results?.[0]?.[0]?.transcript?.trim() || "";

      if (!texto || !conversacionActiva) return;

      numeroPregunta++;
      procesando = true;

      if (entradaUsuario) entradaUsuario.value = texto;

      establecerEstado("Estoy preparando tu respuesta…", "pensando");
      document.body.classList.add("pensando");

      guardarMensajeHistorial("usuario", texto);

      await procesarComando(texto);
    };

    reconocimiento.onerror = (evento) => {
      escuchando = false;
      console.warn("Error del reconocimiento:", evento.error);

      if (
        evento.error === "not-allowed" ||
        evento.error === "service-not-allowed"
      ) {
        conversacionActiva = false;

        responder(
          "Necesitas permitir el acceso al micrófono en tu navegador.",
          { guardar: false }
        );
        return;
      }

      if (evento.error === "no-speech" && conversacionActiva) {
        programarEscucha();
      }
    };

    reconocimiento.onend = () => {
      escuchando = false;

      if (conversacionActiva && !procesando) {
        programarEscucha();
      }
    };

    iniciarEscucha();
  }

  function detenerConversacion() {
    conversacionActiva = false;
    escuchando = false;
    clearTimeout(temporizadorEscucha);

    if (reconocimiento) {
      try {
        reconocimiento.abort();
      } catch (error) {
        console.warn(error);
      }
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    establecerEstado("Voz detenida. Pulsa Hablar para continuar.");
  }

  // PROCESAMIENTO DE PREGUNTAS Y COMANDOS
  async function procesarComando(mensaje) {
    const texto = mensaje.trim();
    const t = texto.toLowerCase();

    try {
      if (/^(hola|hey|buenas|buenos días|buenas tardes|buenas noches)\b/i.test(t)) {
        responder("¡Hola! Soy Tachi, tu asistente. ¿Qué quieres saber?");
        return;
      }

      if (t.includes("cómo te llamas") || t.includes("quién eres")) {
        responder("Me llamo Tachi, tu asistente virtual.");
        return;
      }

      if (t.includes("qué hora es") || t.includes("dime la hora")) {
        responder("Son las " + new Date().toLocaleTimeString("es-SV", {
          hour: "2-digit",
          minute: "2-digit"
        }));
        return;
      }

      if (t.includes("qué fecha es") || t.includes("qué día es hoy")) {
        responder("Hoy es " + new Date().toLocaleDateString("es-SV", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        }));
        return;
      }

      if (t.includes("chiste") || t.includes("hazme reír")) {
        mostrarChiste();
        return;
      }

      if (t.includes("dato curioso")) {
        mostrarDato();
        return;
      }

      if (t.includes("trivia") || t.includes("pregunta de cultura general")) {
        mostrarTrivia();
        return;
      }

      if (
        t.startsWith("investiga ") ||
        t.startsWith("busca ") ||
        t.startsWith("buscar ") ||
        t.startsWith("investiga sobre ") ||
        t.startsWith("qué es ") ||
        t.startsWith("quién es ") ||
        t.startsWith("quién fue ")
      ) {
        const consulta = texto
          .replace(/^(investiga sobre|investiga|busca|buscar)\s+/i, "")
          .trim();

        await investigarTema(consulta || texto);
        return;
      }

      if (t.startsWith("calcula ")) {
        calcularOperacion(texto.replace(/^calcula\s+/i, ""));
        return;
      }

      if (t.includes("ayuda") || t.includes("qué puedes hacer")) {
        responder(
          "Puedo responder saludos, decirte la hora, contar chistes, darte datos curiosos, hacer cálculos e investigar temas en Wikipedia. Por ahora no tengo todas las capacidades de una inteligencia artificial como ChatGPT."
        );
        return;
      }

      responder(
        "He escuchado: " + texto +
        ". Todavía no tengo una respuesta preparada para esa pregunta. Puedes decir investiga seguido del tema que quieres consultar."
      );
    } catch (error) {
      console.error("Error procesando la pregunta:", error);
      responder("Lo siento, ocurrió un error al preparar la respuesta.");
    }
  }

  // INVESTIGACIÓN EN WIKIPEDIA
  async function investigarTema(consulta) {
    const resultado = $("resultadoInvestigacion");
    const boton = $("investigar");

    if (!consulta) {
      responder("Dime qué tema quieres investigar.");
      return;
    }

    if (resultado) resultado.textContent = "Buscando información…";
    if (boton) boton.disabled = true;

    try {
      const url =
        "https://es.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=search&srlimit=5&srsearch=" +
        encodeURIComponent(consulta);

      const respuesta = await fetch(url);

      if (!respuesta.ok) {
        throw new Error("No se pudo conectar con Wikipedia.");
      }

      const datos = await respuesta.json();
      const resultados = datos.query?.search || [];

      if (!resultados.length) {
        if (resultado) resultado.textContent = "No encontré resultados.";
        responder("No encontré resultados para " + consulta + ".");
        return;
      }

      if (resultado) {
        resultado.replaceChildren();

        resultados.forEach((item) => {
          const tarjeta = document.createElement("article");
          tarjeta.className = "resultado";

          const titulo = document.createElement("h3");
          titulo.textContent = item.title;

          const resumen = document.createElement("p");
          resumen.textContent = item.snippet
            .replace(/<[^>]*>/g, "")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, "&");

          const enlace = document.createElement("a");
          enlace.href =
            "https://es.wikipedia.org/?curid=" + item.pageid;
          enlace.target = "_blank";
          enlace.rel = "noopener noreferrer";
          enlace.textContent = "Leer más";

          tarjeta.append(titulo, resumen, enlace);
          resultado.appendChild(tarjeta);
        });
      }

      const primerResultado = resultados[0];
      const resumenVoz = primerResultado.snippet
        .replace(/<[^>]*>/g, "")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&");

      responder(
        "Encontré " + resultados.length +
        " resultados sobre " + consulta +
        ". El primero es " + primerResultado.title +
        ". " + resumenVoz
      );
    } catch (error) {
      console.error(error);

      if (resultado) {
        resultado.textContent =
          "No se pudo investigar. Comprueba tu conexión a internet.";
      }

      responder(
        "No pude consultar Wikipedia. Comprueba tu conexión a internet e inténtalo otra vez."
      );
    } finally {
      if (boton) boton.disabled = false;
    }
  }

  // CALCULADORA
  function calcularOperacion(expresion) {
    const resultado = $("resultadoCalculo");
    const limpia = expresion.replace(/,/g, ".").trim();

    if (!limpia || !/^[0-9+\-*/().%\s]+$/.test(limpia)) {
      responder("Esa operación no es válida. Prueba, por ejemplo, calcula 25 por 4 usando el símbolo de multiplicación.");
      return;
    }

    try {
      const valor = Function('"use strict"; return (' + limpia + ");")();

      if (typeof valor !== "number" || !Number.isFinite(valor)) {
        throw new Error("Operación no válida");
      }

      const respuesta = "El resultado es " + valor;

      if (resultado) resultado.textContent = respuesta;

      responder(respuesta);
    } catch (error) {
      if (resultado) resultado.textContent = "Operación no válida.";
      responder("No pude calcular esa operación. Revisa los números y símbolos.");
    }
  }

  // DIVERSIÓN
  function mostrarChiste() {
    const chistes = [
      "¿Por qué el libro de matemáticas estaba triste? Porque tenía muchos problemas.",
      "¿Qué hace una abeja en el gimnasio? ¡Zum-ba!",
      "¿Por qué la computadora fue al médico? Porque tenía un virus.",
      "¿Qué le dijo un semáforo a otro? No me mires, me estoy cambiando."
    ];

    const chiste = chistes[Math.floor(Math.random() * chistes.length)];
    const salida = $("resultadoDiversion");

    if (salida) salida.textContent = chiste;
    responder(chiste);
  }

  function mostrarDato() {
    const datos = [
      "Los pulpos tienen tres corazones.",
      "La luz del Sol tarda aproximadamente ocho minutos en llegar a la Tierra.",
      "Los tiburones existen desde antes que los árboles.",
      "La Tierra no es una esfera perfecta: está ligeramente achatada en los polos."
    ];

    const dato = datos[Math.floor(Math.random() * datos.length)];
    const salida = $("resultadoDiversion");

    if (salida) salida.textContent = dato;
    responder(dato);
  }

  function mostrarTrivia() {
    const preguntas = [
      {
        pregunta: "¿Cuál es el planeta más grande del sistema solar?",
        opciones: ["Marte", "Júpiter", "Venus"],
        correcta: "Júpiter"
      },
      {
        pregunta: "¿Cuántos lados tiene un hexágono?",
        opciones: ["Cinco", "Seis", "Ocho"],
        correcta: "Seis"
      },
      {
        pregunta: "¿Cuál es la capital de El Salvador?",
        opciones: ["San Salvador", "Santa Ana", "San Miguel"],
        correcta: "San Salvador"
      }
    ];

    const pregunta =
      preguntas[Math.floor(Math.random() * preguntas.length)];

    const salida = $("resultadoDiversion");

    if (salida) {
      salida.replaceChildren();

      const texto = document.createElement("p");
      texto.textContent = pregunta.pregunta;
      salida.appendChild(texto);

      pregunta.opciones.forEach((opcion) => {
        const boton = document.createElement("button");
        boton.textContent = opcion;

        boton.addEventListener("click", () => {
          const correcta = opcion === pregunta.correcta;
          const mensaje = correcta
            ? "¡Correcto! La respuesta es " + pregunta.correcta + "."
            : "No exactamente. La respuesta correcta es " +
              pregunta.correcta + ".";

          texto.textContent = pregunta.pregunta + " " + mensaje;
          salida.querySelectorAll("button").forEach((b) => {
            b.disabled = true;
          });

          responder(mensaje);
        });

        salida.appendChild(boton);
      });
    }

    responder(pregunta.pregunta + " Opciones: " + pregunta.opciones.join(", "));
  }

  // BOTONES Y CAMPOS
  function enviarTexto() {
    if (!entradaUsuario) return;

    const texto = entradaUsuario.value.trim();
    if (!texto) return;

    guardarMensajeHistorial("usuario", texto);
    entradaUsuario.value = "";

    procesando = true;
    establecerEstado("Estoy preparando tu respuesta…", "pensando");
    document.body.classList.add("pensando");

    procesarComando(texto);
  }

  if ($("enviarMensaje")) {
    $("enviarMensaje").addEventListener("click", enviarTexto);
  }

  if (entradaUsuario) {
    entradaUsuario.addEventListener("keydown", (evento) => {
      if (evento.key === "Enter") {
        evento.preventDefault();
        enviarTexto();
      }
    });
  }

  if ($("hablar")) {
    $("hablar").addEventListener("click", activarConversacion);
  }

  if ($("detenerVoz")) {
    $("detenerVoz").addEventListener("click", detenerConversacion);
  }

  if ($("repetirRespuesta")) {
    $("repetirRespuesta").addEventListener("click", () => {
      if (ultimaRespuesta) hablarTexto(ultimaRespuesta);
    });
  }

  if ($("investigar")) {
    $("investigar").addEventListener("click", () => {
      const campo = $("preguntaInvestigacion");
      investigarTema(campo ? campo.value.trim() : "");
    });
  }

  if ($("calcular")) {
    $("calcular").addEventListener("click", () => {
      const campo = $("operacion");
      calcularOperacion(campo ? campo.value : "");
    });
  }

  if ($("botonChiste")) {
    $("botonChiste").addEventListener("click", mostrarChiste);
  }

  if ($("botonTrivia")) {
    $("botonTrivia").addEventListener("click", mostrarTrivia);
  }

  if ($("botonDato")) {
    $("botonDato").addEventListener("click", mostrarDato);
  }

  if ($("actualizarHistorial")) {
    $("actualizarHistorial").addEventListener("click", mostrarHistorial);
  }

  if ($("borrarHistorial")) {
    $("borrarHistorial").addEventListener("click", () => {
      if (confirm("¿Quieres borrar todo el historial de Tachi?")) {
        localStorage.removeItem(CLAVE_HISTORIAL);
        mostrarHistorial();
      }
    });
  }

  mostrarHistorial();
  establecerEstado("Tachi está listo para ayudarte.");
})();
