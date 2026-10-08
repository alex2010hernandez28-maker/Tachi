const hablarBtn = document.getElementById("hablar");
const repetirBtn = document.getElementById("repetir");
const textoRepetir = document.getElementById("textoRepetir");

const respuestaVoz = document.getElementById("respuestaVoz");
const estadoTachi = document.getElementById("estadoTachi");
const rostroTachi = document.getElementById("rostroTachi");

const investigarBtn = document.getElementById("investigar");
const preguntaInvestigacion = document.getElementById("preguntaInvestigacion");
const resultadoInvestigacion = document.getElementById("resultadoInvestigacion");
const abrirBusqueda = document.getElementById("abrirBusqueda");

const sorprendemeBtn = document.getElementById("sorprendeme");
const triviaBtn = document.getElementById("trivia");
const adivinanzaBtn = document.getElementById("adivinanza");
const chisteBtn = document.getElementById("chiste");
const piedraPapelTijeraBtn = document.getElementById("piedraPapelTijera");

const puntosElemento = document.getElementById("puntos");
const resultadoJuego = document.getElementById("resultadoJuego");
const opcionesPPT = document.getElementById("opcionesPPT");
const zonaRespuesta = document.getElementById("zonaRespuesta");
const respuestaUsuario = document.getElementById("respuestaUsuario");
const comprobarTrivia = document.getElementById("comprobarTrivia");

const ecuacionInput = document.getElementById("ecuacion");
const resolverBtn = document.getElementById("resolver");
const resultadoMatematico = document.getElementById("resultadoMatematico");

const archivoMusica = document.getElementById("archivoMusica");
const reproductor = document.getElementById("reproductor");
const playMusica = document.getElementById("playMusica");
const pausaMusica = document.getElementById("pausaMusica");
const stopMusica = document.getElementById("stopMusica");
const volumenMusica = document.getElementById("volumenMusica");

let puntos = 0;
let temporizadorDormir;
let vozActiva = null;
let idVoz = 0;

const rostrosTachi = {
    normal: "tachi-normal.png",
    escuchando: "tachi-escuchando.png",
    hablando: "tachi-hablando.png",
    investigando: "tachi-investigando.png",
    sorprendido: "tachi-sorprendido.png",
    feliz: "tachi-feliz.png",
    dormido: "tachi-dormido.png"
};

function cambiarEstado(estado) {
    if (!rostroTachi || !estadoTachi) return;

    clearTimeout(temporizadorDormir);

    rostroTachi.classList.add("cambiando");

    setTimeout(() => {
        rostroTachi.src = rostrosTachi[estado] || rostrosTachi.normal;

        const nombres = {
            normal: "Normal",
            escuchando: "Escuchando",
            hablando: "Hablando",
            investigando: "Investigando",
            sorprendido: "Sorprendido",
            feliz: "Feliz",
            dormido: "Dormido"
        };

        estadoTachi.textContent = nombres[estado] || "Normal";

        document.body.classList.remove(
            "tachi-escuchando",
            "tachi-hablando",
            "tachi-investigando",
            "tachi-dormido"
        );

        if (estado !== "normal") {
            document.body.classList.add(`tachi-${estado}`);
        }

        rostroTachi.classList.remove("cambiando");
    }, 120);
}

function programarDormir() {
    clearTimeout(temporizadorDormir);

    temporizadorDormir = setTimeout(() => {
        cambiarEstado("dormido");
    }, 5000);
}

function obtenerVoz() {
    if (!("speechSynthesis" in window)) {
        return null;
    }

    const voces = speechSynthesis.getVoices();

    if (!voces.length) {
        return null;
    }

    if (vozActiva) {
        return vozActiva;
    }

    const vozEspanol = voces.find(voz =>
        voz.lang.toLowerCase().startsWith("es")
    );

    vozActiva = vozEspanol || voces[0];

    return vozActiva;
}

speechSynthesis.onvoiceschanged = () => {
    obtenerVoz();
};

function pausaSegunPuntuacion(texto) {
    const limpio = texto.trim();

    if (limpio.endsWith("...")) {
        return 650;
    }

    if (limpio.endsWith("?") || limpio.endsWith("!")) {
        return 500;
    }

    if (limpio.endsWith(".") || limpio.endsWith(":")) {
        return 450;
    }

    if (limpio.endsWith(";")) {
        return 300;
    }

    if (limpio.endsWith(",")) {
        return 180;
    }

    return 80;
}

function dividirTexto(texto) {
    return texto
        .replace(/\s+/g, " ")
        .trim()
        .split(/(?<=[,.!?;:])\s+/)
        .filter(parte => parte.trim() !== "");
}

function hablar(texto) {
    if (!("speechSynthesis" in window)) {
        respuestaVoz.textContent =
            "Tu navegador no permite reproducción de voz.";
        return;
    }

    if (!texto || !texto.trim()) return;

    idVoz++;
    const idActual = idVoz;

    speechSynthesis.cancel();

    cambiarEstado("hablando");

    const partes = dividirTexto(texto);

    if (!partes.length) return;

    const reproducirParte = (indice) => {
        if (idActual !== idVoz) return;

        if (indice >= partes.length) {
            cambiarEstado("normal");
            programarDormir();
            return;
        }

        const parte = partes[indice].trim();

        const voz = new SpeechSynthesisUtterance(parte);

        voz.lang = "es-SV";
        voz.rate = 0.96;
        voz.pitch = 1.02;
        voz.volume = 1;

        const vozSeleccionada = obtenerVoz();

        if (vozSeleccionada) {
            voz.voice = vozSeleccionada;
        }

        voz.onend = () => {
            if (idActual !== idVoz) return;

            const pausa = pausaSegunPuntuacion(parte);

            setTimeout(() => {
                reproducirParte(indice + 1);
            }, pausa);
        };

        voz.onerror = () => {
            if (idActual !== idVoz) return;

            setTimeout(() => {
                reproducirParte(indice + 1);
            }, 100);
        };

        speechSynthesis.speak(voz);
    };

    setTimeout(() => {
        if (idActual === idVoz) {
            reproducirParte(0);
        }
    }, 120);
}

function actualizarPuntos(cantidad) {
    puntos += cantidad;

    if (puntos < 0) {
        puntos = 0;
    }

    puntosElemento.textContent = puntos;
}

function responder(texto) {
    respuestaVoz.textContent = texto;
    hablar(texto);
}

function obtenerHora() {
    return new Date().toLocaleTimeString("es-SV", {
        hour: "numeric",
        minute: "2-digit"
    });
}

function obtenerFecha() {
    return new Date().toLocaleDateString("es-SV", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

function calcularExpresion(expresion) {
    let texto = expresion
        .toLowerCase()
        .replace(/,/g, ".")
        .replace(/\s+/g, "");

    texto = texto
        .replace(/por/g, "*")
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/dividido/g, "/")
        .replace(/más/g, "+")
        .replace(/menos/g, "-");

    if (texto.includes("%")) {
        const numero = parseFloat(texto.replace("%", ""));

        if (!isNaN(numero)) {
            return numero / 100;
        }
    }

    if (texto.startsWith("raiz")) {
        const numero = parseFloat(texto.replace("raiz", ""));

        if (!isNaN(numero) && numero >= 0) {
            return Math.sqrt(numero);
        }
    }

    if (texto.includes("^")) {
        const partes = texto.split("^");

        if (partes.length === 2) {
            const base = parseFloat(partes[0]);
            const exponente = parseFloat(partes[1]);

            if (!isNaN(base) && !isNaN(exponente)) {
                return Math.pow(base, exponente);
            }
        }
    }

    if (/^[0-9+\-*/().]+$/.test(texto)) {
        try {
            const resultado = Function(`"use strict"; return (${texto})`)();

            if (typeof resultado === "number" && isFinite(resultado)) {
                return resultado;
            }
        } catch (error) {
            return null;
        }
    }

    return null;
}

function resolverEcuacion(ecuacion) {
    let texto = ecuacion
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/,/g, ".");

    if (!texto.includes("=")) {
        return null;
    }

    const partes = texto.split("=");

    if (partes.length !== 2) {
        return null;
    }

    const izquierda = partes[0];
    const derecha = partes[1];

    const patronIzquierda = izquierda.match(
        /^([+-]?\d*\.?\d*)x([+-]\d*\.?\d*)?$/
    );

    if (!patronIzquierda) {
        return null;
    }

    let coeficiente = patronIzquierda[1];

    if (coeficiente === "" || coeficiente === "+") {
        coeficiente = 1;
    } else if (coeficiente === "-") {
        coeficiente = -1;
    } else {
        coeficiente = parseFloat(coeficiente);
    }

    let termino = patronIzquierda[2];

    if (!termino) {
        termino = 0;
    } else {
        termino = parseFloat(termino);
    }

    const resultadoDerecha = parseFloat(derecha);

    if (
        isNaN(coeficiente) ||
        isNaN(termino) ||
        isNaN(resultadoDerecha) ||
        coeficiente === 0
    ) {
        return null;
    }

    const x = (resultadoDerecha - termino) / coeficiente;

    return x;
}

resolverBtn.addEventListener("click", () => {
    const ecuacion = ecuacionInput.value.trim();

    if (!ecuacion) {
        resultadoMatematico.textContent =
            "Escribe una operación o ecuación.";
        hablar("Escribe una operación o ecuación.");
        return;
    }

    const ecuacionResultado = resolverEcuacion(ecuacion);

    if (ecuacionResultado !== null) {
        const resultado = Number.isInteger(ecuacionResultado)
            ? ecuacionResultado
            : ecuacionResultado.toFixed(2);

        resultadoMatematico.textContent = `Resultado: x = ${resultado}`;

        hablar(`La solución de la ecuación es x igual a ${resultado}.`);
        cambiarEstado("feliz");
        programarDormir();

        return;
    }

    const resultado = calcularExpresion(ecuacion);

    if (resultado !== null) {
        const numeroFinal = Number.isInteger(resultado)
            ? resultado
            : Number(resultado.toFixed(4));

        resultadoMatematico.textContent = `Resultado: ${numeroFinal}`;

        hablar(`El resultado es ${numeroFinal}.`);
        cambiarEstado("feliz");
        programarDormir();

        return;
    }

    resultadoMatematico.textContent =
        "No pude entender esa operación.";

    hablar(
        "No pude entender esa operación. Prueba, por ejemplo, 2 más 2 o 2x más 5 igual a 15."
    );
});

repetirBtn.addEventListener("click", () => {
    const texto = textoRepetir.value.trim();

    if (!texto) {
        respuestaVoz.textContent = "Escribe algo para que pueda repetirlo.";
        hablar("Escribe algo para que pueda repetirlo.");
        return;
    }

    respuestaVoz.textContent = texto;
    hablar(texto);
});

textoRepetir.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        repetirBtn.click();
    }
});

hablarBtn.addEventListener("click", () => {
    if (
        !("SpeechRecognition" in window) &&
        !("webkitSpeechRecognition" in window)
    ) {
        responder(
            "Tu navegador no permite reconocimiento de voz. Puedes usar la función de repetir texto."
        );
        return;
    }

    const Recognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    const reconocimiento = new Recognition();

    reconocimiento.lang = "es-SV";
    reconocimiento.continuous = false;
    reconocimiento.interimResults = false;

    cambiarEstado("escuchando");

    respuestaVoz.textContent = "Te estoy escuchando...";

    reconocimiento.start();

    reconocimiento.onresult = event => {
        const texto = event.results[0][0].transcript.toLowerCase().trim();

        procesarComando(texto);
    };

    reconocimiento.onerror = () => {
        cambiarEstado("normal");
        respuestaVoz.textContent =
            "No pude escucharte. Intenta hablar nuevamente.";
        programarDormir();
    };

    reconocimiento.onend = () => {
        if (estadoTachi.textContent === "Escuchando") {
            cambiarEstado("normal");
            programarDormir();
        }
    };
});

async function investigarTema(pregunta) {
    if (!pregunta) {
        resultadoInvestigacion.textContent =
            "Escribe algo que quieras investigar.";
        hablar("Escribe algo que quieras investigar.");
        return;
    }

    cambiarEstado("investigando");

    resultadoInvestigacion.textContent =
        "Tachi está investigando... 🔎";

    try {
        const url =
            "https://es.wikipedia.org/w/api.php" +
            "?action=query" +
            "&format=json" +
            "&origin=*" +
            "&prop=extracts" +
            "&exintro=1" +
            "&explaintext=1" +
            "&redirects=1" +
            "&titles=" +
            encodeURIComponent(pregunta);

        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        const paginas = datos.query.pages;
        const pagina = Object.values(paginas)[0];

        if (!pagina || pagina.missing || !pagina.extract) {
            resultadoInvestigacion.textContent =
                "No encontré información clara. Puedes usar el botón de resultados.";
            cambiarEstado("sorprendido");

            hablar(
                "No encontré información clara sobre ese tema. Puedes ver más resultados en Internet."
            );

            programarDormir();
            return;
        }

        let resumen = pagina.extract.trim();

        if (resumen.length > 850) {
            resumen = resumen.substring(0, 850) + "...";
        }

        resultadoInvestigacion.innerHTML =
            `<strong>${pagina.title}</strong><br><br>${resumen}`;

        cambiarEstado("feliz");

        hablar(`Encontré información sobre ${pagina.title}. ${resumen}`);

        programarDormir();
    } catch (error) {
        resultadoInvestigacion.textContent =
            "No pude conectarme para investigar.";
        cambiarEstado("sorprendido");

        hablar(
            "No pude conectarme para investigar en este momento."
        );

        programarDormir();
    }
}

investigarBtn.addEventListener("click", () => {
    const pregunta = preguntaInvestigacion.value.trim();
    investigarTema(pregunta);
});

preguntaInvestigacion.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        investigarBtn.click();
    }
});

abrirBusqueda.addEventListener("click", () => {
    const pregunta = preguntaInvestigacion.value.trim();

    if (!pregunta) {
        hablar("Escribe primero qué quieres investigar.");
        return;
    }

    window.open(
        `https://www.google.com/search?q=${encodeURIComponent(pregunta)}`,
        "_blank"
    );
});

const chistes = [
    "¿Qué hace una abeja en el gimnasio? ¡Zum-ba!",
    "¿Por qué el libro de matemáticas estaba triste? Porque tenía demasiados problemas.",
    "¿Qué le dijo un cero a un ocho? Bonito cinturón.",
    "¿Cuál es el colmo de un robot? Tener el corazón de metal y ponerse nervioso."
];

const adivinanzas = [
    {
        pregunta: "Tengo agujas y no sé coser. ¿Qué soy?",
        respuesta: "reloj"
    },
    {
        pregunta: "Cuanto más quitas, más grande se vuelve. ¿Qué es?",
        respuesta: "agujero"
    },
    {
        pregunta: "Tengo dientes pero no puedo comer. ¿Qué soy?",
        respuesta: "peine"
    }
];

const trivias = [
    {
        pregunta: "¿Cuál es el planeta más grande del sistema solar?",
        respuesta: "jupiter"
    },
    {
        pregunta: "¿Cuántos lados tiene un hexágono?",
        respuesta: "6"
    },
    {
        pregunta: "¿Cuál es el océano más grande del planeta?",
        respuesta: "pacifico"
    },
    {
        pregunta: "¿Qué animal es conocido como el rey de la selva?",
        respuesta: "leon"
    }
];

let triviaActual = null;

function elegirAleatorio(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
}

chisteBtn.addEventListener("click", () => {
    const chiste = elegirAleatorio(chistes);

    resultadoJuego.textContent = chiste;

    cambiarEstado("feliz");
    hablar(chiste);
    programarDormir();
});

adivinanzaBtn.addEventListener("click", () => {
    const adivinanza = elegirAleatorio(adivinanzas);

    resultadoJuego.textContent = adivinanza.pregunta;

    cambiarEstado("sorprendido");
    hablar(adivinanza.pregunta);

    zonaRespuesta.classList.remove("oculto");
    opcionesPPT.classList.add("oculto");

    respuestaUsuario.value = "";
    respuestaUsuario.focus();
});

triviaBtn.addEventListener("click", () => {
    triviaActual = elegirAleatorio(trivias);

    resultadoJuego.textContent = triviaActual.pregunta;

    cambiarEstado("investigando");
    hablar(triviaActual.pregunta);

    zonaRespuesta.classList.remove("oculto");
    opcionesPPT.classList.add("oculto");

    respuestaUsuario.value = "";
    respuestaUsuario.focus();
});

comprobarTrivia.addEventListener("click", () => {
    if (!triviaActual) {
        return;
    }

    const respuesta = respuestaUsuario.value
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const correcta = triviaActual.respuesta
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    if (respuesta === correcta) {
        resultadoJuego.textContent =
            "🎉 ¡Correcto! Ganaste un punto.";

        actualizarPuntos(1);
        cambiarEstado("feliz");
        hablar("¡Correcto! Ganaste un punto.");
    } else {
        resultadoJuego.textContent =
            `❌ Incorrecto. La respuesta era: ${triviaActual.respuesta}.`;

        cambiarEstado("sorprendido");
        hablar(
            `Incorrecto. La respuesta correcta era ${triviaActual.respuesta}.`
        );
    }

    zonaRespuesta.classList.add("oculto");
    programarDormir();
});

piedraPapelTijeraBtn.addEventListener("click", () => {
    opcionesPPT.classList.toggle("oculto");
    zonaRespuesta.classList.add("oculto");

    resultadoJuego.textContent =
        "Elige piedra, papel o tijera.";

    hablar("Elige piedra, papel o tijera.");
});

document.querySelectorAll("#opcionesPPT button").forEach(boton => {
    boton.addEventListener("click", () => {
        const jugador = boton.dataset.eleccion;

        const opciones = ["piedra", "papel", "tijera"];
        const computadora = elegirAleatorio(opciones);

        let resultado = "";

        if (jugador === computadora) {
            resultado = `Empate. Los dos elegimos ${jugador}.`;
        } else if (
            (jugador === "piedra" && computadora === "tijera") ||
            (jugador === "papel" && computadora === "piedra") ||
            (jugador === "tijera" && computadora === "papel")
        ) {
            resultado =
                `¡Ganaste! Tachi eligió ${computadora}. Ganaste un punto.`;

            actualizarPuntos(1);
        } else {
            resultado =
                `Perdiste. Tachi eligió ${computadora}.`;
        }

        resultadoJuego.textContent = resultado;

        if (resultado.startsWith("¡Ganaste")) {
            cambiarEstado("feliz");
        } else {
            cambiarEstado("sorprendido");
        }

        hablar(resultado);

        programarDormir();
    });
});

sorprendemeBtn.addEventListener("click", () => {
    const acciones = [
        () => chisteBtn.click(),
        () => adivinanzaBtn.click(),
        () => triviaBtn.click(),
        () => piedraPapelTijeraBtn.click()
    ];

    elegirAleatorio(acciones)();
});

function procesarComando(texto) {
    if (!texto) {
        responder("No escuché nada.");
        return;
    }

    respuestaVoz.textContent = `Escuché: "${texto}"`;

    if (
        texto.includes("qué hora") ||
        texto.includes("que hora") ||
        texto.includes("hora es")
    ) {
        responder(`Son las ${obtenerHora()}.`);
        return;
    }

    if (
        texto.includes("qué fecha") ||
        texto.includes("que fecha") ||
        texto.includes("qué día") ||
        texto.includes("que dia")
    ) {
        responder(`Hoy es ${obtenerFecha()}.`);
        return;
    }

    if (
        texto.includes("hola") ||
        texto.includes("buenos días") ||
        texto.includes("buenas tardes") ||
        texto.includes("buenas noches")
    ) {
        cambiarEstado("feliz");
        responder("Hola. Soy Tachi. ¿En qué puedo ayudarte?");
        return;
    }

    if (
        texto.includes("cómo estás") ||
        texto.includes("como estas") ||
        texto.includes("cómo te sientes") ||
        texto.includes("como te sientes")
    ) {
        responder(
            "Estoy funcionando perfectamente y lista para ayudarte."
        );
        return;
    }

    if (
        texto.includes("adiós") ||
        texto.includes("adios") ||
        texto.includes("hasta luego")
    ) {
        responder("Hasta luego. Te estaré esperando.");
        return;
    }

    if (
        texto.includes("investiga") ||
        texto.includes("investigar") ||
        texto.includes("busca") ||
        texto.includes("buscar")
    ) {
        const pregunta = texto
            .replace("investiga", "")
            .replace("investigar", "")
            .replace("busca", "")
            .replace("buscar", "")
            .trim();

        if (pregunta) {
            investigarTema(pregunta);
        } else {
            responder("Claro. Dime qué quieres que investigue.");
        }

        return;
    }

    if (
        texto.includes("sorpréndeme") ||
        texto.includes("sorprendeme")
    ) {
        sorprendemeBtn.click();
        return;
    }

    if (texto.includes("trivia")) {
        triviaBtn.click();
        return;
    }

    if (
        texto.includes("adivinanza") ||
        texto.includes("acertijo")
    ) {
        adivinanzaBtn.click();
        return;
    }

    if (
        texto.includes("chiste") ||
        texto.includes("cuéntame un chiste") ||
        texto.includes("cuentame un chiste")
    ) {
        chisteBtn.click();
        return;
    }

    if (
        texto.includes("piedra papel tijera") ||
        texto.includes("piedra papel o tijera")
    ) {
        piedraPapelTijeraBtn.click();
        return;
    }

    if (
        texto.includes("matemática") ||
        texto.includes("matematica") ||
        texto.includes("calcula")
    ) {
        const operacion = texto
            .replace("matemática", "")
            .replace("matematica", "")
            .replace("calcula", "")
            .trim();

        const resultado = calcularExpresion(
            operacion
                .replace(/más/g, "+")
                .replace(/menos/g, "-")
                .replace(/por/g, "*")
                .replace(/dividido entre/g, "/")
        );

        if (resultado !== null) {
            responder(`El resultado es ${resultado}.`);
        } else {
            responder(
                "No pude resolver esa operación. Puedes escribirla en la sección de matemáticas."
            );
        }

        return;
    }

    responder(
        `Entendí que dijiste: ${texto}. Todavía estoy aprendiendo más comandos.`
    );
}

archivoMusica.addEventListener("change", () => {
    const archivo = archivoMusica.files[0];

    if (!archivo) return;

    const url = URL.createObjectURL(archivo);

    reproductor.src = url;
    reproductor.load();

    resultadoJuego.textContent =
        `🎵 Música cargada: ${archivo.name}`;

    cambiarEstado("feliz");
    hablar(`He cargado la música ${archivo.name}.`);

    programarDormir();
});

playMusica.addEventListener("click", () => {
    if (!reproductor.src) {
        hablar("Primero selecciona una canción.");
        return;
    }

    reproductor.play();

    cambiarEstado("feliz");
});

pausaMusica.addEventListener("click", () => {
    reproductor.pause();

    cambiarEstado("normal");
    programarDormir();
});

stopMusica.addEventListener("click", () => {
    reproductor.pause();
    reproductor.currentTime = 0;

    cambiarEstado("normal");
    programarDormir();
});

volumenMusica.addEventListener("input", () => {
    reproductor.volume = volumenMusica.value;
});

document.addEventListener("click", () => {
    obtenerVoz();
}, { once: true });

cambiarEstado("normal");
programarDormir();
