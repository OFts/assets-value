// Link to elements in the form
var list = document.getElementById("assetTypes");
let select = document.getElementById('currency');
let exchange = document.getElementById('exchange');
let con = document.getElementById("condition");
let calc = document.getElementById("calculate");
let cContainer = document.getElementById("chartContainer");
let sContainer = document.getElementById("spreadsheetContainer");
let uContainer = document.getElementById("usedCondition");
let vr = document.getElementById("valReference");
let exVal = document.getElementById("exValue");
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
    if (select.value == "d") {
        exchange.style.display = "block";
    }
    else {
        exchange.style.display = "none";
    }
});

// Display used functionality
con.addEventListener('change', () => {
    if (con.value == "used") {
        uContainer.style.display = "flex";
        if (document.getElementById("criteria").value == "monthsUsed"){
            document.getElementById("refLabel").innerHTML = "Antigüedad en meses";
            vr.placeholder = "Cantidad de meses";
        } else {
            document.getElementById("refLabel").innerHTML = "Valor en estado nuevo";
            vr.placeholder = "Valor en quetzales";
        }
    }
    else {
        uContainer.style.display = "none";
    }
});

document.getElementById("criteria").addEventListener('change', ()=>{
    if (document.getElementById("criteria").value == "monthsUsed"){
        document.getElementById("refLabel").innerHTML = "Antigüedad en meses";
        vr.placeholder = "Cantidad de meses";
    } else {
        document.getElementById("refLabel").innerHTML = "Valor en estado nuevo";
        vr.placeholder = "Valor en quetzales";
    }
});

// Show asset type info

var ast = document.getElementsByClassName("info-a");

for (const type of assetType) {
    if (list.value == type.name){
        ast[0].innerHTML = type.inf;
        ast[1].innerHTML = type.di * 100;
        ast[2].innerHTML = type.dm * 100;
        ast[3].innerHTML = type.vue;
    }
}

list.addEventListener('change', ()=>{
    for (const type of assetType) {
        if (list.value == type.name){
            ast[0].innerHTML = type.inf;
            ast[1].innerHTML = type.di * 100;
            ast[2].innerHTML = type.dm * 100;
            ast[3].innerHTML = type.vue;
        }
    }
});

// Calculate action
calc.addEventListener('click', () => {

    // Display graph and table containers
    cContainer.style.display = "block";
    sContainer.style.display = "block";

    // Scroll to graph
    setTimeout(()=>{
        cContainer.scrollIntoView({ behavior: 'smooth', block: 'start'});
    }, 100);

    // Delete a any content created inside the spreadsheet  
    document.getElementById('spreadsheet').innerHTML = '';
    
    // Declare variables for calculus based on data
    let dc, di, dm, m, f, vu;
    
    // Select parameters in Data.js
    for (const type of assetType) {
        if (list.value == type.name){
            console.log(type.name);
            dc = 1 - type.dc;
            di = 1 - type.di;
            dm = 1 - type.dm;
            m = type.months;
            vu = type.vue * 12;
            f = Math.log((di - dm) / (dc - dm)) / m;
        }
    }

    // Take form values
    let v = document.getElementById('value').value,
        p = document.getElementById('months').value,
        ctr = document.getElementById("criteria");

    // data variable for table
    let data = [];

    // data variable for graph
    gxdata = [];
    gydata[0] = [];
    gydata[1] = [];

    // Check currency
    if (select.value == "d"){
        v = v * exVal.value;
    }

    // Método exponencial
    if (con.value == "used"){
        if (ctr.value == "monthsUsed"){

            // Months used method
            let mu = vr.value;
            let dn = (di - dm) * Math.exp(-mu * f) + dm;
            let vn = v/dn;
            for (let i = 0; i <= p; i++) {
                let pval = (di - dm) * Math.exp((-i - mu) * f) + dm;
                let val = pval * vn;
                data.push([i, pval, val]);
                gxdata.push(i);
                gydata[0].push(val.toFixed(2));
            }
        } else {
            // Original value method
            let vn = vr.value;
            let dn = v/vn;
            let mu = -Math.log((dn - dm)/(di - dm)) / f;
            console.log(mu);
            for (let i = 0; i <= p; i++) {
                let pval = (di - dm) * Math.exp((-i - mu) * f) + dm;
                let val = pval * vn;
                data.push([i, pval, val]);
                gxdata.push(i);
                gydata[0].push(val.toFixed(2));
            }
        }
    } else {
        // Generate data and push it into the data variable - New
        for (let i = 0; i <= p; i++) {
            let pval = (di - dm) * Math.exp(-i * f) + dm;
            let val = pval * v;
            data.push([i, pval, val]);
            gxdata.push(i);
            gydata[0].push(val.toFixed(2));
        }
    }

    // Método de suma de dígitos
    let sum = vu * (vu + 1) / 2;
    console.log(sum)
    let sumContador = 0;
    for (let i = 0; i <= p; i++) {
        sumContador += vu - i;
        let pval = 1 - ((1 - dm) * sumContador / sum);
        console.log(pval + ' ' + dm);
        let val;
        if (i > vu){
            val = dm * v;
        } else {
            val = pval * v;
        }
        gydata[1].push(val.toFixed(2));
    }
    
    /* ------------------------------ Create table ------------------------------ */
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
        myChart.data.datasets[0].data = gydata[0];
        myChart.data.datasets[1].data = gydata[1];
        myChart.update();
    } else {
        myChart = new Chart(graphArea, {
            type: 'line',
            data: {
                labels: gxdata,
                datasets: [{
                    label: 'Método exponencial',
                    data: gydata[0],
                    borderColor: '#1f3d64',
                    backgroundColor: '#1f3d64',
                    tension: 0.1
                },
                {
                    label: 'Método suma digitos',
                    data: gydata[1],
                    borderColor: '#bbc446',
                    backgroundColor: '#bbc446',
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
});

/* -------------------------------- Accordion ------------------------------- */

var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var panel = this.nextElementSibling;
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    } 
  });
}