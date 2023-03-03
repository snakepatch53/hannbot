// const { select } = require("./src/dao/SessionDao");
// const { getUncofigureds_smartolt, searchClients_mikrowisp, getPlans_smartolt, autorize_smartolt, searchOnus_smartolt, getPower_smartolt } = require("./src/scraping");

// getUncofigureds_smartolt();

// const onu = {
//     autorize_url: "https://moronanet.smartolt.com/onu/authorize/board/1/port/5/sn/HWTC378F4C92/pon/gpon/onu_type/55/olt/4",
//     vlan: "1105",
// };

// const plan = {
//     name: "4_ULTRA_VELOCIDAD",
// };

// autorize_smartolt(onu, plan, "Hannbot Test")
//     .then((rs) => console.log(rs))
//     .catch((err) => console.log(err));

// const onu = {
//     url: "https://moronanet.smartolt.com/onu/view/1191",
// };
// getPower_smartolt(onu).then((rs) => console.log(rs));

// const { curl_post } = require("./src/general/curl.general");

// curl_post(
//     {
//         // url: "https://api.moronanet.com/upload_img/z2phE7KCXLC2YLgt",
//         url: "http://localhost/moronanet_api/upload_img/z2phE7KCXLC2YLgt",
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//     },
//     [
//         {
//             type: "file",
//             name: "img",
//             value: "./power_ont_smartolt.png",
//         },
//         {
//             type: "text",
//             name: "name",
//             value: "power_ont_smartolt",
//         },
//     ]
// )
//     .then((rs) => console.log(rs))
//     .catch((err) => console.log(err));

const { searchClients_mikrowisp, getPlans_mikrowisp, updateVlanIp_mikrowisp, getData_mikrowisp } = require("./src/scraping");

// searchClients_mikrowisp("juan").then((client) => {
//     getPlans_mikrowisp(client[0]).then((service) => {
//         client[0].services = service;
//         getData_mikrowisp(client[0], service[0]).then((rs) => {
//             client[0].service = rs;
//             console.log(client[0]);
//         });
//     });
// });

// searchClients_mikrowisp("juan").then((client) => console.log(client));
updateVlanIp_mikrowisp(
    { url: "http://167.71.189.123/admin/#ajax/viewuser?user=1557&token=c0U3NDBTU2tuaXFmeDFHQ0pvcjlwZz09" },
    { id: "2056" },
    { vlan: "1103" }
).then((rs) => console.log(rs));

// getPlans_mikrowisp({ url: "http://167.71.189.123/admin/#ajax/viewuser?user=000747&token=MDAwNzQ3" }).then((service) => {
//     console.log(service);
// });

// getData_mikrowisp(
//     {
//         url: "http://167.71.189.123/admin/#ajax/viewuser?user=000747&token=MDAwNzQ3",
//     },
//     {
//         id: "2045",
//         ip: "10.1.3.13",
//     }
// ).then((rs) => console.log(rs));
