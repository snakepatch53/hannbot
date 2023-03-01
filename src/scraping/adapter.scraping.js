if (process.env.NODE_ENV !== "production") require("dotenv").config();
const { chromium } = require("playwright");

async function navigate(actions) {
    const browser = await chromium.launch({ headless: process.env.APP_MODE === "production" });
    const context = await browser.newContext({});
    const page = await context.newPage();
    const isSuccess = await actions(browser, context, page);
    await browser.close();
    return isSuccess;
}

module.exports = navigate;

module.exports = navigate;
