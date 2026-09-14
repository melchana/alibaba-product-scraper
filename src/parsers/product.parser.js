const cheerio = require('cheerio');

const {
    extractProduct
} = require('../extractors/product.extractor');

const {
    extractSeller
} = require('../extractors/seller.extractor');

const {
    extractSpecifications
} = require('../extractors/specifications.extractor');

const {
    SCRAPER_CONFIG
} = require('../config/constants');

/**
 * Convierte el HTML obtenido con Playwright
 * en información estructurada del producto.
 *
 * @param {string} html
 * @param {string} finalUrl
 * @returns {Object}
 */
function parseProduct(html, finalUrl) {
    const $ = cheerio.load(html);

    const product = extractProduct($, finalUrl);
    const seller = extractSeller($);
    const specifications = extractSpecifications($);

    return {
        productTitle: cleanText(product.productTitle),
        productId: cleanText(product.productId),
        price: cleanText(product.price),
        minOrder: cleanText(product.minOrder),
        images: extractImages($),
        description: extractDescription($),
        specifications,
        sellerInfo: normalizeSellerInfo(seller),
        deliveryTerms: extractDeliveryTerms($),
        paymentMethods: extractPaymentMethods($),
        variations: extractVariations($),
        url: cleanText(finalUrl),
        scrapedAt: new Date().toISOString()
    };
}

/**
 * Extrae las imágenes visibles o cargadas de forma diferida.
 *
 * @param {import('cheerio').CheerioAPI} $
 * @returns {string[]}
 */
function extractImages($) {
    const images = [];

    $('img').each((_, img) => {
        const attributes = [
            'src',
            'data-src',
            'data-lazy-src',
            'data-original',
            'data-image',
            'data-url'
        ];

        for (const attribute of attributes) {
            const src = $(img).attr(attribute);

            if (isValidImageUrl(src)) {
                images.push(src);
                break;
            }
        }

        const srcset = $(img).attr('srcset');

        if (srcset) {
            srcset
                .split(',')
                .map((item) => item.trim().split(/\s+/)[0])
                .filter(isValidImageUrl)
                .forEach((url) => images.push(url));
        }
    });

    return [...new Set(images)];
}

/**
 * Extrae la descripción del producto.
 *
 * @param {import('cheerio').CheerioAPI} $
 * @returns {string}
 */
function extractDescription($) {
    const selectors = [
        '[class*="detail-desc"]',
        '[class*="product-description"]',
        '[class*="description"]',
        '[id*="description"]'
    ];

    for (const selector of selectors) {
        const element = $(selector).first();

        if (!element.length) {
            continue;
        }

        const text = cleanText(element.text());

        if (text) {
            return text.substring(
                0,
                SCRAPER_CONFIG.maxDescriptionLength
            );
        }
    }

    return '';
}

/**
 * Extrae términos de entrega.
 *
 * @param {import('cheerio').CheerioAPI} $
 * @returns {Object}
 */
function extractDeliveryTerms($) {
    const text = cleanText(
        $('body').text()
    );

    const result = {
        incoterms: '',
        shippingPort: '',
        deliveryTime: ''
    };

    const incotermsMatch = text.match(
        /\b(EXW|FOB|CIF|CFR|DDP|DAP|FCA|CPT|CIP)\b/i
    );

    if (incotermsMatch) {
        result.incoterms =
            incotermsMatch[1].toUpperCase();
    }

    const portMatch = text.match(
        /(?:shipping\s+port|port\s+of\s+loading|loading\s+port)\s*[:\-]?\s*([^|;,]{2,100})/i
    );

    if (portMatch) {
        result.shippingPort =
            cleanText(portMatch[1]);
    }

    const deliveryMatch = text.match(
        /(?:delivery\s+time|lead\s+time|delivery\s+date)\s*[:\-]?\s*([^|;,]{2,100})/i
    );

    if (deliveryMatch) {
        result.deliveryTime =
            cleanText(deliveryMatch[1]);
    }

    return result;
}

/**
 * Extrae métodos de pago mencionados en el contenido visible.
 *
 * @param {import('cheerio').CheerioAPI} $
 * @returns {string[]}
 */
function extractPaymentMethods($) {
    const text = cleanText(
        $('body').text()
    ).toLowerCase();

    const methods = [
        {
            label: 'T/T',
            patterns: ['t/t', 'telegraphic transfer']
        },
        {
            label: 'L/C',
            patterns: ['l/c', 'letter of credit']
        },
        {
            label: 'PayPal',
            patterns: ['paypal']
        },
        {
            label: 'Western Union',
            patterns: ['western union']
        },
        {
            label: 'Credit Card',
            patterns: ['credit card']
        },
        {
            label: 'Bank Transfer',
            patterns: ['bank transfer']
        },
        {
            label: 'Online Transfer',
            patterns: ['online transfer']
        },
        {
            label: 'Trade Assurance',
            patterns: ['trade assurance']
        }
    ];

    return methods
        .filter((method) =>
            method.patterns.some((pattern) =>
                text.includes(pattern)
            )
        )
        .map((method) => method.label);
}

/**
 * Extrae posibles variaciones del producto.
 *
 * @param {import('cheerio').CheerioAPI} $
 * @returns {string[]}
 */
function extractVariations($) {
    const variations = [];

    const selectors = [
        '[class*="sku"]',
        '[class*="variation"]',
        '[class*="option"]'
    ];

    $(selectors.join(',')).each((_, element) => {
        const text = cleanText(
            $(element).text()
        );

        if (
            text &&
            text.length <= 500
        ) {
            variations.push(text);
        }
    });

    return [...new Set(variations)];
}

/**
 * Normaliza la información del vendedor para
 * evitar propiedades undefined o null.
 *
 * @param {Object} seller
 * @returns {Object}
 */
function normalizeSellerInfo(seller) {
    return {
        name: cleanText(seller?.name),
        store: cleanText(seller?.store),
        rating: cleanText(seller?.rating),
        yearsOnPlatform: cleanText(
            seller?.yearsOnPlatform
        ),
        location: cleanText(seller?.location)
    };
}

/**
 * Verifica que una URL corresponda a una imagen.
 *
 * @param {string} url
 * @returns {boolean}
 */
function isValidImageUrl(url) {
    if (!url || typeof url !== 'string') {
        return false;
    }

    return /^https?:\/\//i.test(url);
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
    parseProduct
};