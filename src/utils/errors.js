class ScraperError extends Error {
    constructor(message, code = 'SCRAPER_ERROR') {
        super(message);
        this.name = 'ScraperError';
        this.code = code;
    }
}

class InvalidUrlError extends ScraperError {
    constructor(message = 'La URL proporcionada no es valida.') {
        super(message, 'INVALID_URL');
        this.name = 'InvalidUrlError';
    }
}

class PageLoadError extends ScraperError {
    constructor(message = 'No se pudo cargar la pagina del producto.') {
        super(message, 'PAGE_LOAD_ERROR');
        this.name = 'PageLoadError';
    }
}

module.exports = {
    ScraperError,
    InvalidUrlError,
    PageLoadError
};