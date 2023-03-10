const { addKeyword } = require("@bot-whatsapp/bot");
const { sleep } = require("./../general/sleep.general");
const { getNumberIcon } = require("./utils.flow");
const { searchClients_mikrowisp, getPlans_mikrowisp, getData_mikrowisp, updateVlanIp_mikrowisp, changeIP_mikrowisp } = require("./../scraping/mikrowisp.scraping");
const { getUncofigureds_smartolt, getPlans_smartolt, autorize_smartolt, searchOnus_smartolt, getPower_smartolt } = require("./../scraping/smartolt.scraping");

// #region flow consultar cliente -> utils

async function sendDataClient_callback(ctx, { flowDynamic }) {
    const client = clientObj.selected_client;
    let service = clientObj.selected_service;
    service = await getData_mikrowisp(client, service);
    clientObj.selected_service = service;
    await flowDynamic([
        `*π€ Datos del cliente ${client.name.toUpperCase()} π€*`,
        `π  *Direccion:* ${client.address.trim() || "No registrada"}`,
        `π *Pagos:* ${client.state} ${client.state.toLowerCase() == "activo" ? "π’" : client.state.toLowerCase() == "suspendido" ? "π " : "π΄"}`,
        `π *Plan:* ${service.plan}`,
        "π± *Telefono:* ",
        client.movil.trim() || client.tel.trim() || "No registrado",
        "πΊοΈ *Ubicacion:* ",
        service.location !== "" ? service.location_link : "No registrada",
        "π *IP:* ",
        service.ip,
        "π·οΈ *VLAN:*",
        service.vlan,
        "π¨βπ§ *PPPoE Usuario:* ",
        service.pppoe_user,
        "π *PPPoE ContraseΓ±a:* ",
        service.pppoe_pass,
    ]);
}
// #endregion

// #region flow consultar cliente

const clientObj = {
    clients: [],
    services: [],
    client_name: null,
    selected_client: null,
    selected_service: null,

    onus: [],
    selected_onu: null,
};

const flowGetDataClient_smartolt = addKeyword(["enviame datos de un cliente"])
    .addAnswer("Ingresa el nombre del cliente que deseas consultar π€", { capture: true }, async (ctx) => (clientObj.client_name = ctx.body))
    .addAnswer("Espera mientras busco coincidencias con ese nombre β", null, async (ctx, { flowDynamic, endFlow }) => {
        const clients = await searchClients_mikrowisp(clientObj.client_name);
        if (clients.length === 0) return await endFlow({ body: "No se encontraron coincidencias con ese nombre π₯" });
        clientObj.clients = clients;
        const responses = [];
        clients.forEach(async (client, index) => {
            if (index > 3) return;
            responses.push({ body: `*${getNumberIcon(index)}* ${client.name}.` });
        });
        await flowDynamic(responses);
    })
    .addAnswer("β‘οΈ Listo, selecciona el numero de opcion segun el cliente que deseas consultar: ", { capture: true }, async (ctx, { fallBack }) => {
        const option = ctx.body;
        const clients = clientObj.clients;
        if (option < 0 || option >= clients.length) return await fallBack({ body: "β *Opcion invalida, vuelve a intentarlo* β" });
        clientObj.selected_client = clients[option];
    })
    .addAnswer("Espera mientras busco los servicios de ese cliente β", null, async (ctx, { flowDynamic, endFlow }) => {
        const client = await getPlans_mikrowisp(clientObj.selected_client);
        if (client.services.length === 0) return await endFlow({ body: "Este cliente no tiene ningun servicio registrado π₯" });
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
                body: `π *Servicios del cliente ${client.name.toUpperCase()}* π`,
            },
            ...responses,
        ]);
    })
    .addAnswer("β‘οΈ Listo, selecciona el numero de opcion segun el servicio que deseas consultar: ", { capture: true }, async (ctx, { fallBack }) => {
        const option = ctx.body;
        if (option < 0 || option >= clientObj.services.length) return await fallBack({ body: "β *Opcion invalida, vuelve a intentarlo* β" });
        clientObj.selected_service = clientObj.services[option];
    })
    .addAnswer("ΒΏQuieres actualizar el *VLAN* y el *IP* del cliente segun el *BORAD* y *PORT* de *SMARTOLT* β", {
        buttons: [{ body: "Si βοΈ" }, { body: "No β" }],
        capture: true,
    })
    .addAnswer("Ok, espera un momento por favor β", null, async (ctx, { flowDynamic, endFlow }) => {
        const option = ctx.body;
        if (option.toLowerCase().includes("no")) {
            await flowDynamic("β Extraere los datos actuales del cliente β");
            await sendDataClient_callback(ctx, { flowDynamic, endFlow });
            await endFlow({ body: `π Gracias por usar este servicio π, π Si necesitas mi ayuda de nuevo solo escribe *"HOLA"* π` });
        }
    })
    .addAnswer("β Buscare la *ONT* del cliente en *SMARTOLT* β", null, async (ctx, { flowDynamic, endFlow }) => {
        const client = clientObj.selected_client;
        const onus = await searchOnus_smartolt(client.name);
        if (onus.length === 0) {
            return await endFlow([
                { body: "No se encontraron coincidencias con ese nombre π₯" },
                { body: "Es posible que este registrado con un nombre totalmente diferente" },
            ]);
        }
        clientObj.onus = onus;
        const responses = [];
        onus.forEach(async (onu, index) => {
            if (index > 3) return;
            responses.push({ body: `*${getNumberIcon(index)}* *ONT:* ${onu.name}, *VLAN:* ${onu.vlan}, *SERIE:* ${onu.serie}` });
        });
        await flowDynamic([
            {
                body: `π‘ *ONTs del cliente ${client.name.toUpperCase()}* π‘`,
            },
            ...responses,
        ]);
    })
    .addAnswer("β‘οΈ Listo, selecciona el numero de opcion segun el *ONU* que deseas consultar: ", { capture: true }, async (ctx, { fallBack }) => {
        const option = ctx.body;
        const onus = clientObj.onus;
        if (option < 0 || option >= onus.length) return await fallBack({ body: "β *Opcion invalida, vuelve a intentarlo* β" });
        clientObj.selected_onu = onus[option];
    })
    .addAnswer("Espera mientras actualizo la *VLAN* y la *IP* del cliente β", null, async (ctx, { flowDynamic, endFlow }) => {
        const client = clientObj.selected_client;
        const onu = clientObj.selected_onu;
        let service = clientObj.selected_service;
        service = await updateVlanIp_mikrowisp(client, service, onu);
        clientObj.selected_service = service;
        await sleep(2);
    })
    .addAnswer(["Actualizado β", "Espera mientras busco los datos del servicio β"], null, sendDataClient_callback)
    .addAnswer("π Gracias por usar este servicio π")
    .addAnswer(`π Si necesitas mi ayuda de nuevo solo escribe *"HOLA"* π`);

// #endregion

// #region flow cambiar ip cliente
const flowChangeIPClient_mikrowisp = addKeyword(["cambia el ip de un cliente"]).addAnswer("Esta funcion aun no esta disponible π₯");

// #endregion

module.exports = { flowGetDataClient_smartolt, flowChangeIPClient_mikrowisp };
