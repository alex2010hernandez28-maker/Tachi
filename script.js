const mensaje = document.getElementById("mensaje");
const boton = document.getElementById("hablar");
const botonRepetir = document.getElementById("repetir");
const textoRepetir = document.getElementById("textoRepetir");
const robot = document.querySelector(".robot");

/* =========================
VOZ DE TACHI
========================= */

function hablar(texto) {

if ("speechSynthesis" in window) {

    window.speechSynthesis.cancel();

    const voz = new SpeechSynthesisUtterance(texto);

    voz.lang = "es-SV";
    voz.rate = 1;
    voz.pitch = 1;

    window.speechSynthesis.speak(voz);
}

}

/* =========================
MOSTRAR MENSAJE
========================= */

function mostrarMensaje(texto) {
mensaje.textContent = texto;
}

/* =========================
NORMALIZAR TEXTO
========================= */

function normalizarTexto(texto) {

return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

}

/* =========================
RECONOCIMIENTO DE VOZ
========================= */

const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;

let reconocimiento = null;

if (SpeechRecognition) {

reconocimiento = new SpeechRecognition();

reconocimiento.lang = "es-SV";
reconocimiento.continuous = false;
reconocimiento.interimResults = false;

reconocimiento.onstart = function () {

    robot.classList.remove("dormido");

    mostrarMensaje("🎤 Te escucho...");
};

reconocimiento.onresult = function (evento) {

    const texto =
        evento.results[0][0].transcript;

    procesarComando(texto);
};

reconocimiento.onerror = function () {

    mostrarMensaje("No pude entenderte 😕");
};

reconocimiento.onend = function () {

    iniciarTemporizadorDormir();
};

} else {

boton.disabled = true;

mostrarMensaje(
    "Tu navegador no permite reconocimiento de voz."
);

}

/* =========================
BOTÓN HABLAR
========================= */

boton.addEventListener("click", function () {

despertarRobot();

if (reconocimiento) {

    try {
        reconocimiento.start();
    } catch (error) {
        console.log(error);
    }

}

});

/* =========================
PROCESAR COMANDOS
========================= */

function procesarComando(texto) {

despertarRobot();

const textoMinusculas = normalizarTexto(texto);

/* HORA */

if (
    textoMinusculas.includes("hora") ||
    textoMinusculas.includes("que hora es") ||
    textoMinusculas.includes("dime la hora")
) {

    const ahora = new Date();

    let horas = ahora.getHours();
    const minutos = String(
        ahora.getMinutes()
    ).padStart(2, "0");

    const periodo =
        horas >= 12 ? "PM" : "AM";

    horas = horas % 12 || 12;

    const respuesta =
        `Son las ${horas}:${minutos} ${periodo}`;

    mostrarMensaje(respuesta);
    hablar(respuesta);

    return;
}


/* FECHA */

if (
    textoMinusculas.includes("fecha") ||
    textoMinusculas.includes("que dia es") ||
    textoMinusculas.includes("que dia es hoy") ||
    textoMinusculas.includes("dime el dia") ||
    textoMinusculas.includes("dime la fecha")
) {

    const fecha = new Date();

    const opciones = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    };

    const respuesta =
        "Hoy es " +
        fecha.toLocaleDateString(
            "es-SV",
            opciones
        );

    mostrarMensaje(respuesta);
    hablar(respuesta);

    return;
}


/* COMO ESTA TACHI */

if (
    textoMinusculas.includes("como estas") ||
    textoMinusculas.includes("como esta") ||
    textoMinusculas.includes("como te sientes") ||
    textoMinusculas.includes("estas bien") ||
    textoMinusculas.includes("te sientes bien")
) {

    const respuestas = [
        "Estoy muy bien, gracias por preguntar.",
        "Estoy funcionando perfectamente.",
        "Todo bien por aquí. Estoy listo para ayudarte.",
        "Estoy excelente y preparado para ayudarte."
    ];

    const respuesta =
        respuestas[
            Math.floor(
                Math.random() * respuestas.length
            )
        ];

    mostrarMensaje(respuesta);
    hablar(respuesta);

    return;
}


/* SALUDOS */

if (
    textoMinusculas.includes("hola") ||
    textoMinusculas.includes("buenos dias") ||
    textoMinusculas.includes("buenas tardes") ||
    textoMinusculas.includes("buenas noches")
) {

    const respuesta =
        "Hola, ¿cómo estás?";

    mostrarMensaje(respuesta);
    hablar(respuesta);

    return;
}


/* DESPEDIDA */

if (
    textoMinusculas.includes("adios") ||
    textoMinusculas.includes("hasta luego")
) {

    const respuesta =
        "Hasta luego. Aquí estaré cuando me necesites.";

    mostrarMensaje(respuesta);
    hablar(respuesta);

    return;
}


/* RESPUESTA GENERAL */

const respuesta =
    "Sí, dime.";

mostrarMensaje(respuesta);
hablar(respuesta);

}

/* =========================
REPETIR TEXTO
========================= */

botonRepetir.addEventListener("click", function () {

despertarRobot();

const texto =
    textoRepetir.value.trim();

if (texto === "") {

    mostrarMensaje(
        "Escribe algo primero."
    );

    hablar(
        "Escribe algo primero."
    );

    return;
}

mostrarMensaje(texto);

hablar(texto);

textoRepetir.value = "";

});

/* =========================
RESOLVER MATEMÁTICAS
========================= */

const ecuacion =
document.getElementById("ecuacion");

const botonResolver =
document.getElementById("resolver");

const resultadoMatematico =
document.getElementById("resultadoMatematico");

function resolverMatematicas() {

const entrada =
    ecuacion.value.trim();

if (entrada === "") {

    resultadoMatematico.textContent =
        "Escribe una operación o ecuación.";

    return;
}

try {

    let expresion = entrada
        .toLowerCase()
        .replace(/,/g, ".")
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-")
        .replace(/\^/g, "**")
        .replace(/√/g, "Math.sqrt");

    /* PORCENTAJES */

    expresion = expresion.replace(
        /(\d+(?:\.\d+)?)%/g,
        "($1/100)"
    );

    /* MULTIPLICACIÓN IMPLÍCITA */

    expresion = expresion
        .replace(/(\d)\s*x\s*(\d)/g, "$1*$2");

    /* Solo operaciones numéricas */

    if (
        /^[0-9+\-*/().%\s*xMath.sqrt]+$/i.test(
            expresion
        ) &&
        !/[a-z]/i.test(
            expresion.replace(/Math\.sqrt/gi, "")
        )
    ) {

        const resultado =
            Function(
                `"use strict"; return (${expresion})`
            )();

        if (
            typeof resultado === "number" &&
            Number.isFinite(resultado)
        ) {

            const respuesta =
                Number.isInteger(resultado)
                    ? resultado
                    : Number(
                        resultado.toFixed(10)
                    );

            resultadoMatematico.textContent =
                `Resultado: ${respuesta}`;

            mostrarMensaje(
                `El resultado es ${respuesta}`
            );

            hablar(
                `El resultado es ${respuesta}`
            );

            return;
        }
    }

    /*
       ECUACIONES LINEALES
       Ejemplo:
       2x + 5 = 15
    */

    const ecuacionCoincide =
        entrada
            .replace(/\s/g, "")
            .match(
                /^([+-]?\d*\.?\d*)x([+-]\d+\.?\d*)?=([+-]?\d+\.?\d*)$/
            );

    if (ecuacionCoincide) {

        let a =
            ecuacionCoincide[1];

        let b =
            ecuacionCoincide[2] || "0";

        let c =
            ecuacionCoincide[3];

        if (a === "" || a === "+") {
            a = 1;
        }

        if (a === "-") {
            a = -1;
        }

        a = Number(a);
        b = Number(b);
        c = Number(c);

        if (a !== 0) {

            const x =
                (c - b) / a;

            const respuesta =
                Number.isInteger(x)
                    ? x
                    : Number(x.toFixed(10));

            resultadoMatematico.textContent =
                `x = ${respuesta}`;

            mostrarMensaje(
                `La solución es x igual a ${respuesta}`
            );

            hablar(
                `La solución es x igual a ${respuesta}`
            );

            return;
        }
    }

    resultadoMatematico.textContent =
        "No pude resolver esa ecuación.";

    mostrarMensaje(
        "No pude resolver esa ecuación."
    );

    hablar(
        "No pude resolver esa ecuación."
    );

} catch (error) {

    resultadoMatematico.textContent =
        "No pude entender la operación.";

    mostrarMensaje(
        "No pude entender la operación."
    );

    hablar(
        "No pude entender la operación."
    );
}

}

botonResolver.addEventListener(
"click",
resolverMatematicas
);

ecuacion.addEventListener(
"keydown",
function (evento) {

    if (evento.key === "Enter") {
        resolverMatematicas();
    }

}

);

/* =========================
REPRODUCTOR DE MÚSICA
========================= */

const archivoMusica =
document.getElementById("archivoMusica");

const audioMusica =
document.getElementById("audioMusica");

const nombreCancion =
document.getElementById("nombreCancion");

const reproducirMusica =
document.getElementById("reproducirMusica");

const pausarMusica =
document.getElementById("pausarMusica");

const detenerMusica =
document.getElementById("detenerMusica");

const volumen =
document.getElementById("volumen");

archivoMusica.addEventListener(
"change",
function () {

    const archivo =
        archivoMusica.files[0];

    if (!archivo) {
        return;
    }

    const url =
        URL.createObjectURL(archivo);

    audioMusica.src = url;

    nombreCancion.textContent =
        archivo.name;
}

);

reproducirMusica.addEventListener(
"click",
function () {

    if (!audioMusica.src) {
        return;
    }

    audioMusica.play();
}

);

pausarMusica.addEventListener(
"click",
function () {

    audioMusica.pause();
}

);

detenerMusica.addEventListener(
"click",
function () {

    audioMusica.pause();

    audioMusica.currentTime = 0;
}

);

volumen.addEventListener(
"input",
function () {

    audioMusica.volume =
        volumen.value;
}

);

/* =========================
DORMIR
========================= */

let temporizadorDormir = null;

function despertarRobot() {

robot.classList.remove("dormido");

iniciarTemporizadorDormir();

}

function iniciarTemporizadorDormir() {

clearTimeout(
    temporizadorDormir
);

temporizadorDormir =
    setTimeout(
        dormirRobot,
        5000
    );

}

function dormirRobot() {

robot.classList.add("dormido");

mostrarMensaje("😴 Zzz...");

}

/* INICIO */

iniciarTemporizadorDormir();
