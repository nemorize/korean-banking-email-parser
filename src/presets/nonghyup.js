
export const nonghyupPreset = {
    verifier: (html) => html.includes('입출금 거래 내역 조회'),
    account: parseNonghyupAccount,
    transactions: parseNonghyupTransactions,
};

function parseNonghyupAccount(dom) {
    const { document } = dom.window;
    return {
        accountNumber: findValueByLabel(document, '계좌번호'),
        accountHolder: findValueByLabel(document, '예금주명'),
        accountStatus: findValueByLabel(document, '계좌상태'),
        balance: parseMoney(findValueByLabel(document, '통 장 잔 액')),
        availableBalance: parseMoney(findValueByLabel(document, '지급가능잔액')),
    };
}

function parseNonghyupTransactions(dom) {
    const { document } = dom.window;
    const rows = [...document.querySelectorAll('tr')];
    const transactions = [];
    for (const row of rows) {
        const cells = [...row.querySelectorAll('td')].map((v) => normalizeText(v.textContent));
        if (!isTransactionRow(cells)) {
            continue;
        }
        transactions.push({
            transactionDate: cells[1],
            type: cells[2] === '입금' ? 'deposit' : cells[2] === '출금' ? 'withdrawal' : 'unknown',
            amount: parseMoney(cells[3]),
            balanceAfter: parseMoney(cells[4]),
            branch: cells[5],
            bank: cells[6],
            description: cells[7],
        });
    }
    return transactions;
}

function parseMoney(text) {
    text = normalizeText(text);
    if (!text) {
        return 0;
    }
    if (!text.endsWith('원')) {
        return 0;
    }
    const number = Number(text.replace(/[^0-9\-]/g, ''));
    if (!number || isNaN(number)) {
        return 0;
    }
    return number;
}

function normalizeText(text) {
    return String(text || '')
        .replace(/\s+/g, ' ')
        .trim();
}

function findValueByLabel(document, label) {
    const tds = [...document.querySelectorAll('td')];
    for (const td of tds) {
        if (normalizeText(td.textContent) === label) {
            const next = td.nextElementSibling;
            if (next) {
                return normalizeText(next.textContent);
            }
        }
    }
    return '';
}

function isTransactionRow(cells) {
    if (cells.length < 8) {
        return false;
    }
    if (!/^\d+$/.test(cells[0])) {
        return false;
    }
    if (!/\d{4}\/\d{2}\/\d{2}/.test(cells[1])) {
        return false;
    }
    if (!cells[3].includes('원')) {
        return false;
    }
    return true;
}