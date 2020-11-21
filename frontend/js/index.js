// Get product list and type
const backendUrl = 'http://localhost:3000/api/';
let productType = 'cameras'; // 'cameras', 'teddies', 'furniture'
const numberOfProductPerRow = 2; // 1, 2 or 3
const myProductList = document.getElementById('product-list');
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

function alert(text) {
    myProductList.appendChild(createHTMLElement('div', { class: 'alert alert-danger', role: 'alert', innerHTML: text }));
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
    return Number.parseFloat(price).toFixed(2).replace('.', ',') + ' €';
}

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

// Create product in a div and return the pointer to the new div
function createProduct(product) {
    // verify the product have all his attributs, if not return
    if (!product._id || !product.name || !product.price || !product.description || !product.imageUrl) {
        return null;
    }

    let newProdDiv = createHTMLElement('div', { id: 'product-' + product._id, class: 'col product-container' });

    let subDiv = createHTMLElement('div', { class: 'border border-dark rounded product' });
    subDiv.addEventListener('click', (event) => {
        document.location.href = './product.html?type=' + productType + '&product=' + product._id;
    });
    newProdDiv.appendChild(subDiv);

    let img = createHTMLElement('img', { src: product.imageUrl, alt: product.name });
    let title = createHTMLElement('h3', { innerHTML: product.name + ' - ' + renderPrice(product.price) });
    let desc = createHTMLElement('p', { innerHTML: product.description });
    subDiv.appendChild(img);
    subDiv.appendChild(title);
    subDiv.appendChild(desc);

    return newProdDiv;
}

// Add a product with all details in product list (list of rows containing two products)
function addProductToList(product) {
    let newProdDiv = createProduct(product);
    // If no div, then leave
    if (newProdDiv == null) {
        return;
    }

    // If no row then we create the first row and add the product
    if (myProductList.children.length == 0) {
        let newRowDiv = createHTMLElement('div', { class: 'row' });
        myProductList.appendChild(newRowDiv);
        newRowDiv.appendChild(newProdDiv);
        // If there is existing rows
    } else {
        // Get the last existing row ( - 1 because index start at 0)
        let rowDiv = myProductList.children[myProductList.children.length - 1];
        // If the row have already two product inside, then we have to create a new row
        if (rowDiv.children.length >= numberOfProductPerRow) {
            let newRowDiv = createHTMLElement('div', { class: 'row' });
            myProductList.appendChild(newRowDiv);
            newRowDiv.appendChild(newProdDiv);
            // Otherwise we just add the new product inside
        } else {
            rowDiv.appendChild(newProdDiv);
        }
    }
}

// Call at 1st, load data from backend and populate frontend
function loadData() {
    myProductList.innerHTML = '';
    // Create a Promise in order to get all products
    makeRequest(backendUrl + productType).then(function onSuccess(resolved) {
        // Populate with products
        for (product of JSON.parse(resolved.response)) {
            addProductToList(product);
        }
        const waiterSpinner = document.getElementById('waiter');
        if (waiterSpinner != null) {
            waiterSpinner.remove();
        }
        // Get the last existing row ( - 1 because index start at 0)
        let rowDiv = myProductList.children[myProductList.children.length - 1];
        let emptyProductDiv;
        // Check a second time in case of null div from corrupted product
        while (rowDiv.children.length < numberOfProductPerRow) {
            // Create empty col for rendering
            emptyProductDiv = createHTMLElement('div', { class: 'col', style: 'min-width: 360px' });
            rowDiv.append(emptyProductDiv);
        }
    }).catch(function onError(rejected) {
        const waiterSpinner = document.getElementById('waiter');
        if (waiterSpinner != null) {
            waiterSpinner.remove();
        }
        alert('Oops, something went wrong. Please <strong>refresh</strong> the page!<br/>' + rejected.statusText);
    });
}

// When the page is loaded, get data from backend and set the bag
function onInit() {
    loadData();
    manageBag();
}

onInit();
