// Get product list and type
const backendUrl = 'http://localhost:3000/api/';
const myProductDetails = document.getElementById('product-details');
let bag = { items: [], ids: [] }; // [items: [{ productType: '', product: '', personalisation: '', qty: 0 }], ids: [string]}

function generateID(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let res = '';
    for (let i = 0; i < length; ++i) {
        res += chars[Math.floor(Math.random() * (chars.length - 1))]
    }
    return res;
}

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
    myProductDetails.appendChild(createHTMLElement('div', { class: 'alert alert-danger', role: 'alert', innerHTML: text }));
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
    return Number.parseFloat(price).toFixed(2).replace('.', ',') + ' €';
}

function addProductToBag(productType, product, personalisation) {
    let alreadyExist = false;
    for (item of bag.items) {
        if (item.product._id == product._id && item.personalisation == personalisation) {
            alreadyExist = true;
            item.qty++;
            break;
        }
    }
    if (alreadyExist == false) {
        let newId = generateID(10);
        while (bag.ids.includes(newId)) {
            newId = generateID(10);
        }
        bag.ids.push(newId);
        bag.items.push({ id: newId, productType: productType, product: product, personalisation: personalisation, qty: 1 })
    }
    window.localStorage.setItem('bag', JSON.stringify(bag))
    return getItemCountInBag();
}

// Add a list of string in a select as options with a default value 
function populateSelect(select, optionList, defaultOpt = null) {
    if (defaultOpt != null) {
        select.appendChild(createHTMLElement('option', { innerHTML: defaultOpt, value: 'undefined' }));
    }
    for (option of optionList) {
        select.appendChild(createHTMLElement('option', { innerHTML: option }));
    }
}

// Create product in a div and return the pointer to the new div
function createProduct(product, productType) {
    if (!product._id || !product.name || !product.price || !product.description || !product.imageUrl) {
        return null;
    }
    // if the product have not his personnalisation list
    if ((productType == 'cameras' && !product.lenses) || (productType == 'teddies' && !product.colors) || (productType == 'furniture' && !product.varnish)) {
        return null;
    }

    let newProdDiv = createHTMLElement('div', { id: 'product-' + product._id, class: 'container' })
    let subDiv = createHTMLElement('div', { class: 'border border-dark rounded product row' });
    newProdDiv.appendChild(subDiv);

    let imgDiv = createHTMLElement('div', { class: 'col' });
    subDiv.appendChild(imgDiv);

    let infoDiv = createHTMLElement('div', { class: 'col' });
    subDiv.appendChild(infoDiv);

    let img = createHTMLElement('img', { src: product.imageUrl });
    imgDiv.appendChild(img);

    let title = createHTMLElement('h3', { innerHTML: product.name + ' - ' + renderPrice(product.price) });
    infoDiv.appendChild(title);

    let desc = createHTMLElement('p', { innerHTML: product.description });
    infoDiv.appendChild(desc);

    // Add a row with two columns for the select on left and the 'add to bag' button on right
    let selectAndButtonRowDiv = createHTMLElement('div', { class: 'row' });
    infoDiv.appendChild(selectAndButtonRowDiv);

    let selectDiv = createHTMLElement('div', { class: 'col' });
    selectAndButtonRowDiv.appendChild(selectDiv);

    let buttonDiv = createHTMLElement('div', { class: 'col' });
    selectAndButtonRowDiv.appendChild(buttonDiv);

    let select = createHTMLElement('select', { id: 'product-personalisation', class: 'browser-default custom-select' });
    select.addEventListener('change', (event) => {
        document.getElementById('product-add-to-bag').disabled = (event.target.value == null || event.target.value == 'undefined');
    });
    selectDiv.appendChild(select);

    let button = createHTMLElement('button', { id: 'product-add-to-bag', class: 'btn btn-outline-dark', disabled: true, innerHTML: 'Add to bag' });
    button.addEventListener('click', (event) => {
        let countOfItem = addProductToBag(productType, product, select.value);
        document.getElementById('bag').children[0].children[1].innerHTML = countOfItem + '<br/>Panier';
    });
    buttonDiv.appendChild(button);

    switch (productType) {
        case 'cameras':
            populateSelect(select, product.lenses, 'Choose a lense');
            break;
        case 'teddies':
            populateSelect(select, product.colors, 'Choose a color');
            break;
        case 'furniture':
            populateSelect(select, product.varnish, 'Choose a varnish');
            break;
    }

    return newProdDiv;
}

// Call at 1st, load data from backend and populate frontend
function loadData(productId, productType) {
    myProductDetails.innerHTML = '';
    // Create a Promise in order to get all products
    makeRequest(backendUrl + productType + '/' + productId).then(function onSuccess(resolved) {
        const waiterSpinner = document.getElementById('waiter');
        if (waiterSpinner != null) {
            waiterSpinner.remove();
        }
        // Populate data from the product
        let newProdDiv = createProduct(JSON.parse(resolved.response), productType);
        // If no div, then leave
        if (newProdDiv == null) {
            alert('Oops, something went wrong..');
            return;
        }
        myProductDetails.appendChild(newProdDiv);
    }).catch(function onError(rejected) {
        const waiterSpinner = document.getElementById('waiter');
        if (waiterSpinner != null) {
            waiterSpinner.remove();
        }
        alert('Oops, something went wrong. Please <strong>refresh</strong> the page!<br/>' + rejected.statusText)
    });
}

// When the page is loaded, get data from backend and set the bag
function onInit() {
    // Retrieve the prodcut id gived in GET
    const productId = new URL(document.location.href).searchParams.get('product');
    const productType = new URL(document.location.href).searchParams.get('type');
    // If no product id then go back to product list
    if (productId == null || productType == null) {
        document.location.href = './index.html';
    }
    loadData(productId, productType);
    manageBag();
}

onInit();
