window.onload = function(){
    FirebaseIntegration.checkForRedirect();
    loadVehicles();
};
document.getElementById("addVehicle").addEventListener("click", addVehicle);

function loadVehicles() {
    //FirebaseIntegration.loginUser("seckeichhorn@gmail.com", "cargonaut")

    console.log("load");

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            console.log("user");
            FirebaseIntegration.getVehiclesForUser(user.uid).then(
                (vehicles) => {
                    let i;
                    let vehicleListHtml = '';
                    if (vehicles.length > 0) {
                        for (i = 0; i < vehicles.length; i++) {
                            vehicleListHtml += "<tr><td>" + vehicles[i].data.name + "</td><td>" + vehicles[i].data.type + "</td><td>" + vehicles[i].data.maxCargoWeight + "</td><td>" + vehicles[i].data.maxCargoDepth + "</td><td>" + vehicles[i].data.maxCargoHeight + "</td><td>" + vehicles[i].data.maxCargoWidth + "</td><td><button class=\"btn btn-primary p-centered\" id=\"" + vehicles[i].id + "\" onClick=\"deleteVehicle(this.id)\">Delete</button></td></tr>";
                        }
                    } else {
                        vehicleListHtml += "<tr><td colspan=\"5\">You haven't any vehicles yet</td></tr>";
                    }
                    document.getElementById("vehicleList").innerHTML = vehicleListHtml;
                }
            );
        }
    });
}

function addVehicle() {

    console.log("add");

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            const name = document.getElementById("name").value;
            const type = document.getElementById("category").value;
            const maxCargoDepth = document.getElementById("maxCargoDepth").value;
            const maxCargoHeight = document.getElementById("maxCargoHeight").value;
            const maxCargoWidth = document.getElementById("maxCargoWidth").value;
            const maxCargoWeight = document.getElementById("maxCargoWeight").value;

            FirebaseIntegration.createVehicle(name, user.uid, type, maxCargoDepth, maxCargoHeight, maxCargoWidth,
                maxCargoWeight);

            loadVehicles();
        }
    });
}

function deleteVehicle(id) {

    FirebaseIntegration.deleteXFromUser(id, "vehicle", "creator", firebase.auth().currentUser.uid);
    loadVehicles();

}