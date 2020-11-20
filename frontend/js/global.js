export const backendUrl = 'http://localhost:3000/api/';
export const productType = 'cameras';

export function renderPrice(price) {
    if (typeof price == 'string') {
        while(price.includes(',')) {
            price = price.replace(',', '.');
        }
    }
    // If the price param is not a Number
    if (Number.isNaN(Number.parseFloat(price))) {
        return '';
    }
    return Number.parseFloat(price).toFixed(2).replace('.', ',') + ' €';
}

function generateID(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let res = '';
    for(let i = 0; i < length; ++i) {
        res += chars[Math.floor(Math.random() * (chars.length -1))]
    }
    return res;
}