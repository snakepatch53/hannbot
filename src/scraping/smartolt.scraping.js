// imports
if (process.env.NODE_ENV !== "production") require("dotenv").config();
const navigate = require("./adapter.scraping");
const { sleep } = require("./utils.scraping");
const { curl_post } = require("./../general/curl.general");

// #region exportables
async function getUncofigureds_smartolt() {
    return await navigate(async function (browser, context, page) {
        await login(page);
        await page.goto(process.env.SMARTOLT_URL + "onu/unconfigured");
        await waitLoad(page);
        await sleep(5);
        const unconfigureds = await page.evaluate(() => {
            const unconfigureds = [];
            const rows = document.querySelectorAll("#gpon-epon-unconfigured-4 table tbody tr.valign-center");
            rows.forEach((row) => {
                if (row.lenght === 0) return;
                const cells = row.querySelectorAll("td");
                const unconfigured = {
                    board: cells[0].innerText,
                    port: cells[1].innerText,
                    serie: cells[2].innerText,
                    type: cells[3].innerText,
                    autorize_url: cells[4].querySelector("a").href,
                };
                unconfigureds.push(unconfigured);
            });
            return unconfigureds;
        });
        unconfigureds.forEach(async (unconfigured) => (unconfigured.vlan = await getVlan(unconfigured.board, unconfigured.port)));
        return unconfigureds;
    });
}

async function getPlans_smartolt() {
    return await navigate(async function (browser, context, page) {
        await login(page);
        await page.goto(process.env.SMARTOLT_URL + "speed_profiles");
        await waitLoad(page);
        const speeds_profiles = await page.evaluate(() => {
            const speeds_profiles = [];
            const rows = document.querySelectorAll("#download table tbody tr.valign-center");
            rows.forEach((row) => {
                if (row.lenght === 0) return;
                const cells = row.querySelectorAll("td");
                const speed_profile = {
                    name: cells[0].innerText,
                    speed: cells[1].innerText,
                    type: cells[2].innerText,
                    onus: cells[4].innerText,
                };
                speeds_profiles.push(speed_profile);
            });
            return speeds_profiles;
        });
        return speeds_profiles;
    });
}

async function autorize_smartolt(onu, plan, client_name) {
    return await navigate(async function (browser, context, page) {
        await login(page);
        await page.goto(onu.autorize_url);
        await waitLoad(page);
        await page.locator("#download_speed").selectOption({ label: plan.name });
        await page.locator("#upload_speed").selectOption({ label: plan.name });
        await page.evaluate(() => {
            const isRouting = document.querySelector("#router_label").style.display !== "none";
            if (isRouting) return document.querySelector("#router_label").click();
            document.querySelector("#bridge_label").click();
        });
        await page.locator("#location_name").fill(client_name);
        await page.locator("#vlan").selectOption({ label: onu.vlan });
        await page.locator("#auth_button").click();
        // wait for power values
        let power = { txpower: 0, rxpower: 0, url_img: "" };
        do {
            await page.reload();
            await waitLoad(page);
            await page.waitForFunction(() => document.querySelector("#signal_wrapper").innerText !== "", { timeout: 10000 });
            power = await page.evaluate(() => {
                const power = document.querySelector("#signal_wrapper").innerText.split("/");
                const txpower = parseFloat(power[0]);
                const rxpower = parseFloat(power[1]);
                return { txpower, rxpower };
            });
        } while (isNaN(power.txpower) || isNaN(power.rxpower) || power.txpower == 0 || power.rxpower == 0);
        const img_power_path = "./power_ont_smartolt.png";
        const img_power_name = "power_ont_smartolt";
        await page.locator(".container-fluid.onu-wrapper .col-xs-12.col-sm-6").nth(1).screenshot({ path: img_power_path });
        power.url_img = await uploadImgPower(img_power_name, img_power_path);
        return power;
    });
}

async function searchOnus_smartolt(client_name) {
    return await navigate(async function (browser, context, page) {
        await login(page);
        await page.goto(process.env.SMARTOLT_URL + "onu/configured");
        await waitLoad(page);
        await page.locator("#free_text").fill(client_name);
        await page.locator("#free_text").press("Enter");
        await waitLoad(page);
        const clients = await page.evaluate(() => {
            const clients = [];
            const rows = document.querySelectorAll("#onu_configured_list table tbody tr.valign-center");
            rows.forEach((row, index) => {
                console.log(index);
                const cells = row.querySelectorAll("td");
                const client = {
                    url: cells[1].querySelector("a").href,
                    name: cells[2].innerText,
                    serie: cells[3].innerText,
                    type: cells[8].innerText,
                    vlan: cells[9].innerText,
                };
                clients.push(client);
            });
            return clients;
        });
        return clients;
    });
}

async function getPower_smartolt(onu) {
    return await navigate(async function (browser, context, page) {
        await login(page);
        await page.goto(onu.url);
        // wait for power values
        let power = { txpower: 0, rxpower: 0, url_img: "" };
        do {
            await page.reload();
            await waitLoad(page);
            await page.waitForFunction(() => document.querySelector("#signal_wrapper").innerText !== "", { timeout: 10000 });
            power = await page.evaluate(() => {
                const power = document.querySelector("#signal_wrapper").innerText.split("/");
                const txpower = parseFloat(power[0]);
                const rxpower = parseFloat(power[1]);
                return { txpower, rxpower };
            });
        } while (isNaN(power.txpower) || isNaN(power.rxpower) || power.txpower == 0 || power.rxpower == 0);
        const img_power_path = "./power_ont_smartolt.png";
        const img_power_name = "power_ont_smartolt";
        await page.locator(".container-fluid.onu-wrapper .col-xs-12.col-sm-6").nth(1).screenshot({ path: img_power_path });
        power.url_img = await uploadImgPower(img_power_name, img_power_path);
        return power;
    });
}
// #endregion

// #region private
async function login(page) {
    try {
        await page.goto(process.env.SMARTOLT_URL + "auth/login");
        await waitLoad(page);
        await page.locator("#identity").fill(process.env.SMARTOLT_USER);
        await page.locator("#password").fill(process.env.SMARTOLT_PASS);
        await page.locator("input[type=submit]").click();
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
async function getVlan(board, port) {
    return "1" + board + (port < 10 ? "0" + port : port);
}
async function uploadImgPower(name, path) {
    return await curl_post(
        {
            url: process.env.API_MORONANET_URL + process.env.API_MORONANET_SERVICE_UPLOAD_IMG + process.env.API_MORONANET_KEY,
            headers: { "Content-Type": "application/json" },
        },
        [
            {
                type: "file",
                name: "img",
                value: path,
            },
            {
                type: "text",
                name: "name",
                value: name,
            },
        ]
    );
}
// #endregion

// exports
module.exports = {
    getUncofigureds_smartolt,
    getPlans_smartolt,
    autorize_smartolt,
    searchOnus_smartolt,
    getPower_smartolt,
};
