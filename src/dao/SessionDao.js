const db_query = require("./db_query");

/** Retorna un array de sessions
 * @returns {Promise<any[]>} Retorna un array de sessions
 */
async function select() {
    return await db_query("SELECT * FROM sessions");
}

/** Consulta un session por id
 * @param {string} name Ingresa el name del session
 * @returns {Promise<any>} Retorna un objeto de session
 */
async function selectLast(name) {
    return (await db_query(`SELECT * FROM sessions WHERE session_name = '${name}' ORDER BY session_id DESC LIMIT 1`))[0];
}

/** Consulta un session por id
 * @param {string} id Ingresa el id del session
 * @returns {Promise<any>} Retorna un objeto de session
 */
async function selectById(id) {
    return (await db_query("SELECT * FROM sessions WHERE session_id = " + id))[0];
}

/** Inserta un nuevo session
 * @param {string} session_key Ingresa el key del session
 * @returns {string} Retorna el id del session insertado
 * */
async function insert(session_name, session_key) {
    const session_id = (await db_query(`INSERT INTO sessions SET session_name = '${session_name}', session_key = '${session_key}'`)).insertId;
    return session_id;
}

/** Actualiza un session
 *  @param {string} session_id Ingresa el id del session
 *  @param {string} session_key Ingresa el key del session
 *  @returns {string} Retorna el id del session actualizado
 */
async function update(session_id, session_name, session_key) {
    await db_query(`UPDATE sessions SET session_name = '${session_name}', session_key = '${session_key}' WHERE session_id = ${session_id}`);
    return session_id;
}

/** Elimina un session
 * @param {string} session_id Ingresa el id del session
 * @returns {boolean} Retorna true si el session fue eliminado
 * */
async function deleteById(session_id) {
    await db_query(`DELETE FROM sessions WHERE session_id = ${session_id}`);
    return true;
}

module.exports = { select, selectLast, selectById, insert, update, deleteById };
