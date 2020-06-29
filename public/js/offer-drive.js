var vehicles;

window.onload = function(){
    FirebaseIntegration.checkForRedirect();
    loadVehicles();
};

function loadVehicles(){
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            FirebaseIntegration.getVehiclesForUser(user.uid).then(

                (dbVehicles) => {

                    vehicles = dbVehicles;
                    let i;
                    let vehicleListHTML = '';

                    for( i = 0; i < vehicles.length; i++){
                        vehicleListHTML += "<option>" + vehicles[i].data.name + "</option>";
                    }

                    document.getElementById('vehicle').innerHTML = vehicleListHTML;
                }
            );
        } else {
            // User not logged in
        }
    });

}

function storeDrive(){

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            let startPlace = document.getElementById('start').value;
            let endPlace = document.getElementById('end').value;
            let startDate = document.getElementById('startTime').value;
            let endDate = document.getElementById('endTime').value;
            let vehicleName = document.getElementById('vehicle').value;
            let price = document.getElementById('price').value;


            if(startPlace === ''){
                document.getElementById('start').select();
                return;
            }

            if(endPlace === ''){
                document.getElementById('end').select();
                return;
            }

            if(startDate === ''){
                document.getElementById('startTime').select();
                return;
            }

            if(endDate === ''){
                document.getElementById('endTime').select();
                return;
            }

            if(price === ''){
                document.getElementById('price').select();
                return;
            }

            let vehicle = vehicles.find(v => v.data.name.localeCompare(vehicleName) === 0);

            FirebaseIntegration.createEntry('drive', startPlace, endPlace, startDate, endDate, price, vehicle.id, user.uid).then(r => undefined);
        } else {
            // No user is signed in.
        }
    });
}