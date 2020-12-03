// createBill(), onInit()
const myConfirmationDetails = document.getElementById('confirmation-details');

function createBill(resume) {
    let billContainer = createHTMLElement('div', { id: 'bill', class: 'container border border-dark rounded' });

    let orderId = createHTMLElement('h2', { innerHTML: 'Order: ' + resume.orderId });
    billContainer.appendChild(orderId);
    billContainer.appendChild(createHTMLElement('br', {}));

    let title = createHTMLElement('h3', { innerHTML: 'Mr./Mrs ' + resume.contact.firstName + ' ' + resume.contact.lastName });
    billContainer.appendChild(title);

    let email = createHTMLElement('h4', { innerHTML: 'Email: ' + resume.contact.email });
    billContainer.appendChild(email);

    let address = createHTMLElement('h5', { innerHTML: 'Address: ' + resume.contact.address + '<br/>' + resume.contact.city });
    billContainer.appendChild(address);

    let detailsTable = createHTMLElement('table', { class: 'table' });
    billContainer.appendChild(detailsTable);

    let tableHeader = createHTMLElement('thead', { innerHTML: '<tr><th scope="col">Description</th><th scope="col">Unit price</th><th scope="col">Qty</th><th scope="col">Amount</th></tr>' });
    detailsTable.appendChild(tableHeader);

    let tableBody = createHTMLElement('tbody', {});
    detailsTable.appendChild(tableBody);

    for (item of bag.items) {
        tableBody.appendChild(createHTMLElement('tr', { innerHTML: '<th>' + item.product.name + ' (' + item.personalisation + ')</th><th>' + renderPrice(item.product.price) + '</th><th>' + item.qty + '</th><th>' + renderPrice(getPriceMultQty(item.product.price, item.qty)) + '</th>' }));
    }

    let total = createHTMLElement('h3', { innerHTML: '<strong>Total:</strong> ' + renderPrice(getTotalPrice()) });
    billContainer.appendChild(total);

    return billContainer
}

// When the page is loaded
function onInit() {
    manageBag();
    /// Retrieve the prodcut id gived in GET
    const url = new URL(document.location.href);
    let contact = {
        firstName: url.searchParams.get('firstname'),
        lastName: url.searchParams.get('lastname'),
        address: url.searchParams.get('address'),
        city: url.searchParams.get('city'),
        email: url.searchParams.get('email'),
    };
    if (!contact || !contact.firstName || !contact.lastName || !contact.address || !contact.city || !contact.email) {
        document.location.href = './index.html';
    }
    let products = [];
    for (item of bag.items) {
        if(products.includes(item.product._id) == false) {
            products.push(item.product._id);
        }
    }
    makeHTTPRequest(backendUrl + productType + '/order', 'POST', JSON.stringify({ contact: contact, products: products })).then(function onSuccess(resolved) {
        alert(myConfirmationDetails, 'Order passed successfully!', 'success');

        let bill = createBill(JSON.parse(resolved.responseText));
        myConfirmationDetails.appendChild(bill);

        bag = { items: [], ids: [] };
        window.localStorage.setItem('bag', JSON.stringify(bag));
        manageBag();
    }).catch(function onError(rejected) {
        alert(myConfirmationDetails, 'Oops, something went wrong..');
    });
}

onInit();
