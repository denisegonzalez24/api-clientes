/** 
 Estrategia de acceso a datos.
 Implementa cache en memoria con precarga inicial y fallback a base de datos.
 Los servicios consumen este módulo sin conocer si los datos provienen
 de cache o directamente de la BD.
*/


import * as clientModel from "../models/client.model.js";

const cache = new Map();
let isCacheLoaded = false;

/**
 * Precarga inicial de clientes desde la base de datos.
 * Se ejecuta una sola vez al iniciar la aplicación.
 * info de clientes_cuentas donde superado = 0 y elim = 0
 */
export async function preloadCacheClientesCuentas() {
    const clients = await clientModel.dbListClientesCuentas();
    clients.forEach(client => {
        cache.set(client.id, client);
    });
    isCacheLoaded = true;
}

/**
 * Obtiene un cliente por id.
 * Primero consulta cache, si no existe hace fallback a BD.
 */
export async function getClient(id) {
    if (cache.has(id)) {
        return cache.get(id);
    }

    const client = await clientModel.dbGetClient(id);

    if (client) {
        cache.set(id, client);
    }

    return client;
}

/**
 * Devuelve todos los clientes.
 * Si el cache está cargado, responde desde memoria.
 */
export async function listClients() {
    if (isCacheLoaded) {
        return Array.from(cache.values());
    }

    const clients = await clientModel.dbListClientesCuentas();
    clients.forEach(c => cache.set(c.id, c));
    isCacheLoaded = true;

    return clients;
}

/**
 * Crea un cliente y actualiza el cache.
 */
export async function createClient(data) {
    const client = await clientModel.dbCreateClient(data);
    cache.set(client.id, client);
    return client;
}

/**
 * Edita cliente y sincroniza cache.
 */
export async function editClient(id, data) {
    const client = await clientModel.dbEditClient(id, data);
    cache.set(id, client);
    return client;
}

/**
 * Desactiva cliente y sincroniza cache.
 */
export async function deactivateClient(id) {
    const client = await clientModel.dbDeactivateClient(id);
    cache.set(id, client);
    return client;
}