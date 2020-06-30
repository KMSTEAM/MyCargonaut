window.onload = function(){
    FirebaseIntegration.checkForRedirect();
};

let cargoCounter = 1;
function addCargo(){
    let cargoHTML = `<div class=\"form-group\"><div class=\"input-group col-12\"> 
                         <span class=\"input-group-addon bg-primary col-2\">#${cargoCounter}</span>
                         <input id=\"descr${cargoCounter}\" type=\"text\" class=\"form-input\" placeholder=\"Description\">
                       </div>
                       <div class=\"input-group col-12\">
                         <span class=\"input-group-addon col-2\">Weight</span>
                         <input id=\"weight${cargoCounter}\" type=\"text\" class=\"form-input col-4\" placeholder=\"1kg\">
                         <span class=\"input-group-addon col-2\">Height</span>
                         <input id=\"height${cargoCounter}\" type=\"text\" class=\"form-input col-4\" placeholder=\"1m\">
                       </div>
                       <div class=\"input-group col-12\">
                         <span id=\"depth${cargoCounter}\" class=\"input-group-addon col-2\">Depth</span>
                         <input type=\"text\" class=\"form-input col-4\" placeholder=\"1m\">
                         <span class=\"input-group-addon col-2\">Width</span>
                         <input id=\"width${cargoCounter}\" type=\"text\" class=\"form-input col-4\" placeholder=\"1m\">
                       </div>
                       </div>`;


    document.getElementById('cargoContainer').innerHTML += cargoHTML;

    cargoCounter++;
}


function requestDrive(){

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            let startPlace = document.getElementById('start').value;
            let endPlace = document.getElementById('end').value;
            let startDate = document.getElementById('startTime').value;
            let endDate = document.getElementById('endTime').value;
            let seats = document.getElementById('seats').value;
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

            if(seats === ''){
                document.getElementById('seats').select();
                return;
            }

            if(price === ''){
                document.getElementById('price').select();
                return;
            }



            /* TODO
            FirebaseIntegration.createEntry('drive', startPlace, endPlace, startDate, endDate, price, vehicle.id, user.uid).then(r => undefined);
             */
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