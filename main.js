// Link to elements in the form
var list = document.getElementById("assetTypes");
let select = document.getElementById('currency');
let exchange = document.getElementById('exchange');
let calc = document.getElementById("calculate");

// Add each type of asset to the html list
for (const type of assetType) {
    let node = document.createElement("option");
    node.value = type.name;
    const textnode = document.createTextNode(type.name);
    node.appendChild(textnode);
    list.appendChild(node);
}

// Show currency exchange if Dollars is selected
select.addEventListener('change', () => {
    if (select.value == "US Dollars - $") {
        exchange.style.display = "block";
    }
    else {
        exchange.style.display = "none";
    }
});

// Calculate action
calc.addEventListener('click', () => {

    // Delete a any content created inside the spreadsheet  
    document.getElementById('spreadsheet').innerHTML = '';

    // Declare variables for calculus based on data
    let dc = 1 - assetType[0].dc,
        di = 1 - assetType[0].di,
        dm = 1 - assetType[0].dm,
        m = assetType[0].months,
        f = Math.log((di - dm) / (dc - dm)) / m;
    
    // Take form values
    let v = document.getElementById('value').value,
        p = document.getElementById('months').value;

    let data = [];

    // Generate data and push it into the data variable
    for (let i = 0; i <= p; i++) {
        let pval = (di - dm) * Math.exp(-i * f) + dm;
        let val = pval * v;
        data.push([i, pval, val]);
    }

    // Generate the table
    jspreadsheet(document.getElementById('spreadsheet'), {
        data: data,
        columns: [
            { type: 'text', title: 'Mes', width: 60 },
            { type: 'numeric', title: 'Depreciación', width: 120, mask: '0%' },
            { type: 'numeric', title: 'Valor', width: 150, mask: 'Q #,##0.00' },
        ]
    });

    /* ------------------------------ Create chart ------------------------------ */
    const myChart = new Chart(
        document.getElementById('myChart'),
        config
    );
});



/* ----------------------------- Chart settings ----------------------------- */

const labels = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
];

const data = {
    labels: labels,
    datasets: [{
        label: 'My First dataset',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: [0, 10, 5, 2, 20, 30, 45],
    }]
};

const config = {
    type: 'line',
    data: data,
    options: {}
};