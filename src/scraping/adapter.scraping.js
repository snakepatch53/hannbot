const { chromium } = require("playwright");

async function navigate(actions) {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({});
    const page = await context.newPage();
    const isSuccess = await actions(browser, context, page);
    await browser.close();
    return isSuccess;
}

module.exports = navigate;

module.exports = navigate;
