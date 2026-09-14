const { fetchPage } = require('./services/browser.service');
const { parseProduct } = require('./parsers/product.parser');
const { isValidAlibabaUrl } = require('./utils/validators');

const {
    InvalidUrlError,
    PageLoadError,
    ProductNotFoundError
} = require('./utils/errors');

const {
    SCRAPER_CONFIG
} = require('./config/constants');

async function main() {
    const url = process.argv[2];

    try {
        if (!isValidAlibabaUrl(url)) {
            throw new InvalidUrlError(
                'Debes proporcionar una URL valida de un producto de Alibaba.'
            );
        }

        console.error('Obteniendo producto...');

        const { html, finalUrl } = await fetchPage(url);

        if (!html || html.length < 1000) {
            throw new PageLoadError(
                'La pagina del producto no contiene suficiente contenido.'
            );
        }

        const product = parseProduct(html, finalUrl);

        validateProduct(product);

        console.log(
            JSON.stringify(
                product,
                null,
                SCRAPER_CONFIG.outputIndent
            )
        );

    } catch (error) {

        console.error(
            JSON.stringify(
                {
                    error: true,
                    code: error.code || 'SCRAPER_ERROR',
                    message: error.message
                },
                null,
                SCRAPER_CONFIG.outputIndent
            )
        );

        process.exitCode = 1;
    }
}

/**
 * Verifica que la informacion minima del producto
 * haya sido encontrada antes de devolver el resultado.
 *
 * @param {Object} product
 * @throws {ProductNotFoundError}
 */
function validateProduct(product) {
    if (!product) {
        throw new ProductNotFoundError();
    }

    const hasTitle =
        typeof product.productTitle === 'string' &&
        product.productTitle.trim().length > 0;

    const hasProductId =
        typeof product.productId === 'string' &&
        product.productId.trim().length > 0;

    if (!hasTitle || !hasProductId) {
        throw new ProductNotFoundError(
            'No se encontro informacion identificable del producto.'
        );
    }
}

main();
