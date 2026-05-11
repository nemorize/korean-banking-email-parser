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
 *     accountNumber: string|null,
 *     accountHolder: string|null,
 *     accountStatus: string|null,
 *     balance: number|null,
 *     availableBalance: number|null,
 *   },
 *   transactions: {
 *     transactionDate: string|null,
 *     type: 'deposit'|'withdrawal'|null,
 *     amount: number|null,
 *     balanceAfter: number|null,
 *     branch: string|null,
 *     bank: string|null,
 *     description: string|null,
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