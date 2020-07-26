window.onload = function(){
    FirebaseIntegration.checkForRedirect();
};

const helloUsername = document.getElementById('helloUsername');
const userTitle = document.getElementById('userTitle');
const userAvatar = document.getElementById('userAvatar');
const birthdateSpan = document.getElementById('birthdate');

firebase.auth().onAuthStateChanged( (user) => {
    FirebaseIntegration.getUserByID(user.uid).then((dbUser) => {
       const username = dbUser.data.username;
       const birthdate = dbUser.data.birthDate;
       helloUsername.innerText = username;
       userTitle.innerText = username;
       userAvatar.dataset.initial = username[0] || 'U';
       birthdateSpan.innerText = birthdate.toLocaleString();
    });
});

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
