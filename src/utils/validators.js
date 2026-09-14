const ALIBABA_HOSTNAME = 'www.alibaba.com';
const ALIBABA_PRODUCT_PATH = /^\/product-detail\/.+/i;

/**
 * Valida que la URL corresponda a un producto de Alibaba.
 *
 * @param {string} url
 * @returns {boolean}
 */
function isValidAlibabaUrl(url) {
    if (!url || typeof url !== 'string') {
        return false;
    }

    try {
        const parsedUrl = new URL(url);

        const isHttps =
            parsedUrl.protocol === 'https:';

        const isAlibaba =
            parsedUrl.hostname.toLowerCase() ===
            ALIBABA_HOSTNAME;

        const isProductPage =
            ALIBABA_PRODUCT_PATH.test(
                parsedUrl.pathname
            );

        return (
            isHttps &&
            isAlibaba &&
            isProductPage
        );

    } catch {
        return false;
    }
}

module.exports = {
    isValidAlibabaUrl
};