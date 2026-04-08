// src/providers/tn.provider.js

import { CustomException, executeQueryFromPool } from "lightdata-tools";
import { getPool, getPoolProduccion, poolPreenvios } from "../db.js";
import axios from "axios";
import { exec } from "child_process";


// conectarme a cuentasArgs e insertar info en preenvios sobre esto

export class TnProvider {
    name = 'tn';

    async desvincularCuenta(body) {
        try {
            const { seller_id, didEmpresa, didCuenta } = body;

            //conectarse a produccion con pool
            const connection = getPoolProduccion();

            const sql = `SELECT * from tn_clientes_argentina WHERE seller_id = ? AND superado = 0 and elim = 0;`;
            //buscar en tabla tn_clientes_args el seller_id y eliminar la vinculacion

            const resultCuentasTn = await executeQueryFromPool({ pool: connection, query: sql, values: [seller_id], log: true });
            const poolEmpresa = await getPool(didEmpresa);


            if (resultCuentasTn.length > 1) {

                console.log("ingrese caso mas de una cuenta");

                //verificar por didCuenta
                const cuentaElegida = resultCuentasTn.find(cuenta => cuenta.didEmpresa === didEmpresa && cuenta.didCuenta === didCuenta);
                console.log("cuenta elegida", cuentaElegida);

                //si en la tabla tn_clientes_argentinos existe el mismo seller_id y diferente empresa, pongo elim = 1 en tn_clientes_args en la empresa que sea = a didEmpresapara desvincular la cuenta
                const sqlDesvincular = `UPDATE tn_clientes_argentina SET elim = 1 WHERE seller_id= ? and didEmpresa = ? and didCuenta  = ? and superado = 0 and elim = 0;`;
                // console.log("sqlDesvincular", sqlDesvincular, resultCuentasTn[0].seller_id, resultCuentasTn[0].didEmpresa);
                await executeQueryFromPool({ pool: connection, query: sqlDesvincular, values: [cuentaElegida.seller_id, cuentaElegida.didEmpresa, cuentaElegida.didCuenta], log: true });

                const cLientesCuentasQuery = `SELECT did, didCliente, tn_url, data from clientes_cuentas WHERE tn_id = ? and elim = 0 and superado = 0; `;
                const clientesCuentas = await executeQueryFromPool({ pool: poolEmpresa, query: cLientesCuentasQuery, values: [seller_id, didCuenta], log: true });
                const didCuenta = clientesCuentas[0].did;


                //elimino de la empresa y elimino la cuenta de tn en produccion
                const desvincularCLientesCuentas = `UPDATE clientes_cuentas SET sync_woo = 0 WHERE did = ? and elim = 0 and superado = 0;`;
                console.log("desvincularCLientesCuentas", desvincularCLientesCuentas, seller_id, didCuenta);
                await executeQueryFromPool({ pool: poolEmpresa, query: desvincularCLientesCuentas, values: [didCuenta], log: true });


                //me conecto a preenvios ---- la conexiona a clintes cuentas la hae joaqui y le pego a un endpoint
                const conexionPreenvios = await poolPreenvios();
                const sqlDesvincularPreenvios = `UPDATE cuentas SET elim = 1 WHERE didEmpresa = ? and  didCuenta = ? and elim = 0 and superado = 0; `;

                const resultPreenvios = await executeQueryFromPool({ pool: conexionPreenvios, query: sqlDesvincularPreenvios, values: [didEmpresa, didCuenta], log: true });

                //armo  un array de respuestas de la query para despues validar empresa por empresa y desvincular la cuenta de tn
                return { message: 'Cuenta desvinculada exitosamente' };

            } else if (resultCuentasTn.length === 1) {
                console.log("ingrese caso una cuenta");
                //desvinculo de tn
                // elim = 1 en tn_clientes_args

                const sqlDesvincular = `UPDATE tn_clientes_argentina SET elim = 1 WHERE id = ?`;
                await executeQueryFromPool({ pool: connection, query: sqlDesvincular, values: [resultCuentasTn[0].id], log: true });

                //nueva pool poor empresa

                //conecto a clientes_cuentas 
                const cLientesCuentasQuery = `SELECT did, didCliente, tn_url, data from clientes_cuentas WHERE tn_id = ? and elim = 0 and superado = 0; `;
                const clientesCuentas = await executeQueryFromPool({ pool: poolEmpresa, query: cLientesCuentasQuery, values: [seller_id], log: true });
                const didCuenta = clientesCuentas[0].did;
                const didCliente = clientesCuentas[0].didCliente;

                //elimino de la empresa y elimino la cuenta de tn en produccion
                const desvincularCLientesCuentas = `UPDATE clientes_cuentas SET sync_woo = 0 WHERE tn_id = ? and did = ? and elim = 0 and superado = 0;`;
                await executeQueryFromPool({ pool: poolEmpresa, query: desvincularCLientesCuentas, values: [seller_id, didCuenta], log: true });



                // voy a preenvios y elimino la cuenta de tn
                const conexionPreenvios = await poolPreenvios()
                const dataPreenviosSql = `SELECT * FROM cuentas WHERE didEmpresa = ? and didCliente = ? and  didCuenta = ? and elim = 0 and superado = 0;`;
                const dataPreenvios = await executeQueryFromPool({ pool: conexionPreenvios, query: dataPreenviosSql, values: [didEmpresa, didCliente, didCuenta], log: true });
                const storeId = dataPreenvios[0].store_id;
                const token = dataPreenvios[0].token;

                const sqlDesvincularPreenvios = `UPDATE cuentas SET elim = 1 WHERE didEmpresa = ? and didCliente = ? and  didCuenta = ? and elim = 0 and superado = 0; `;
                const resultPreenvios = await executeQueryFromPool({ pool: conexionPreenvios, query: sqlDesvincularPreenvios, values: [didEmpresa, didCliente, didCuenta], log: true });


                let webhooksTn

                //listo los webhook de tn en preenvios por endpoint de axios  
                try {
                    console.log("entre al llamada api");

                    console.log("token", resultCuentasTn[0].token);
                    //consologuear la llamda a l api de tn para ver que envia
                    const webhooksUrl = `https://api.tiendanube.com/v1/${storeId}/webhooks`;
                    const webhookHeaders = {
                        "Authentication": `${resultCuentasTn[0].token}`,
                        "User-Agent": "API Lightdata (administracion@lightdata.com.ar)"
                    };

                    console.log("webhooksUrl", webhooksUrl);
                    console.log("webhookHeaders", webhookHeaders);

                    const webhooksTnCall = await axios.get(
                        webhooksUrl,
                        {
                            headers: webhookHeaders
                        }
                    );
                    webhooksTn = webhooksTnCall.data;

                } catch (err) {
                    console.error("ERROR AL OBTENER WEBHOOKS DE TIENDANUBE:", err.message);
                    throw new CustomException({
                        title: "Error al obtener webhooks de Tiendanube",
                        message: `Error al obtener webhooks de Tiendanube ${err.message}`,
                        error: err
                    });
                }
                // eliminar metodo de envio de tn 

                console.log("webhooksTn", webhooksTn);

                //elimino los webhooks de tn por endpoint de axios
                for (const webhook of webhooksTn) {
                    console.log("webhook.endpoint", webhook.url);
                    // verficar si los wehooks son de ld
                    if (webhook.url.includes('https://preenviostiendanube.lightdata.app')) {
                        console.log("elimine webhook", webhook.id, webhook.url);
                        const result = await deleteWebhook(webhook.id, storeId, resultCuentasTn[0].token);
                        console.log("resultado eliminacion webhook", result);

                    }
                }

                // lsto metodos de envio
                let metodosDeEnvioTn;
                metodosDeEnvioTn = await getShippingMethods(storeId, resultCuentasTn[0].token);
                console.log("metodosDeEnvioTn", metodosDeEnvioTn);

                for (const metodo of metodosDeEnvioTn) {
                    if (metodo.name.includes(`Flex_${didEmpresa}`) && metodo.callback_url.includes(`_${didCuenta}.php`)) {
                        console.log("elimine metodo de envio", metodo.id, metodo.name);
                        await deleteShippingMethod(metodo.id, storeId, resultCuentasTn[0].token);
                        await executeQueryFromPool({ pool: poolEmpresa, query: 'UPDATE clientes_cuentas_metodos_envios SET elim = 1 WHERE didcuenta = ? AND sellerId = ? AND tiendaURL = ?', values: [didCuenta, seller_id, metodo.callback_url], log: true });

                    }
                }


                return { message: 'Cuenta desvinculada exitosamente' };
            } else {

                return { message: 'no hay cuentas para desvincular en tn_clientes_argentina' };
            }
            console.log("Pool solicitado empresa:", didEmpresa);
            console.log("Pools activos:", pools.size);

            return { message: 'Proceso de desvinculación iniciado' };
        } catch (error) {
            console.error("ERROR MYSQL:", error.message);
            console.error(error);
        } finally {

        }

    }

    async createDidCuenta(data) {
        const { didCliente, didEmpresa, quien, tn_id, tn_url } = data;
    }

    async getCuentas(seller_id) {
        try {
            const connection = getPoolProduccion();
            const sql = `SELECT * from tn_clientes_argentina WHERE seller_id = ? AND superado = 0 and elim = 0;`;
            const resultCuentasTn = await executeQueryFromPool({ pool: connection, query: sql, values: [seller_id], log: true });
            return resultCuentasTn;
        } catch (error) {
            console.error("ERROR MYSQL:", error.message);
            console.error(error);
            throw error;
        }



    }

    async vincularCuenta(body) {
        const { seller_id, didEmpresa, didCuenta } = body;
        try {

            const connection = getPoolProduccion();
            const sql = `SELECT * from tn_clientes_argentina WHERE seller_id = ? AND didEmpresa = ? AND didCuenta = ? AND superado = 0;`;
            const resultCuentasTn = await executeQueryFromPool({ pool: connection, query: sql, values: [seller_id, didEmpresa, didCuenta], log: true });

            if (resultCuentasTn[0].elim === 0) {
                throw new CustomException({
                    title: "Cuenta ya vinculada",
                    message: `La cuenta ya está vinculada a esta empresa con el cliente: ${resultCuentasTn[0].didCliente}`
                });
            }

            //verificar que existe el cliente con un select a tabla clientes
            if (resultCuentasTn.length === 0) {
                throw new CustomException({
                    title: "Cliente no encontrado",
                    message: "No existe un cliente de Tiendanube para vincular con esos datos"
                });
            }


            const poolEmpresa = await getPool(didEmpresa);
            const sqlVincularEmpresa = `UPDATE clientes_cuentas SET sync_woo = 1 WHERE tn_id = ? AND did = ? AND elim = 0 AND superado = 0;`;
            await executeQueryFromPool({ pool: poolEmpresa, query: sqlVincularEmpresa, values: [seller_id, didCuenta], log: true });


            const conexionPreenvios = await poolPreenvios();
            const sqlVincularPreenvios = `INSERT INTO cuentas SET elim = 0 WHERE didEmpresa = ? AND didCuenta = ? AND superado = 0 AND elim = 1;`;
            await executeQueryFromPool({ pool: conexionPreenvios, query: sqlVincularPreenvios, values: [didEmpresa, didCuenta], log: true });


            // pegarle a clientes-args y hacer algo


            // token del cliente


            // crear wehooks de tn - guardar


            // crear metodos de envios - guardar  | si corresponde tambien en tabla clientes_cuentas_metodos_envio

            // insertar datos en tn_clientes_argentina y updatear al final
            //   const sqlVincularTn = `INSERT INTO tn_clientes_argentina (seller_id, didEmpresa, didCuenta,token, superado) VALUES (?, ?, ?, 0) ON DUPLICATE KEY UPDATE elim = 0;`;
            await executeQueryFromPool({ pool: connection, query: sqlVincularTn, values: [seller_id, didEmpresa, didCuenta, token], log: true });


            return { message: "Cuenta vinculada exitosamente" };
        } catch (error) {
            console.error("ERROR MYSQL:", error.message);
            console.error(error);
            throw error;
        }



    }

}

//helper para webhok

// se pueden reactivar??
async function deleteWebhook(webhookId, storeId, token) {
    await axios.delete(
        `https://api.tiendanube.com/v1/${storeId}/webhooks/${webhookId}`,
        {
            headers: {
                Authentication: `${token}`,
                "User-Agent": "API Lightdata (administracion@lightdata.com.ar)"
            }
        }
    );
}

// get metodos de envio de tn por endpoint de axios
async function getShippingMethods(storeId, token) {
    try {
        const metodosDeEnvioTn = await axios.get(
            `https://api.tiendanube.com/v1/${storeId}/shipping_carriers`,
            {
                headers: {
                    Authentication: `bearer ${token}`,
                    "User-Agent": "API Lightdata (administracion@lightdata.com.ar)"
                }
            });
        return metodosDeEnvioTn.data;
    } catch (err) {
        console.error("Error al obtener métodos de envío de Tiendanube:", err.message);
        throw new CustomException({
            title: "Error al obtener métodos de envío de Tiendanube",
            message: `Error al obtener métodos de envío de Tiendanube ${err.message}`
        });
    }
}


async function deleteShippingMethod(shippingMethodId, storeId, token) {
    await axios.delete(
        `https://api.tiendanube.com/v1/${storeId}/shipping_carriers/${shippingMethodId}`,
        {
            headers: {
                Authentication: `${token}`,
                "User-Agent": "API Lightdata (administracion@lightdata.com.ar)"
            }
        }
    );
}