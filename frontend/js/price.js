// getPriceMultQty(), getTotalPrice()

function getPriceMultQty(price, qty) {
    if (typeof price == 'string') {
        while (price.includes(',')) {
            price = price.replace(',', '.');
        }
    }
    // If the price param is not a Number
    if (Number.isNaN(Number.parseFloat(price))) {
        return '';
    }
    // If the qty param is not a Number
    if (Number.isNaN(Number.parseInt(qty))) {
        return '';
    }
    let finalPrice = Number.parseFloat(Number.parseFloat(price).toFixed(2));
    return finalPrice * Number.parseInt(qty);
}

function getTotalPrice() {
    let res = 0;
    for (item of bag.items) {
        let price = getPriceMultQty(item.product.price, item.qty);
        if (Number.isNaN(price) == false) {
            res += price;
        }
    }
    return res;
}
