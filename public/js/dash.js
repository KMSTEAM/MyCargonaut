window.onload = function (e) {
    FirebaseIntegration.checkForRedirect();
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            console.log("logged user: " + user.uid);
        }
    });
    loadUserOwnEntries();
    // TO-DO
    // // query SELECT FROM entry * WHERE 'fromCity' = 'myOfferFromCity' and 'toCity' = 'myOfferToCity' and 'type' = 'driveRequest'
    // matchUserOffers();
    // // query SELECT FROM entry * WHERE 'fromCity' = 'myRequestFromCity' and 'toCity' = 'myRequestToCity' and 'type' = 'drive'
    // matchUserRequests();
    //loadMyFutureDrives();
    //loadMyOffers();
};
var creator;
var vehicle;
var suitableOffers;
var suitableRequests;
function setCreator(username) {
    creator = username;
}
function getCreator() {
    return this.creator;
}
function setVehicle(name) {
    vehicle = name;
}
function getVehicle() {
    return this.vehicle;
}

function loadMyFutureDrives() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // todo
        }
    }).then(drives => {
        console.log(drives.data())
    }, error => {
        console.log(error.message)
    });
}

function loadUserOwnEntries() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            console.log("user");
            FirebaseIntegration.getEntriesForUser(user.uid).then(
                async (entries) => {
                    let i;
                    let entriesListHtml = '';
                    if (entries.length > 0) {
                        for (i = 0; i < entries.length; i++) {
                            await firebase.firestore().collection('vehicle').doc(entries[i].data.vehicle.id).get()
                                .then(async vehicleDocSnapShot => {
                                    if (vehicleDocSnapShot.exists) {
                                        const name = vehicleDocSnapShot.data().name;
                                        console.log(name);
                                        return setVehicle(name);
                                    }
                                });
                            await firebase.firestore().collection('user').doc(entries[i].data.creator.id).get()
                                .then(async userDocSnapShot => {
                                    const username = userDocSnapShot.data().username;
                                    console.log(username);
                                    return setCreator(username);
                                });
                            // exec after query
                            if (entries[i].data.type == "driveRequest") {
                                // render drive request panel
                                entriesListHtml += "<div class=\"column col-6 col-xs-12\"><div class=\"panel\" ><div class=\"panel-header text-center\"><span class=\"label label-rounded label-warning\">Request</span><div class=\"panel-title\"><div class=\"panel-title h5\">From " + entries[i].data.fromCity + " to " + entries[i].data.toCity + "</div><div class=\"panel-subtitle text-gray\">Recommended for you</div></div></div><div class=\"panel-body\"><div class=\"columns\"><div class=\"column col-3\">Deputure\:  <br>Creator: <br>Vehicle: <br></div><div class=\"column col-3 text-center\">" + entries[i].data.depatureTime + " <br>" + getCreator() + " <br>" + getVehicle() + " <br></div></div><div class=\"panel-footer text-center\"><button class=\"btn btn-primary\" href=\"#panelDetails\">Get in Touch!</button></div></div></div></div>"
                            } else {
                                // render drive offer panel
                                entriesListHtml += "<div class=\"column col-6 col-xs-12\"><div class=\"panel\" ><div class=\"panel-header text-center\"><span class=\"label label-rounded label-success\">Offer</span><div class=\"panel-title\"><div class=\"panel-title h5\">From " + entries[i].data.fromCity + " to " + entries[i].data.toCity + "</div><div class=\"panel-subtitle text-gray\">Recommended for you</div></div></div><div class=\"panel-body\"><div class=\"columns\"><div class=\"column col-3\">Deputure\:  <br>Arrival: <br>Creator: <br>Price: <br></div><div class=\"column col-3 text-center\">" + entries[i].data.depatureTime + " <br>" + entries[i].data.arrivalTime + " <br>" + getCreator() + " <br>" + entries[i].data.suggestedPrice + " <br></div></div><div class=\"panel-footer text-center\"><button class=\"btn btn-primary\" href=\"#panelDetails\">Get in Touch!</button></div ></div ></div ></div > "
                            }
                        }
                    } else {
                        entriesListHtml += "<tr><td colspan=\"5\">You don't have any request or offers yet</td></tr>";
                    }
                    document.getElementById("drives_requests").innerHTML = entriesListHtml;
                }
            );
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