window.onload = function () {
    FirebaseIntegration.checkForRedirect();
    loadRequests();
};

function loadRequests() {
    //FirebaseIntegration.loginUser("seckeichhorn@gmail.com", "cargonaut")

    console.log("load");

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            console.log("user: " + user.uid);
            FirebaseIntegration.getRequestsForUser(user.uid).then(
                (requests) => {
                    console.log(requests);
                    let i;
                    let requestsListHtml = '';
                    if (requests.length > 0) {
                        for (i = 0; i < requests.length; i++) {
                            console.log("id: " + requests[i].id + "date: " + requests[i].data.arrivalTime);
                            const date = new Date(requests[i].data.arrivalTime);
                            requestsListHtml += "<tr><td>" + date.toLocaleDateString() + "</td><td>" + requests[i].data.fromCity + "</td><td>" + requests[i].data.toCity + "</td><td>" + requests[i].data.price + "€</td><td><button class=\"btn btn-primary p-centered\" id=\"" + requests[i].id + "\" onClick=\"cancelRequest(this.id)\">Cancel</button></td></tr>";

                        }
                    } else {
                        requestsListHtml += "<tr><td colspan=\"5\">You haven't published any requests yet</td></tr>";
                    }
                    document.getElementById("requestsList").innerHTML = requestsListHtml;
                }
            );
        }
    });
}

function cancelRequest(id) {

    FirebaseIntegration.deleteXFromUser(id, "entry", "creator", firebase.auth().currentUser.uid);
    loadRequests();

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