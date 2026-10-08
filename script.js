const hablarBtn = document.getElementById("hablar");
const respuestaVoz = document.getElementById("respuestaVoz");

const textoRepetir = document.getElementById("textoRepetir");
const repetirBtn = document.getElementById("repetir");

const preguntaInvestigacion = document.getElementById("preguntaInvestigacion");
const investigarBtn = document.getElementById("investigar");
const resultadoInvestigacion = document.getElementById("resultadoInvestigacion");
const abrirBusquedaBtn = document.getElementById("abrirBusqueda");

const rostroTachi = document.getElementById("rostroTachi");
const estadoTachi = document.getElementById("estadoTachi");

const ecuacion = document.getElementById("ecuacion");
const resolverBtn = document.getElementById("resolver");
const resultadoMatematico = document.getElementById("resultadoMatematico");

const archivoMusica = document.getElementById("archivoMusica");
const reproductor = document.getElementById("reproductor");
const playMusica = document.getElementById("playMusica");
const pausaMusica = document.getElementById("pausaMusica");
const stopMusica = document.getElementById("stopMusica");
const volumenMusica = document.getElementById("volumenMusica");

const sorprendemeBtn = document.getElementById("sorprendeme");
const triviaBtn = document.getElementById("trivia");
const adivinanzaBtn = document.getElementById("adivinanza");
const chisteBtn = document.getElementById("chiste");
const piedraPapelTijeraBtn = document.getElementById("piedraPapelTijera");

const puntosTexto = document.getElementById("puntos");
const resultadoJuego = document.getElementById("resultadoJuego");
const opcionesPPT = document.getElementById("opcionesPPT");

const respuestaUsuario = document.getElementById("respuestaUsuario");
const comprobarTriviaBtn = document.getElementById("comprobarTrivia");
const zonaRespuesta = document.getElementById("zonaRespuesta");

let puntos = 0;
let estadoActual = "normal";
let temporizadorDormir;

const rostrosTachi = {
  normal: "tachi-normal.png",
  escuchando: "tachi-escuchando.png",
  hablando: "tachi-hablando.png",
  investigando: "tachi-investigando.png",
  sorprendido: "tachi-sorprendido.png",
  feliz: "tachi-feliz.png",
  dormido: "tachi-dormido.png"
};

/* =========================
   CAMBIO DE ESTADO
========================= */

function cambiarEstado(estado) {
  if (!rostrosTachi[estado]) {
    estado = "normal";
  }

  estadoActual = estado;

  rostroTachi.parentElement.classList.add("cambiando");

  setTimeout(() => {
    rostroTachi.src = rostrosTachi[estado];

    const nombres = {
      normal: "Normal",
      escuchando: "Escuchando",
      hablando: "Hablando",
      investigando: "Investigando",
      sorprendido: "Sorprendido",
      feliz: "Feliz",
      dormido: "Dormido"
    };

    estadoTachi.textContent = nombres[estado];

    document.body.className =
      document.body.className
        .split(" ")
        .filter(clase => !clase.startsWith("tachi-"))
        .join(" ");

    document.body.classList.add(`tachi-${estado}`);

    rostroTachi.parentElement.classList.remove("cambiando");
  }, 150);
}

/* =========================
   VOZ DE TACHI
========================= */

function hablar(texto) {
  if (!texto) return;

  speechSynthesis.cancel();

  cambiarEstado("hablando");

  const voz = new SpeechSynthesisUtterance(texto);
  voz.lang = "es-SV";
  voz.rate = 1;
  voz.pitch = 1;

  voz.onend = () => {
    cambiarEstado("normal");
    iniciarTemporizadorDormir();
  };

  speechSynthesis.speak(voz);
}

/* =========================
   DESPERTAR Y DORMIR
========================= */

function despertarRobot() {
  clearTimeout(temporizadorDormir);
  cambiarEstado("normal");
}

function dormirRobot() {
  if (speechSynthesis.speaking) return;

  cambiarEstado("dormido");
}

function iniciarTemporizadorDormir() {
  clearTimeout(temporizadorDormir);

  temporizadorDormir = setTimeout(() => {
    dormirRobot();
  }, 5000);
}

/* =========================
   REPETIR TEXTO
========================= */

repetirBtn.addEventListener("click", () => {
  despertarRobot();

  const texto = textoRepetir.value.trim();

  if (!texto) {
    hablar("Escribe algo para que pueda repetirlo.");
    return;
  }

  respuestaVoz.textContent = texto;
  hablar(texto);
});

textoRepetir.addEventListener("keydown", evento => {
  if (evento.key === "Enter") {
    repetirBtn.click();
  }
});

/* =========================
   RECONOCIMIENTO DE VOZ
========================= */

const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

let recognition = null;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();

  recognition.lang = "es-SV";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    despertarRobot();
    cambiarEstado("escuchando");
    respuestaVoz.textContent = "🎤 Te escucho...";
  };

  recognition.onresult = evento => {
    const texto = evento.results[0][0].transcript;

    respuestaVoz.textContent = `Tú: ${texto}`;

    procesarComando(texto);
  };

  recognition.onerror = () => {
    cambiarEstado("normal");
    respuestaVoz.textContent = "No pude entenderte 😕";
    iniciarTemporizadorDormir();
  };

  recognition.onend = () => {
    if (estadoActual === "escuchando") {
      cambiarEstado("normal");
    }

    iniciarTemporizadorDormir();
  };
}

hablarBtn.addEventListener("click", () => {
  if (!recognition) {
    respuestaVoz.textContent =
      "Tu navegador no permite reconocimiento de voz.";
    return;
  }

  despertarRobot();

  try {
    recognition.start();
  } catch (error) {
    console.log("El reconocimiento ya estaba activo.");
  }
});

/* =========================
   PROCESAR COMANDOS
========================= */

function procesarComando(textoOriginal) {
  const texto = textoOriginal.toLowerCase().trim();

  despertarRobot();

  if (
    texto.includes("qué hora") ||
    texto.includes("que hora") ||
    texto.includes("hora es")
  ) {
    const ahora = new Date();

    let hora = ahora.getHours();
    const minutos = String(ahora.getMinutes()).padStart(2, "0");

    const periodo = hora >= 12 ? "PM" : "AM";

    hora = hora % 12;

    if (hora === 0) hora = 12;

    hablar(`Son las ${hora}:${minutos} ${periodo}.`);
    return;
  }

  if (
    texto.includes("qué fecha") ||
    texto.includes("que fecha") ||
    texto.includes("qué día") ||
    texto.includes("que dia")
  ) {
    const fecha = new Date();

    const fechaTexto = fecha.toLocaleDateString("es-SV", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    hablar(`Hoy es ${fechaTexto}.`);
    return;
  }

  if (
    texto.includes("hola") ||
    texto.includes("buenos días") ||
    texto.includes("buenos dias") ||
    texto.includes("buenas tardes") ||
    texto.includes("buenas noches")
  ) {
    cambiarEstado("feliz");
    hablar("¡Hola! Me alegra escucharte.");
    return;
  }

  if (
    texto.includes("cómo estás") ||
    texto.includes("como estas")
  ) {
    cambiarEstado("feliz");
    hablar("Estoy funcionando perfectamente y listo para ayudarte.");
    return;
  }

  if (
    texto.includes("adiós") ||
    texto.includes("adios") ||
    texto.includes("hasta luego")
  ) {
    hablar("Hasta luego. Nos vemos pronto.");
    return;
  }

  if (
    texto.startsWith("investiga ") ||
    texto.startsWith("investigar ") ||
    texto.startsWith("busca ") ||
    texto.startsWith("buscar ") ||
    texto.startsWith("quiero investigar ")
  ) {
    let pregunta = texto;

    const prefijos = [
      "quiero investigar ",
      "investiga ",
      "investigar ",
      "busca ",
      "buscar "
    ];

    for (const prefijo of prefijos) {
      if (pregunta.startsWith(prefijo)) {
        pregunta = pregunta.slice(prefijo.length).trim();
        break;
      }
    }

    investigarEnInternet(pregunta);
    return;
  }

  if (
    texto.includes("sorpréndeme") ||
    texto.includes("sorprendeme")
  ) {
    sorpresa();
    return;
  }

  if (
    texto === "trivia" ||
    texto.includes("hazme una trivia") ||
    texto.includes("quiero una trivia")
  ) {
    iniciarTrivia();
    return;
  }

  if (
    texto.includes("adivinanza") ||
    texto.includes("dime una adivinanza")
  ) {
    iniciarAdivinanza();
    return;
  }

  if (
    texto.includes("cuéntame un chiste") ||
    texto.includes("cuentame un chiste") ||
    texto === "chiste"
  ) {
    contarChiste();
    return;
  }

  if (
    texto.includes("piedra papel o tijera") ||
    texto.includes("piedra papel tijera")
  ) {
    iniciarPiedraPapelTijera();
    return;
  }

  if (
    texto.includes("resolver") &&
    texto.length > 9
  ) {
    const operacion = texto
      .replace("resolver", "")
      .trim();

    resolverMatematica(operacion);
    return;
  }

  hablar(
    "No reconocí ese comando. Puedes pedirme la hora, la fecha, una investigación, una trivia, una adivinanza, un chiste o jugar."
  );
}

/* =========================
   INVESTIGACIÓN
========================= */

async function investigarEnInternet(pregunta) {
  if (!pregunta) {
    hablar("Dime qué quieres investigar.");
    return;
  }

  clearTimeout(temporizadorDormir);

  cambiarEstado("investigando");

  resultadoInvestigacion.textContent =
    "🔎 Estoy investigando...";

  try {
    const urlBusqueda =
      "https://es.wikipedia.org/w/api.php" +
      "?action=query" +
      "&list=search" +
      "&srsearch=" +
      encodeURIComponent(pregunta) +
      "&format=json" +
      "&origin=*";

    const respuesta = await fetch(urlBusqueda);
    const datos = await respuesta.json();

    if (
      !datos.query ||
      !datos.query.search ||
      datos.query.search.length === 0
    ) {
      resultadoInvestigacion.textContent =
        "No encontré información suficiente.";

      cambiarEstado("sorprendido");
      hablar("No encontré información suficiente sobre eso.");
      return;
    }

    const titulo = datos.query.search[0].title;

    const urlArticulo =
      "https://es.wikipedia.org/w/api.php" +
      "?action=query" +
      "&prop=extracts" +
      "&exintro=1" +
      "&explaintext=1" +
      "&redirects=1" +
      "&titles=" +
      encodeURIComponent(titulo) +
      "&format=json" +
      "&origin=*";

    const respuestaArticulo = await fetch(urlArticulo);
    const datosArticulo = await respuestaArticulo.json();

    const paginas = datosArticulo.query.pages;
    const pagina = Object.values(paginas)[0];

    const extracto =
      pagina.extract ||
      "No encontré una explicación disponible.";

    resultadoInvestigacion.innerHTML = `
      <strong>${escapeHTML(titulo)}</strong>
      <br><br>
      ${escapeHTML(extracto)}
    `;

    const textoVoz = resumirParaVoz(extracto);

    hablar(
      `Encontré información sobre ${titulo}. ${textoVoz}`
    );

  } catch (error) {
    console.error(error);

    resultadoInvestigacion.textContent =
      "No pude conectarme a Internet.";

    cambiarEstado("sorprendido");

    hablar(
      "No pude conectarme a Internet en este momento."
    );
  }
}

function resumirParaVoz(texto) {
  if (texto.length <= 850) {
    return texto;
  }

  return texto.slice(0, 850) + "...";
}

function escapeHTML(texto) {
  return texto
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

investigarBtn.addEventListener("click", () => {
  despertarRobot();

  investigarEnInternet(
    preguntaInvestigacion.value.trim()
  );
});

preguntaInvestigacion.addEventListener("keydown", evento => {
  if (evento.key === "Enter") {
    investigarBtn.click();
  }
});

abrirBusquedaBtn.addEventListener("click", () => {
  const pregunta =
    preguntaInvestigacion.value.trim();

  if (!pregunta) return;

  window.open(
    "https://www.google.com/search?q=" +
    encodeURIComponent(pregunta),
    "_blank"
  );
});

/* =========================
   MATEMÁTICAS
========================= */

function resolverMatematica(entrada) {
  const texto = entrada.trim().toLowerCase();

  if (!texto) {
    resultadoMatematico.textContent =
      "Escribe una operación o ecuación.";
    return;
  }

  const ecuacionLineal =
    texto.match(
      /^(-?\d*\.?\d*)x\s*([+-])\s*(-?\d*\.?\d*)\s*=\s*(-?\d*\.?\d*)$/
    );

  if (ecuacionLineal) {
    let a = ecuacionLineal[1];

    if (a === "" || a === "+") {
      a = 1;
    } else if (a === "-") {
      a = -1;
    } else {
      a = Number(a);
    }

    const operador = ecuacionLineal[2];
    const b = Number(ecuacionLineal[3]);
    const c = Number(ecuacionLineal[4]);

    if (operador === "-") {
      const resultado = (c + b) / a;

      resultadoMatematico.textContent =
        `x = ${resultado}`;

      hablar(`La respuesta es x igual a ${resultado}.`);
      return;
    }

    const resultado = (c - b) / a;

    resultadoMatematico.textContent =
      `x = ${resultado}`;

    hablar(`La respuesta es x igual a ${resultado}.`);
    return;
  }

  let expresion = texto
    .replaceAll("×", "*")
    .replaceAll("÷", "/")
    .replaceAll(",", ".")
    .replace(/\s+/g, "");

  expresion = expresion.replace(
    /(\d)\s*x\s*(\d)/g,
    "$1*$2"
  );

  expresion = expresion.replace(
    /(\d)\s*x/g,
    "$1*"
  );

  expresion = expresion.replace(
    /x\s*(\d)/g,
    "*$1"
  );

  expresion = expresion.replace(
    /(\d+)%/g,
    "($1/100)"
  );

  expresion = expresion.replace(
    /(\d+(?:\.\d+)?)\^(\d+(?:\.\d+)?)/g,
    "Math.pow($1,$2)"
  );

  expresion = expresion.replace(
    /√(\d+(?:\.\d+)?)/g,
    "Math.sqrt($1)"
  );

  if (
    !/^[0-9+\-*/().,%Mathpowsqrt]+$/.test(
      expresion
    )
  ) {
    resultadoMatematico.textContent =
      "No pude interpretar esa operación.";

    hablar(
      "No pude interpretar esa operación."
    );

    return;
  }

  try {
    const resultado = Function(
      `"use strict"; return (${expresion})`
    )();

    if (
      typeof resultado !== "number" ||
      !Number.isFinite(resultado)
    ) {
      throw new Error("Resultado inválido");
    }

    resultadoMatematico.textContent =
      `Resultado: ${resultado}`;

    hablar(`El resultado es ${resultado}.`);

  } catch (error) {
    resultadoMatematico.textContent =
      "No pude resolver esa operación.";

    hablar(
      "No pude resolver esa operación."
    );
  }
}

resolverBtn.addEventListener("click", () => {
  despertarRobot();
  resolverMatematica(ecuacion.value);
});

ecuacion.addEventListener("keydown", evento => {
  if (evento.key === "Enter") {
    resolverBtn.click();
  }
});

/* =========================
   MÚSICA
========================= */

archivoMusica.addEventListener("change", () => {
  const archivo = archivoMusica.files[0];

  if (!archivo) return;

  reproductor.src =
    URL.createObjectURL(archivo);

  reproductor.load();

  hablar(`He cargado ${archivo.name}.`);
});

playMusica.addEventListener("click", () => {
  reproductor.play();
});

pausaMusica.addEventListener("click", () => {
  reproductor.pause();
});

stopMusica.addEventListener("click", () => {
  reproductor.pause();
  reproductor.currentTime = 0;
});

volumenMusica.addEventListener("input", () => {
  reproductor.volume =
    Number(volumenMusica.value);
});

/* =========================
   ENTRETENIMIENTO
========================= */

const chistes = [
  "¿Qué hace una abeja en el gimnasio? ¡Zum-ba!",
  "¿Qué le dijo un techo a otro techo? Techo de menos.",
  "¿Por qué el libro de matemáticas estaba triste? Porque tenía demasiados problemas.",
  "¿Qué hace una computadora cuando tiene frío? Cierra Windows.",
  "¿Cuál es el colmo de un electricista? No encontrar su corriente de trabajo."
];

const adivinanzas = [
  {
    pregunta: "Tengo agujas y no sé coser. ¿Qué soy?",
    respuesta: "reloj"
  },
  {
    pregunta: "Cuanto más me quitas, más grande me hago. ¿Qué soy?",
    respuesta: "agujero"
  },
  {
    pregunta: "Tengo dientes pero no puedo morder. ¿Qué soy?",
    respuesta: "peine"
  },
  {
    pregunta: "Vuelo sin alas y lloro sin ojos. ¿Qué soy?",
    respuesta: "nube"
  }
];

const trivias = [
  {
    pregunta: "¿Cuál es el planeta más grande del sistema solar?",
    respuesta: "jupiter"
  },
  {
    pregunta: "¿Cuántos continentes hay en el modelo de siete continentes?",
    respuesta: "7"
  },
  {
    pregunta: "¿Cuál es el océano más grande?",
    respuesta: "pacifico"
  },
  {
    pregunta: "¿Qué animal es conocido como el rey de la selva?",
    respuesta: "leon"
  },
  {
    pregunta: "¿Cuántos lados tiene un hexágono?",
    respuesta: "6"
  }
];

let preguntaActual = null;
let tipoPreguntaActual = null;

function actualizarPuntos(cantidad) {
  puntos += cantidad;
  puntosTexto.textContent = puntos;
}

function iniciarTrivia() {
  const trivia =
    trivias[Math.floor(Math.random() * trivias.length)];

  preguntaActual = trivia;
  tipoPreguntaActual = "trivia";

  cambiarEstado("feliz");

  resultadoJuego.textContent =
    `🧠 ${trivia.pregunta}`;

  zonaRespuesta.classList.remove("oculto");

  hablar(trivia.pregunta);
}

function iniciarAdivinanza() {
  const adivinanza =
    adivinanzas[
      Math.floor(Math.random() * adivinanzas.length)
    ];

  preguntaActual = adivinanza;
  tipoPreguntaActual = "adivinanza";

  cambiarEstado("sorprendido");

  resultadoJuego.textContent =
    `🧩 ${adivinanza.pregunta}`;

  zonaRespuesta.classList.remove("oculto");

  hablar(adivinanza.pregunta);
}

function contarChiste() {
  const chiste =
    chistes[
      Math.floor(Math.random() * chistes.length)
    ];

  cambiarEstado("feliz");

  resultadoJuego.textContent =
    `😂 ${chiste}`;

  hablar(chiste);
}

function iniciarPiedraPapelTijera() {
  cambiarEstado("feliz");

  opcionesPPT.classList.remove("oculto");
  zonaRespuesta.classList.add("oculto");

  resultadoJuego.textContent =
    "✊ Elige piedra, papel o tijera.";

  hablar("Elige piedra, papel o tijera.");
}

function jugarPPT(eleccionUsuario) {
  const opciones = [
    "piedra",
    "papel",
    "tijera"
  ];

  const eleccionTachi =
    opciones[
      Math.floor(Math.random() * opciones.length)
    ];

  let resultado;

  if (eleccionUsuario === eleccionTachi) {
    resultado = "Empate.";
  } else if (
    (eleccionUsuario === "piedra" &&
      eleccionTachi === "tijera") ||
    (eleccionUsuario === "papel" &&
      eleccionTachi === "piedra") ||
    (eleccionUsuario === "tijera" &&
      eleccionTachi === "papel")
  ) {
    resultado = "¡Ganaste! +10 puntos.";
    actualizarPuntos(10);
    cambiarEstado("feliz");
  } else {
    resultado = "Esta vez gané yo.";
    cambiarEstado("sorprendido");
  }

  resultadoJuego.textContent =
    `Tú: ${eleccionUsuario} | Tachi: ${eleccionTachi} | ${resultado}`;

  hablar(
    `Tú elegiste ${eleccionUsuario} y yo elegí ${eleccionTachi}. ${resultado}`
  );
}

function comprobarRespuesta() {
  if (!preguntaActual) return;

  const respuesta =
    respuestaUsuario.value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const correcta =
    preguntaActual.respuesta
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  if (respuesta === correcta) {
    actualizarPuntos(10);
    cambiarEstado("feliz");

    resultadoJuego.textContent =
      "🎉 ¡Correcto! Ganaste 10 puntos.";

    hablar("¡Correcto! Ganaste 10 puntos.");

  } else {
    cambiarEstado("sorprendido");

    resultadoJuego.textContent =
      "❌ No es correcto. Inténtalo otra vez.";

    hablar("No es correcto. Inténtalo otra vez.");
  }
}

function sorpresa() {
  const opciones = [
    iniciarTrivia,
    iniciarAdivinanza,
    contarChiste,
    iniciarPiedraPapelTijera
  ];

  cambiarEstado("sorprendido");

  const funcion =
    opciones[
      Math.floor(Math.random() * opciones.length)
    ];

  funcion();
}

sorprendemeBtn.addEventListener(
  "click",
  sorpresa
);

triviaBtn.addEventListener(
  "click",
  iniciarTrivia
);

adivinanzaBtn.addEventListener(
  "click",
  iniciarAdivinanza
);

chisteBtn.addEventListener(
  "click",
  contarChiste
);

piedraPapelTijeraBtn.addEventListener(
  "click",
  iniciarPiedraPapelTijera
);

comprobarTriviaBtn.addEventListener(
  "click",
  comprobarRespuesta
);

respuestaUsuario.addEventListener(
  "keydown",
  evento => {
    if (evento.key === "Enter") {
      comprobarRespuesta();
    }
  }
);

document
  .querySelectorAll("#opcionesPPT button")
  .forEach(boton => {
    boton.addEventListener("click", () => {
      jugarPPT(
        boton.dataset.eleccion
      );
    });
  });

/* =========================
   INICIO
========================= */

cambiarEstado("normal");
iniciarTemporizadorDormir();
