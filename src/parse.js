import { JSDOM } from 'jsdom';
import { createDom } from './dom.js';

/**
 * Parse the VestMail content and extract account information and transactions using the provided parser functions.
 * 
 * @param {string} html 
 * @param {{
 *   account: (dom: JSDOM) => {
 *     accountNumber: string|null,
 *     accountHolder: string|null,
 *     accountStatus: string|null,
 *     balance: number|null,
 *     availableBalance: number|null,
 *   },
 *   transactions: (dom: JSDOM) => {
 *     transactionDate: string|null,
 *     type: 'deposit'|'withdrawal'|null,
 *     amount: number|null,
 *     balanceAfter: number|null,
 *     branch: string|null,
 *     bank: string|null,
 *     description: string|null,
 *   }[]
 * }} parser 
 * @returns {{
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
 * }}
 */
export function parseContent(html, parser) {
    const dom = createDom(html);
    return {
        account: parser.account(dom),
        transactions: parser.transactions(dom),
    };
}