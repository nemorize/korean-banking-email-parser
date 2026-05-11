import { parseContent } from './parse.js';
import { nonghyupPreset } from './presets/nonghyup.js';
import { decryptVestMail } from './vestmail.js';

/**
 * 
 * @param {string} html Full encrypted HTML content of the VestMail.
 * @param {string} password Password to decrypt the VestMail.
 * @param {number} [timeout=10000] Maximum time to wait for decryption (in milliseconds).
 * 
 * @returns {Promise<{
 *   account: {
 *     accountNumber: string,
 *     accountHolder: string,
 *     accountStatus: string,
 *     balance: number,
 *     availableBalance: number,
 *   },
 *   transactions: {
 *     transactionDate: string,
 *     type: 'deposit'|'withdrawal'|'unknown',
 *     amount: number,
 *     balanceAfter: number,
 *     branch: string,
 *     bank: string,
 *     description: string,
 *   }[]
 * }>}
 */
export async function parse(html, password, timeout) {
    const preset = detectPreset(html);
    const decryptedHtml = await decryptVestMail(html, password, preset.verifier, timeout);
    return parseContent(decryptedHtml, preset);
}

const presets = {
    '농협': nonghyupPreset,
}

function detectPreset(html) {
    for (const [name, preset] of Object.entries(presets)) {
        if (html.includes(name)) {
            return preset;
        }
    }
    throw new Error('Cannot detect bank from the VestMail content');
}