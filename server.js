import { logPurple } from 'lightdata-tools';
import app from './api-clientes.js';

app.listen(12000, () => {
    logPurple('Service running on port 12000');
});