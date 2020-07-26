window.onload = function () {
    FirebaseIntegration.checkForRedirect();
    loadOffers();
};

function loadOffers() {

    console.log("load");

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            console.log("user: " + user.uid);
            FirebaseIntegration.getOffersForUser(user.uid).then(
                (offers) => {
                    let i, date, fromCity, toCity;
                    let offersListHtml = '';
                    if (offers.length > 0) {
                        for (i = 0; i < offers.length; i++) {
                            let price = offers[i].data.price;
                            let id = offers[i].id;
                            let state = offers[i].data.state;
                            FirebaseIntegration.getXByRef(offers[i].data.drive).then(
                                (drive) => {
                                    console.log("id: " + drive.id + "date: " + drive.data.arrivalTime)
                                    date = new Date(drive.data.arrivalTime);
                                    console.log(date)
                                    fromCity = drive.data.fromCity;
                                    toCity = drive.data.toCity;
                                    offersListHtml += "<tr><td>" + date.toLocaleDateString() + "</td><td>" + fromCity + "</td><td>" + toCity + "</td><td>" + price + "€</td><td>" + state + "</td><td><button class=\"btn btn-primary \" id=\"" + id + "\" onClick=\"acceptOffer(this.id)\">Accept</button> <button class=\"btn btn-secondary \" id=\"" + id + "\" onClick=\"rejectOffer(this.id)\">Reject</button></td></tr>";
                                    console.log(offersListHtml)
                                }
                            ).then(() => document.getElementById("offersList").innerHTML = offersListHtml);
                        }
                    } else {
                        document.getElementById("offersList").innerHTML = "<tr><td colspan=\"6\">You haven't got any offers for your offers yet</td></tr>";
                    }
                }
            );
        }
    });
}

function acceptOffer(id) {

    FirebaseIntegration.updateOfferState(id, "accepted");
    loadOffers();

}

function rejectOffer(id) {

    FirebaseIntegration.updateOfferState(id, "rejected");
    loadOffers();

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