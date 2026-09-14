/**
 * Extrae información básica del vendedor.
 *
 * @param {import('cheerio').CheerioAPI} $ - Instancia de Cheerio.
 * @returns {Object}
 */
function extractSeller($) {
    const sellerName =
        $('[class*="seller-name"]').first().text().trim() ||
        $('[class*="supplier-name"]').first().text().trim() ||
        '';

    const store =
        $('[class*="store-name"]').first().text().trim() ||
        $('[class*="company-name"]').first().text().trim() ||
        '';

    const rating =
        $('[class*="rating"]').first().text().trim() ||
        '';

    const yearsOnPlatform =
        $('[class*="years"]').first().text().trim() ||
        $('[class*="year"]').first().text().trim() ||
        '';

    const location =
        $('[class*="location"]').first().text().trim() ||
        '';

    return {
        name: sellerName,
        store,
        rating,
        yearsOnPlatform,
        location
    };
}

module.exports = {
    extractSeller
};
