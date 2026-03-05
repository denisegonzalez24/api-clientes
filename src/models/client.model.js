// comunicacion con la base de datos

export async function dbCreateClient({ id, name }) {
    const sql = `
    INSERT INTO clients (id, name, status, created_at)
    VALUES (?, ?, 'ACTIVE', NOW())
  `;

    await executeQuery(connection, sql, [id, name]);
    return dbGetClient(id);
}

export async function dbGetClient(id) {
    const sql = `SELECT * FROM clientes WHERE id = ?`;
    const rows = await executeQuery(connection, sql, [id]);
    return rows[0] || null;
}

export async function dbListClients() {
    const sql = `SELECT * FROM clientes`;
    return executeQuery(connection, sql);
}

export async function dbDesactivateClient(id) {
    const sql = `UPDATE clients SET status = 'INACTIVE' WHERE id = ?`;
    await executeQuery(connection, sql, [id]);
    return dbGetClient(id);
}

export async function dbEditClient(id, data) {
    const sql = `UPDATE clients SET name = ? WHERE id = ?`;
    await executeQuery(connection, sql, [data.name, id]);
    return dbGetClient(id);
}

