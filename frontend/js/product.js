// addProductToBag(), populateSelect(), createProduct(), loadData(), onInit()
const myProductDetails = document.getElementById('product-details');

function addProductToBag(productType, product, personalisation) {
    let alreadyExist = false;
    // For each items { productType, product, personalisation } of the bag
    for (item of bag.items) {
        // If the item have the same product id and the same personnalisation
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
    makeHTTPRequest(backendUrl + productType + '/' + productId).then(function onSuccess(resolved) {
        const waiterSpinner = document.getElementById('waiter');
        if (waiterSpinner != null) {
            waiterSpinner.remove();
        }
        // Populate data from the product
        let newProdDiv = createProduct(JSON.parse(resolved.responseText), productType);
        // If no div, then leave
        if (newProdDiv == null) {
            alert(myProductDetails, 'Oops, something went wrong..');
            return;
        }
        myProductDetails.appendChild(newProdDiv);
    }).catch(function onError(rejected) {
        const waiterSpinner = document.getElementById('waiter');
        if (waiterSpinner != null) {
            waiterSpinner.remove();
        }
        alert(myProductDetails, 'Oops, something went wrong. Please <strong>refresh</strong> the page!<br/>' + rejected.statusText)
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
