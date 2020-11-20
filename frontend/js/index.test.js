
function renderPriceTest() {
    console.log('Test renderPrice start.')
    const inputs = [1, '5', '9.5', '5,22', 8.777, 'exp1', '1exp', true, false, {}, [], null, undefined];
    const outputs = ['1,00 €', '5,00 €', '9,50 €', '5,22 €', '8,78 €', '', '1,00 €', '', '', '', '', '', ''];
    let successCount = 0;
    for(let i = 0; i < inputs.length; ++i) {
        let res = renderPrice(inputs[i]);
        if(outputs[i] != res) {
            console.error('Error: renderPrice\nInput:' + inputs[i] +'\nExpected output:' + outputs[i] + '\nReiceived output:' + res)
        } else {
            ++successCount;
        }
    }
    if(successCount == inputs.length) {
        console.log('Test renderPrice completed successfully.');
    } else {
        console.log('Test renderPrice finished, ' + successCount + '/' + inputs.length + ' tasks validated.');
    }
}
renderPriceTest();

function createProductTest() {
    console.log('Test createProduct start.')
    const inputs = [
        {}, // missing everything
        {name: 'aName', price: '124566', description: 'Lorem ipsum', imageUrl: 'aFakeUrl'}, // missing _id
        {_id: 'something', price: '124566', description: 'Lorem ipsum', imageUrl: 'aFakeUrl'}, // missing name
        {_id: 'something', name: 'aName', description: 'Lorem ipsum', imageUrl: 'aFakeUrl'}, // missing price
        {_id: 'something', name: 'aName', price: '124566', imageUrl: 'aFakeUrl'}, // missing description
        {_id: 'something', name: 'aName', price: '124566', description: 'Lorem ipsum'}, // missing imageUrl
        {_id: 'something', name: 'aName', price: '124566', description: 'Lorem ipsum', imageUrl: 'aFakeUrl'} // no missing attributs
    ];
    const outputsIsNull = [true, true, true, true, true, true, false];
    let successCount = 0;
    for(let i = 0; i < inputs.length; ++i) {
        let res = createProduct(inputs[i]);
        if((res == null) != outputsIsNull[i]) {
            console.error('Error: createProduct\nInput:' + inputs[i] +'\nExpected output:' + outputsIsNull[i] + '\nReiceived output:' + (res == null))
        } else {
            ++successCount;
        }
    }
    if(successCount == inputs.length) {
        console.log('Test createProduct completed successfully.');
    } else {
        console.log('Test createProduct finished, ' + successCount + '/' + inputs.length + ' tasks validated.');
    }
}
createProductTest();

