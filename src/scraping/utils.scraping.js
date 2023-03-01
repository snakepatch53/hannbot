async function sleep(sec) {
    return new Promise((resolve, reject) => {
        setTimeout(function () {
            resolve();
        }, sec * 1000);
    });
}

function fastKey() {
    return Math.random().toString(36).substr(2, 3);
}

async function getVlan(board, port) {
    return "1" + board + (port < 10 ? "0" + port : port);
}

module.exports = {
    sleep,
    fastKey,
    getVlan,
};
