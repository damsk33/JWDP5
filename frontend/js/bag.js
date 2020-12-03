// createItemInfo(), onInit()
const myBagDetails = document.getElementById('bag-details');

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

// When the page is loaded
function onInit() {
    manageBag();
    
    //Render the bag
    for (item of bag.items) {
        let itemDiv = createItemInfo(item);
        if (itemDiv != null) {
            myBagDetails.appendChild(itemDiv);
        }
    }

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
        const checkoutFormular = document.getElementById('checkout-formular');
        if (checkoutFormular.getAttribute('class')) {
            checkoutFormular.setAttribute('class', '');
        } else {

            checkoutFormular.setAttribute('class', 'show');
        }
    });
    document.getElementById('checkout').children[0].innerHTML = 'Total checkout: ' + renderPrice(getTotalPrice());
}

onInit();
