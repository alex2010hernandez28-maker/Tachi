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

        const voz =
            new SpeechSynthesisUtterance(texto);

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

    reconocimiento =
        new SpeechRecognition();

    reconocimiento.lang = "es-SV";
    reconocimiento.continuous = false;
    reconocimiento.interimResults = false;


    reconocimiento.onstart = function () {

        robot.classList.remove("dormido");

        mostrarMensaje(
            "🎤 Te escucho..."
        );
    };


    reconocimiento.onresult = function (evento) {

        const texto =
            evento.results[0][0].transcript;

        procesarComando(texto);
    };


    reconocimiento.onerror = function () {

        mostrarMensaje(
            "No pude entenderte 😕"
        );
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

boton.addEventListener(
    "click",
    function () {

        despertarRobot();

        if (reconocimiento) {

            try {

                reconocimiento.start();

            } catch (error) {

                console.log(error);
            }
        }
    }
);


/* =========================
   PROCESAR COMANDOS
========================= */

function procesarComando(texto) {

    despertarRobot();

    const textoMinusculas =
        normalizarTexto(texto);


    /* INVESTIGAR */

    if (
        textoMinusculas.startsWith("investiga") ||
        textoMinusculas.startsWith("investigar") ||
        textoMinusculas.startsWith("busca") ||
        textoMinusculas.startsWith("buscar") ||
        textoMinusculas.startsWith("quiero investigar")
    ) {

        let pregunta = texto;

        pregunta = pregunta
            .replace(/^investiga\s*/i, "")
            .replace(/^investigar\s*/i, "")
            .replace(/^busca\s*/i, "")
            .replace(/^buscar\s*/i, "")
            .replace(/^quiero investigar\s*/i, "");

        pregunta = pregunta.trim();

        if (pregunta === "") {

            mostrarMensaje(
                "Dime qué quieres que investigue."
            );

            hablar(
                "Dime qué quieres que investigue."
            );

            return;
        }

        investigarEnInternet(
            pregunta
        );

        return;
    }


    /* JUEGOS POR VOZ */

    if (
        textoMinusculas.includes("sorprendeme") ||
        textoMinusculas.includes("sorprendeme tachi")
    ) {

        sorprender();

        return;
    }


    if (
        textoMinusculas.includes("hazme una trivia") ||
        textoMinusculas.includes("trivia")
    ) {

        iniciarTrivia();

        return;
    }


    if (
        textoMinusculas.includes("adivinanza") ||
        textoMinusculas.includes("dime una adivinanza")
    ) {

        iniciarAdivinanza();

        return;
    }


    if (
        textoMinusculas.includes("cuentame un chiste") ||
        textoMinusculas.includes("cuentame un chiste")
    ) {

        contarChiste();

        return;
    }


    if (
        textoMinusculas.includes("piedra papel o tijera")
    ) {

        iniciarPPT();

        return;
    }


    /* HORA */

    if (
        textoMinusculas.includes("hora") ||
        textoMinusculas.includes("que hora es") ||
        textoMinusculas.includes("dime la hora")
    ) {

        const ahora =
            new Date();

        let horas =
            ahora.getHours();

        const minutos =
            String(
                ahora.getMinutes()
            ).padStart(2, "0");

        const periodo =
            horas >= 12
                ? "PM"
                : "AM";

        horas =
            horas % 12 || 12;

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

        const fecha =
            new Date();

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


    /* COMO ESTA */

    if (
        textoMinusculas.includes("como estas") ||
        textoMinusculas.includes("como esta") ||
        textoMinusculas.includes("como te sientes") ||
        textoMinusculas.includes("estas bien")
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
                    Math.random() *
                    respuestas.length
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
   INVESTIGACIÓN
========================= */

const preguntaInvestigacion =
    document.getElementById(
        "preguntaInvestigacion"
    );

const botonInvestigar =
    document.getElementById(
        "investigar"
    );

const resultadoInvestigacion =
    document.getElementById(
        "resultadoInvestigacion"
    );

const abrirBusqueda =
    document.getElementById(
        "abrirBusqueda"
    );

let ultimaBusqueda = "";


async function investigarEnInternet(
    pregunta
) {

    despertarRobot();

    pregunta =
        pregunta.trim();

    if (pregunta === "") {

        resultadoInvestigacion.textContent =
            "Escribe una pregunta primero.";

        hablar(
            "Escribe una pregunta primero."
        );

        return;
    }

    ultimaBusqueda =
        pregunta;

    resultadoInvestigacion.textContent =
        "🔎 Estoy investigando...";

    mostrarMensaje(
        "🔎 Estoy investigando..."
    );

    try {

        const parametrosBusqueda =
            new URLSearchParams({

                action: "query",

                list: "search",

                srsearch: pregunta,

                srlimit: "3",

                format: "json",

                origin: "*"

            });


        const respuestaBusqueda =
            await fetch(
                "https://es.wikipedia.org/w/api.php?" +
                parametrosBusqueda.toString()
            );


        if (!respuestaBusqueda.ok) {

            throw new Error(
                "Error de conexión"
            );
        }


        const datosBusqueda =
            await respuestaBusqueda.json();


        const resultados =
            datosBusqueda?.query?.search ||
            [];


        if (
            resultados.length === 0
        ) {

            resultadoInvestigacion.innerHTML =
                `
                <strong>
                    No encontré información suficiente.
                </strong>
                <br><br>
                Puedes ver más resultados en Internet.
                `;

            mostrarMensaje(
                "No encontré información suficiente."
            );

            hablar(
                "No encontré información suficiente."
            );

            return;
        }


        const titulo =
            resultados[0].title;


        const parametrosPagina =
            new URLSearchParams({

                action: "query",

                prop: "extracts",

                exintro: "1",

                explaintext: "1",

                redirects: "1",

                titles: titulo,

                format: "json",

                origin: "*"

            });


        const respuestaPagina =
            await fetch(
                "https://es.wikipedia.org/w/api.php?" +
                parametrosPagina.toString()
            );


        const datosPagina =
            await respuestaPagina.json();


        const paginas =
            datosPagina?.query?.pages ||
            {};


        const pagina =
            Object.values(paginas)[0];


        let resumen =
            pagina?.extract || "";


        resumen =
            resumen.trim();


        if (resumen === "") {

            resumen =
                "Encontré el tema, pero no pude obtener un resumen.";
        }


        const resumenParaHablar =
            resumirParaVoz(
                resumen
            );


        resultadoInvestigacion.innerHTML =
            `
            <strong>
                ${escapeHTML(titulo)}
            </strong>

            <p>
                ${escapeHTML(resumen)}
            </p>
            `;


        mostrarMensaje(
            "Encontré información sobre " +
            titulo
        );


        hablar(
            "Encontré información sobre " +
            titulo +
            ". " +
            resumenParaHablar
        );


    } catch (error) {

        console.error(error);

        resultadoInvestigacion.innerHTML =
            `
            <strong>
                No pude realizar la investigación.
            </strong>
            <br><br>
            Comprueba tu conexión a Internet.
            `;

        mostrarMensaje(
            "No pude realizar la investigación."
        );

        hablar(
            "No pude realizar la investigación."
        );
    }
}


function resumirParaVoz(texto) {

    const limite =
        850;

    if (
        texto.length <= limite
    ) {

        return texto;
    }

    return (
        texto.substring(
            0,
            limite
        ) +
        "."
    );
}


function escapeHTML(texto) {

    return texto
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


botonInvestigar.addEventListener(
    "click",
    function () {

        investigarEnInternet(
            preguntaInvestigacion.value
        );
    }
);


preguntaInvestigacion.addEventListener(
    "keydown",
    function (evento) {

        if (
            evento.key === "Enter"
        ) {

            investigarEnInternet(
                preguntaInvestigacion.value
            );
        }
    }
);


abrirBusqueda.addEventListener(
    "click",
    function () {

        const pregunta =
            preguntaInvestigacion.value.trim() ||
            ultimaBusqueda;

        if (
            pregunta === ""
        ) {

            mostrarMensaje(
                "Escribe algo para buscar."
            );

            return;
        }

        const url =
            "https://www.google.com/search?q=" +
            encodeURIComponent(
                pregunta
            );

        window.open(
            url,
            "_blank"
        );
    }
);


/* =========================
   REPETIR TEXTO
========================= */

botonRepetir.addEventListener(
    "click",
    function () {

        despertarRobot();

        const texto =
            textoRepetir.value.trim();

        if (
            texto === ""
        ) {

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
    }
);


/* =========================
   SISTEMA DE PUNTOS
========================= */

let puntos =
    0;


const elementoPuntos =
    document.getElementById(
        "puntos"
    );


function sumarPuntos(cantidad) {

    puntos += cantidad;

    elementoPuntos.textContent =
        puntos;
}


/* =========================
   ELEMENTOS DE JUEGOS
========================= */

const resultadoJuego =
    document.getElementById(
        "resultadoJuego"
    );

const opcionesPPT =
    document.getElementById(
        "opcionesPPT"
    );

const respuestaTrivia =
    document.getElementById(
        "respuestaTrivia"
    );

const respuestaUsuario =
    document.getElementById(
        "respuestaUsuario"
    );

const comprobarTrivia =
    document.getElementById(
        "comprobarTrivia"
    );


/* =========================
   CHISTES
========================= */

const chistes = [

    "¿Qué hace una abeja en el gimnasio? ¡Zum-ba!",

    "¿Cuál es el colmo de un electricista? No encontrar su corriente de trabajo.",

    "¿Qué le dijo un techo a otro techo? Techo de menos.",

    "¿Qué hace una computadora cuando tiene frío? Cierra Windows.",

    "¿Por qué el libro de matemáticas estaba triste? Porque tenía demasiados problemas."

];


function contarChiste() {

    ocultarJuegos();

    const chiste =
        chistes[
            Math.floor(
                Math.random() *
                chistes.length
            )
        ];

    resultadoJuego.textContent =
        "😂 " + chiste;

    mostrarMensaje(
        "Te voy a contar un chiste."
    );

    hablar(chiste);
}


/* =========================
   ADIVINANZAS
========================= */

const adivinanzas = [

    {
        pregunta:
            "Tengo agujas y no sé coser. ¿Qué soy?",

        respuesta:
            "reloj"
    },

    {
        pregunta:
            "Cuanto más quitas, más grande se vuelve. ¿Qué es?",

        respuesta:
            "agujero"
    },

    {
        pregunta:
            "Tiene dientes pero no puede comer. ¿Qué es?",

        respuesta:
            "peine"
    },

    {
        pregunta:
            "Vuelo sin alas y lloro sin ojos. ¿Qué soy?",

        respuesta:
            "nube"
    }

];


let adivinanzaActual =
    null;


function iniciarAdivinanza() {

    ocultarJuegos();

    adivinanzaActual =
        adivinanzas[
            Math.floor(
                Math.random() *
                adivinanzas.length
            )
        ];

    resultadoJuego.textContent =
        "🧩 " +
        adivinanzaActual.pregunta;

    mostrarMensaje(
        "Tengo una adivinanza para ti."
    );

    hablar(
        adivinanzaActual.pregunta
    );

    respuestaTrivia.style.display =
        "block";
}


/* =========================
   TRIVIA
========================= */

const trivias = [

    {
        pregunta:
            "¿Cuál es el planeta más grande del sistema solar?",

        respuesta:
            "jupiter"
    },

    {
        pregunta:
            "¿Cuántos continentes hay tradicionalmente?",

        respuesta:
            "7"
    },

    {
        pregunta:
            "¿En qué país se encuentra la Torre Eiffel?",

        respuesta:
            "francia"
    },

    {
        pregunta:
            "¿Cuál es el océano más grande?",

        respuesta:
            "pacifico"
    },

    {
        pregunta:
            "¿Cuántos lados tiene un hexágono?",

        respuesta:
            "6"
    }

];


let triviaActual =
    null;


function iniciarTrivia() {

    ocultarJuegos();

    triviaActual =
        trivias[
            Math.floor(
                Math.random() *
                trivias.length
            )
        ];

    resultadoJuego.textContent =
        "🧠 " +
        triviaActual.pregunta;

    mostrarMensaje(
        "Aquí tienes una pregunta de trivia."
    );

    hablar(
        triviaActual.pregunta
    );

    respuestaTrivia.style.display =
        "block";
}


comprobarTrivia.addEventListener(
    "click",
    comprobarRespuesta
);


respuestaUsuario.addEventListener(
    "keydown",
    function (evento) {

        if (
            evento.key === "Enter"
        ) {

            comprobarRespuesta();
        }
    }
);


function comprobarRespuesta() {

    const respuesta =
        normalizarTexto(
            respuestaUsuario.value
        ).trim();


    if (
        respuesta === ""
    ) {

        hablar(
            "Escribe una respuesta primero."
        );

        return;
    }


    if (
        triviaActual &&
        respuesta ===
        triviaActual.respuesta
    ) {

        sumarPuntos(10);

        resultadoJuego.textContent =
            "🎉 ¡Correcto! Ganaste 10 puntos.";

        mostrarMensaje(
            "¡Respuesta correcta!"
        );

        hablar(
            "¡Correcto! Ganaste 10 puntos."
        );

    } else if (
        adivinanzaActual &&
        respuesta ===
        adivinanzaActual.respuesta
    ) {

        sumarPuntos(10);

        resultadoJuego.textContent =
            "🎉 ¡Correcto! Ganaste 10 puntos.";

        mostrarMensaje(
            "¡Adivinaste!"
        );

        hablar(
            "¡Correcto! Ganaste 10 puntos."
        );

    } else {

        resultadoJuego.textContent =
            "❌ No es correcto. ¡Inténtalo otra vez!";

        mostrarMensaje(
            "No es correcto."
        );

        hablar(
            "No es correcto. Inténtalo otra vez."
        );
    }


    respuestaUsuario.value = "";

    triviaActual = null;
    adivinanzaActual = null;
}


/* =========================
   PIEDRA PAPEL TIJERA
========================= */

const opciones =
    [
        "piedra",
        "papel",
        "tijera"
    ];


function iniciarPPT() {

    ocultarJuegos();

    opcionesPPT.style.display =
        "block";

    resultadoJuego.textContent =
        "✊ ¡Elige piedra, papel o tijera!";

    mostrarMensaje(
        "Elige tu jugada."
    );

    hablar(
        "Elige piedra, papel o tijera."
    );
}


document
    .querySelectorAll(
        "#opcionesPPT button"
    )
    .forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                function () {

                    jugarPPT(
                        boton.dataset.eleccion
                    );
                }
            );
        }
    );


function jugarPPT(jugador) {

    const computadora =
        opciones[
            Math.floor(
                Math.random() *
                opciones.length
            )
        ];


    let resultado;


    if (
        jugador === computadora
    ) {

        resultado =
            "🤝 ¡Empate!";

    } else if (

        (
            jugador === "piedra" &&
            computadora === "tijera"
        ) ||

        (
            jugador === "papel" &&
            computadora === "piedra"
        ) ||

        (
            jugador === "tijera" &&
            computadora === "papel"
        )

    ) {

        resultado =
            "🎉 ¡Ganaste! +10 puntos";

        sumarPuntos(10);

    } else {

        resultado =
            "😅 ¡Tachi ganó esta vez!";
    }


    const texto =
        `Tú elegiste ${jugador}. Tachi eligió ${computadora}. ${resultado}`;


    resultadoJuego.textContent =
        texto;

    mostrarMensaje(
        resultado
    );

    hablar(texto);
}


/* =========================
   SORPRÉNDEME
========================= */

function sorprender() {

    const acciones = [

        "trivia",

        "adivinanza",

        "chiste",

        "ppt"

    ];


    const accion =
        acciones[
            Math.floor(
                Math.random() *
                acciones.length
            )
        ];


    if (
        accion === "trivia"
    ) {

        iniciarTrivia();

    } else if (
        accion === "adivinanza"
    ) {

        iniciarAdivinanza();

    } else if (
        accion === "chiste"
    ) {

        contarChiste();

    } else {

        iniciarPPT();
    }
}


/* =========================
   OCULTAR JUEGOS
========================= */

function ocultarJuegos() {

    opcionesPPT.style.display =
        "none";

    respuestaTrivia.style.display =
        "none";

    triviaActual = null;
    adivinanzaActual = null;

    respuestaUsuario.value = "";
}


/* =========================
   BOTONES
========================= */

document
    .getElementById(
        "sorprendeme"
    )
    .addEventListener(
        "click",
        sorprender
    );


document
    .getElementById(
        "trivia"
    )
    .addEventListener(
        "click",
        iniciarTrivia
    );


document
    .getElementById(
        "adivinanza"
    )
    .addEventListener(
        "click",
        iniciarAdivinanza
    );


document
    .getElementById(
        "chiste"
    )
    .addEventListener(
        "click",
        contarChiste
    );


document
    .getElementById(
        "piedraPapelTijera"
    )
    .addEventListener(
        "click",
        iniciarPPT
    );


/* =========================
   MATEMÁTICAS
========================= */

const ecuacion =
    document.getElementById(
        "ecuacion"
    );

const botonResolver =
    document.getElementById(
        "resolver"
    );

const resultadoMatematico =
    document.getElementById(
        "resultadoMatematico"
    );


function resolverMatematicas() {

    const entrada =
        ecuacion.value.trim();

    if (
        entrada === ""
    ) {

        resultadoMatematico.textContent =
            "Escribe una operación o ecuación.";

        return;
    }


    try {

        let expresion =
            entrada
                .toLowerCase()
                .replace(
                    /,/g,
                    "."
                )
                .replace(
                    /×/g,
                    "*"
                )
                .replace(
                    /÷/g,
                    "/"
                )
                .replace(
                    /−/g,
                    "-"
                )
                .replace(
                    /\^/g,
                    "**"
                )
                .replace(
                    /√/g,
                    "Math.sqrt"
                );


        expresion =
            expresion.replace(
                /(\d+(?:\.\d+)?)%/g,
                "($1/100)"
            );


        expresion =
            expresion.replace(
                /(\d)\s*x\s*(\d)/g,
                "$1*$2"
            );


        if (
            /^[0-9+\-*/().%\s*xMath.sqrt]+$/i.test(
                expresion
            ) &&
            !/[a-z]/i.test(
                expresion.replace(
                    /Math\.sqrt/gi,
                    ""
                )
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
                    Number.isInteger(
                        resultado
                    )
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


        const ecuacionCoincide =
            entrada
                .replace(
                    /\s/g,
                    ""
                )
                .match(
                    /^([+-]?\d*\.?\d*)x([+-]\d+\.?\d*)?=([+-]?\d+\.?\d*)$/
                );


        if (
            ecuacionCoincide
        ) {

            let a =
                ecuacionCoincide[1];

            let b =
                ecuacionCoincide[2] ||
                "0";

            let c =
                ecuacionCoincide[3];


            if (
                a === "" ||
                a === "+"
            ) {

                a = 1;
            }


            if (
                a === "-"
            ) {

                a = -1;
            }


            a = Number(a);
            b = Number(b);
            c = Number(c);


            if (
                a !== 0
            ) {

                const x =
                    (c - b) / a;


                const respuesta =
                    Number.isInteger(x)
                        ? x
                        : Number(
                            x.toFixed(10)
                        );


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


        hablar(
            "No pude resolver esa ecuación."
        );


    } catch (error) {

        resultadoMatematico.textContent =
            "No pude entender la operación.";

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

        if (
            evento.key === "Enter"
        ) {

            resolverMatematicas();
        }
    }
);


/* =========================
   MÚSICA
========================= */

const archivoMusica =
    document.getElementById(
        "archivoMusica"
    );

const audioMusica =
    document.getElementById(
        "audioMusica"
    );

const nombreCancion =
    document.getElementById(
        "nombreCancion"
    );

const reproducirMusica =
    document.getElementById(
        "reproducirMusica"
    );

const pausarMusica =
    document.getElementById(
        "pausarMusica"
    );

const detenerMusica =
    document.getElementById(
        "detenerMusica"
    );

const volumen =
    document.getElementById(
        "volumen"
    );


archivoMusica.addEventListener(
    "change",
    function () {

        const archivo =
            archivoMusica.files[0];

        if (
            !archivo
        ) {

            return;
        }


        const url =
            URL.createObjectURL(
                archivo
            );


        audioMusica.src =
            url;


        nombreCancion.textContent =
            archivo.name;
    }
);


reproducirMusica.addEventListener(
    "click",
    function () {

        if (
            !audioMusica.src
        ) {

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

        audioMusica.currentTime =
            0;
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

let temporizadorDormir =
    null;


function despertarRobot() {

    robot.classList.remove(
        "dormido"
    );

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

    robot.classList.add(
        "dormido"
    );

    mostrarMensaje(
        "😴 Zzz..."
    );
}


/* =========================
   INICIO
========================= */

iniciarTemporizadorDormir();
