const { addKeyword } = require("@bot-whatsapp/bot");
const { flowAutorizar_smartolt, flowVerPotencia_smartolt } = require("./smartolt.flow");
const { flowGetDataClient_smartolt, flowChangeIPClient_mikrowisp } = require("./mikrowisp.flow");

const flowMenu = addKeyword([
    "hola",
    "menu",
    "inicio",
    "comenzar",
    "empezar",
    "iniciar",
    "inicia",
    "iniciemos",
    "buenas tardes",
    "buenas noches",
    "buenos dias",
    "buen dia",
    "buenas",
    "hello",
    "hi",
    "hey",
    "hola",
    "holi",
    "holis",
    "holaa",
    "holaaa",
    "holaaaa",
    "holaaaaa",
    "start",
    "good morning",
    "good afternoon",
    "good evening",
    "good night",
    "good day",
    "good",
])
    .addAnswer("🙌 Hola bienvenido a la nueva version de *Hannbot 🤖* ")
    .addAnswer("Soy un bot tenico de Moronanet, listo para ayudarte.")
    .addAnswer(["📡 SmartOlt:"], {
        buttons: [{ body: "Autorizame un equipo 🖥️" }, { body: "Ver la potencia de un cliente ⚡" }],
    })
    .addAnswer(
        ["📡 Mikrowisp:"],
        {
            buttons: [{ body: "Enviame datos de un cliente 🧑" }, { body: "Cambia el IP de un cliente 🌐" }],
        },
        null,
        [flowAutorizar_smartolt, flowVerPotencia_smartolt, flowGetDataClient_smartolt, flowChangeIPClient_mikrowisp]
    );

module.exports = flowMenu;
