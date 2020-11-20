// Get product list and type
const backendUrl = 'http://localhost:3000/api/';
let productType = 'cameras'; // 'cameras', 'teddies', 'furniture'
const numberOfProductPerRow = 2; // 1, 2 or 3
const myProductList = document.getElementById('product-list');
let bag = []; // { productType: '', product: '', personalisation: '', qty: 0 }

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
    let alert = document.createElement('div')
    alert.setAttribute('class', 'alert alert-danger')
    alert.setAttribute('role', 'alert')
    alert.innerHTML = text
    myProductList.appendChild(alert)
}

// Render a given price
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

// Create product in a div and return the pointer to the new div
function createProduct(product) {
    // verify the product have all his attributs, if not return
    if (!product._id || !product.name || !product.price || !product.description || !product.imageUrl) {
        return null;
    }

    let newProdDiv = document.createElement('div');
    newProdDiv.setAttribute('id', 'product-' + product._id);
    newProdDiv.setAttribute('data-id', product._id);
    newProdDiv.setAttribute('class', 'col product-container');
    
    let subDiv = document.createElement('div');
    subDiv.setAttribute('class', 'border border-dark rounded product');
    subDiv.addEventListener("click", (event) => {
        document.location.href = './product.html?type=' + productType + '&product=' + event.path[2].getAttribute('data-id') ;
    });
    newProdDiv.appendChild(subDiv);

    let img = document.createElement('img');
    let title = document.createElement('h3');
    let desc = document.createElement('p');

    img.setAttribute('src', product.imageUrl);
    img.setAttribute('alt', product.name);
    title.innerHTML = product.name + ' - ' + renderPrice(product.price);
    desc.innerHTML = product.description;

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
    if(myProductList.children.length == 0) {
        let newRowDiv = document.createElement('div');
        newRowDiv.setAttribute('class', 'row');
        newRowDiv.appendChild(newProdDiv);
        myProductList.appendChild(newRowDiv);
    // If there is existing rows
    } else {
        // Get the last existing row ( - 1 because index start at 0)
        let rowDiv = myProductList.children[myProductList.children.length - 1];
        // If the row have already two product inside, then we have to create a new row
        if(rowDiv.children.length >= numberOfProductPerRow) {
            let newRowDiv = document.createElement('div');
            newRowDiv.setAttribute('class', 'row');
            newRowDiv.appendChild(newProdDiv);
            myProductList.appendChild(newRowDiv);
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
        for(product of JSON.parse(resolved.response)) {
            addProductToList(product);
        } 
        // Get the last existing row ( - 1 because index start at 0)
        let rowDiv = myProductList.children[myProductList.children.length - 1];
        let emptyProductDiv;
        // Check a second time in case of null div from corrupted product
        while(rowDiv.children.length < numberOfProductPerRow) {
            // Create empty col for rendering
            emptyProductDiv = document.createElement('div');
            emptyProductDiv.setAttribute('class', 'col');
            emptyProductDiv.style.minWidth = '280px';
            rowDiv.append(emptyProductDiv);
        }
    }).catch(function onError(rejected) {
        alert('Oops, something went wrong. Please <strong>refresh</strong> the page!<br/>' + rejected.statusText)
    });
}
