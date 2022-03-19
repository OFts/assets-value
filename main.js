// Link to elements in the form
var list = document.getElementById("assetTypes");
let select = document.getElementById('currency');
let exchange = document.getElementById('exchange');
let calc = document.getElementById("calculate");
let myChart = [];
let gxdata = [];
let gydata = [];

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
    gdata = [];
    
    // Declare variables for calculus based on data
    let dc = 1 - assetType[0].dc,
        di = 1 - assetType[0].di,
        dm = 1 - assetType[0].dm,
        m = assetType[0].months,
        f = Math.log((di - dm) / (dc - dm)) / m;
    
    // Take form values
    let v = document.getElementById('value').value,
        p = document.getElementById('months').value;


    // data variable for table
    let data = [];

    // data variable for graph
    gxdata = [];
    gydata = [];

    // Generate data and push it into the data variable
    for (let i = 0; i <= p; i++) {
        let pval = (di - dm) * Math.exp(-i * f) + dm;
        let val = pval * v;
        data.push([i, pval, val]);
        gxdata.push(i);
        gydata.push(val.toFixed(2));
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
    var graphArea = document.getElementById("chart").getContext("2d");
    if ('canvas' in myChart){
        myChart.data.labels = gxdata;
        myChart.data.datasets[0].data = gydata;
        myChart.update();
    } else {
        myChart = new Chart(graphArea, {
            type: 'line',
            data: {
                labels: gxdata,
                datasets: [{
                    label: 'Método exponencial',
                    data: gydata,
                    borderColor: '#1f3d64',
                    backgroundColor: '#448454',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Valor de activo en el tiempo'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Mes'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Valor en Quetzales'
                        }
                    }
                }
            }
        });
    }
    console.log(myChart);
});
