 /**
 * Extrae las especificaciones del producto.
 *
 * @param {import('cheerio').CheerioAPI} $ - Instancia de Cheerio.
 * @returns {Object}
 */
function extractSpecifications($) {
    const specifications = {};

    extractFromTables($, specifications);
    extractFromAttributeContainers($, specifications);

    return specifications;
}

/**
 * Extrae especificaciones desde tablas HTML.
 *
 * Ejemplo:
 *
 * | Material | Sterling Silver |
 * | Color    | Silver          |
 *
 * @param {import('cheerio').CheerioAPI} $
 * @param {Object} specifications
 */
function extractFromTables($, specifications) {
    $('table').each((_, table) => {
        $(table)
            .find('tr')
            .each((__, row) => {
                const cells = $(row)
                    .find('th, td')
                    .map((___, cell) =>
                        cleanText($(cell).text())
                    )
                    .get()
                    .filter(Boolean);

                if (cells.length >= 2) {
                    const key = cells[0];
                    const value = cells
                        .slice(1)
                        .join(' ');

                    addSpecification(
                        specifications,
                        key,
                        value
                    );
                }
            });
    });
}

/**
 * Busca posibles contenedores de atributos
 * cuando las especificaciones no están dentro
 * de una tabla.
 *
 * @param {import('cheerio').CheerioAPI} $
 * @param {Object} specifications
 */
function extractFromAttributeContainers($, specifications) {
    const selectors = [
        '[class*="specification"]',
        '[class*="specifications"]',
        '[class*="attribute"]',
        '[class*="product-attribute"]',
        '[class*="property"]'
    ];

    $(selectors.join(',')).each((_, container) => {
        const elements = $(container)
            .find('li, div, span, p')
            .toArray();

        for (let i = 0; i < elements.length - 1; i++) {
            const key = cleanText(
                $(elements[i]).text()
            );

            const value = cleanText(
                $(elements[i + 1]).text()
            );

            if (
                isValidSpecification(
                    key,
                    value
                )
            ) {
                addSpecification(
                    specifications,
                    key,
                    value
                );
            }
        }
    });
}

/**
 * Agrega una especificación evitando valores
 * vacíos y claves duplicadas.
 *
 * @param {Object} specifications
 * @param {string} key
 * @param {string} value
 */
function addSpecification(
    specifications,
    key,
    value
) {
    const normalizedKey = cleanText(key);
    const normalizedValue = cleanText(value);

    if (
        !normalizedKey ||
        !normalizedValue
    ) {
        return;
    }

    if (
        normalizedKey.length > 100 ||
        normalizedValue.length > 500
    ) {
        return;
    }

    if (!specifications[normalizedKey]) {
        specifications[normalizedKey] =
            normalizedValue;
    }
}

/**
 * Verifica si un par puede ser una especificación.
 *
 * @param {string} key
 * @param {string} value
 * @returns {boolean}
 */
function isValidSpecification(key, value) {
    if (!key || !value) {
        return false;
    }

    if (key === value) {
        return false;
    }

    if (key.length > 100) {
        return false;
    }

    if (value.length > 500) {
        return false;
    }

    return true;
}

/**
 * Limpia espacios y evita valores undefined/null.
 *
 * @param {unknown} value
 * @returns {string}
 */
function cleanText(value) {
    if (value === undefined || value === null) {
        return '';
    }

    return String(value)
        .replace(/\s+/g, ' ')
        .trim();
}

module.exports = {
    extractSpecifications
};