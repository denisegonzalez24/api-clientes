import { logPurple } from 'lightdata-tools';
import app from './api-clientes.js';

app.listen(13000, () => {
    logPurple('Service running on port 13000');
});