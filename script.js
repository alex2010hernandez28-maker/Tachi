const hablarBtn = document.getElementById("hablar");
const repetirBtn = document.getElementById("repetir");
const textoRepetir = document.getElementById("textoRepetir");

const respuestaVoz = document.getElementById("respuestaVoz");
const estadoTachi = document.getElementById("estadoTachi");
const rostroTachi = document.getElementById("rostroTachi");

const investigarBtn = document.getElementById("investigar");
const preguntaInvestigacion =
    document.getElementById("preguntaInvestigacion");
const resultadoInvestigacion =
    document.getElementById("resultadoInvestigacion");
const abrirBusqueda =
    document.getElementById("abrirBusqueda");

const sorprendemeBtn =
    document.getElementById("sorprendeme");
const triviaBtn =
    document.getElementById("trivia");
const adivinanzaBtn =
    document.getElementById("adivinanza");
const chisteBtn =
    document.getElementById("chiste");
const piedraPapelTijeraBtn =
    document.getElementById("piedraPapelTijera");

const puntosElemento =
    document.getElementById("puntos");
const resultadoJuego =
    document.getElementById("resultadoJuego");

const opcionesPPT =
    document.getElementById("opcionesPPT");
const zonaRespuesta =
    document.getElementById("zonaRespuesta");
const respuestaUsuario =
    document.getElementById("respuestaUsuario");
const comprobarTrivia =
    document.getElementById("comprobarTrivia");

const resolverBtn =
    document.getElementById("resolver");
const ecuacion =
    document.getElementById("ecuacion");
const resultadoMatematico =
    document.getElementById("resultadoMatematico");

const archivoMusica =
    document.getElementById("archivoMusica");
const reproductor =
    document.getElementById("reproductor");
const playMusica =
    document.getElementById("playMusica");
const pausaMusica =
    document.getElementById("pausaMusica");
const stopMusica =
    document.getElementById("stopMusica");
const volumenMusica =
    document.getElementById("volumenMusica");


let puntos = 0;
let temporizadorDormir;
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

    clearTimeout(temporizadorDormir);

    if (rostroTachi) {
        rostroTachi.src =
            rostrosTachi[estado] ||
            rostrosTachi.normal;
    }

    if (estadoTachi) {
        const nombres = {
            normal: "Normal",
            escuchando: "Escuchando",
            hablando: "Hablando",
            investigando: "Investigando",
            sorprendido: "Sorprendido",
            feliz: "Feliz",
            dormido: "Dormido"
        };

        estadoTachi.textContent =
            nombres[estado] || "Normal";
    }

    document.body.classList.remove(
        "tachi-escuchando",
        "tachi-hablando",
        "tachi-investigando",
        "tachi-dormido"
    );

    if (
        estado === "escuchando" ||
        estado === "hablando" ||
        estado === "investigando" ||
        estado === "dormido"
    ) {
        document.body.classList.add(
            `tachi-${estado}`
        );
    }
}


function programarDormir() {

    clearTimeout(temporizadorDormir);

    temporizadorDormir = setTimeout(() => {
        cambiarEstado("dormido");
    }, 5000);
}


function detenerVoz() {

    idVoz++;

    if ("speechSynthesis" in window) {
        speechSynthesis.cancel();
    }

    cambiarEstado("normal");
}


function hablar(texto) {

    if (!texto || !texto.trim()) return;

    const idActual = ++idVoz;

    if (!("speechSynthesis" in window)) {

        console.error(
            "Este navegador no admite síntesis de voz."
        );

        return;
    }

    speechSynthesis.cancel();

    cambiarEstado("hablando");

    const voz =
        new SpeechSynthesisUtterance(texto);

    voz.lang = "es-SV";
    voz.rate = 0.96;
    voz.pitch = 1;
    voz.volume = 1;

    voz.onend = () => {

        if (idActual !== idVoz) return;

        cambiarEstado("normal");
        programarDormir();
    };

    voz.onerror = () => {

        if (idActual !== idVoz) return;

        cambiarEstado("normal");
        programarDormir();
    };

    speechSynthesis.speak(voz);
}


function actualizarPuntos(cantidad) {

    puntos += cantidad;

    if (puntos < 0) {
        puntos = 0;
    }

    if (puntosElemento) {
        puntosElemento.textContent = puntos;
    }
}


function responder(texto) {

    if (!respuestaVoz) return;

    respuestaVoz.textContent = texto;

    hablar(texto);
}


function obtenerHora() {

    const ahora = new Date();

    return ahora.toLocaleTimeString(
        "es-SV",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );
}


function obtenerFecha() {

    const ahora = new Date();

    return ahora.toLocaleDateString(
        "es-SV",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}


function calcularExpresion(expresion) {

    let texto = expresion
        .toLowerCase()
        .trim();

    texto = texto
        .replace(/raiz/g, "Math.sqrt")
        .replace(/√/g, "Math.sqrt")
        .replace(/\^/g, "**")
        .replace(/,/g, ".")
        .replace(/%/g, "/100");

    texto = texto.replace(
        /(\d+)\s*%/g,
        "($1/100)"
    );

    try {

        if (
            !/^[0-9+\-*/().\sMathsqrt]+$/.test(
                texto
            )
        ) {
            return null;
        }

        const resultado =
            Function(
                `"use strict"; return (${texto})`
            )();

        if (
            typeof resultado !== "number" ||
            !isFinite(resultado)
        ) {
            return null;
        }

        return resultado;

    } catch (error) {

        return null;
    }
}


function resolverEcuacion(ecuacionTexto) {

    let texto = ecuacionTexto
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/−/g, "-");

    if (!texto.includes("=")) {
        return null;
    }

    const partes = texto.split("=");

    if (partes.length !== 2) {
        return null;
    }

    let izquierda = partes[0];
    let derecha = partes[1];

    try {

        function obtenerCoeficientes(expresion) {

            let xMatch =
                expresion.match(
                    /^([+-]?\d*\.?\d*)x([+-]\d*\.?\d*)?$/
                );

            if (!xMatch) return null;

            let a = xMatch[1];

            if (a === "" || a === "+") {
                a = 1;
            } else if (a === "-") {
                a = -1;
            } else {
                a = Number(a);
            }

            let b = xMatch[2];

            if (!b) {
                b = 0;
            } else {
                b = Number(b);
            }

            return {
                a,
                b
            };
        }

        const izquierdaCoef =
            obtenerCoeficientes(izquierda);

        if (izquierdaCoef) {

            const c = Number(derecha);

            if (!isFinite(c)) return null;

            const {
                a,
                b
            } = izquierdaCoef;

            if (a === 0) return null;

            return (c - b) / a;
        }

        const derechaCoef =
            obtenerCoeficientes(derecha);

        if (derechaCoef) {

            const c = Number(izquierda);

            if (!isFinite(c)) return null;

            const {
                a,
                b
            } = derechaCoef;

            if (a === 0) return null;

            return (c - b) / a;
        }

    } catch (error) {

        return null;
    }

    return null;
}


if (resolverBtn) {

    resolverBtn.addEventListener(
        "click",
        () => {

            const texto =
                ecuacion.value.trim();

            if (!texto) {

                resultadoMatematico.textContent =
                    "Escribe una operación o ecuación.";

                return;
            }

            const resultadoEcuacion =
                resolverEcuacion(texto);

            if (
                resultadoEcuacion !== null &&
                texto.includes("=")
            ) {

                const resultado =
                    Number.isInteger(
                        resultadoEcuacion
                    )
                        ? resultadoEcuacion
                        : resultadoEcuacion.toFixed(4);

                resultadoMatematico.textContent =
                    `Resultado: x = ${resultado}`;

                responder(
                    `La respuesta es x igual a ${resultado}.`
                );

                return;
            }

            const resultado =
                calcularExpresion(texto);

            if (resultado === null) {

                resultadoMatematico.textContent =
                    "No pude resolver esa operación.";

                responder(
                    "No pude resolver esa operación."
                );

                return;
            }

            const resultadoFinal =
                Number.isInteger(resultado)
                    ? resultado
                    : Number(
                        resultado.toFixed(4)
                    );

            resultadoMatematico.textContent =
                `Resultado: ${resultadoFinal}`;

            responder(
                `El resultado es ${resultadoFinal}.`
            );
        }
    );
}


if (ecuacion) {

    ecuacion.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {
                resolverBtn.click();
            }
        }
    );
}


if (repetirBtn) {

    repetirBtn.addEventListener(
        "click",
        () => {

            const texto =
                textoRepetir.value.trim();

            if (!texto) {

                responder(
                    "Escribe algo para que pueda repetirlo."
                );

                return;
            }

            responder(texto);
        }
    );
}


if (textoRepetir) {

    textoRepetir.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {
                repetirBtn.click();
            }
        }
    );
}


let reconocimiento;

if (
    "SpeechRecognition" in window ||
    "webkitSpeechRecognition" in window
) {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    reconocimiento =
        new SpeechRecognition();

    reconocimiento.lang = "es-SV";
    reconocimiento.continuous = false;
    reconocimiento.interimResults = false;

    reconocimiento.onstart = () => {

        cambiarEstado("escuchando");

        respuestaVoz.textContent =
            "Te estoy escuchando...";
    };

    reconocimiento.onresult = event => {

        const texto =
            event.results[0][0].transcript;

        respuestaVoz.textContent =
            `Escuché: "${texto}"`;

        procesarComando(texto);
    };

    reconocimiento.onerror = event => {

        console.error(
            "Error de reconocimiento:",
            event.error
        );

        cambiarEstado("sorprendido");

        respuestaVoz.textContent =
            "No pude entenderte.";

        programarDormir();
    };

    reconocimiento.onend = () => {

        if (estadoTachi.textContent === "Escuchando") {
            cambiarEstado("normal");
        }
    };
}


if (hablarBtn) {

    hablarBtn.addEventListener(
        "click",
        () => {

            if (!reconocimiento) {

                responder(
                    "Tu navegador no admite reconocimiento de voz."
                );

                return;
            }

            try {

                detenerVoz();

                reconocimiento.start();

            } catch (error) {

                console.error(error);
            }
        }
    );
}


async function investigarTema(tema) {

    if (!tema || !tema.trim()) {

        responder(
            "Escribe algo para investigar."
        );

        return;
    }

    cambiarEstado("investigando");

    resultadoInvestigacion.textContent =
        "Investigando...";

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
            encodeURIComponent(tema);

        const respuesta =
            await fetch(url);

        const datos =
            await respuesta.json();

        const paginas =
            datos.query?.pages;

        if (!paginas) {
            throw new Error(
                "Sin resultados"
            );
        }

        const pagina =
            Object.values(paginas)[0];

        if (
            !pagina ||
            pagina.missing !== undefined
        ) {

            resultadoInvestigacion.textContent =
                "No encontré información sobre ese tema.";

            responder(
                "No encontré información sobre ese tema."
            );

            return;
        }

        const resumen =
            pagina.extract ||
            "No encontré un resumen disponible.";

        resultadoInvestigacion.textContent =
            resumen;

        responder(
            resumen.substring(0, 500)
        );

    } catch (error) {

        console.error(
            "Error investigando:",
            error
        );

        resultadoInvestigacion.textContent =
            "No pude realizar la investigación.";

        responder(
            "No pude realizar la investigación."
        );
    }
}


if (investigarBtn) {

    investigarBtn.addEventListener(
        "click",
        () => {

            investigarTema(
                preguntaInvestigacion.value
            );
        }
    );
}


if (preguntaInvestigacion) {

    preguntaInvestigacion.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {
                investigarBtn.click();
            }
        }
    );
}


if (abrirBusqueda) {

    abrirBusqueda.addEventListener(
        "click",
        () => {

            const pregunta =
                preguntaInvestigacion.value.trim();

            if (!pregunta) {

                responder(
                    "Escribe algo para buscar."
                );

                return;
            }

            const url =
                "https://www.google.com/search?q=" +
                encodeURIComponent(pregunta);

            window.open(
                url,
                "_blank"
            );
        }
    );
}


const chistes = [

    "¿Qué hace una computadora cuando tiene frío? Se pone Windows.",

    "¿Por qué el programador confundió Halloween con Navidad? Porque OCT 31 es igual a DEC 25.",

    "¿Qué le dijo un bit a otro bit? Nos vemos en el próximo byte."

];


const adivinanzas = [

    {
        pregunta:
            "Tengo teclas pero no abro puertas. ¿Qué soy?",
        respuesta: "teclado"
    },

    {
        pregunta:
            "Tengo agujas pero no sé coser. ¿Qué soy?",
        respuesta: "reloj"
    },

    {
        pregunta:
            "Cuanto más quitas, más grande se vuelve. ¿Qué es?",
        respuesta: "agujero"
    }

];


const trivias = [

    {
        pregunta:
            "¿Cuál es el planeta más grande del sistema solar?",
        respuesta: "jupiter"
    },

    {
        pregunta:
            "¿Cuántos continentes hay?",
        respuesta: "7"
    },

    {
        pregunta:
            "¿Cuál es la capital de El Salvador?",
        respuesta: "san salvador"
    }

];


let triviaActual = null;
let adivinanzaActual = null;


if (sorprendemeBtn) {

    sorprendemeBtn.addEventListener(
        "click",
        () => {

            const opciones = [

                () =>
                    responder(
                        "La tecnología avanza cada día. ¡Sigue aprendiendo!"
                    ),

                () =>
                    responder(
                        "Dato curioso: los pulpos tienen tres corazones."
                    ),

                () =>
                    responder(
                        "Nunca dejes de experimentar con tus ideas."
                    ),

                () =>
                    responder(
                        "Quizá hoy sea un buen día para aprender algo nuevo."
                    )

            ];

            const opcion =
                opciones[
                    Math.floor(
                        Math.random() *
                        opciones.length
                    )
                ];

            opcion();

            actualizarPuntos(1);
        }
    );
}


if (triviaBtn) {

    triviaBtn.addEventListener(
        "click",
        () => {

            triviaActual =
                trivias[
                    Math.floor(
                        Math.random() *
                        trivias.length
                    )
                ];

            adivinanzaActual = null;

            zonaRespuesta.classList.remove(
                "oculto"
            );

            opcionesPPT.classList.add(
                "oculto"
            );

            respuestaUsuario.value = "";

            resultadoJuego.textContent =
                triviaActual.pregunta;

            responder(
                triviaActual.pregunta
            );
        }
    );
}


if (adivinanzaBtn) {

    adivinanzaBtn.addEventListener(
        "click",
        () => {

            adivinanzaActual =
                adivinanzas[
                    Math.floor(
                        Math.random() *
                        adivinanzas.length
                    )
                ];

            triviaActual = null;

            zonaRespuesta.classList.remove(
                "oculto"
            );

            opcionesPPT.classList.add(
                "oculto"
            );

            respuestaUsuario.value = "";

            resultadoJuego.textContent =
                adivinanzaActual.pregunta;

            responder(
                adivinanzaActual.pregunta
            );
        }
    );
}


if (chisteBtn) {

    chisteBtn.addEventListener(
        "click",
        () => {

            const chiste =
                chistes[
                    Math.floor(
                        Math.random() *
                        chistes.length
                    )
                ];

            resultadoJuego.textContent =
                chiste;

            responder(chiste);

            actualizarPuntos(1);
        }
    );
}


if (piedraPapelTijeraBtn) {

    piedraPapelTijeraBtn.addEventListener(
        "click",
        () => {

            opcionesPPT.classList.remove(
                "oculto"
            );

            zonaRespuesta.classList.add(
                "oculto"
            );

            resultadoJuego.textContent =
                "Elige piedra, papel o tijera.";

            responder(
                "Elige piedra, papel o tijera."
            );
        }
    );
}


document
    .querySelectorAll(
        "#opcionesPPT button"
    )
    .forEach(boton => {

        boton.addEventListener(
            "click",
            () => {

                const jugador =
                    boton.dataset.eleccion;

                const opciones = [
                    "piedra",
                    "papel",
                    "tijera"
                ];

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
                        `Empate. Tachi eligió ${computadora}.`;

                } else if (

                    (jugador === "piedra" &&
                        computadora === "tijera") ||

                    (jugador === "papel" &&
                        computadora === "piedra") ||

                    (jugador === "tijera" &&
                        computadora === "papel")

                ) {

                    resultado =
                        `Ganaste. Tachi eligió ${computadora}.`;

                    actualizarPuntos(1);

                } else {

                    resultado =
                        `Perdiste. Tachi eligió ${computadora}.`;

                    actualizarPuntos(-1);
                }

                resultadoJuego.textContent =
                    resultado;

                responder(resultado);
            }
        );
    });


if (comprobarTrivia) {

    comprobarTrivia.addEventListener(
        "click",
        () => {

            const respuesta =
                respuestaUsuario.value
                    .trim()
                    .toLowerCase();

            if (!respuesta) return;

            let correcta = false;

            if (triviaActual) {

                correcta =
                    respuesta ===
                    triviaActual.respuesta
                        .toLowerCase();

            }

            if (adivinanzaActual) {

                correcta =
                    respuesta.includes(
                        adivinanzaActual.respuesta
                    );
            }

            if (correcta) {

                resultadoJuego.textContent =
                    "¡Correcto! 🎉";

                responder(
                    "¡Correcto! Muy bien."
                );

                actualizarPuntos(2);

            } else {

                resultadoJuego.textContent =
                    "No es correcto. Inténtalo de nuevo.";

                responder(
                    "No es correcto. Inténtalo de nuevo."
                );
            }
        }
    );
}


if (respuestaUsuario) {

    respuestaUsuario.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {
                comprobarTrivia.click();
            }
        }
    );
}


if (archivoMusica) {

    archivoMusica.addEventListener(
        "change",
        () => {

            const archivo =
                archivoMusica.files[0];

            if (!archivo) return;

            const url =
                URL.createObjectURL(archivo);

            reproductor.src = url;

            reproductor.play().catch(
                error => {
                    console.error(error);
                }
            );
        }
    );
}


if (playMusica) {

    playMusica.addEventListener(
        "click",
        () => {

            reproductor.play().catch(
                error => {
                    console.error(error);
                }
            );
        }
    );
}


if (pausaMusica) {

    pausaMusica.addEventListener(
        "click",
        () => {

            reproductor.pause();
        }
    );
}


if (stopMusica) {

    stopMusica.addEventListener(
        "click",
        () => {

            reproductor.pause();
            reproductor.currentTime = 0;
        }
    );
}


if (volumenMusica) {

    volumenMusica.addEventListener(
        "input",
        () => {

            reproductor.volume =
                Number(
                    volumenMusica.value
                );
        }
    );
}


function procesarComando(texto) {

    const comando =
        texto.toLowerCase().trim();


    if (
        comando.includes("hora") ||
        comando.includes("qué hora") ||
        comando.includes("que hora")
    ) {

        const hora =
            obtenerHora();

        responder(
            `Son las ${hora}.`
        );

        return;
    }


    if (
        comando.includes("fecha") ||
        comando.includes("qué día") ||
        comando.includes("que dia")
    ) {

        const fecha =
            obtenerFecha();

        responder(
            `Hoy es ${fecha}.`
        );

        return;
    }


    if (
        comando.includes("hola") ||
        comando.includes("buenas") ||
        comando.includes("hey")
    ) {

        responder(
            "Hola. Soy Tachi. ¿En qué puedo ayudarte?"
        );

        return;
    }


    if (
        comando.includes("cómo estás") ||
        comando.includes("como estas")
    ) {

        responder(
            "Estoy funcionando perfectamente y lista para ayudarte."
        );

        return;
    }


    if (
        comando.includes("adiós") ||
        comando.includes("adios") ||
        comando.includes("chao")
    ) {

        responder(
            "Hasta luego. Fue un gusto ayudarte."
        );

        return;
    }


    if (
        comando.includes("investiga") ||
        comando.includes("investigar") ||
        comando.includes("busca")
    ) {

        let tema =
            comando
                .replace("investiga", "")
                .replace("investigar", "")
                .replace("busca", "")
                .trim();

        if (!tema) {

            responder(
                "Dime qué quieres que investigue."
            );

            return;
        }

        investigarTema(tema);

        return;
    }


    if (
        comando.includes("sorpréndeme") ||
        comando.includes("sorprendeme")
    ) {

        sorprendemeBtn.click();

        return;
    }


    if (comando.includes("trivia")) {

        triviaBtn.click();

        return;
    }


    if (
        comando.includes("adivinanza") ||
        comando.includes("acertijo")
    ) {

        adivinanzaBtn.click();

        return;
    }


    if (
        comando.includes("chiste") ||
        comando.includes("cuéntame un chiste") ||
        comando.includes("cuentame un chiste")
    ) {

        chisteBtn.click();

        return;
    }


    if (
        comando.includes("piedra") ||
        comando.includes("papel") ||
        comando.includes("tijera")
    ) {

        piedraPapelTijeraBtn.click();

        return;
    }


    const resultado =
        calcularExpresion(comando);

    if (resultado !== null) {

        const resultadoFinal =
            Number.isInteger(resultado)
                ? resultado
                : Number(
                    resultado.toFixed(4)
                );

        responder(
            `El resultado es ${resultadoFinal}.`
        );

        return;
    }


    responder(
        "Entendí lo que dijiste, pero todavía no tengo una respuesta programada para eso."
    );
}


cambiarEstado("normal");
programarDormir();
