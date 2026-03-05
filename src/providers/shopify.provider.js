// src/providers/shopify.provider.js
export class ShopifyProvider {
    name = 'shopify';

    async startLink(account) {
        return {
            linkUrl: `https://shopify.com/oauth?state=${account.id}`
        };
    }

    async completeLink(account, payload) {
        return {
            credentials: {
                accessToken: payload.accessToken
            },
            metadata: {
                shop: payload.shop
            }
        };
    }
}
