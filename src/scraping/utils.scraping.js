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

module.exports = {
    sleep,
    // curl,
    fastKey,
};
