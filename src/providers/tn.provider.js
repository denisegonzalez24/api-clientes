// src/providers/tn.provider.js

import { executeQueryFromPool } from "lightdata-tools";
import { getPool, getPoolProduccion } from "../db.js";

// conectarme a cuentasArgs e insertar info en preenvios sobre esto

export class TnProvider {
    name = 'tn';

    async desvincularCuenta(body) {
        try {
            const { seller_id, didEmpresas } = body;

            //conectarse a produccion con pool
            const connection = getPoolProduccion();
            console.log("connection", connection);
            const sql = `SELECT * from tn_clientes_argentina WHERE seller_id = ? AND superado = 0 and elim = 0;`;
            //buscar en tabla tn_clientes_args el seller_id y eliminar la vinculacion

            const resultCuentasTn = await executeQueryFromPool({ pool: connection, query: sql, values: [seller_id], log: true });


            if (resultCuentasTn.length > 1) {

                //validacion con mas cuentas para desvincular las cuentas 
                //si en la tabla tn_clientes_argentinos existe el mismo seller_id y diferente empresa, pongo elim = 1 en tn_clientes_args en la empresa que sea = a didEmpresapara desvincular la cuenta


                //armo  un array de respuestas de la query para despues validar empresa por empresa y desvincular la cuenta de tn
                const cuentasTn = resultCuentasTn.map(cuenta => {

                });

            }
            if (resultCuentasTn.length === 1) {
                //desvinculo de tn
                // elim = 1 en tn_clientes_args
                const sqlDesvincular = `UPDATE tn_clientes_args SET elim = 1 WHERE seller_id = ? AND didEmpresa = ? AND didCliente = ? AND didCuenta = ?`;
                await executeQueryFromPool(connection, sqlDesvincular, [seller_id, didEmpresa, didCLiente, didCuenta]);
                return { message: 'Cuenta desvinculada exitosamente' };
            }
            else {
                //updateo en tn_clientes_args con elim = 1 para desvincular la cuenta
                const sqlDesvincular = `UPDATE tn_clientes_args SET elim = 1 WHERE did = ?;`;
                await executeQueryFromPool(connection, sqlDesvincular, [seller_id, did]);
                return { message: 'Cuenta desvinculada exitosamente' };
                // e,conecto a clienntes_cuentas de la empresa y elimino la cuenta de tn
                const sqlDesvincularCuenta = `DELETE FROM clientes_cuentas WHERE didEmpresa = ? AND didCuenta = ?`;
                await executeQueryFromPool(connection, sqlDesvincularCuenta, [didEmpresa, didCuenta]);
                return { message: 'Cuenta desvinculada exitosamente' };
            }

            return { message: 'Proceso de desvinculación iniciado' };
        } catch (error) {
            console.error("ERROR MYSQL:", error.message);
            console.error(error);
        }
    }

    async createDidCuenta(data) {
        const { didCliente, didEmpresa, quien, tn_id, tn_url } = data;
    }







}
