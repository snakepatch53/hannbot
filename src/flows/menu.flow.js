const { addKeyword } = require("@bot-whatsapp/bot");
const { flowAutorizar_smartolt, flowVerPotencia_smartolt } = require("./smartolt.flow");

const flowMenu = addKeyword(["menu", "hola", "ole", "alo"])
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
        [
            flowAutorizar_smartolt,
            flowVerPotencia_smartolt,
            addKeyword("img").addAnswer("img", null, (ctx, { flowDynamic }) => {
                flowDynamic({
                    body: "img",
                    media: "https:\\/\\/api.moronanet.com\\/public\\/cloud_img\\/power_ont_smartolt.png",
                });
            }),
        ]
    );

module.exports = flowMenu;
