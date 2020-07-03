var currentUser;
var username = '';
var vehicle = '';
var offersList = [];
var matchesList = [];
var requestsList = [];
var offer = {
    id: undefined,
    createdBy: undefined,
    createdFor: undefined,
    request: undefined,
    price: undefined,
    drive: undefined,
    fromCity: undefined,
    toCity: undefined,
};
var drive = {
    id: undefined,
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
    id: undefined,
    type: 'driveRequest',
    fromCity: undefined,
    toCity: undefined,
    creator: undefined,
    departureTime: undefined,
    vehicle: undefined
};
var match = {
    id: undefined,
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
            const logoutBtn = document.getElementById("logout-btn");
            /* Allow Logging out from current page */
            logoutBtn.addEventListener("click", (e) => {
                e.preventDefault();
                firebase.auth().onAuthStateChanged(function (user) {
                    if (user) {
                        FirebaseIntegration.logoutUser().then(() => {
                            window.location.href = "index.html";
                        }).catch(function (error) {
                            handleErrors(error);
                        });
                    }
                });
            });
            loadToMeOfferedDrives();
            loadMyRequests();
            loadMyMatches();
        }
    });
};


async function setMatch(match) {
    var data = match.data;
    if (!data) {
        // document is snapshot, start reading directly
        data = match;
    };

    var departureTime = new Date(data.departureTime * 1000).toDateString().substring(0, 9);
    departureTime += ', ' + new Date(data.departureTime * 1000).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1").substring(0, 5);
    var arrivalTime = new Date(data.arrivalTime * 1000).toDateString().substring(0, 9);
    arrivalTime += ', ' + new Date(data.arrivalTime * 1000).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1").substring(0, 5);
    var type = data.type.substring(0, 1).toUpperCase() + data.type.substring(1);

    var creator = {
        id: data.creator.id,
        name: await FirebaseIntegration.getUserByID(data.creator.id).then(user => {
            const username = DisplayName(user);
            return username;
        })
    };
    var vehicle = 'Not Available';
    if (data.vehicle) {
        vehicle = await FirebaseIntegration.getVehicleById(data.vehicle.id).then(v => {
            const vcl = v.data.name + ' [' + v.data.type + ']';
            return vcl;
        });
    }

    return match = {
        id: match.id,
        fromCity: data.fromCity,
        toCity: data.toCity,
        creator: creator,
        departureTime: departureTime,
        arrivalTime: arrivalTime,
        price: data.price,
        vehicle: vehicle,
        type: type
    };
};

async function setDrive(drive) {
    var data = drive.data;
    if (!data) {
        // document is snapshot, start reading directly
        data = drive;
    };

    var departureTime = new Date(data.departureTime * 1000).toDateString().substring(0, 9);
    departureTime += ', ' + new Date(data.departureTime * 1000).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1").substring(0, 5);
    var arrivalTime = new Date(data.arrivalTime * 1000).toDateString().substring(0, 9);
    arrivalTime += ', ' + new Date(data.arrivalTime * 1000).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1").substring(0, 5);
    
    var creator = await FirebaseIntegration.getUserByID(data.creator.id).then(user => {
        const username = DisplayName(user);
        return username;
    });

    return drive = {
        id: drive.id,
        type: 'drive',
        creator: creator,
        arrivalTime: arrivalTime,
        departureTime: departureTime,
        price: data.price,
        fromCity: data.fromCity,
        toCity: data.toCity,
    };
};

async function setRequest(request) {
    var data = request.data;
    if (!data) {
        // document is snapshot, start reading directly
        data = request;
    };
    var departureTime = new Date(data.departureTime * 1000).toDateString().substring(0, 9);
    departureTime += ', ' + new Date(data.departureTime * 1000).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1").substring(0, 5);
    var creator = await FirebaseIntegration.getUserByID(data.creator.id).then(user => {
        const username = DisplayName(user);
        return username;
    });
    var vehicle = await FirebaseIntegration.getVehicleById(data.vehicle.id).then(v => {
        if (v) {
            const vcl = v.data.name + ' [' + v.data.type + ']';
            return vcl;
        };
    });
    if (!vehicle) {
        vehicle = 'Not Available';
    };
    return request = {
        id: request.id,
        fromCity: data.fromCity,
        toCity: data.toCity,
        creator: creator,
        departureTime: departureTime,
        vehicle: vehicle
    };
};

async function setOffer(offer, request) {
    var data = offer.data;
    if (!data) {
        // document is snapshot, start reading directly
        data = offer;
    };
    var creator = await FirebaseIntegration.getUserByID(data.createdBy.id).then(user => {
        const username = DisplayName(user);
        return username;
    });
    var drive = await FirebaseIntegration._getXById('entry', data.drive.id).then(drive => {
        if (drive) {
            const drv = drive.data;
            return setDrive(drv);
        }
    });
    var fromCity = '';
    var toCity = '';
    if (!data.fromCity || !data.toCity) {
        fromCity = drive.fromCity;
        toCity = drive.toCity;
    }
    return offer = {
        id: offer.id,
        createdBy: creator,
        createdFor: DisplayName(currentUser),
        request: request,
        price: data.price,
        drive: drive,
        fromCity: fromCity,
        toCity: toCity,
    };
}

async function renderOffers(offers) {
    var offerCardHtml = '';
    if (offers && offers.length > 0) {
        for (let i = 0; i < offers.length; i++) {
            var request = await firebase.firestore().collection('entry').doc(offers[i].data.request.id).get()
                .then(async sh => {
                    const req = sh.data();
                    req.id = sh.id;
                    return setRequest(req);
                });
            offer = await setOffer(offers[i], request);
            offersList.push(offer);
            var vehicle = offer.vehicle;
            if (!vehicle) {
                vehicle = 'Not Available';
            };
            offerCardHtml += "<div class=\"column col-6 col-xs-12\"><div class=\"panel\" ><div class=\"panel-header text-center\"><span class=\"label label-rounded label-warning\">Offer</span><div class=\"panel-title\"><div class=\"panel-title h5\">From " + offer.request.fromCity + " to " + offer.request.toCity + "</div><div class=\"panel-subtitle text-gray\"></div></div></div><div class=\"panel-body\"><div class=\"columns\"><div class=\"column col-3\">Departure\:<br>Arrival\:<br>Creator: <br>Vehicle: <br>Price: <br></div><div class=\"column text-center\">" + offer.request.departureTime + "<br>" + offer.drive.arrivalTime + " <br>" + offer.createdBy + "<br>" + vehicle + " <br>" + offer.price + " <br></div></div><div class=\"panel-footer text-right\"><button class=\"btn btn-primary\"  onClick=\"acceptOffer(event,'" + offers[i].id + "')\" style=\"margin-right: 10px;\">Accept</button><button class=\"btn btn-default\"   onClick=\"rejectOffer(event,'" + offers[i].id + "')\">Reject</button></div></div></div></div>";            
        };
    } else {
        offerCardHtml = "<tr><td colspan=\"5\">You don't have any offers yet</td></tr>";
    };
    document.getElementById("openOffers").innerHTML = offerCardHtml;
}

async function renderRequests(requests) {
    var requestCardHtml = '';
    if (requests && requests.length > 0) {
        for (let i = 0; i < requests.length; i++) {
            request = await setRequest(requests[i]);
            requestsList.push(request);
            requestCardHtml += "<div class=\"column col-6 col-xs-12\"><div class=\"panel\" ><div class=\"panel-header text-center\"><span class=\"label label-rounded label-error\">Request</span><div class=\"panel-title\"><div class=\"panel-title h5\">From " + request.fromCity + " to " + request.toCity + "</div><div class=\"panel-subtitle text-gray\"></div></div></div><div class=\"panel-body\"><div class=\"columns\"><div class=\"column col-3\">Departure\:  <br>Creator: <br>Vehicle: <br></div><div class=\"column text-center\">" + request.departureTime + " <br>" + request.creator + " <br>" + request.vehicle + " <br></div></div><div class=\"panel-footer text-right\"><button class=\"btn btn-default\" href=\"#panelDetails\">Edit</button></div></div></div></div>"
        }
    } else {
        requestCardHtml = "<tr><td colspan=\"5\">You don't have any requests yet</td></tr>";
    }
    document.getElementById("openRequests").innerHTML = requestCardHtml;
}

async function renderMatches(matches) {
    var matchCardHtml = '';
    if (matches && matches.length > 0) {
        for (let i = 0; i < matches.length; i++) {
            match = await setMatch(matches[i]);
            matchesList.push(match);
            matchCardHtml += "<div class=\"column col-6 col-xs-12\"><div class=\"panel\" ><div class=\"panel-header text-center\"><span class=\"label label-rounded label-success\">Match</span><div class=\"panel-title\"><div class=\"panel-title h5\">From " + match.fromCity + " to " + match.toCity + "</div><div class=\"panel-subtitle text-gray\">Recommended for you</div></div></div><div class=\"panel-body\"><div class=\"columns\"><div class=\"column col-3\">Type\:<br>Departure\:<br>Arrival\:<br>Creator:<br>Vehicle:<br>Price\:<br></div><div class=\"column text-center\">" + match.type + "<br>" + match.departureTime + " <br>" + match.arrivalTime + " <br>" + match.creator.name + " <br>" + match.vehicle + "<br>" + match.price + " <br></div></div><div class=\"panel-footer text-right\"><button class=\"btn btn-primary\" onClick=\"getInTouch(event,'"+ match.creator.id +"')\">Get in Touch!</button></div></div></div></div>";
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

async function rejectOffer(e, offerId){
    e.preventDefault();
    await FirebaseIntegration.updateOfferState(offerId, 'rejected')
        .then(() => {
            e.target.parentElement.className = 'panel-footer text-center';
            e.target.parentElement.innerHTML = '<div class="bg-error">Rejected</div>';
            var msg = 'Offer Rejected'
            alertDone(msg);
        }, error => {
            handleErrors(error);
        });
}

async function acceptOffer(e, offerId){
    e.preventDefault();
    await FirebaseIntegration.updateOfferState(offerId, 'accepted')
        .then(() => {
            e.target.parentElement.className = 'panel-footer text-center';
            e.target.parentElement.innerHTML = '<div class="bg-success">Accepted</div>';
            var msg = 'Offer Accepted'
            alertDone(msg);
        }, error => {
            handleErrors(error);
        });
}

async function editRequest(e, user) {
    e.preventDefault();
    // TO-DO: fire swal input modal with request data to modify it
    const { value: formValues } = await Swal.fire({
        title: 'Send a Message!',
        html: '<div id="swal2-content" class="swal2-html-container" style="display: block;"><div class="input-group col-12"><span class="input-group-addon addon-lg col-4 bg-primary">Your Email: </span><input type="text" id="email" placeholder="user@example.com" class="form-input input-lg col-5"></div><textarea id="msg" placeholder="Write your message here" rows="3" class="form-input input-lg col-xs-12" style="margin-top: 20px; width: 628px; height: 84px;"></textarea></div>',
        focusConfirm: false,
        confirmButtonText: 'Send Message',
        preConfirm: () => {
            return [
                document.getElementById('email').value,
                document.getElementById('msg').value
            ]
        }
    })
    // TO-DO: update request
    if (formValues) {
        Swal.fire(JSON.stringify(formValues))
    }
}

async function getInTouch(e, user){
    e.preventDefault();
    const { value: formValues } = await Swal.fire({
        title: 'Send a Message!',
        html: '<div id="swal2-content" class="swal2-html-container" style="display: block;"><div class="input-group col-12"><span class="input-group-addon addon-lg col-4 bg-primary">Your Email: </span><input type="text" id="email" placeholder="user@example.com" class="form-input input-lg col-5"></div><textarea id="msg" placeholder="Write your message here" rows="3" class="form-input input-lg col-xs-12" style="margin-top: 20px; width: 628px; height: 84px;"></textarea></div>',
        focusConfirm: false,
        confirmButtonText: 'Send Message',
        preConfirm: () => {
            return [
                document.getElementById('email').value,
                document.getElementById('msg').value
            ]
        }
    })
    // TO-DO: sent email to user with write-back adress and msg
    if (formValues) {
        Swal.fire(JSON.stringify(formValues))
    }
}

function handleErrors(error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    Swal.fire({
        icon: 'error',
        title: 'Oops.. Something went wrong!',
        text: errorMessage,
        footer: 'Error Code: ' + errorCode
    });
}

function alertDone(msg){
    Swal.fire({
        position: 'center',
        icon: 'success',
        title: msg,
        showConfirmButton: false,
        timer: 1500
    });
}

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
};
