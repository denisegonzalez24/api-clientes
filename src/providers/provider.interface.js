// src/providers/provider.interface.js

/**
 * @interface EcommerceProvider
 *
 * Un provider debe implementar:
 *
 * - name: string
 * - startLink(account)
 * - completeLink(account, payload)
 *
 * Métodos opcionales:
 * - refresh(account)
 * - revoke(account)
 */
