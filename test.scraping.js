// const { select } = require("./src/dao/SessionDao");
const { getUncofigureds_smartolt, getPlans_smartolt, autorize_smartolt, searchOnus_smartolt, getPower_smartolt } = require("./src/scraping");

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

const onu = {
    url: "https://moronanet.smartolt.com/onu/view/1191",
};
getPower_smartolt(onu).then((rs) => console.log(rs));

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
