const ALIBABA_PRODUCT_URL_REGEX =
    /^https:\/\/www\.alibaba\.com\/product-detail\/.+/i;

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

        return (
            parsedUrl.protocol === 'https:' &&
            parsedUrl.hostname === 'www.alibaba.com' &&
            ALIBABA_PRODUCT_URL_REGEX.test(url)
        );
    } catch {
        return false;
    }
}

module.exports = {
    isValidAlibabaUrl
};