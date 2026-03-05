import express from 'express';
import clientRoutes from './src/routes/clientes.route.js';
import accountRoutes from './src/routes/accounts.route.js';

const app = express();
app.use(express.json());


app.use('/clientes', clientRoutes);
app.use('/cuentas', accountRoutes);


export default app;
