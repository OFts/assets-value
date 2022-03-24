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

function showAst() {
    for (const type of assetType) {
        if (list.value == type.name){
            ast[0].innerHTML = type.inf;
            ast[1].innerHTML = type.di * 100;
            ast[2].innerHTML = type.dm * 100;
            ast[3].innerHTML = type.vue;
        }
    }
}

showAst();

list.addEventListener('change', ()=>{
    showAst();
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
    data[0] =[];
    data[1] =[];
    data[2] =[];
    
    // data variable for graph
    gxdata = [];
    gydata[0] = [];
    gydata[1] = [];
    gydata[2] = [];

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
                data[0].push([i, pval, val]);
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
                data[0].push([i, pval, val]);
                gxdata.push(i);
                gydata[0].push(val.toFixed(2));
            }
        }
    } else {
        // Generate data and push it into the data variable - New
        for (let i = 0; i <= p; i++) {
            let pval = (di - dm) * Math.exp(-i * f) + dm;
            let val = pval * v;
            data[0].push([i, pval, val]);
            gxdata.push(i);
            gydata[0].push(val.toFixed(2));
        }
    }

    // Método de suma de dígitos
    let sum = vu * (vu + 1) / 2;
    let sumContador = 0;
    for (let i = 0; i <= p; i++) {
        sumContador += vu - i;
        let pval = 1 - ((1 - dm) * sumContador / sum);
        let val;
        if (i > vu){
            val = dm * v;
        } else {
            val = pval * v;
        }
        gydata[1].push(val.toFixed(2));
        data[1].push([i, pval, val]);
    }

    // Método lineal sin depreciación inicial
    let da = (1 - dm) / vu; // Depreciaciión mensual
    for (let i = 0; i <= p; i++){
        let pval = 1 - (da * i);
        console.log(pval);
        let val;
        if (i > vu){
            val = dm * v;
        } else {
            val = pval * v;
        }
        gydata[2].push(val.toFixed(2));
        data[2].push([i, pval, val]);
    }
    
    console.log(data[2]);

    /* ------------------------------ Create table ------------------------------ */
    jspreadsheet(document.getElementById('spreadsheet'), {
        data: data[0],
        columns: [
            { type: 'text', title: 'Mes', width: 60 },
            { type: 'numeric', title: 'Depreciación', width: 120, mask: '0%' },
            { type: 'numeric', title: 'Valor', width: 150, mask: 'Q #,##0.00' },
        ]
    });
    
    jspreadsheet(document.getElementById('spreadsheet-m1'), {
        data: data[2],
        columns: [
            { type: 'text', title: 'Mes', width: 60 },
            { type: 'numeric', title: 'Depreciación', width: 120, mask: '0%' },
            { type: 'numeric', title: 'Valor', width: 150, mask: 'Q #,##0.00' },
        ]
    });

    jspreadsheet(document.getElementById('spreadsheet-m2'), {
        data: data[1],
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
        myChart.data.datasets[2].data = gydata[2];
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
                    label: 'Método lineal',
                    data: gydata[2],
                    borderColor: '#ff5733 ',
                    backgroundColor: '#ff5733 ',
                    tension: 0.1
                },
                {
                    label: 'Método decreciente',
                    data: gydata[1],
                    borderColor: '#bbc446',
                    backgroundColor: '#bbc446',
                    tension: 0.1
                },
            ]
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

// Responsive function
// Fix when is opened in a small screen
window.addEventListener('resize', ()=>{
    if(window.innerWidth < 768){
        myChart.options.maintainAspectRatio = false;
        document.getElementById("miniChart").classList.add("eightyv");
    } else {
        myChart.options.maintainAspectRatio = true;
        myChart.options.aspectRatio = 2;
        document.getElementById("miniChart").classList.remove("eightyv");
    }
    myChart.reset();
});

/* -------------------------------- Accordion ------------------------------- */

var acc = document.getElementsByClassName("accordion");

for (const acg of acc) {
    if (acg.classList.contains("active")){
        toggleAcc(acg);
    }
}
acc[0].addEventListener("click", function() {
    toggleAcc(this);
});

for (var i = 1; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {

        var setClasses = !this.classList.contains('active');

        for (var j = 1; j < acc.length; j++){
            if (acc[j].classList.contains("active")){
                toggleAcc(acc[j]);
            }
        }
        if (setClasses) {
            toggleAcc(this);
        }
    });
}


function toggleAcc (ack){
    ack.classList.toggle("active");
    let panel = ack.nextElementSibling;
    if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
    } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
    }
}