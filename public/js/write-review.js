window.onload = function () {
    FirebaseIntegration.checkForRedirect();
};
document.getElementById("writeReview").addEventListener("click", (e) => {
    e.preventDefault();
    writeReview();
});

function writeReview() {

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            const reviewed = getReviewedUser();
            const reviewer = user.uid;
            const stars = document.getElementById("stars").value;
            const review = document.getElementById("review").value;
            console.log(reviewed, reviewer, stars, review);
            FirebaseIntegration.createReview(reviewed, reviewer, review, stars);
            location.href = 'dash.html';
        }
    });
}

function getReviewedUser() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const userId = urlParams.get('id');
    console.log(userId);
    return userId
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