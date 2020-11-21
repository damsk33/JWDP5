// Get product list and type
const backendUrl = 'http://localhost:3000/api/';
const myBagDetails = document.getElementById('bag-details');
let bag = { items: [], ids: [] }; // [items: [{ productType: '', product: '', personalisation: '', qty: 0 }], ids: [string]}

// tagName ex => div
// caracteristics ex => {id: 'myId', class : 'maClasse', value: 'coucou'}
function createHTMLElement(tagName, caracteristics) {
    try {
        let element = document.createElement(tagName);
        for (key of Object.keys(caracteristics)) {
            if (key == 'innerHTML') {
                element.innerHTML = caracteristics[key];
            } else {
                element.setAttribute(key, caracteristics[key]);
            }
        }
        return element;
    } catch (e) {
        return null;
    }
}

function makeRequest(url, method = 'GET') {
    // Create the XHR request
    let request = new XMLHttpRequest();
    // Return it as a Promise
    return new Promise(function (resolve, reject) {
        // Setup our listener to process compeleted requests
        request.onload = () => {
            if (request.status >= 200 && request.status < 300) {
                resolve(request);
            } else {
                reject({
                    status: request.status,
                    statusText: request.statusText
                });
            }
        };
        request.onerror = () => reject({
            status: request.status,
            statusText: request.statusText
        });;
        // Setup our HTTP request
        request.open(method, url, true);
        // Send the request
        request.send();
    });
};

function getItemCountInBag() {
    let res = 0;
    for (item of bag.items) {
        res += item.qty;
    }
    return res;
}

function manageBag() {
    let theBag = window.localStorage.getItem('bag');
    if (theBag != null) {
        bag = JSON.parse(theBag);
        let countInBag = getItemCountInBag();
        document.getElementById('bag').children[0].children[1].innerHTML = countInBag + '<br/>Panier';
    }
}

function alert(text) {
    myBagDetails.appendChild(createHTMLElement('div', { class: 'alert alert-danger', role: 'alert', innerHTML: text }));
}

function renderPrice(price) {
    if (typeof price == 'string') {
        while (price.includes(',')) {
            price = price.replace(',', '.');
        }
    }
    // If the price param is not a Number
    if (Number.isNaN(Number.parseFloat(price))) {
        return '';
    }
    const beautyPrice = Number.parseFloat(price).toFixed(2).replace('.', ',');
    let res = '';
    // We walk on the string from the queue to the head
    for(i = 0; i < beautyPrice.length; ++i) {
        res = beautyPrice[beautyPrice.length - i - 1] + res;
        // If we passed the 3 first caractere and the caractere position % 3 is equal to 0
        // That mean we are on a couple of 3 caractere and we add a space.
        if ( i > 2 && (i-2) % 3 == 0 ) {
            res = ' ' + res;
        }
    }
    return res + ' €';
}

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

function createItemInfo(item) {
    // verify the product have all his attributs, if not return
    if (!item.product || !item.productType || !item.qty || !item.personalisation) {
        return null;
    }
    let newProdDiv = createHTMLElement('div', { id: 'item-' + item.id, class: 'container' });

    let subDiv = createHTMLElement('div', { class: 'border border-dark rounded product row' });
    newProdDiv.appendChild(subDiv);

    let imgDiv = createHTMLElement('div', { class: 'col' });
    subDiv.appendChild(imgDiv);

    let img = createHTMLElement('img', { src: item.product.imageUrl });
    img.addEventListener('click', (event) => {
        document.location.href = './product.html?type=' + item.productType + '&product=' + item.product._id;
    });
    imgDiv.appendChild(img);

    let infoDiv = createHTMLElement('div', { class: 'col info-text' });
    subDiv.appendChild(infoDiv);

    let subInfoDiv = createHTMLElement('div', {});
    infoDiv.appendChild(subInfoDiv);

    let title = createHTMLElement('h4', { innerHTML: item.product.name + ' (' + item.personalisation + ')<br/>Price: ' + renderPrice(item.product.price) });
    subInfoDiv.appendChild(title);

    let qtyContainer = createHTMLElement('div', { class: 'qty-container' });
    subInfoDiv.appendChild(qtyContainer);

    let qtyh = createHTMLElement('h4', { innerHTML: 'Qty: ' });
    qtyContainer.appendChild(qtyh);

    let total = createHTMLElement('h4', { innerHTML: '<br/>Total: ' + renderPrice(getPriceMultQty(item.product.price, item.qty)) });
    subInfoDiv.appendChild(total);

    let qtyInput = createHTMLElement('input', { id: 'input-qty-' + item.id, class: 'qty-input', type: 'number', value: item.qty, min: 0 });
    qtyInput.addEventListener('change', (event) => {
        let numQty = Number.parseInt(event.target.value);
        if (numQty < 0) {
            numQty = 0;
        }

        for (anItem of bag.items) {
            if (anItem.id == item.id) {
                if (Number.isNaN(numQty) == false) {
                    anItem.qty = numQty;
                } else {
                    qtyInput.value = anItem.qty;
                }
            }
        }
        if (numQty > 0) {
            total.innerHTML = '<br/>Total: ' + renderPrice(getPriceMultQty(item.product.price, numQty));
        } else if (Number.isNaN(numQty) == false) {
            document.getElementById('delete-modal-button').click();
        }
        // Save it in the localstorage
        window.localStorage.setItem('bag', JSON.stringify(bag));
        // Update the bag in the header
        document.getElementById('bag').children[0].children[1].innerHTML = getItemCountInBag() + '<br/>Panier';
        document.getElementById('checkout').children[0].innerHTML = 'Total checkout: ' + renderPrice(getTotalPrice());
    });
    qtyContainer.appendChild(qtyInput);

    return newProdDiv;
}

function renderBag() {
    for (item of bag.items) {
        let itemDiv = createItemInfo(item);
        if (itemDiv != null) {
            myBagDetails.appendChild(itemDiv);
        }
    }
}

// When the page is loaded
function onInit() {
    manageBag();
    renderBag();
    let deleteValidated = document.getElementById('delete-validated');
    let deleteCancelled = document.getElementById('delete-cancelled');
    deleteValidated.addEventListener('click', (event) => {
        let theItem = null;
        for (item of bag.items) {
            if (item.qty == 0) {
                theItem = item;
            }
        }
        if (theItem != null) {
            bag.items = bag.items.filter(item => item.id != theItem.id);
            bag.ids = bag.ids.filter(id => id != theItem.id);
            document.getElementById('item-' + theItem.id).remove();
            window.localStorage.setItem('bag', JSON.stringify(bag));
            document.getElementById('checkout').children[0].innerHTML = 'Total checkout: ' + renderPrice(getTotalPrice());
        }
    });
    deleteCancelled.addEventListener('click', (event) => {
        for (item of bag.items) {
            if (item.qty == 0) {
                item.qty = 1;
                let input = document.getElementById('input-qty-' + item.id);
                if (input != null) {
                    input.value = 1;
                }
            }
        }
        window.localStorage.setItem('bag', JSON.stringify(bag));
        document.getElementById('checkout').children[0].innerHTML = 'Total checkout: ' + renderPrice(getTotalPrice());
    });

    let checkoutButton = document.getElementById('checkout').children[1];
    checkoutButton.addEventListener('click', (event) => {
        console.log('checkout !!' + event)
    });
    document.getElementById('checkout').children[0].innerHTML = 'Total checkout: ' + renderPrice(getTotalPrice());
}

onInit();