// Get product list and type
const backendUrl = 'http://localhost:3000/api/';
const myProductDetails = document.getElementById('product-details');
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
    myProductDetails.appendChild(alert)
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

function addProductToBag(productType, product, personalisation) {
    let alreadyExist = false;
    for(item of bag) {
        if (item.product._id == product._id && item.personalisation == personalisation) {
            alreadyExist = true;
            item.qty++;
            break;
        }
    }
    if (alreadyExist == false) {
        bag.push({ productType: productType, product: product, personalisation: personalisation, qty: 1 })
    }
    window.localStorage.setItem('bag', JSON.stringify(bag))
    return getItemCountInBag();
}

// Add a list of string in a select as options with a default value 
function populateSelect(select, optionList, defaultOpt = null) {
    if (defaultOpt != null) {
        let opt = document.createElement('option');
        opt.innerHTML = defaultOpt
        opt.value = 'undefined'
        select.appendChild(opt) 
    }
    for(option of optionList) {
        let opt = document.createElement('option');
        opt.innerHTML = option
        select.appendChild(opt)
    }
}

// Create product in a div and return the pointer to the new div
function createProduct(product, productType) {
    if (!product._id || !product.name || !product.price || !product.description || !product.imageUrl) {
        return null;
    }
    // if the product have not his personnalisation list
    if ( (productType == 'cameras' && !product.lenses) || (productType == 'teddies' && !product.colors) || (productType == 'furniture' && !product.varnish) ) {
        return null;
    }

    let newProdDiv = document.createElement('div');
    let subDiv = document.createElement('div');
    newProdDiv.setAttribute('id', 'product-' + product._id);
    newProdDiv.setAttribute('data-id', product._id);
    newProdDiv.setAttribute('class', 'col');
    newProdDiv.appendChild(subDiv);

    let img = document.createElement('img');
    let title = document.createElement('h3');
    let desc = document.createElement('p');
    let select = document.createElement('select');
    select.setAttribute('id', 'product-personalisation');
    select.setAttribute('class', 'browser-default custom-select');
    select.addEventListener("change", (event) => {
        document.getElementById('product-add-to-bag').disabled = (event.target.value == null || event.target.value == 'undefined');
    });
    let button = document.createElement('button');
    button.setAttribute('id', 'product-add-to-bag');
    button.setAttribute('class', 'btn btn-outline-dark');
    button.disabled = true;
    button.innerHTML = 'Add to bag';
    button.addEventListener("click", (event) => {
        let countOfItem = addProductToBag(productType, product, select.value);
        document.getElementById('bag').children[0].children[1].innerHTML = countOfItem + '<br/>Panier';
    });

    // Add a row with two columns for the select on left and the "add to bag" button on right
    let selectAndButtonRowDiv = document.createElement('div');
    selectAndButtonRowDiv.setAttribute('class', 'row');

    let selectDiv = document.createElement('div');
    selectDiv.setAttribute('class', 'col container');
    selectDiv.appendChild(select);
    selectAndButtonRowDiv.appendChild(selectDiv);

    let buttonDiv = document.createElement('div');
    buttonDiv.setAttribute('class', 'col container');
    buttonDiv.appendChild(button);
    selectAndButtonRowDiv.appendChild(buttonDiv);

    subDiv.setAttribute('class', 'border border-dark rounded product');
    img.setAttribute('src', product.imageUrl);
    title.innerHTML = product.name + ' - ' + renderPrice(product.price);
    desc.innerHTML = product.description;
    switch(productType) {
        case 'cameras':
            populateSelect(select, product.lenses, 'Choose a lense');
            break;
        case 'teddies':
            populateSelect(select, product.colors, 'Choose a color');
            break;
        case 'furniture':
            populateSelect(select,  product.varnish, 'Choose a varnish');
            break;
    }

    subDiv.appendChild(img);
    subDiv.appendChild(title);
    subDiv.appendChild(desc);
    subDiv.appendChild(selectAndButtonRowDiv);

    return newProdDiv;
}

// Call at 1st, load data from backend and populate frontend
function loadData(productId, productType) {
    myProductDetails.innerHTML = '';
    // Create a Promise in order to get all products
    makeRequest(backendUrl + productType + '/' + productId).then(function onSuccess(resolved) {
        // Populate data from the product
        let newProdDiv = createProduct(JSON.parse(resolved.response), productType);
        // If no div, then leave
        if (newProdDiv == null) {
            alert('Oops, something went wrong..');
            return;
        }
        myProductDetails.appendChild(newProdDiv);
    }).catch(function onError(rejected) {
        alert('Oops, something went wrong. Please <strong>refresh</strong> the page!<br/>' + rejected.statusText)
    });
}
