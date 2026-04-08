import axios from "axios";
import { CustomException, logPurple, logYellow } from "lightdata-tools";





export class FenicioProvider {
    name = 'fenicio';

    async vincularCuentaJson(body) {

        const { didEmpresa, didCliente, didCuenta, token } = body;
        logPurple(token);
        const message = {
            didEmpresa: didEmpresa,
            didCliente: didCliente,
            didCuenta: didCuenta,
            token: token
        }

        logYellow("Mensaje a enviar a fenicio:", message);
        let result;

        try {
            const result = await axios.post(
                `https://preenvios.lightdata.app/fenicio/tokens`,
                message
            );

            console.log("✅ RESPONSE:", result.data);
            return result.data;

        } catch (error) {
            throw new CustomException({
                status: error.response?.status || 500,
                message: `Error al vincular cuenta con Fenicio: ${error.message}`,
                title: 'Error de vinculación'
            });
        }


    }


    async desvincularCuenta(body) {
        // lógica específica para desvincular cuenta en Fenicio
        const { didEmpresa, didCliente, didCuenta, token } = body;
        logPurple(token);
        const message = {
            didEmpresa: didEmpresa,
            didCliente: didCliente,
            didCuenta: didCuenta,
            token: token
        }

        logYellow("Mensaje a enviar a fenicio:", message);
        let result;

        try {
            //todo  Buscra el endpoint
            const result = await axios.delete(
                `https://preenvios.lightdata.app/fenicio/t`,
                message
            );

            console.log("✅ RESPONSE:", result.data);
            return result.data;

        } catch (error) {
            throw new CustomException({
                status: error.response?.status || 500,
                message: `Error al vincular cuenta con Fenicio: ${error.message}`,
                title: 'Error de vinculación'
            });
        }

    }

}
