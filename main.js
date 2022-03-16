window.onload = function() {

    console.log(assetType);
    var list = document.getElementById("assetTypes");
    
    for (const type of assetType){
        let node = document.createElement("option");
        console.log(type.name);
        node.value = type.name;
        const textnode = document.createTextNode(type.name);
        node.appendChild(textnode);
        list.appendChild(node);
    }
    
    let select = document.getElementById('currency');
    let exchange = document.getElementById('exchange');
    let txt = document.querySelector('h2');

    select.addEventListener('change', ()=>{
        if (select.value == "US Dollars - $"){
            exchange.style.display = "block";
        }
        else {
            exchange.style.display = "none"; 
        }
    });
    
    
    let calc = document.getElementById("calculate");
    
    calc.addEventListener('click',()=>{
        
        document.getElementById('spreadsheet').innerHTML = '';

        var dc = 1 - assetType[0].dc,
        di = 1 - assetType[0].di,
        dm = 1 - assetType[0].dm,
        m = assetType[0].months,
        f = Math.log((di - dm)/(dc - dm))/m;
        val = document.getElementById('value').value,
        p = document.getElementById('months').value;
        
        var data = [];

        for (let i = 0; i <= p; i++){
            let v = val * ((di - dm) * Math.exp(-i*f) + dm);
            data.push([ i, (di - dm) * Math.exp(-i*f) + dm, v]);
        }

        
        jspreadsheet(document.getElementById('spreadsheet'), {
            data:data,
            columns: [
                { type: 'text', title: 'Mes', width: 60 },
                { type: 'numeric', title:'Depreciación', width:120, mask:'0%' },
                { type: 'numeric', title:'Valor', width:150, mask:'Q #,##0.00'},
            ]
        });
    });
};

