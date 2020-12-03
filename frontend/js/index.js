// createProduct(), addProductToList(), loadData(), onInit()
const numberOfProductPerRow = 2; // 1, 2 or 3
const myProductList = document.getElementById('product-list');

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

function completeLastRowOfProducts() {
 // Get the last existing row ( - 1 because index start at 0)
 let lastRowDiv = myProductList.children[myProductList.children.length - 1];
 let emptyProductDiv;
 // Check a second time in case of null div from corrupted product
 while (lastRowDiv.children.length < numberOfProductPerRow) {
     // Create empty col for rendering
     emptyProductDiv = createHTMLElement('div', { class: 'col', style: 'min-width: 360px' });
     lastRowDiv.append(emptyProductDiv);
 }
}

// Call at 1st, load data from backend and populate frontend
function loadData() {
    myProductList.innerHTML = '';
    // Create a Promise in order to get all products
    makeHTTPRequest(backendUrl + productType).then(function onSuccess(resolved) {
        // Populate with products
        for (product of JSON.parse(resolved.responseText)) {
            addProductToList(product);
        }
        const waiterSpinner = document.getElementById('waiter');
        if (waiterSpinner != null) {
            waiterSpinner.remove();
        }
        completeLastRowOfProducts()
    }).catch(function onError(rejected) {
        const waiterSpinner = document.getElementById('waiter');
        if (waiterSpinner != null) {
            waiterSpinner.remove();
        }
        alert(myProductList, 'Oops, something went wrong. Please <strong>refresh</strong> the page!<br/>' + rejected.statusText);
    });
}

// When the page is loaded, get data from backend and set the bag
function onInit() {
    loadData();
    manageBag();
}

onInit();
