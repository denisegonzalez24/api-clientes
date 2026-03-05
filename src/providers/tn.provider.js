// src/providers/tn.provider.js

// conectarme a cuentasArgs e insertar info en preenvios sobre esto

export class TnProvider {
    name = 'tn';

    async desvincularCuenta(body) {
        const { tn_id, didEmpresa, didCLiente, didCuenta } = body;
        console.log('voy a desvincular esta cuenta con tn_id:', tn_id);
        //conectarse a produccion con pool
        const sql = `SELECT selelr_id from tn_clientes_args WHERE elim = 1 AND tn_id = ? AND didEmpresa = ? AND didCliente = ? AND didCuenta = ?`;
        //buscar en tabla tn_clientes_args el tn_id y eliminar la vinculacion

        const resultCuentasTn = await executeQuery(connection, sql, [tn_id, didEmpresa, didCLiente, didCuenta]);

        // REALIZAR MAS cosas

        if (resultCuentasTn.length === 1) {
            //desvinculo de tn
            // elim = 1 en tn_clientes_args
            const sqlDesvincular = `UPDATE tn_clientes_args SET elim = 1 WHERE tn_id = ? AND didEmpresa = ? AND didCliente = ? AND didCuenta = ?`;
            await executeQuery(connection, sqlDesvincular, [tn_id, didEmpresa, didCLiente, didCuenta]);
            return { message: 'Cuenta desvinculada exitosamente' };

        } if (resultCuentasTn.length > 1) {

            //validacion con mas cuentas para desvincular las cuentas 

        } else {
            throw new CustomException({
                message: 'Cuenta no encontrada o ya desvinculada',
                title: 'Error al desvincular cuenta'
            });
        }

    }

    async createDidCuenta(data) {
        const { didCliente, didEmpresa, quien, tn_id, tn_url } = data;
    }







}
