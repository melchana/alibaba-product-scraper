const { chromium } = require('playwright');

const {
    PageLoadError,
    BlockedError
} = require('../utils/errors');

const {
    SCRAPER_CONFIG
} = require('../config/constants');

/**
 * Obtiene el HTML de una página de producto de Alibaba.
 *
 * @param {string} url
 * @returns {Promise<{html: string, finalUrl: string}>}
 */
async function fetchPage(url) {
    let browser;

    try {
        browser = await chromium.launch({
            headless: true
        });

        const context = await browser.newContext({
            viewport: {
                width: 1366,
                height: 768
            },
            locale: 'en-US',
            userAgent:
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                'Chrome/131.0.0.0 Safari/537.36'
        });

        const page = await context.newPage();

        page.setDefaultTimeout(
            SCRAPER_CONFIG.navigationTimeout
        );

        page.setDefaultNavigationTimeout(
            SCRAPER_CONFIG.navigationTimeout
        );

        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: SCRAPER_CONFIG.navigationTimeout
        });

        await page.waitForTimeout(
            SCRAPER_CONFIG.waitAfterLoad
        );

        const html = await page.content();
        const finalUrl = page.url();

        const lowerHtml = html.toLowerCase();

        const isBlocked =
            lowerHtml.includes('captcha interception') ||
            lowerHtml.includes('<punish-component') ||
            lowerHtml.includes('awsc/captcha');

        if (isBlocked) {
            throw new BlockedError(
                'Alibaba bloqueo el acceso y mostro una pagina de CAPTCHA. No fue posible obtener los datos del producto.'
            );
        }

        return {
            html,
            finalUrl
        };

    } catch (error) {

        if (error.code) {
            throw error;
        }

        if (
            error.name === 'TimeoutError' ||
            error.message.toLowerCase().includes('timeout')
        ) {
            throw new PageLoadError(
                'Alibaba no respondio dentro del tiempo limite establecido.'
            );
        }

        throw new PageLoadError(
            `No se pudo obtener la pagina: ${error.message}`
        );

    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = {
    fetchPage
};