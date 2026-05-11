import { JSDOM } from 'jsdom';
import { createDom } from './dom.js';

/**
 * Parse the VestMail content and extract account information and transactions using the provided parser functions.
 * 
 * @param {string} html 
 * @param {{
 *   account: (dom: JSDOM) => {
 *     accountNumber: string,
 *     accountHolder: string,
 *     accountStatus: string,
 *     balance: number,
 *     availableBalance: number,
 *   },
 *   transactions: (dom: JSDOM) => {
 *     transactionDate: string,
 *     type: 'deposit'|'withdrawal'|'unknown',
 *     amount: number,
 *     balanceAfter: number,
 *     branch: string,
 *     bank: string,
 *     description: string,
 *   }[]
 * }} parser 
 * @returns {{
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
 * }}
 */
export function parseContent(html, parser) {
    const dom = createDom(html);
    return {
        account: parser.account(dom),
        transactions: parser.transactions(dom),
    };
}