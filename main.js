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
};


