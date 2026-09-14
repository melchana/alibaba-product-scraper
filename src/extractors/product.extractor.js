/**
 * Extrae los datos principales del producto.
 *
 * @param {import('cheerio').CheerioAPI} $ - Instancia de Cheerio.
 * @param {string} sourceUrl - URL final de la página.
 * @returns {Object}
 */
function extractProduct($, sourceUrl = '') {
    const structuredData =
        extractStructuredProductData($);

    const productTitle =
        cleanText(
            $('h1').first().text()
        ) ||
        cleanText(
            $('[class*="product-title"]').first().text()
        ) ||
        cleanText(
            $('[class*="title"]').first().text()
        ) ||
        structuredData.name ||
        '';

    const productId =
        cleanText(
            $('[data-product-id]')
                .first()
                .attr('data-product-id')
        ) ||
        cleanText(
            $('[data-productid]')
                .first()
                .attr('data-productid')
        ) ||
        structuredData.productId ||
        extractProductIdFromCanonical($) ||
        extractProductIdFromUrl(sourceUrl) ||
        '';

    const price =
        cleanText(
            $('[class*="product-price"]')
                .first()
                .text()
        ) ||
        cleanText(
            $('[class*="price"]').first().text()
        ) ||
        structuredData.price ||
        '';

    const minOrder =
        cleanText(
            $('[class*="min-order"]')
                .first()
                .text()
        ) ||
        cleanText(
            $('[class*="minimum-order"]')
                .first()
                .text()
        ) ||
        extractMinOrderFromText($) ||
        '';

    return {
        productTitle,
        productId,
        price,
        minOrder
    };
}

/**
 * Intenta obtener información del producto desde JSON-LD.
 *
 * @param {import('cheerio').CheerioAPI} $
 * @returns {Object}
 */
function extractStructuredProductData($) {
    const result = {
        name: '',
        productId: '',
        price: ''
    };

    $('script[type="application/ld+json"]').each(
        (_, script) => {
            if (
                result.name &&
                result.productId &&
                result.price
            ) {
                return;
            }

            const raw = $(script).html();

            if (!raw) {
                return;
            }

            try {
                const data = JSON.parse(raw);

                const candidates = [];

                if (Array.isArray(data)) {
                    candidates.push(...data);
                } else {
                    candidates.push(data);

                    if (
                        Array.isArray(
                            data['@graph']
                        )
                    ) {
                        candidates.push(
                            ...data['@graph']
                        );
                    }
                }

                for (const item of candidates) {
                    if (
                        !item ||
                        typeof item !== 'object'
                    ) {
                        continue;
                    }

                    if (
                        !result.name &&
                        typeof item.name === 'string'
                    ) {
                        result.name =
                            cleanText(item.name);
                    }

                    if (!result.productId) {
                        result.productId =
                            cleanText(
                                item.productID
                            ) ||
                            cleanText(
                                item.productId
                            ) ||
                            cleanText(
                                item.sku
                            );
                    }

                    if (
                        !result.price &&
                        item.offers
                    ) {
                        const offers =
                            Array.isArray(
                                item.offers
                            )
                                ? item.offers
                                : [item.offers];

                        for (const offer of offers) {
                            if (
                                offer &&
                                offer.price !==
                                    undefined &&
                                offer.price !==
                                    null
                            ) {
                                result.price =
                                    cleanText(
                                        String(
                                            offer.price
                                        )
                                    );

                                break;
                            }
                        }
                    }

                    if (
                        result.name &&
                        result.productId &&
                        result.price
                    ) {
                        break;
                    }
                }
            } catch {
                // El contenido no era JSON válido.
            }
        }
    );

    return result;
}

/**
 * Obtiene el ID desde la URL canónica.
 *
 * @param {import('cheerio').CheerioAPI} $
 * @returns {string}
 */
function extractProductIdFromCanonical($) {
    const canonicalUrl =
        $('link[rel="canonical"]')
            .attr('href') || '';

    return extractProductIdFromUrl(
        canonicalUrl
    );
}

/**
 * Obtiene el ID desde una URL de Alibaba.
 *
 * Ejemplo:
 * ..._1601597750137.html
 *
 * @param {string} url
 * @returns {string}
 */
function extractProductIdFromUrl(url) {
    if (!url) {
        return '';
    }

    const match = url.match(
        /_(\d+)\.html(?:[?#].*)?$/i
    );

    return match
        ? match[1]
        : '';
}

/**
 * Busca el pedido mínimo dentro del texto visible.
 *
 * Ejemplos:
 * Minimum Order: 10 pieces
 * Min. Order: 20 pieces
 * Minimum order quantity: 50 pieces
 *
 * @param {import('cheerio').CheerioAPI} $
 * @returns {string}
 */
function extractMinOrderFromText($) {
    const text = $('body')
        .text()
        .replace(/\s+/g, ' ')
        .trim();

    const match = text.match(
        /(?:minimum\s+order(?:\s+quantity)?|min\.?\s+order)\s*[:\-]?\s*([^|;,]{1,80})/i
    );

    return match
        ? cleanText(match[1])
        : '';
}

/**
 * Limpia espacios y valores inválidos.
 *
 * @param {unknown} value
 * @returns {string}
 */
function cleanText(value) {
    if (
        value === undefined ||
        value === null
    ) {
        return '';
    }

    return String(value)
        .replace(/\s+/g, ' ')
        .trim();
}

module.exports = {
    extractProduct
};