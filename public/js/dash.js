var currentUser;
var username = '';
var vehicle = '';
var offer = {
    createdBy: undefined,
    createdFor: undefined,
    request: undefined,
    price: undefined,
    drive: undefined,
    fromCity: undefined,
    toCity: undefined,
};
var drive = {
    type: 'drive',
    creator: undefined,
    arrivalTime: undefined,
    departureTime: undefined,
    price: undefined,
    vehicle: undefined,
    fromCity: undefined,
    toCity: undefined,
};
var request = {
    type: 'driveRequest',
    fromCity: undefined,
    toCity: undefined,
    creator: undefined,
    depatureTime: undefined,
    vehicle: undefined
};
var match = {
    arrivalTime: undefined,
    departureTime: undefined,
    creator: undefined,
    fromCity: undefined,
    toCity: undefined,
    price: undefined,
    vehicle: undefined,
    type: undefined
};
window.onload = function (e) {
    FirebaseIntegration.checkForRedirect();
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            currentUser = user;
            username += DisplayName(currentUser);
            document.getElementById('welcome').innerText = 'Hello ' + username + '! Here you can see all activities on our platform';
        }
    });
    loadToMeOfferedDrives();
    loadMyRequests();
    loadMyMatches();
};

const DisplayName = function (user) {
    if (user.data) {
        return user.data.username;
    } else {
        if (user.displayName) {
            return user.displayName;
        } else {
            return user.email;
        }
    }
}

function setUsername(nameOrEmail) {
    username = nameOrEmail;
}

function getUsername() {
    return this.username;
}

function setVehicle(vehicleObject) {
    vehicle = vehicleObject;
}

function getVehicle() {
    return this.vehicle;
}

async function setMatch(data) {
    var depatureTime = new Date(data.depatureTime * 1000).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1").substring(0,5);
    var arrivalTime = new Date(data.arrivalTime).toTimeString().substring(0,5);
    var type = data.type.substring(0,1).toUpperCase() + data.type.substring(1);
    var creator = '';
    var vehicle = '';
    await FirebaseIntegration.getUserByID(data.creator.id).then( user => {
        const username = DisplayName(user);
        return setUsername(username);
    });
    await FirebaseIntegration.getVehicleById(data.vehicle.id).then( v => {
        const vcl = v.data.name + ' [' + v.data.type + ']';;
        return setVehicle(vcl);
    });
    creator = getUsername();
    vehicle = getVehicle();
    match = {
        fromCity: data.fromCity,
        toCity: data.toCity,
        creator: creator,
        depatureTime: depatureTime,
        arrivalTime: arrivalTime,
        price: data.price,
        vehicle: vehicle,
        type: type
    };
}

async function setDrive(data) {
    var depatureTime = new Date(data.depatureTime * 1000).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1").substring(0,5);
    var arrivalTime = new Date(data.arrivalTime).toTimeString().substring(0,5);
    var creator = '';
    await FirebaseIntegration.getUserByID(data.creator.id).then( user => {
        const username = DisplayName(user);
        return setUsername(username);
    });
    creator = getUsername();
    drive = {
        type: 'drive',
        creator: creator,
        arrivalTime: arrivalTime,
        departureTime: depatureTime,
        price: data.price,
        fromCity: data.fromCity,
        toCity: data.toCity,
    };
}

function getMatch() {
    return this.match;
}
function getDrive() {
    return this.drive;
}

async function setRequest(data) {
    var depatureTime = new Date(data.depatureTime * 1000).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1").substring(0, 5);
    var creator = '';
    var vehicle = '';
    await FirebaseIntegration.getUserByID(data.creator.id).then(user => {
        const username = DisplayName(user);
        return setUsername(username);
    });
    creator = getUsername();
    await FirebaseIntegration.getVehicleById(data.vehicle.id).then(v => {
        if (v) {
            const vcl = v.data.name + ' [' + v.data.type + ']';;
            return setVehicle(vcl);
        }
    });
    vehicle = getVehicle();
    request = {
        fromCity: data.fromCity,
        toCity: data.toCity,
        creator: creator,
        depatureTime: depatureTime,
        vehicle: vehicle
    };
}

function getRequest() {
    return this.request;
}

async function setOffer(data, request) {
    var creator = '';
    var drive = '';
    await FirebaseIntegration.getUserByID(data.createdBy.id).then(user => {
        const username = DisplayName(user);
        return setUsername(username);
    });
    await FirebaseIntegration._getXById('entry', data.drive.id).then(drive => {
        if (drive) {
            const drv = drive.data;
            return setDrive(drv);
        }
    });
    creator = getUsername();
    drive = getDrive();
    offer = {
        createdBy: creator,
        createdFor: DisplayName(currentUser),
        request: request,
        price: data.price,
        drive: drive,
        fromCity: data.fromCity,
        toCity: data.toCity,
    };
}

function getOffer() {
    return this.offer;
}

function checkProperties(obj) {
    for (var key in obj) {
        if (!obj[key]) {
            obj[key] = "NA";
        }
    }
}

async function renderOffers(offers) {
    var offerCardHtml = '';
    if (offers && offers.length > 0) {
        for (let i = 0; i < offers.length; i++) {
            var data = offers[i].data;
            await firebase.firestore().collection('entry').doc(data.request.id).get()
                .then(async sh => {
                    const req = sh.data();
                    return setRequest(req);
                });
            request = getRequest();
            await setOffer(data, request);
            offer = getOffer();
            offerCardHtml += "<div class=\"column col-6 col-xs-12\"><div class=\"panel\" ><div class=\"panel-header text-center\"><span class=\"label label-rounded label-warning\">Offer</span><div class=\"panel-title\"><div class=\"panel-title h5\">From " + offer.request.fromCity + " to " + offer.request.toCity + "</div><div class=\"panel-subtitle text-gray\"></div></div></div><div class=\"panel-body\"><div class=\"columns\"><div class=\"column col-3\">Deputure\:  <br>Creator: <br>Price: <br></div><div class=\"column text-center\">" + offer.request.depatureTime + " <br>" + offer.createdBy + " <br>" + offer.price + " <br></div></div><div class=\"panel-footer text-center\"><button class=\"btn btn-primary\" href=\"#panelDetails\">Get in Touch!</button></div ></div ></div ></div > "
        }
    } else {
        offerCardHtml = "<tr><td colspan=\"5\">You don't have any offers yet</td></tr>";
    }
    document.getElementById("openOffers").innerHTML = offerCardHtml;
}

async function renderRequests(requests) {
    var requestCardHtml = '';
    if (requests && requests.length > 0) {
        for (let i = 0; i < requests.length; i++) {
            var data = requests[i].data;
            await setRequest(data);
            request = getRequest();
            requestCardHtml += "<div class=\"column col-6 col-xs-12\"><div class=\"panel\" ><div class=\"panel-header text-center\"><span class=\"label label-rounded label-error\">Request</span><div class=\"panel-title\"><div class=\"panel-title h5\">From " + request.fromCity + " to " + request.toCity + "</div><div class=\"panel-subtitle text-gray\"></div></div></div><div class=\"panel-body\"><div class=\"columns\"><div class=\"column col-3\">Departure\:  <br>Creator: <br>Vehicle: <br></div><div class=\"column text-center\">" + request.depatureTime + " <br>" + request.creator + " <br>" + request.vehicle + " <br></div></div><div class=\"panel-footer text-center\"><button class=\"btn btn-primary\" href=\"#panelDetails\">Get in Touch!</button></div></div></div></div>"
        }
    } else {
        requestCardHtml = "<tr><td colspan=\"5\">You don't have any requests yet</td></tr>";
    }
    document.getElementById("openRequests").innerHTML = requestCardHtml;
}

async function renderMatches(matches) {
    var matchCardHtml = '';
    console.log("matches: ");
    console.log(matches);
    if (matches && matches.length > 0) {
        for (let i = 0; i < matches.length; i++) {
            var data = matches[i].data;
            await setMatch(data);
            match = getMatch();
            matchCardHtml += "<div class=\"column col-6 col-xs-12\"><div class=\"panel\" ><div class=\"panel-header text-center\"><span class=\"label label-rounded label-success\">Match</span><div class=\"panel-title\"><div class=\"panel-title h5\">From " + match.fromCity + " to " + match.toCity + "</div><div class=\"panel-subtitle text-gray\">Recommended for you</div></div></div><div class=\"panel-body\"><div class=\"columns\"><div class=\"column col-3\">Type\:<br>Departure\:<br>Arrival\:<br>Creator:<br>Vehicle:<br>Price\:<br></div><div class=\"column text-center\">" + match.type + "<br>" + match.depatureTime + " <br>" + match.arrivalTime + " <br>" + match.creator + " <br>" + match.vehicle + "<br>" + match.price + " <br></div></div><div class=\"panel-footer text-center\"><button class=\"btn btn-primary\" href=\"#panelDetails\">Get in Touch!</button></div></div></div></div>"
        }
    } else {
        matchCardHtml = "<tr><td colspan=\"5\">Sorry, we couldn't find any match!</td></tr>";
    }
    document.getElementById("matches").innerHTML = matchCardHtml;
}


function loadMyRequests() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            FirebaseIntegration.getRequestsForUser(user.uid)
                .then(async (requests) => {
                    renderRequests(requests);
                }, error => {
                    handleErrors(error);
                });
        }
    });
}


function loadMyMatches() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            FirebaseIntegration.matchRequestAndDrives(user.uid)
                .then(async (matches) => {
                    renderMatches(matches);
                }, error => {
                    handleErrors(error);
                });
        }
    });
}


function loadToMeOfferedDrives() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            FirebaseIntegration.getAllMyOpenOffers(user.uid)
                .then(async (offers) => {
                    renderOffers(offers);
                }, error => {
                    handleErrors(error);
                });
        }
    });
}

function renderAllMyRequestsAndOffers() {
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
                                    return setUsername(username);
                                });
                            // exec after query
                            if (entries[i].data.type == "driveRequest") {
                                // render drive request panel
                                entriesListHtml += "<div class=\"column col-6 col-xs-12\"><div class=\"panel\" ><div class=\"panel-header text-center\"><span class=\"label label-rounded label-warning\">Request</span><div class=\"panel-title\"><div class=\"panel-title h5\">From " + entries[i].data.fromCity + " to " + entries[i].data.toCity + "</div><div class=\"panel-subtitle text-gray\"></div></div></div><div class=\"panel-body\"><div class=\"columns\"><div class=\"column col-3\">Departure\:  <br>Creator: <br>Vehicle: <br></div><div class=\"column col-3 text-center\">" + entries[i].data.depatureTime + " <br>" + getUsername() + " <br>" + getVehicle() + " <br></div></div><div class=\"panel-footer text-center\"><button class=\"btn btn-primary\" href=\"#panelDetails\">Get in Touch!</button></div></div></div></div>"
                            } else {
                                // render drive offer panel
                                entriesListHtml += "<div class=\"column col-6 col-xs-12\"><div class=\"panel\" ><div class=\"panel-header text-center\"><span class=\"label label-rounded label-success\">Offer</span><div class=\"panel-title\"><div class=\"panel-title h5\">From " + entries[i].data.fromCity + " to " + entries[i].data.toCity + "</div><div class=\"panel-subtitle text-gray\"></div></div></div><div class=\"panel-body\"><div class=\"columns\"><div class=\"column col-3\">Departure\:  <br>Arrival: <br>Creator: <br>Price: <br></div><div class=\"column col-3 text-center\">" + entries[i].data.depatureTime + " <br>" + entries[i].data.arrivalTime + " <br>" + getUsername() + " <br>" + entries[i].data.suggestedPrice + " <br></div></div><div class=\"panel-footer text-center\"><button class=\"btn btn-primary\" href=\"#panelDetails\">Get in Touch!</button></div ></div ></div ></div > "
                            }
                        }
                    } else {
                        entriesListHtml += "<tr><td colspan=\"5\">You don't have any request or offers yet</td></tr>";
                    }
                    document.getElementById("openRequests").innerHTML = entriesListHtml;
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
                handleErrors(error);
            });
        }
    });
});

function handleErrors(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    Swal.fire({
        icon: 'error',
        title: 'Oops.. Something went wrong!',
        text: errorMessage,
        footer: 'Error Code: ' + errorCode
    });
}