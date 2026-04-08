import express from 'express';
import { desvincularCuenta, getCuentas, vincularCuenta, vincularCuentaJson } from '../services/account.service.js';


const accountRoutes = express.Router();

// accountRoutes.post('/', (req, res) => {
//     const { id, provider } = req.body;
//     const account = createAccount({ id, provider });
//     res.json(account);
// });

// accountRoutes.post('/:id/link/start', async (req, res) => {
//     const result = await startLink(req.params.id);
//     res.json(result);
// });

// accountRoutes.post('/:id/link/complete', async (req, res) => {
//     await completeLink(req.params.id, req.body);
//     res.json({ status: 'linked' });
// });

accountRoutes.post('/desvincularCuenta', async (req, res) => {

    const respuesta = await desvincularCuenta(req.body);
    res.json({ respuesta });
});

accountRoutes.post('/cuentas', async (req, res) => {

    const respuesta = await getCuentas(req.body);
    res.json({ respuesta });
}
);

accountRoutes.post('/vincularCuenta', async (req, res) => {

    const respuesta = await vincularCuenta(req.body);
    res.json({ respuesta });
});

accountRoutes.post('/vincularCuentaJson', async (req, res) => {

    const respuesta = await vincularCuentaJson(req.body);
    res.json({ respuesta });
});

export default accountRoutes;



// paylooad basico
/*
{
    didCliente: '123',
    didEmpresa: '789',
    tn_url : 'https://www.reina.com.ar/', es la tienda
    tn_id :  verificar si y existee una vinculacion 
    
}

paso 1:   crear cuenta en clientes_cuentas didCuenta: '456' (no vinculado) si no existe por la url 

verificar si exuste con sync_woo
sync_woo (vinclado / no vinculado)
tn_clientes_argentinos

tn_id:"967602",
    link vinculacion: 'https://cuentasarg.lightdata.com.ar/synctn.php?id=YTo0OntzOjk6ImF1dG9mZWNoYSI7czoxNDoiMjAyNjAzMDUxMTUxMTciO3M6MTA6ImRpZGNsaWVudGUiO3M6MzoiMjkxIjtzOjk6ImRpZGN1ZW50YSI7czo0OiI3MTM2IjtzOjEwOiJkaWRlbXByZXNhIjtpOjEyO30=',


*/