import express from 'express';
import {
    createClientService,
    getClientService,
    listClientsService,
} from '../services/client.service.js';

const clientRoutes = express.Router();

clientRoutes.post('/', (req, res) => {
    const client = createClientService(req.body);
    res.json(client);
});

clientRoutes.get('/', (req, res) => {
    res.json(listClientsService());
});

clientRoutes.get('/:id', (req, res) => {
    const client = getClientService(req.params.id);
    if (!client) return res.status(404).json({ error: 'Not found' });
    res.json(client);
});



export default clientRoutes;
