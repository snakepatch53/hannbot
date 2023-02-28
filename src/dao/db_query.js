if (process.env.NODE_ENV !== "production") require("dotenv").config();
const mysql = require("mysql2");

const dataConnection = {
    host: process.env.MYSQL_DB_HOST,
    user: process.env.MYSQL_DB_USER,
    password: process.env.MYSQL_DB_PASSWORD,
    database: process.env.MYSQL_DB_NAME,
    port: process.env.MYSQL_DB_PORT,
};

function db_query(sql) {
    const connection = mysql.createConnection(dataConnection);
    const promise = new Promise((resolve, reject) => {
        connection.connect(function (err) {
            if (err) {
                console.log("Error en la Coneccion");
                throw reject(err.stack);
            }
        });
        connection.query(sql, async function (error, results, fields) {
            if (error) {
                console.log("Error en la consulta");
                throw reject(error);
            }
            resolve(results);
        });
        connection.end();
    });
    return promise;
}

module.exports = db_query;
