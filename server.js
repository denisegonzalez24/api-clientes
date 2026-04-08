import { logPurple } from 'lightdata-tools';
import app from './api-clientes.js';
import { closeAllPools } from './src/db.js';

const server = app.listen(13000, () => {
    logPurple('Service running on port 13000');
});

async function shutdown(signal) {
    try {
        logPurple(`Received ${signal}. Closing resources...`);
        server.close();
        await closeAllPools();
        process.exit(0);
    } catch (error) {
        console.error('Error while closing resources:', error.message);
        process.exit(1);
    }
}

process.on('SIGINT', () => {
    shutdown('SIGINT');
});

process.on('SIGTERM', () => {
    shutdown('SIGTERM');
});