if (process.env.NODE_ENV !== "production") require("dotenv").config();
const navigate = require("./adapter.scraping");
const { sleep } = require("./utils.scraping");

// #region exportables
async function searchClients_mikrowisp(client_name) {
    return await navigate(async function (browser, context, page) {
        await login(page);
        await page.goto(process.env.MIKROWISP_URL + "admin/#ajax/usuarios");
        await waitLoad(page);
        // normalizar las columnas
        await normalizeColumns(page);
        await sleep(1);
        //recargar para mostrar todos los clientes
        await page.goto(process.env.MIKROWISP_URL + "admin/#ajax/usuarios");
        await waitLoad(page);
        // ingresamos el nombre del cliente y buscamos
        await page.locator("#data-usuarios tfoot tr th input.form-control>>nth=1").fill(client_name);
        await page.locator("#data-usuarios tfoot tr th input.form-control>>nth=1").press("Enter");
        await sleep(1);
        // obtenemos los clientes
        const clients = await page.evaluate(() => {
            const clients = [];
            const rows = document.querySelectorAll("#data-usuarios tbody tr");
            rows.forEach((row, index) => {
                const cells = row.querySelectorAll("td");
                const client = {
                    id: cells[1].innerText,
                    url: cells[2].querySelector("a").href,
                    name: cells[2].querySelector("a").innerText.replace(cells[2].querySelector("small").innerText, "").trim(),
                    state: cells[2].querySelector("small").innerText,
                    ip: cells[3].querySelectorAll("a").length != 0 ? cells[3].querySelector("a").innerText : false,
                    ips: Array.from(cells[3].querySelectorAll("a")).map((e) => e.innerText),
                    address: cells[4].innerText,
                    addresses: cells[5].innerHTML.split("<br>"),
                    server: cells[6].innerHTML.split("<br>")[0],
                    servers: cells[6].innerHTML.split("<br>"),
                };
                if (client.servers.length > 0) clients.push(client);
            });
            return clients;
        });
        return clients;
    });
}

async function getPlans_mikrowisp(client) {
    return await navigate(async function (browser, context, page) {
        await login(page);
        await page.goto(client.url);
        await waitLoad(page);
        client.movil = await page.evaluate(() => document.querySelector(`input[name="cliente[movil]"]`).value);
        client.tel = await page.evaluate(() => document.querySelector(`input[name="cliente[telefono]"]`).value);
        await page.evaluate(() => document.querySelector(`a.nav-link[href="#nav-tab-2"]`).click());
        // hacemos que espere hasta que cargue los servicios
        await page.waitForFunction(() => {
            const el1 = document.querySelector(`#data-servicios tbody tr td.dataTables_empty`);
            const el2 = document.querySelectorAll(`#data-servicios tbody tr td`);
            return (el1 && !el1.innerText.includes("Cargando")) || el2.length > 1;
        });
        // comprobamos si existen servicios
        const existServices = await page.evaluate(() => !document.querySelector(`#data-servicios tbody tr td.dataTables_empty`));
        if (!existServices) return [];
        await sleep(1);
        // obtenemos los servicios
        const services = await page.evaluate(() => {
            const _services = [];
            const rows = document.querySelectorAll(`#data-servicios tbody tr`);
            rows.forEach((row, index) => {
                const cells = row.querySelectorAll("td");
                const service = {
                    id: cells[0].innerText,
                    plan: cells[1].innerText,
                    price: cells[2].innerText,
                    ip: cells[3].innerText,
                    server: cells[4].innerText,
                    createdat: cells[5].innerText,
                    address: cells[6].innerText,
                    status: cells[7].innerText,
                };
                _services.push(service);
            });
            return _services;
        });
        return services;
    });
}

async function getData_mikrowisp(client, service) {
    return await navigate(async function (browser, context, page) {
        await login(page);
        await page.goto(client.url);
        await waitLoad(page);
        await page.evaluate(() => document.querySelector(`a.nav-link[href="#nav-tab-2"]`).click());
        // hacemos que espere hasta que cargue los servicios
        await page.waitForFunction(() => {
            const el1 = document.querySelector(`#data-servicios tbody tr td.dataTables_empty`);
            const el2 = document.querySelectorAll(`#data-servicios tbody tr td`);
            return (el1 && !el1.innerText.includes("Cargando")) || el2.length > 1;
        });
        // comprobamos si existen servicios
        const existServices = await page.evaluate(() => !document.querySelector(`#data-servicios tbody tr td.dataTables_empty`));
        if (!existServices) return false;
        await sleep(1);
        // abrimos el servicio que corresponde
        await page.evaluate((service_id) => {
            const rows = document.querySelectorAll(`#data-servicios tbody tr`);
            rows.forEach((row, index) => {
                const cells = row.querySelectorAll("td");
                if (cells[0].innerText == service_id) {
                    return row.querySelectorAll(`td a`).forEach((e) => (e.innerHTML.includes("edit") ? e.click() : null));
                }
            });
        }, service.id);
        // hacemos que espere hasta que cargue el servicio
        await page.waitForFunction(() => {
            try {
                const el1 = document.querySelectorAll(`#modaltmp #servicio-form-edit .dataservice`);
                if (el1.length == 0) return false;
                if (el1[0].querySelectorAll(".form-group.row").length > 0 && el1[1].querySelectorAll(".form-group.row").length > 0) return true;
            } catch (error) {
                return false;
            }
        });
        await sleep(3);
        // obtenemos los datos
        service.description = await page.evaluate(() => document.querySelector(`textarea[name="servicio[descripcion]"]`).value);
        service.location = await page.evaluate(() => document.querySelector(`input[name="servicio[coordenadas]"]`).value);
        service.pppoe_user = await page.evaluate(() => document.querySelector(`input[name="servicio[pppuser]"]`).value);
        service.pppoe_pass = await page.evaluate(() => document.querySelector(`input[name="servicio[ppppass]"]`).value);
        service.vlan = getVlanFromIP(service.ip);
        return service;
    });
}

async function changeIP_mikrowisp() {
    return await navigate(async function (browser, context, page) {});
}
// #endregion
async function normalizeColumns(page) {
    await page.evaluate(() => getmodal("ajax/usuarios?action=columnas", "Columnas Disponibles", "md"));
    await page.waitForFunction(() => document.querySelector("#modaltmp"));
    await page.evaluate(() => {
        const COLOR_ON = "rgb(18, 187, 168)";
        const nameSelector = (selector) => document.querySelector(`#columnas-form #list-columnas input[name="chcol['${selector}']"] + span`);
        // lista de los que hay que activar
        const activate = ["id", "nombre", "ip", "direccion_principal", "direccion", "nodo", "zona", "status"];
        // lista de los que hay que desactivar
        const desactivate = [
            "ipap",
            "ultimo_vencimiento",
            "ultimo_pago",
            "tipo_estrato",
            "caja_nap",
            "fecha_suspendido",
            "plan_voip",
            "mac",
            "dia_pago",
            "facturas_no_pagadas",
            "correo",
            "telefono",
            "plan",
            "proximo_pago",
            "movil",
            "saldo",
            "emisor",
            "instalado",
            "cedula",
            "pppuser",
            "pasarela",
            "codigo",
            "user_ubnt",
            "coordenadas",
            "total_cobrar",
            "servicios_personalizados",
        ];

        // activo los que hay que activar
        activate.forEach((selector) => {
            const name = nameSelector(selector);
            name.style.backgroundColor !== COLOR_ON ? name.click() : null;
        });

        // desactivo los que hay que desactivar
        desactivate.forEach((selector) => {
            const name = nameSelector(selector);
            name.style.backgroundColor === COLOR_ON ? name.click() : null;
        });

        document.querySelector(`#columnas-form button[type=submit]`).click();
    });
    // espera 1
    await page.waitForFunction(() => {
        try {
            return document.querySelectorAll("#data-usuarios tr")[0].querySelectorAll("th").length === 10;
        } catch (error) {
            return false;
        }
    });
}
// #region private
async function login(page) {
    try {
        await page.goto(process.env.MIKROWISP_URL + "admin");
        await waitLoad(page);
        await page.locator("#login-login").fill(process.env.MIKROWISP_USER);
        await page.locator("#password-login").fill(process.env.MIKROWISP_PASS);
        await page.locator("button.btn.btn-success.btn-block.btn-lg").click();
        await waitLoad(page);
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}

async function waitLoad(page) {
    await page.waitForFunction(() => document.title !== "", { timeout: 10000 });
    await sleep(1);
}

function getVlanFromIP(ip) {
    const ipArray = ip.split(".");
    return "1" + ipArray[1] + (ipArray[2] < 10 ? "0" + ipArray[2] : ipArray[2]);
}

// #endregion

// exports
module.exports = {
    searchClients_mikrowisp,
    getPlans_mikrowisp,
    getData_mikrowisp,
    changeIP_mikrowisp,
};
