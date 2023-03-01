if (process.env.NODE_ENV !== "production") require("dotenv").config();

const { createBot, createProvider, createFlow, addKeyword } = require("@bot-whatsapp/bot");
const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MySQLAdapter = require("@bot-whatsapp/database/mysql");

const flowMenu = require("./src/flows/menu.flow");

const main = async () => {
    const adapterDB = new MySQLAdapter({
        host: process.env.MYSQL_DB_HOST,
        user: process.env.MYSQL_DB_USER,
        database: process.env.MYSQL_DB_NAME,
        password: process.env.MYSQL_DB_PASS,
        port: process.env.MYSQL_DB_PORT,
    });
    const adapterFlow = createFlow([flowMenu]);
    const adapterProvider = createProvider(BaileysProvider);
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });
    QRPortalWeb({ port: process.env.APP_PORT });
};

main();
