window.onload = function () {
    FirebaseIntegration.checkForRedirect();
    loadReviews();
};

function loadReviews() {
    //FirebaseIntegration.loginUser("seckeichhorn@gmail.com", "cargonaut")

    console.log("load");

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            console.log("user");
            FirebaseIntegration.getReviewsForUser(user.uid).then(
                (reviews) => {
                    let i;
                    let reviewsListHtml = '';
                    if (reviews.length > 0) {
                        for (i = 0; i < reviews.length; i++) {
                            reviewsListHtml += "<tr><td>" + reviews[i].data.stars + "</td><td>" + reviews[i].data.review + "</td></tr>";
                        }
                    } else {
                        reviewsListHtml += "<tr><td colspan=\"5\">You haven't any reviews yet</td></tr>";
                    }
                    document.getElementById("reviewsList").innerHTML = reviewsListHtml;
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