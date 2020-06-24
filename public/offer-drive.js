function loadVehicles(){

    let vehicleNames = ["Polo","Golf","VW"];

    let vehicleListHTML = '';

    let i;

    for(i = 0; i < vehicleNames.length; i++){
        vehicleListHTML += "<option>" + vehicleNames[i] + "</option>";
    }

    document.getElementById('vehicle').innerHTML = vehicleListHTML;
}