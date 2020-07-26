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
                                    console.log(drive)
                                    date = new Date(drive.data.arrivalTime);
                                    fromCity = drive.data.fromCity;
                                    toCity = drive.data.toCity;
                                    driver = drive.data.creator.id;
                                    offersListHtml += "<tr><td>" + date.toLocaleDateString() + "</td><td>" + fromCity + "</td><td>" + toCity + "</td><td>" + price + "€</td><td>" + state + "</td><td><button class=\"btn btn-primary \" id=\"" + id + "\" onClick=\"payDrive(this.id)\">Pay</button> <button class=\"btn btn-secondary \" id=\"" + driver + "\" onClick=\"writeReview(this.id)\">Review</button></td></tr>";
                                }
                            ).then(() => document.getElementById("offersList").innerHTML = offersListHtml);
                        }
                    } else {
                        document.getElementById("offersList").innerHTML = "<tr><td colspan=\"6\">You haven't got any booked drives yet</td></tr>";
                    }
                }
            );
        }
    });
}

function payDrive(id) {

    FirebaseIntegration.updateOfferState(id, "paid");
    loadOffers();

}

function writeReview(id) {

    window.location.href = "write-review.html?id=" + id;

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