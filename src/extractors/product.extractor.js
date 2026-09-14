/**
 * Extrae los datos principales del producto.
 *
 * @param {import('cheerio').CheerioAPI} $ - Instancia de Cheerio.
 * @returns {Object}
 */
function extractProduct($) {
    const productTitle =
        $('h1').first().text().trim() ||
        $('[class*="title"]').first().text().trim() ||
        '';

    const productId =
        $('[data-product-id]').first().attr('data-product-id') ||
        $('[data-spm-anchor-id*="product"]').first().attr('data-product-id') ||
        extractProductIdFromUrl($);

    const price =
        $('[class*="price"]').first().text().trim() ||
        '';

    const minOrder =
        $('[class*="min-order"]').first().text().trim() ||
        $('[class*="minimum-order"]').first().text().trim() ||
        '';

    return {
        productTitle,
        productId,
        price,
        minOrder
    };
}

function extractProductIdFromUrl($) {
    const canonicalUrl = $('link[rel="canonical"]').attr('href');

    if (!canonicalUrl) {
        return '';
    }

    const match = canonicalUrl.match(/\/product-detail\/[^/]+\/(\d+)\.html/i);

    return match ? match[1] : '';
}

module.exports = {
    extractProduct
};