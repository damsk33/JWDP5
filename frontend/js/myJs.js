// Get product list and type
const backendUrl = 'http://localhost:3000/api/';
const productType = 'cameras';
const myProductList = document.getElementById('product-list');

function renderPrice(price) {
    return price + ',00 €';
}

// Create product in a div and return the pointer to the new div
function createProduct(product) {
    let newProdDiv = document.createElement('div');
    let subDiv = document.createElement('div');
    newProdDiv.setAttribute('id', 'product-' + product._id);
    newProdDiv.setAttribute('data-id', product._id);
    newProdDiv.setAttribute('class', 'col');
    newProdDiv.appendChild(subDiv);
    subDiv.addEventListener("click", (event) => {
        document.location.href="product.html"
        console.log("Somebody clicked on meeeee!!!")
        console.log(event.path[2].getAttribute('data-id'))
    });

    let img = document.createElement('img');
    let title = document.createElement('h3');
    let desc = document.createElement('p');

    subDiv.setAttribute('class', 'container border border-dark rounded product');
    img.setAttribute('src', product.imageUrl);
    title.innerHTML = product.name + ' - ' + renderPrice(product.price.toString());
    desc.innerHTML = product.description;

    subDiv.appendChild(img);
    subDiv.appendChild(title);
    subDiv.appendChild(desc);

    return newProdDiv;
}

// Add a product with all details in product list (list of rows containing two products)
function addProductToList(product) {
    let newProdDiv = createProduct(product);

    // If no row then we create the first row and add the product
    if(myProductList.children.length == 0) {
        let newRowDiv = document.createElement('div');
        newRowDiv.setAttribute('class', 'row');
        newRowDiv.appendChild(newProdDiv);
        myProductList.appendChild(newRowDiv);
    // If there is existing rows
    } else {
        // Get the last existing row
        let rowDiv = myProductList.children[myProductList.children.length - 1];
        // If the row have already two product inside, then we have to create a new row
        if(rowDiv.children.length > 1) {
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
    $.ajax({
        url: (backendUrl + productType),
        success: function(data) {
            // On data receiving
            console.log(data);
            // Populate with products
            for(product of data) {
                addProductToList(product)
            }
            // A row contains two products, if product list is odd, we have to create a empty product div
            if(data.length % 2 == 1) {
                // Get the last existing row
                let rowDiv = myProductList.children[myProductList.children.length - 1];
                // Create empty col for rendering
                let emptyProductDiv = document.createElement('div');
                emptyProductDiv.setAttribute('class', 'col');
                rowDiv.append(emptyProductDiv);
            }
            
        }
    });
}
