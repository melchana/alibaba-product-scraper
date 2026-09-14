/**
 * Extrae información básica del vendedor.
 *
 * @param {import('cheerio').CheerioAPI} $ - Instancia de Cheerio.
 * @returns {Object}
 */
function extractSeller($) {
    const sellerName =
        getFirstText($, [
            '[class*="seller-name"]',
            '[class*="supplier-name"]',
            '[class*="sellerName"]',
            '[class*="supplierName"]',
            '[data-seller-name]',
            '[data-supplier-name]'
        ]);

    const store =
        getFirstText($, [
            '[class*="store-name"]',
            '[class*="company-name"]',
            '[class*="storeName"]',
            '[class*="companyName"]',
            '[class*="shop-name"]',
            '[class*="shopName"]'
        ]);

    const rating =
        getFirstText($, [
            '[class*="seller-rating"]',
            '[class*="supplier-rating"]',
            '[class*="sellerRating"]',
            '[class*="supplierRating"]'
        ]) ||
        extractRatingFromText($);

    const yearsOnPlatform =
        getFirstText($, [
            '[class*="years-on-platform"]',
            '[class*="yearsOnPlatform"]',
            '[class*="platform-years"]',
            '[class*="platformYears"]'
        ]) ||
        extractYearsFromText($);

    const location =
        getFirstText($, [
            '[class*="seller-location"]',
            '[class*="supplier-location"]',
            '[class*="sellerLocation"]',
            '[class*="supplierLocation"]',
            '[class*="company-location"]',
            '[class*="companyLocation"]'
        ]) ||
        extractLocationFromText($);

    return {
        name: sellerName,
        store,
        rating,
        yearsOnPlatform,
        location
    };
}

/**
 * Obtiene el primer texto válido de una lista de selectores.
 *
 * @param {import('cheerio').CheerioAPI} $
 * @param {string[]} selectors
 * @returns {string}
 */
function getFirstText($, selectors) {
    for (const selector of selectors) {
        const element = $(selector).first();

        if (!element.length) {
            continue;
        }

        const text = cleanText(
            element.text()
        );

        if (text) {
            return text;
        }
    }

    return '';
}

/**
 * Busca una valoración dentro del texto visible.
 *
 * Ejemplos:
 * 4.8
 * 4.8/5
 * Rating: 4.8
 *
 * @param {import('cheerio').CheerioAPI} $
 * @returns {string}
 */
function extractRatingFromText($) {
    const text = cleanText(
        $('body').text()
    );

    const match = text.match(
        /(?:rating|supplier\s+rating|seller\s+rating)\s*[:\-]?\s*(\d(?:\.\d)?(?:\s*\/\s*5)?)/i
    );

    return match
        ? cleanText(match[1])
        : '';
}

/**
 * Busca los años de permanencia en la plataforma.
 *
 * Ejemplos:
 * 5 years
 * 8 Years
 * 3 years on Alibaba
 *
 * @param {import('cheerio').CheerioAPI} $
 * @returns {string}
 */
function extractYearsFromText($) {
    const text = cleanText(
        $('body').text()
    );

    const match = text.match(
        /(\d+(?:\.\d+)?)\s*(?:years?|yrs?)\s*(?:on\s+(?:alibaba|platform))?/i
    );

    return match
        ? cleanText(match[0])
        : '';
}

/**
 * Busca una ubicación en el texto visible.
 *
 * @param {import('cheerio').CheerioAPI} $
 * @returns {string}
 */
function extractLocationFromText($) {
    const text = cleanText(
        $('body').text()
    );

    const match = text.match(
        /(?:location|located\s+in|address)\s*[:\-]?\s*([^|;,]{2,100})/i
    );

    return match
        ? cleanText(match[1])
        : '';
}

/**
 * Limpia espacios y evita valores undefined/null.
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
    extractSeller
};
