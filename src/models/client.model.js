// comunicacion con la base de datos

import { executeQueryFromPool } from "lightdata-tools";

export async function dbCreateClient({ id, name }) {
    const sql = `
    INSERT INTO clientes ( nombre_fantasia,  status, autofecha)
    VALUES (?, ?, 'ACTIVE', NOW())
  `;

    const result = await executeQueryFromPool(connection, sql, [id, name]);


    return dbGetClient(id);
}

export async function dbGetClient(id) {
    const sql = `SELECT * FROM clientes WHERE id = ?`;
    const rows = await executeQueryFromPool(connection, sql, [id]);
    return rows[0] || null;
}

export async function dbListClients() {
    const sql = `SELECT * FROM clientes`;
    return executeQueryFromPool(connection, sql);
}

export async function dbDesactivateClient(id) {
    const sql = `UPDATE clientes SET status = 'INACTIVE' WHERE id = ?`;
    await executeQueryFromPool(connection, sql, [id]);
    return dbGetClient(id);
}

export async function dbEditClient(id, data) {
    const sql = `UPDATE clientes SET name = ? WHERE id = ?`;
    await executeQueryFromPool(connection, sql, [data.name, id]);
    return dbGetClient(id);
}

