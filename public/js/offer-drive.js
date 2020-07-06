var vehicles;

window.onload = function(){
    FirebaseIntegration.checkForRedirect();
    loadVehicles();
};

document.getElementById('Offer_Button').addEventListener("click", function(e) {
    e.preventDefault();
    storeDrive();
});

document.getElementById('More_Offers_Button').addEventListener("click",function (e) {
   e.preventDefault();
   loadInputForms();
});

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

function loadInputForms(){
    document.getElementById('confirmation').hidden = true;

    document.getElementById('start').value = '';
    document.getElementById('end').value = '';
    document.getElementById('startTime').value = '';
    document.getElementById('endTime').value = '';
    document.getElementById('price').value = '';
    document.getElementById('description').value = '';

    document.getElementById('inputForm').hidden = false;
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
            let description = document.getElementById('description').value;


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

            FirebaseIntegration.createEntry('drive',startPlace,endPlace,startDate,endDate,price,-1,description,[],vehicle.id,user.uid);

            document.getElementById('inputForm').hidden = true;
            document.getElementById('confirmation').hidden = false;

        } else {
            // No user is signed in.
        }
    });
}

const logoutBtn = document.getElementById("logout-btn");

/* Allow Logging out from current page */
logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            FirebaseIntegration.logoutUser().then(() => {
                window.location.href = "index.html";
                console.log("loggedout user: " + user.uid);
            }).catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                Swal.fire({
                    icon: 'error',
                    title: 'Oops.. Something went wrong!',
                    text: errorMessage,
                    footer: 'Error Code: ' + errorCode
                });
            });
        }
    });
});
