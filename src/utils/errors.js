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

class BlockedError extends ScraperError {
    constructor(
        message = 'Alibaba bloqueo el acceso y mostr una pagina de CAPTCHA.'
    ) {
        super(message, 'ACCESS_BLOCKED');
        this.name = 'BlockedError';
    }
}

class ProductNotFoundError extends ScraperError {
    constructor(
        message = 'No se encontro informacion del producto en la pagina.'
    ) {
        super(message, 'PRODUCT_NOT_FOUND');
        this.name = 'ProductNotFoundError';
    }
}

module.exports = {
    ScraperError,
    InvalidUrlError,
    PageLoadError,
    BlockedError,
    ProductNotFoundError
};