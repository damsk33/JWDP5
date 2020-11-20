// Get product list and type
const backendUrl = 'http://localhost:3000/api/';
const myBagDetails = document.getElementById('bag-details');
let bag = []; // { productType: '', product: '', personalisation: '', qty: 0 }

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
    for(item of bag) {
        res+= item.qty;
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
    let alert = document.createElement('div')
    alert.setAttribute('class', 'alert alert-danger')
    alert.setAttribute('role', 'alert')
    alert.innerHTML = text
    myBagDetails.appendChild(alert)
}

function renderPrice(price) {
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

function getPriceMultQty(price, qty) {
    if (typeof price == 'string') {
        while(price.includes(',')) {
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

function createItemInfo(item) {
    // verify the product have all his attributs, if not return
    if (!item.product|| !item.productType || !item.qty || !item.personalisation) {
        return null;
    }
    let newProdDiv = document.createElement('div');
    newProdDiv.setAttribute('id', 'product-' + item.product._id);
    newProdDiv.setAttribute('data-id', item.product._id);
    newProdDiv.setAttribute('class', 'col product-container');
    
    let subDiv = document.createElement('div');
    subDiv.setAttribute('class', 'border border-dark rounded product');
    subDiv.addEventListener("click", (event) => {
        document.location.href = './product.html?type=' + item.productType + '&product=' + event.path[2].getAttribute('data-id') ;
    });
    newProdDiv.appendChild(subDiv);

    let img = document.createElement('img');
    let title = document.createElement('h3');
    let desc = document.createElement('p');

    img.setAttribute('src', item.product.imageUrl);
    img.setAttribute('alt', item.product.name);
    title.innerHTML = item.product.name + ' - ' + renderPrice(item.product.price) + ' / ' + item.qty + 'p<br/>' + renderPrice(getPriceMultQty(item.product.price, item.qty));
    desc.innerHTML = item.personalisation;

    subDiv.appendChild(img);
    subDiv.appendChild(title);
    subDiv.appendChild(desc);

    return newProdDiv;
}

function renderBag() {
    for(item of bag) {
        let itemDiv = createItemInfo(item);
        if (itemDiv != null) {
            myBagDetails.appendChild(itemDiv);
        }
    }
}