import { logRed } from "lightdata-tools";
import mysql2 from 'mysql2/promise'
import redis from 'redis';
import dotenv from "dotenv";
dotenv.config();
//cagar config

let companiesList = {};
export function getProdDbConfig(company) {
    return {
        host: hostProductionDb,
        user: company.dbuser,
        password: company.dbpass,
        database: company.dbname,
        port: portProductionDb,
        connectTimeout: 6000
    };
}

// cargar companies
const hostProductionDb = process.env.PRODUCTION_DB_HOST;
const portProductionDb = process.env.PRODUCTION_DB_PORT;
/// Redis para obtener las empresas
const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;
const redisPassword = process.env.REDIS_PASSWORD;
export const redisClient = redis.createClient({
    socket: {
        host: redisHost,
        port: redisPort,
    },
    password: redisPassword,
});

async function loadCompaniesFromRedis() {
    try {
        const companiesListString = await redisClient.get('empresasData');

        companiesList = JSON.parse(companiesListString);

    } catch (error) {
        logRed(`Error en loadCompaniesFromRedis: ${error.stack}`);
        throw error;
    }
}

export async function getCompanyById(companyId) {
    try {
        console.log('Obteniendo compañía con ID:', companyId);
        let company = companiesList[companyId];

        if (company == undefined || Object.keys(companiesList).length === 0) {
            try {
                await loadCompaniesFromRedis();

                company = companiesList[companyId];
            } catch (error) {
                logRed
                    (`Error al cargar compañías desde Redis: ${error.stack}`);
                throw error;
            }
        }

        return company;
    } catch (error) {
        logRed(`Error en getCompanyById: ${error.stack}`);
        throw error;
    }
}

const pools = new Map();

//agregar que si pools llega a 50 conexiones, eliminar la mitad de pools desde el mas antiguo

/**
 * Obtiene (o crea si no existe) un pool para una empresa.
 */
export function getPool(didEmpresa) {
    if (pools.has(didEmpresa)) {
        return pools.get(didEmpresa);
    }
    // Si se llegó al límite, eliminar la mitad de los pools más antiguos
    if (pools.size >= 50) {
        const removeCount = Math.floor(50 / 5);
        const oldestKeys = Array.from(pools.keys()).slice(0, removeCount);

        for (const key of oldestKeys) {
            const oldPool = pools.get(key);

            if (oldPool) {
                oldPool.end();
            }

            pools.delete(key);
        }
    }
    const company = getCompanyById(didEmpresa);
    // pasar comany
    const config = getProdDbConfig(company);

    const pool = mysql.createPool({
        ...config,
        waitForConnections: true,
        connectionLimit: 3,
        queueLimit: 0
    });

    pools.set(didEmpresa, pool);

    return pool;
}


const poolProduccion = mysql2.createPool({
    host: process.env.PRODUCTION_DB_HOST,
    user: process.env.USUARIO_MICRO_PRODUCCION,
    password: process.env.PASSWORD_MICRO_PRODUCCION,
    database: process.env.NAME_MICRO_PRODUCCION,
    port: portProductionDb,
    waitForConnections: true,
    connectionLimit: 2,
    queueLimit: 0
});

export function getPoolProduccion() {
    console.log({
        host: process.env.PRODUCTION_DB_HOST,
        port: portProductionDb,
        user: process.env.USUARIO_MICRO_PRODUCCION,
        database: process.env.NAME_MICRO_PRODUCCION
    });
    return poolProduccion;
}