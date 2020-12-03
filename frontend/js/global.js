// makeHTTPRequest(), alert(), createHTMLElement(), generateID(), renderPrice(), manageBag(), getItemCountInBag()
const backendUrl = 'http://localhost:3000/api/';
let productType = 'cameras'; // 'cameras', 'teddies', 'furniture'
let bag = { items: [], ids: [] }; // [items: [{ productType: '', product: '', personalisation: '', qty: 0 }], ids: [string]}

// method in ['GET', 'POST', 'PUT', 'DELETE' ]
function makeHTTPRequest(url, method = 'GET', data = null) {
    // Create the XHR request
    let request = new XMLHttpRequest();
    // Return it as a Promise
    return new Promise(function (resolve, reject) {
        // Setup our listener to process compeleted requests
        request.onload = function onload() {
            if (request.status >= 200 && request.status < 300) {
                resolve(request);
            } else {
                reject({
                    status: request.status,
                    statusText: request.statusText
                });
            }
        };
        request.onerror = function onerror() {
            reject({
                status: request.status,
                statusText: request.statusText
            })
        };
        // Setup our HTTP request
        request.open(method, url, true);
        request.setRequestHeader('Content-type','application/json');
        // Send the request
        request.send(data);
    });
}

// danger, success, warning, light, dark, primary, secondary
function alert(target, text, type = 'danger') {
    target.prepend(createHTMLElement('div', { class: 'alert alert-' + type, role: 'alert', innerHTML: text }));
}

// tagName ex => div, p, img, h1, h3, header, etc
// caracteristics ex => {id: 'myId', class : 'maClasse', value: 'coucou', 'src': 'url...'}
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

function generateID(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let res = '';
    for (let i = 0; i < length; ++i) {
        res += chars[Math.floor(Math.random() * (chars.length - 1))]
    }
    return res;
}

// Render a given price
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
    for (i = 0; i < beautyPrice.length; ++i) {
        res = beautyPrice[beautyPrice.length - i - 1] + res;
        // If we passed the 3 first caractere and the caractere position % 3 is equal to 0
        // That mean we are on a couple of 3 caractere and we add a space.
        if (i > 2 && (i - 2) % 3 == 0) {
            res = ' ' + res;
        }
    }
    return res + ' €';
}

function manageBag() {
    let theBag = window.localStorage.getItem('bag');
    if (theBag != null) {
        bag = JSON.parse(theBag);
        document.getElementById('bag-text').innerHTML = getItemCountInBag() + '<br/>Panier';
    }
}

function getItemCountInBag() {
    let res = 0;
    for (item of bag.items) {
        res += item.qty;
    }
    return res;
}
