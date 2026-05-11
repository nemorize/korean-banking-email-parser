import { createDom } from './dom.js';

/**
 * Decrypt the VestMail content from the given HTML and password.
 * 
 * @param {string} html Full HTML content of the VestMail.
 * @param {string} password Password to decrypt the VestMail.
 * @param {(html:string)=>boolean} [verifier=(html)=>html.length>100] Function to verify if the decrypted content is correct. It receives the decrypted HTML and should return true if it's valid.
 * @param {number} [timeout=10000] Maximum time to wait for decryption (in milliseconds).
 * 
 * @returns {Promise<string>} Decrypted HTML content of the VestMail.
 * 
 * @warning This executes the JavaScript code embedded in the HTML. Make sure to use it only with trusted content.
 */
export async function decryptVestMail(html, password, verifier, timeout) {
    timeout = timeout || 10000;
    verifier = verifier || ((html) => html.length > 100);

    const dom = createDom(html, {
        runScripts: 'dangerously',
        resources: 'usable',
        pretendToBeVisual: true,
        url: 'http://localhost/'
    });

    const { window } = dom;
    const { document } = window;
    const documentWrite = document.write.bind(document);

    let resultHtml = null;
    document.write = function (content) {
        if (typeof content === 'string' && verifier(content)) {
            resultHtml = content;
        }
        return documentWrite(content);
    };

    let finished = false;
    window.vestmail_onend = function () {
        finished = true;
    };

    const startTime = Date.now();
    await new Promise((resolve) => {
        window.addEventListener('load', () => resolve(), {
            once: true,
        });
        setTimeout(resolve, Math.min(3000, timeout));
    });
    timeout = timeout - (Date.now() - startTime);

    const inputs = [...document.querySelectorAll('input')];
    const passwordInput = inputs.find((v) => {
        const s = `${v.id} ${v.name} ${v.type}`.toLowerCase();
        return s.includes('pass');
    });
    if (!passwordInput) {
        throw new Error('Cannot find password input');
    }
    passwordInput.value = password;

    const doAction = window.doAction || window.N;
    if (typeof doAction !== 'function') {
        throw new Error('Cannot find doAction function');
    }

    doAction();
    await new Promise((resolve) => {
        const started = Date.now();
        const t = setInterval(() => {
            if (finished || resultHtml || Date.now() - started > timeout) {
                clearInterval(t);
                resolve();
            }
        }, 50);
    });

    if (!resultHtml) {
        resultHtml = document.documentElement.outerHTML;
    }
    if (!resultHtml || !verifier(resultHtml)) {
        throw new Error('Failed to decrypt VestMail');
    }
    return resultHtml;
}