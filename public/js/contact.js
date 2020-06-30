window.onload = function(){
    FirebaseIntegration.checkForRedirect();
};

document.getElementById("send").addEventListener("click", submitForm);

function submitForm() {

let name = document.getElementById("name").value;
let email = document.getElementById("email").value;
let subject = document.getElementById("subject").value;
let msg = document.getElementById("message").value;

    //TODO: check if all information were submitted
    FirebaseIntegration.createMessage(name,email,subject,msg);
    //TODO: send a feedback message to the user

}

/* Allow Logging out from current page */
const logoutBtn = document.getElementById("logout-btn");

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
