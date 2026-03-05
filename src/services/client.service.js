// reglas de negocio, validaciones, etc. acá


import {
    dbCreateClient,
    dbGetClient,
    dbListClients,
    dbDesactivateClient,
    dbEditClient
} from '../models/client.model.js';

export async function createClientService(data) {
    const existing = await dbGetClient(data.id);
    if (existing) {
        throw new Error('Cliente ya existente');
    }
    return dbCreateClient(data);
}

export async function getClientService(id) {
    return dbGetClient(id);
}

export async function editClientService(id, data) {
    return dbEditClient(id, data);
}


export async function listClientsService() {
    return dbListClients();
}

export async function desactivateClientService(id) {
    return dbDesactivateClient(id);
}
