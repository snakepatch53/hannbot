async function sleep(sec) {
    return new Promise((resolve, reject) => {
        setTimeout(function () {
            resolve();
        }, sec * 1000);
    });
}

module.exports = { sleep };
