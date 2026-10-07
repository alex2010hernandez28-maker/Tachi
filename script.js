const mensaje = document.getElementById("mensaje");
const boton = document.getElementById("hablar");

const botonRepetir = document.getElementById("repetir");
const textoRepetir = document.getElementById("textoRepetir");

const robot = document.querySelector(".robot");


// ==============================
// VOZ
// ==============================

function hablar(texto) {

    speechSynthesis.cancel();

    const voz = new SpeechSynthesisUtterance(texto);

    voz.lang = "es-SV";
    voz.rate = 1;
    voz.pitch = 1;

    speechSynthesis.speak(voz);
}


// ==============================
// RECONOCIMIENTO DE VOZ
// ==============================

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

        despertar();

        mensaje.textContent = "🎤 ¡Te estoy escuchando!";
    };


    reconocimiento.onresult = function (evento) {

        despertar();

        const texto =
            evento.results[0][0].transcript;

        const textoMinusculas =
            texto.toLowerCase();

        console.log("Usuario:", texto);


        // TACHI DEBE SER MENCIONADO

        if (!textoMinusculas.includes("tachi")) {

            mensaje.textContent =
                "👂 No me llamaste";

            reiniciarTemporizador();

            return;
        }


        // ==============================
        // EXPRESIONES
        // ==============================

        if (
            textoMinusculas.includes("wow") ||
            textoMinusculas.includes("sorpresa") ||
            textoMinusculas.includes("increible") ||
            textoMinusculas.includes("increíble") ||
            textoMinusculas.includes("que paso") ||
            textoMinusculas.includes("qué pasó")
        ) {

            mensaje.textContent = "😲";

        } else {

            mensaje.textContent = "😊";
        }


        // ==============================
        // HORA
        // ==============================

        if (
            textoMinusculas.includes("hora")
        ) {

            const ahora = new Date();

            let horas = ahora.getHours();

            const minutos =
                ahora.getMinutes()
                    .toString()
                    .padStart(2, "0");

            horas = horas % 12 || 12;

            const respuesta =
                `Son las ${horas}:${minutos}`;

            mensaje.textContent =
                `🕐 ${respuesta}`;

            hablar(respuesta);

        }


        // ==============================
        // FECHA
        // ==============================

        else if (
            textoMinusculas.includes("fecha") ||
            textoMinusculas.includes("día") ||
            textoMinusculas.includes("dia")
        ) {

            const fecha = new Date();

            const opciones = {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            };

            const respuesta =
                `Hoy es ${fecha.toLocaleDateString(
                    "es-SV",
                    opciones
                )}`;

            mensaje.textContent =
                `📅 ${respuesta}`;

            hablar(respuesta);
        }


        // ==============================
        // HOLA
        // ==============================

        else if (
            textoMinusculas.includes("hola") ||
            textoMinusculas.includes("cómo estás") ||
            textoMinusculas.includes("como estas")
        ) {

            const respuesta =
                "Bien gracias por preguntar, ¿en qué puedo ayudarte?";

            mensaje.textContent =
                `😊 ${respuesta}`;

            hablar(respuesta);
        }


        // ==============================
        // BUENOS DIAS
        // ==============================

        else if (
            textoMinusculas.includes("buenos días") ||
            textoMinusculas.includes("buenos dias")
        ) {

            const horaActual =
                new Date().getHours();

            let respuesta;


            if (
                horaActual >= 5 &&
                horaActual < 12
            ) {

                respuesta =
                    "¡Buenos días! ¿En qué puedo ayudarte?";

            }

            else if (
                horaActual >= 12 &&
                horaActual < 19
            ) {

                respuesta =
                    "Aún es de tarde, ¿quisiste decir buenas tardes?";

            }

            else {

                respuesta =
                    "Aún es de noche, ¿quisiste decir buenas noches?";
            }


            mensaje.textContent =
                `🌅 ${respuesta}`;

            hablar(respuesta);
        }


        // ==============================
        // BUENAS TARDES
        // ==============================

        else if (
            textoMinusculas.includes("buenas tardes")
        ) {

            const horaActual =
                new Date().getHours();

            let respuesta;


            if (
                horaActual >= 12 &&
                horaActual < 19
            ) {

                respuesta =
                    "¡Buenas tardes! ¿En qué puedo ayudarte?";

            }

            else if (
                horaActual >= 5 &&
                horaActual < 12
            ) {

                respuesta =
                    "Aún es de mañana, ¿quisiste decir buenos días?";

            }

            else {

                respuesta =
                    "Ya es de noche, ¿quisiste decir buenas noches?";
            }


            mensaje.textContent =
                `🌇 ${respuesta}`;

            hablar(respuesta);
        }


        // ==============================
        // BUENAS NOCHES
        // ==============================

        else if (
            textoMinusculas.includes("buenas noches")
        ) {

            const horaActual =
                new Date().getHours();

            let respuesta;


            if (
                horaActual >= 19 ||
                horaActual < 5
            ) {

                respuesta =
                    "¡Buenas noches! ¿En qué puedo ayudarte?";

            }

            else if (
                horaActual >= 12 &&
                horaActual < 19
            ) {

                respuesta =
                    "Aún es de tarde, ¿quisiste decir buenas tardes?";

            }

            else {

                respuesta =
                    "Aún es de día, ¿quisiste decir buenos días?";
            }


            mensaje.textContent =
                `🌙 ${respuesta}`;

            hablar(respuesta);
        }


        // ==============================
        // RESPUESTA GENERAL
        // ==============================

        else {

            const respuesta =
                "Sí, dime.";

            mensaje.textContent =
                `😊 ${respuesta}`;

            hablar(respuesta);
        }


        reiniciarTemporizador();
    };


    reconocimiento.onerror = function (evento) {

        mensaje.textContent =
            "❌ No pude escucharte";

        console.log(
            "Error de reconocimiento:",
            evento.error
        );

        reiniciarTemporizador();
    };

}


// ==============================
// BOTÓN HABLAR
// ==============================

boton.addEventListener(
    "click",
    function () {

        despertar();

        if (!reconocimiento) {

            mensaje.textContent =
                "❌ Tu navegador no permite reconocimiento de voz.";

            return;
        }


        try {

            reconocimiento.start();

        }

        catch (error) {

            console.log(error);
        }

    }
);


// ==============================
// REPETIR TEXTO
// ==============================

botonRepetir.addEventListener(
    "click",
    function () {

        const texto =
            textoRepetir.value.trim();


        if (texto === "") {

            mensaje.textContent =
                "✍️ Escribe algo primero";

            return;
        }


        despertar();

        mensaje.textContent =
            `🗣️ Tachi dice: ${texto}`;


        hablar(texto);

        reiniciarTemporizador();

    }
);


// ENTER PARA REPETIR

textoRepetir.addEventListener(
    "keydown",
    function (evento) {

        if (evento.key === "Enter") {

            botonRepetir.click();
        }

    }
);


// ==============================
// DORMIR
// ==============================

let temporizadorDormir;


function reiniciarTemporizador() {

    clearTimeout(temporizadorDormir);

    temporizadorDormir =
        setTimeout(
            dormir,
            5000
        );
}


function dormir() {

    robot.classList.add("dormido");

    mensaje.textContent =
        "😴 Zzz...";
}


function despertar() {

    robot.classList.remove("dormido");
}


// ==============================
// REPRODUCTOR DE MÚSICA
// ==============================

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


let archivoSeleccionado = null;


// ==============================
// SELECCIONAR CANCIÓN
// ==============================

archivoMusica.addEventListener(
    "change",
    function () {

        const archivo =
            archivoMusica.files[0];

        if (!archivo) {
            return;
        }


        archivoSeleccionado = archivo;


        const url =
            URL.createObjectURL(archivo);

        audioMusica.src = url;


        nombreCancion.textContent =
            `🎵 ${archivo.name}`;


        despertar();

        mensaje.textContent =
            "🎵 Canción seleccionada";


        reiniciarTemporizador();
    }
);


// ==============================
// REPRODUCIR
// ==============================

reproducirMusica.addEventListener(
    "click",
    function () {

        if (!archivoSeleccionado) {

            mensaje.textContent =
                "🎵 Primero selecciona una canción";

            return;
        }


        despertar();

        audioMusica.play();

        mensaje.textContent =
            `🎵 Reproduciendo: ${archivoSeleccionado.name}`;

        reiniciarTemporizador();
    }
);


// ==============================
// PAUSAR
// ==============================

pausarMusica.addEventListener(
    "click",
    function () {

        audioMusica.pause();

        despertar();

        mensaje.textContent =
            "⏸️ Música pausada";

        reiniciarTemporizador();
    }
);


// ==============================
// DETENER
// ==============================

detenerMusica.addEventListener(
    "click",
    function () {

        audioMusica.pause();

        audioMusica.currentTime = 0;

        despertar();

        mensaje.textContent =
            "⏹️ Música detenida";

        reiniciarTemporizador();
    }
);


// ==============================
// VOLUMEN
// ==============================

volumen.addEventListener(
    "input",
    function () {

        audioMusica.volume =
            volumen.value;
    }
);


// ==============================
// INICIAR TEMPORIZADOR
// ==============================

reiniciarTemporizador();
