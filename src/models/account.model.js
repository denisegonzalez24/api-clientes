// comunicacion con la base de datos

import { LightdataORM } from "lightdata-tools";

export async function dbCreateClienteCuenta({ db, user, didCliente, tipoCuenta, ML_id_vendedor }) {

    const didCuenta = LightdataORM.insert({
        db,
        table: 'clientes_cuentas',
        data: {
            didCliente: didCliente,
            tipoCuenta: tipoCuenta,
            ml_ID_VENDEDOR: ML_id_vendedor
        },
        quien: user,
        log: true
    })

    return dbGetClienteCuenta(didCuenta);
}

export async function dbGetClienteCuenta(id) {
    const sql = `SELECT * FROM clientes_cuentas WHERE id = ? AND superado = 0 AND elim = 0`;
    const rows = await executeQuery(connection, sql, [id]);
    return rows[0] || null;
}

export async function dbListClienteCuenta() {
    const sql = `SELECT * FROM clientes_cuentas WHERE superado = 0 AND elim = 0`;
    return executeQuery(connection, sql);
}

export async function dbDeactivateClienteCuenta(id) {
    const sql = `UPDATE clientes_cuentas SET elim = 1 WHERE id = ?`;
    await executeQuery(connection, sql, [id]);
    return dbGetClienteCuenta(id);
}

export async function dbEditClienteCuenta(id, data) {
    const sql = `UPDATE clientes_cuentas SET name = ? WHERE id = ?`;
    await executeQuery(connection, sql, [data.name, id]);
    return dbGetClienteCuenta(id);
}