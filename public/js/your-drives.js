window.onload = function () {
    FirebaseIntegration.checkForRedirect();
    loadDrives();
};

function loadDrives() {
    //FirebaseIntegration.loginUser("seckeichhorn@gmail.com", "cargonaut")

    console.log("load");

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            console.log("user: " + user.uid);
            FirebaseIntegration.getEntriesForUser(user.uid).then(
                (drives) => {
                    let drivesListHtml = '';
                    if (drives.length > 0) {
                        for (i = 0; i < drives.length; i++) {
                            if (drives[i].data.type == 'drive') {
                                let date = new Date(drives[i].data.arrivalTime);
                                let price = drives[i].data.price;
                                let id = drives[i].id;
                                let fromCity = drives[i].data.fromCity;
                                let toCity = drives[i].data.toCity;
                                console.log(drives[i].data.vehicle)
                                FirebaseIntegration.getXByRef(drives[i].data.vehicle).then(
                                    (vehicle) => {
                                        console.log(vehicle)
                                        let vehicleName = vehicle.data.name;
                                        drivesListHtml += "<tr><td>" + date.toLocaleDateString() + "</td><td>" + fromCity + "</td><td>" + toCity + "</td><td>" + vehicleName + "</td><td>" + price + "€</td><td><button class=\"btn btn-primary \" id=\"" + id + "\" onClick=\"cancelDrive(this.id)\">Cancel</button></td></tr>";
                                        console.log(drivesListHtml)
                                    }
                                ).then(() => document.getElementById("drivesList").innerHTML = drivesListHtml);
                            }
                        };
                    } else {
                        document.getElementById("drivesList").innerHTML = "<tr><td colspan=\"5\">You haven't got any drives for your drives yet</td></tr>";
                    }
                }
            );
        }
    });
}

function loadDDDrives() {
    //FirebaseIntegration.loginUser("seckeichhorn@gmail.com", "cargonaut")

    console.log("load");

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            console.log("user");
            FirebaseIntegration.getEntriesForUser(user.uid).then(
                (drives) => {
                    console.log(drives);
                    let i;
                    let drivesListHtml = '';
                    if (drives.length > 0) {
                        for (i = 0; i < drives.length; i++) {
                            if (drives[i].data.type == 'drive') {
                                console.log("id: " + drives[i].id + "date: " + drives[i].data.arrivalTime);

                                const date = new Date(drives[i].data.arrivalTime);
                                const vehicleName = "VW Bus";
                                drivesListHtml += "<tr><td>" + date.toLocaleDateString() + "</td><td>" + drives[i].data.fromCity + "</td><td>" + drives[i].data.toCity + "</td><td>" + drives[i].data.price + "€</td><td>" + vehicleName + "</td><td><button class=\"btn btn-primary p-centered\" id=\"" + drives[i].id + "\" onClick=\"cancelDrive(this.id)\">Cancel</button></td></tr>";
                            }
                        }
                    } else {
                        drivesListHtml += "<tr><td colspan=\"5\">You haven't got any drives yet</td></tr>";
                    }
                    document.getElementById("drivesList").innerHTML = drivesListHtml;
                }
            );
        }
    });
}

function cancelDrive(id) {

    FirebaseIntegration.deleteXFromUser(id, "entry", "creator", firebase.auth().currentUser.uid);
    loadDrives();

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