import mysql from "mysql2/promise";
//cagar config
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


const pools = new Map();

/**
 * Obtiene (o crea si no existe) un pool para una empresa.
 */
export function getPool(didEmpresa) {
    if (pools.has(didEmpresa)) {
        return pools.get(didEmpresa);
    }

    const config = getProdDbConfig(didEmpresa);

    const pool = mysql.createPool({
        ...config,
        waitForConnections: true,
        connectionLimit: 3,
        queueLimit: 0
    });

    pools.set(didEmpresa, pool);

    return pool;
}