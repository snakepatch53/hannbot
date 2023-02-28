const mikrowisp = require("./mikrowisp.scraping");
const smartolt = require("./smartolt.scraping");
module.exports = { ...mikrowisp, ...smartolt };
