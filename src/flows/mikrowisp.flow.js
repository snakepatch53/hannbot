const { addKeyword } = require("@bot-whatsapp/bot");
const { sleep } = require("./../general/sleep.general");
const { getNumberIcon } = require("./utils.flow");
const { searchClients_mikrowisp, getPlans_mikrowisp, getData_mikrowisp, changeIP_mikrowisp } = require("./../scraping/mikrowisp.scraping");

// #region flow consultar cliente

const clientObj = {
    clients: [],
    services: [],
    client_name: null,
    selected_client: null,
    selected_service: null,
};

const flowGetDataClient_smartolt = addKeyword(["enviame datos de un cliente"])
    .addAnswer("Ingresa el nombre del cliente que deseas consultar 👤", { capture: true }, async (ctx) => (clientObj.client_name = ctx.body))
    .addAnswer("Espera mientras busco coincidencias con ese nombre ⌛", null, async (ctx, { flowDynamic, endFlow }) => {
        const clients = await searchClients_mikrowisp(clientObj.client_name);
        if (clients.length === 0) return await endFlow({ body: "No se encontraron coincidencias con ese nombre 😥" });
        clientObj.clients = clients;
        const responses = [];
        clients.forEach(async (client, index) => {
            if (index > 3) return;
            responses.push({ body: `*${getNumberIcon(index)}* ${client.name}.` });
        });
        await flowDynamic(responses);
    })
    .addAnswer("➡️ Listo, selecciona el numero de opcion segun el cliente que deseas consultar: ", { capture: true }, async (ctx, { fallBack }) => {
        const option = ctx.body;
        const clients = clientObj.clients;
        if (option < 0 || option >= clients.length) return await fallBack({ body: "❌ *Opcion invalida, vuelve a intentarlo* ❌" });
        clientObj.selected_client = clients[option];
    })
    .addAnswer("Espera mientras busco los servicios de ese cliente ⌛", null, async (ctx, { flowDynamic, endFlow }) => {
        const client = await getPlans_mikrowisp(clientObj.selected_client);
        if (client.services.length === 0) return await endFlow({ body: "Este cliente no tiene ningun servicio registrado 😥" });
        clientObj.selected_client = client;
        const { services } = client;
        clientObj.services = services;
        const responses = [];
        services.forEach(async (service, index) => {
            if (index > 3) return;
            responses.push({ body: `*${getNumberIcon(index)}* *Plan:* ${service.plan}, *Direccion:* ${service.address}.` });
        });
        await flowDynamic([
            {
                body: `🚀 *Servicios del cliente ${client.name.toUpperCase()}* 🚀`,
            },
            ...responses,
        ]);
    })
    .addAnswer("➡️ Listo, selecciona el numero de opcion segun el servicio que deseas consultar: ", { capture: true }, async (ctx, { fallBack }) => {
        const option = ctx.body;
        if (option < 0 || option >= clientObj.services.length) return await fallBack({ body: "❌ *Opcion invalida, vuelve a intentarlo* ❌" });
        clientObj.selected_service = clientObj.services[option];
    })
    .addAnswer("Espera mientras busco los datos del servicio ⌛", null, async (ctx, { flowDynamic }) => {
        const client = clientObj.selected_client;
        console.log(client);
        let service = clientObj.selected_service;
        service = await getData_mikrowisp(client, service);
        clientObj.selected_service = service;
        await flowDynamic([
            `*👤 Datos del cliente ${client.name.toUpperCase()} 👤*`,
            `🏠 *Direccion:* ${client.address.trim() || "No registrada"}`,
            `📈 *Pagos:* ${client.state} ${client.state.toLowerCase() == "activo" ? "🟢" : client.state.toLowerCase() == "suspendido" ? "🟠" : "🔴"}`,
            `🚀 *Plan:* ${service.plan}`,
            "📱 *Telefono:* ",
            client.movil.trim() || client.tel.trim() || "No registrado",
            "🗺️ *Ubicacion:* ",
            service.location !== "" ? service.location_link : "No registrada",
            "🌐 *IP:* ",
            service.ip,
            "🏷️ *VLAN:*",
            service.vlan,
            "👨‍🔧 *PPPoE Usuario:* ",
            service.pppoe_user,
            "🔑 *PPPoE Contraseña:* ",
            service.pppoe_pass,
        ]);
    })
    .addAnswer("😁 Gracias por usar este servicio 😁")
    .addAnswer(`👋 Si necesitas mi ayuda de nuevo solo escribe "*HOLA*" 👋`);
// #endregion

// #region flow cambiar ip cliente
const flowChangeIPClient_mikrowisp = addKeyword(["cambia el ip de un cliente"]).addAnswer("Esta funcion aun no esta disponible 😥");

// #endregion

module.exports = { flowGetDataClient_smartolt, flowChangeIPClient_mikrowisp };
