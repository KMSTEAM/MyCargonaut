window.onload = function(){
    FirebaseIntegration.checkForRedirect();
};

let cargoCounter = 1;
const addCargo_btn = document.getElementById('addCargo');
addCargo_btn.addEventListener('click', function (e) {
    e.preventDefault();
    addCargo();
});

const removeCargo_btn = document.getElementById('removeCargo');
removeCargo_btn.addEventListener('click', function (e) {
    e.preventDefault();
    removeCargo();
});

document.getElementById('More_Requests_Button').addEventListener('click',function (e) {
    e.preventDefault();
    loadInputForms();
});

function removeCargo() {
    cargoCounter--;
    console.log(cargoCounter);
    document.getElementById("#" + cargoCounter).outerHTML = "";
    // document.getElementById("#" + cargoCounter).remove;
}

function addCargo(){
    let cargoHTML = `<div class=\"form-group py-2\" id=\"#${cargoCounter}\">
                        <div class=\"input-group col-12\"> 
                           <span class=\"input-group-addon bg-primary col-2\">#${cargoCounter}</span>
                           <input id=\"descr${cargoCounter}\" type=\"text\" class=\"form-input\" placeholder=\"Description\">
                        </div>
                        <div class=\"input-group col-12\">
                          <span class=\"input-group-addon col-2\">Weight</span>
                          <input id=\"weight${cargoCounter}\" type=\"text\" class=\"form-input col-4\" placeholder=\"1kg\">
                          <span class=\"input-group-addon col-2\">Height</span>
                          <input id=\"height${cargoCounter}\" type=\"text\" class=\"form-input col-4\" placeholder=\"1cm\">
                        </div>
                        <div class=\"input-group col-12\">
                          <span class=\"input-group-addon col-2\">Depth</span>
                          <input id=\"depth${cargoCounter}\" type=\"text\" class=\"form-input col-4\" placeholder=\"1cm\">
                          <span class=\"input-group-addon col-2\">Width</span>
                          <input id=\"width${cargoCounter}\" type=\"text\" class=\"form-input col-4\" placeholder=\"1cm\">
                        </div>
                     </div>`;

    let tmpElement = document.createElement('div');

    tmpElement.innerHTML = cargoHTML;

    document.getElementById('cargoContainer').insertAdjacentElement("beforeend",tmpElement);

    cargoCounter++;
}

function loadInputForms(){
    document.getElementById('confirmation').hidden = true;

    document.getElementById('start').value = '';
    document.getElementById('end').value = '';
    document.getElementById('startTime').value = '';
    document.getElementById('endTime').value = '';
    document.getElementById('seats').value = '';
    document.getElementById('description').value = '';
    document.getElementById('cargoContainer').innerHTML = '';

    document.getElementById('inputForm').hidden = false;
}

const request_btn = document.getElementById('requestDrive');
request_btn.addEventListener('click', function (e) {
    e.preventDefault();
    requestDrive();
});

function requestDrive(){

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            let startPlace = document.getElementById('start').value;
            let endPlace = document.getElementById('end').value;
            let startDate = document.getElementById('startTime').value;
            let endDate = document.getElementById('endTime').value;
            let seats = parseInt(document.getElementById('seats').value);
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

            if(seats === ''){
                document.getElementById('seats').select();
                return;
            }


            let tmpCargo = {};

            let i;
            for(i = 1; i < cargoCounter; i++){
                let tmpDescr = document.getElementById(`descr${i}`).value;
                let tmpWeight = parseInt(document.getElementById(`weight${i}`).value);
                let tmpHeight = parseInt(document.getElementById(`height${i}`).value);
                let tmpDepth = parseInt(document.getElementById(`depth${i}`).value);
                let tmpWidth = parseInt(document.getElementById(`width${i}`).value);

                if(tmpDescr===''){
                    document.getElementById(`descr${i}`).select();
                    return;
                }

                if(tmpWeight===''){
                    document.getElementById(`weight${i}`).select();
                    return;
                }

                if(tmpHeight===''){
                    document.getElementById(`height${i}`).select();
                    return;
                }

                if(tmpDepth===''){
                    document.getElementById(`depth${i}`).select();
                    return;
                }

                if(tmpWidth===''){
                    document.getElementById(`width${i}`).select();
                    return;
                }

                tmpCargo[i] = {height:tmpHeight,width:tmpWidth,depth:tmpDepth,weight:tmpWeight,description:tmpDescr};
            }
            FirebaseIntegration.createEntry('request',startPlace,endPlace,startDate,endDate,-1,seats,description,tmpCargo,'',user.uid);
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