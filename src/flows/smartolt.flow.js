const { addKeyword } = require("@bot-whatsapp/bot");
const { sleep } = require("./../general/sleep.general");
const { getUncofigureds_smartolt, getPlans_smartolt, autorize_smartolt, searchOnus_smartolt, getPower_smartolt } = require("./../scraping/smartolt.scraping");

// #region flow autorizar

const autorizeObj = {
    unconfigureds: [],
    plans: [],
    selected_onu: null,
    selected_plan: null,
    client_name: null,
};

const flowAutorizar_smartolt = addKeyword(["autorizame un equipo"])
    .addAnswer("Espera un momento mientras busco los equipos sin autorizar ⌛", null, async (ctx, { flowDynamic }) => {
        autorizeObj.unconfigureds = await getUncofigureds_smartolt();
        const responses = [];
        await autorizeObj.unconfigureds.forEach(async (onu, index) => {
            responses.push({ body: `*${index}*. *Vlan:* ${onu.vlan}, *SN:* ${onu.serie}` });
        });
        await flowDynamic(responses);
    })
    .addAnswer(
        "➡️ Listo, selecciona el numero de opcion segun el equipo con la serie que deseas autorizar: ",
        {
            capture: true,
        },
        async (ctx, { flowDynamic, fallBack }) => {
            const option = ctx.body;
            if (option < 0 || option >= autorizeObj.unconfigureds.length) return await fallBack({ body: " *Opcion invalida, vuelve a intentarlo*" });
            const onu = autorizeObj.unconfigureds[option];
            autorizeObj.selected_onu = onu;
        }
    )
    .addAnswer("Selecciona el plan que deseas asignar al equipo")
    .addAnswer("Espera mientras busco los planes disponibles ⌛", null, async (ctx, { flowDynamic }) => {
        autorizeObj.plans = await getPlans_smartolt();
        const responses = [];
        await autorizeObj.plans.forEach(async (plan, index) => {
            responses.push({ body: `*${index}*. *Plan:* ${plan.name}` });
        });
        await flowDynamic(responses);
    })
    .addAnswer(
        "➡️ Listo, selecciona el numero de opcion segun el plan que deseas asignar:",
        {
            capture: true,
        },
        async (ctx, { flowDynamic, fallBack }) => {
            const option = ctx.body;
            if (option < 0 || option >= autorizeObj.plans.length) return await fallBack({ body: " *Opcion invalida, vuelve a intentarlo*" });
            const plan = autorizeObj.plans[option];
            autorizeObj.selected_plan = plan;
        }
    )
    .addAnswer(
        "Ingresa el nombre del cliente que autorizas",
        {
            capture: true,
        },
        async (ctx, { flowDynamic, fallBack }) => {
            const name = ctx.body;
            autorizeObj.client_name = name;
        }
    )
    .addAnswer("Espera mientras autorizo el equipo ⌛", null, async (ctx, { flowDynamic }) => {
        const { selected_onu, selected_plan, client_name } = autorizeObj;
        const power = await autorize_smartolt(selected_onu, selected_plan, client_name);
        await flowDynamic(["✅ Listo el equipo esta autorizado", "*TX Power:* " + power.txpower, "*RX Power:* " + power.rxpower, "*VLAN:* " + selected_onu.vlan]);
        await flowDynamic({
            body: "Desde SmartOlt",
            media: power.url_img,
        });
    })
    .addAnswer("😁 Gracias por usar este servicio 😁")
    .addAnswer(`👋 Si necesitas mi ayuda de nuevo solo escribe "*HOLA*" 👋`);
// #endregion

// #region flow ver potencia

const powerObj = {
    onus: [],
    selected_onu: {
        name: null,
        serie: null,
        vlan: null,
    },
    power: {
        txpower: null,
        rxpower: null,
        url_img: null,
    },
    client_name: null,
};

const flowVerPotencia_smartolt = addKeyword(["ver la potencia de un cliente"])
    .addAnswer(
        "Ingresa el nombre del cliente que deseas consultar 👤",
        {
            capture: true,
        },
        (ctx) => {
            const name = ctx.body;
            powerObj.client_name = name;
        }
    )
    .addAnswer("Espera mientras busco coincidencias con ese nombre ⌛", null, async (ctx, { flowDynamic, endFlow }) => {
        const { client_name } = powerObj;
        powerObj.onus = await searchOnus_smartolt(client_name);
        console.log(powerObj.onus.length);
        if (powerObj.onus.length === 0) return await endFlow({ body: "😥 No se encontraron coincidencias 😥" });
        const responses = [];
        await powerObj.onus.forEach(async (onu, index) => {
            if (index > 3) return;
            responses.push({ body: `*${index}*. ${onu.name}, *SN:* ${onu.serie}` });
        });
        await flowDynamic(responses);
    })
    .addAnswer(
        "➡️ Listo, selecciona el numero de opcion segun el nombre del cliente: ",
        {
            capture: true,
        },
        async (ctx, { flowDynamic, fallBack }) => {
            const option = ctx.body;
            if (option < 0 || option >= powerObj.onus.length) return await fallBack({ body: " ❌ Opcion invalida, vuelve a intentarlo ❌" });
            const onu = powerObj.onus[option];
            powerObj.selected_onu = onu;
        }
    )
    .addAnswer("Espera mientras obtengo la potencia del equipo ⌛", null, async (ctx, { flowDynamic }) => {
        const { selected_onu } = powerObj;
        powerObj.power = await getPower_smartolt(selected_onu);
        await flowDynamic(["*TX Power:* " + powerObj.power.txpower, "*RX Power:* " + powerObj.power.rxpower, "*VLAN:* " + selected_onu.vlan]);
        await flowDynamic({
            body: "Desde SmartOlt",
            media: powerObj.power.url_img,
        });
    })
    .addAnswer("😁 Gracias por usar este servicio 😁")
    .addAnswer(`👋 Si necesitas mi ayuda de nuevo solo escribe "*HOLA*" 👋`);

// #endregion

module.exports = { flowAutorizar_smartolt, flowVerPotencia_smartolt };
