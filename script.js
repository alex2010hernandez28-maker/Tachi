const mensaje = document.getElementById("mensaje");

const boton = document.getElementById("hablar");

const botonRepetir = document.getElementById("repetir");

const textoRepetir = document.getElementById("textoRepetir");


const ReconocimientoVoz =
    window.SpeechRecognition || window.webkitSpeechRecognition;

const reconocimiento = new ReconocimientoVoz();

reconocimiento.lang = "es-SV";
reconocimiento.continuous = false;
reconocimiento.interimResults = false;

const robot = document.querySelector(".robot");

let temporizadorDormido;


// ==============================
// DORMIR
// ==============================

function iniciarTemporizadorDormido() {

    clearTimeout(temporizadorDormido);

    temporizadorDormido = setTimeout(function () {

        robot.classList.remove("feliz");
        robot.classList.remove("sorprendido");

        robot.classList.add("dormido");

        mensaje.textContent = "😴 Zzz...";

    }, 5000);
}


// ==============================
// DESPERTAR
// ==============================

function despertarRobot() {

    robot.classList.remove("dormido");

    mensaje.textContent = "👀 Estoy despierto";

    iniciarTemporizadorDormido();
}


// ==============================
// HACER QUE TACHI HABLE
// ==============================

function hablar(texto) {

    speechSynthesis.cancel();

    const respuesta =
        new SpeechSynthesisUtterance(texto);

    respuesta.lang = "es-SV";
    respuesta.rate = 1;
    respuesta.pitch = 1;

    speechSynthesis.speak(respuesta);
}


// ==============================
// AL EMPEZAR A ESCUCHAR
// ==============================

reconocimiento.onstart = function () {

    robot.classList.remove("dormido");

    mensaje.textContent = "🎤 ¡Te estoy escuchando!";

    iniciarTemporizadorDormido();
};


// ==============================
// CUANDO RECIBE LA VOZ
// ==============================

reconocimiento.onresult = function (evento) {

    const texto = evento.results[0][0].transcript;

    mensaje.textContent = "🗣️ Dijiste: " + texto;

    const textoMinusculas = texto.toLowerCase();


    // ==============================
    // COMPROBAR SI DIJERON "TACHI"
    // ==============================

    if (!textoMinusculas.includes("tachi")) {

        mensaje.textContent = "👂 No me llamaste";

        iniciarTemporizadorDormido();

        return;
    }


    // ==============================
    // EXPRESIÓN SORPRENDIDA
    // ==============================

    if (
        textoMinusculas.includes("wow") ||
        textoMinusculas.includes("sorpresa") ||
        textoMinusculas.includes("increíble") ||
        textoMinusculas.includes("increible") ||
        textoMinusculas.includes("qué pasó") ||
        textoMinusculas.includes("que paso")
    ) {

        robot.classList.remove("feliz");

        robot.classList.add("sorprendido");

        setTimeout(function () {
            robot.classList.remove("sorprendido");
        }, 3000);

    } else {

        // ==============================
        // EXPRESIÓN FELIZ
        // ==============================

        robot.classList.remove("sorprendido");

        robot.classList.add("feliz");

        setTimeout(function () {
            robot.classList.remove("feliz");
        }, 3000);
    }


    // ==============================
    // RESPUESTA
    // ==============================

    let respuestaTexto;


    // ==============================
    // HORA
    // ==============================

    if (
        textoMinusculas.includes("hora")
    ) {

        const ahora = new Date();

        let horas = ahora.getHours();

        const minutos =
            String(ahora.getMinutes()).padStart(2, "0");

        if (horas > 12) {
            horas -= 12;
        }

        if (horas === 0) {
            horas = 12;
        }

        respuestaTexto =
            `Son las ${horas}:${minutos}`;

    }


    // ==============================
    // FECHA / DÍA
    // ==============================

    else if (
        textoMinusculas.includes("fecha") ||
        textoMinusculas.includes("día") ||
        textoMinusculas.includes("dia")
    ) {

        const ahora = new Date();

        const dias = [
            "domingo",
            "lunes",
            "martes",
            "miércoles",
            "jueves",
            "viernes",
            "sábado"
        ];

        const meses = [
            "enero",
            "febrero",
            "marzo",
            "abril",
            "mayo",
            "junio",
            "julio",
            "agosto",
            "septiembre",
            "octubre",
            "noviembre",
            "diciembre"
        ];

        const diaSemana =
            dias[ahora.getDay()];

        const dia =
            ahora.getDate();

        const mes =
            meses[ahora.getMonth()];

        const año =
            ahora.getFullYear();

        respuestaTexto =
            `Hoy es ${diaSemana} ${dia} de ${mes} de ${año}`;

    }


    // ==============================
    // HOLA / ¿CÓMO ESTÁS?
    // ==============================

    else if (
        textoMinusculas.includes("hola") ||
        textoMinusculas.includes("cómo estás") ||
        textoMinusculas.includes("como estas")
    ) {

        respuestaTexto =
            "Bien gracias por preguntar, ¿en qué puedo ayudarte?";

    }


    // ==============================
    // BUENOS DÍAS
    // ==============================

    else if (
        textoMinusculas.includes("buenos días") ||
        textoMinusculas.includes("buenos dias")
    ) {

        const horaActual =
            new Date().getHours();

        if (horaActual >= 5 && horaActual < 12) {

            respuestaTexto =
                "¡Buenos días! ¿En qué puedo ayudarte?";

        } else if (horaActual >= 12 && horaActual < 19) {

            respuestaTexto =
                "Aún es de tarde, ¿quisiste decir buenas tardes?";

        } else {

            respuestaTexto =
                "Aún es de noche, ¿quisiste decir buenas noches?";

        }

    }


    // ==============================
    // BUENAS TARDES
    // ==============================

    else if (
        textoMinusculas.includes("buenas tardes")
    ) {

        const horaActual =
            new Date().getHours();

        if (horaActual >= 12 && horaActual < 19) {

            respuestaTexto =
                "¡Buenas tardes! ¿En qué puedo ayudarte?";

        } else if (horaActual >= 5 && horaActual < 12) {

            respuestaTexto =
                "Aún es de mañana, ¿quisiste decir buenos días?";

        } else {

            respuestaTexto =
                "Ya es de noche, ¿quisiste decir buenas noches?";

        }

    }


    // ==============================
    // BUENAS NOCHES
    // ==============================

    else if (
        textoMinusculas.includes("buenas noches")
    ) {

        const horaActual =
            new Date().getHours();

        if (horaActual >= 19 || horaActual < 5) {

            respuestaTexto =
                "¡Buenas noches! ¿En qué puedo ayudarte?";

        } else if (horaActual >= 12) {

            respuestaTexto =
                "Aún es de tarde, ¿quisiste decir buenas tardes?";

        } else {

            respuestaTexto =
                "Aún es de día, ¿quisiste decir buenos días?";

        }

    }


    // ==============================
    // RESPUESTA GENERAL
    // ==============================

    else {

        respuestaTexto =
            "Sí, dime.";

    }


    // ==============================
    // TACHI HABLA
    // ==============================

    hablar(respuestaTexto);

    iniciarTemporizadorDormido();
};


// ==============================
// ERROR
// ==============================

reconocimiento.onerror = function (evento) {

    mensaje.textContent =
        "❌ Error: " + evento.error;

    console.log(
        "Error de voz:",
        evento.error
    );

    iniciarTemporizadorDormido();
};


// ==============================
// BOTÓN HABLAR
// ==============================

boton.addEventListener("click", function () {

    despertarRobot();

    try {

        reconocimiento.start();

    } catch (error) {

        console.log(
            "Reconocimiento ya iniciado:",
            error
        );

    }

});


// ==============================
// BOTÓN REPETIR TEXTO
// ==============================

botonRepetir.addEventListener("click", function () {

    const texto =
        textoRepetir.value.trim();

    if (texto === "") {

        mensaje.textContent =
            "✍️ Escribe algo primero";

        return;
    }


    despertarRobot();

    mensaje.textContent =
        "🗣️ Tachi dice: " + texto;

    robot.classList.remove("sorprendido");

    robot.classList.add("feliz");

    setTimeout(function () {

        robot.classList.remove("feliz");

    }, 3000);


    hablar(texto);

    iniciarTemporizadorDormido();

});


// ==============================
// PERMITIR ENTER PARA REPETIR
// ==============================

textoRepetir.addEventListener("keydown", function (evento) {

    if (evento.key === "Enter") {

        botonRepetir.click();

    }

});


// ==============================
// INICIAR
// ==============================

iniciarTemporizadorDormido();