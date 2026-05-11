import { JSDOM, VirtualConsole } from 'jsdom';

/**
 * Create a JSDOM instance from the given HTML and options.
 * 
 * @param {string} html 
 * @param {import('jsdom').ConstructorOptions} options 
 * @returns {JSDOM}
 */
export function createDom(html, options) {
    const virtualConsole = new VirtualConsole();
    virtualConsole.on('error', () => { });

    const dom = new JSDOM(html, {
        ...options,
        virtualConsole,
        beforeParse(window) {
            window.alert = function () { };
        },
    });
    return dom;
}