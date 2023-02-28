if (process.env.NODE_ENV !== "production") require("dotenv").config();
const navigate = require("./adapter.scraping");

// #region exportables
async function getData_mikrowisp() {
    return await navigate(async function (browser, context, page) {});
}
async function changeIP_mikrowisp() {
    return await navigate(async function (browser, context, page) {});
}
// #endregion

// #region private
// #endregion

// exports
module.exports = {
    getData_mikrowisp,
    changeIP_mikrowisp,
};
