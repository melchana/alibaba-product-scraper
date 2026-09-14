const cheerio = require('cheerio');

const { extractProduct } = require('../extractors/product.extractor');
const { extractSeller } = require('../extractors/seller.extractor');
const {
    extractSpecifications
} = require('../extractors/specifications.extractor');

/**
 * Convierte el HTML obtenido con Playwright en datos estructurados.
 *
 * @param {string} html
 * @param {string} finalUrl
 * @returns {Object}
 */
function parseProduct(html, finalUrl) {
    const $ = cheerio.load(html);

    const product = extractProduct($);
    const seller = extractSeller($);
    const specifications = extractSpecifications($);

    const images = extractImages($);
    const description = extractDescription($);
    const deliveryTerms = extractDeliveryTerms($);
    const paymentMethods = extractPaymentMethods($);
    const variations = extractVariations($);

    return {
        productTitle: product.productTitle,
        productId: product.productId,
        price: product.price,
        minOrder: product.minOrder,
        images,
        description,
        specifications,
        sellerInfo: seller,
        deliveryTerms,
        paymentMethods,
        variations,
        url: finalUrl,
        scrapedAt: new Date().toISOString()
    };
}

function extractImages($) {
    const images = [];

    $('img').each((_, img) => {
        const src =
            $(img).attr('src') ||
            $(img).attr('data-src') ||
            $(img).attr('data-lazy-src');

        if (src && src.startsWith('http')) {
            images.push(src);
        }
    });

    return [...new Set(images)];
}

function extractDescription($) {
    const selectors = [
        '[class*="description"]',
        '[id*="description"]',
        '[class*="detail-desc"]'
    ];

    for (const selector of selectors) {
        const text = $(selector).first().text().trim();

        if (text) {
            return text;
        }
    }

    return '';
}

function extractDeliveryTerms($) {
    const text = $('body').text().replace(/\s+/g, ' ').trim();

    const result = {
        incoterms: '',
        shippingPort: '',
        deliveryTime: ''
    };

    const incotermsMatch = text.match(
        /\b(EXW|FOB|CIF|CFR|DDP|DAP|FCA)\b/i
    );

    if (incotermsMatch) {
        result.incoterms = incotermsMatch[1].toUpperCase();
    }

    const portMatch = text.match(
        /(?:shipping port|port of loading)\s*[:\-]?\s*([A-Za-z\s]+)/i
    );

    if (portMatch) {
        result.shippingPort = portMatch[1].trim();
    }

    const deliveryMatch = text.match(
        /(?:delivery time|lead time)\s*[:\-]?\s*([^|;]+)/i
    );

    if (deliveryMatch) {
        result.deliveryTime = deliveryMatch[1].trim();
    }

    return result;
}

function extractPaymentMethods($) {
    const text = $('body').text().replace(/\s+/g, ' ').trim();

    const methods = [
        'T/T',
        'L/C',
        'PayPal',
        'Western Union',
        'Credit Card',
        'Bank Transfer',
        'Online Transfer'
    ];

    return methods.filter((method) =>
        text.toLowerCase().includes(method.toLowerCase())
    );
}

function extractVariations($) {
    const variations = [];

    $('[class*="sku"], [class*="variation"], [class*="option"]').each(
        (_, element) => {
            const text = $(element).text().replace(/\s+/g, ' ').trim();

            if (text && text.length < 500) {
                variations.push(text);
            }
        }
    );

    return [...new Set(variations)];
}

module.exports = {
    parseProduct
};
