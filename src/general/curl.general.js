const request = require("request");
const fs = require("fs");
async function curl_post(options, params = false) {
    return new Promise((resolve, reject) => {
        var req = request.post(options.url, function (err, resp, body) {
            if (err) return reject(err);
            return resolve(JSON.parse(body));
        });
        if (!params) return;
        const form = req.form();
        if (Array.isArray(params)) {
            params.forEach((param) => {
                if (param.type == "text") {
                    form.append(param.name, param.value);
                } else {
                    form.append(param.name, fs.createReadStream(param.value));
                }
            });
            return;
        }

        if (params.type == "text") {
            form.append(params.name, params.value);
        } else {
            form.append(params.name, fs.createReadStream(params.value));
        }
        // form.append(params[1].name, fs.createReadStream(params[1].path));
        // form.append(params[1].name, params[1]);
    });
}

async function curl(options) {
    return new Promise((resolve, reject) => {
        request(options, (err, res, body) => {
            if (err) return reject(err);
            resolve(JSON.parse(body));
        });
    });
}

// options example:
// {
//     url: `https://2captcha.com/res.php?key=${api_key}&action=get&id=${captcha_id}&json=true`,
//     method: "GET",
// }

module.exports = { curl, curl_post };
