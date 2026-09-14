/**
 * Extrae las especificaciones del producto.
 *
 * @param {import('cheerio').CheerioAPI} $ - Instancia de Cheerio.
 * @returns {Object}
 */
function extractSpecifications($) {
    const specifications = {};

    $('table').each((_, table) => {
        $(table)
            .find('tr')
            .each((__, row) => {
                const cells = $(row)
                    .find('th, td')
                    .map((___, cell) => $(cell).text().trim())
                    .get()
                    .filter(Boolean);

                if (cells.length >= 2) {
                    specifications[cells[0]] = cells.slice(1).join(' ');
                }
            });
    });

    return specifications;
}

module.exports = {
    extractSpecifications
};