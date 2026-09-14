const { fetchPage } = require('./services/browser.service');
const { parseProduct } = require('./parsers/product.parser');
const { isValidAlibabaUrl } = require('./utils/validators');
const {
    InvalidUrlError,
    PageLoadError
} = require('./utils/errors');

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

        console.log(JSON.stringify(product, null, 2));
    } catch (error) {
        console.error(
            JSON.stringify(
                {
                    error: true,
                    code: error.code || 'SCRAPER_ERROR',
                    message: error.message
                },
                null,
                2
            )
        );

        process.exitCode = 1;
    }
}

main();