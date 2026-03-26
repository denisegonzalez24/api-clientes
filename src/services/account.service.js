import { CustomException } from "lightdata-tools";
import { TnProvider } from "../providers/tn.provider.js";


const ecommerce = {
    tn: new TnProvider(),
    // ml: new MlProvider(),
    // shopify: new ShopifyProvider()
};

export async function desvincularCuenta(body) {

    const provider = body.tienda;

    if (!provider) {
        throw new CustomException({
            message: 'Debe especificarse un ecommerce para desvincular la cuenta',
            title: 'Ecommerce requerido'
        });
    }

    const selectedProvider = ecommerce[provider];

    if (!selectedProvider) {
        throw new CustomException({
            message: `Provider no soportado: ${provider}`,
            title: 'Ecommerce no soportado'
        });
    }

    return await selectedProvider.desvincularCuenta(body);
}


export async function getCuentas(body) {
    const provider = body.tienda;
    console.log("data en getCuentas", body);

    if (!provider) {
        throw new CustomException({
            message: 'Debe especificarse un ecommerce para obtener las cuentas',
            title: 'Ecommerce requerido'
        });
    }

    const selectedProvider = ecommerce[provider];

    if (!selectedProvider) {
        throw new CustomException({
            message: `Provider no soportado: ${provider}`,
            title: 'Ecommerce no soportado'
        });
    }

    return await selectedProvider.getCuentas(body.seller_id);
}   