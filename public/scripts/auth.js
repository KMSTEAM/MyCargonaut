const auth = firebase.auth();



function sendEmailVerification() {
    firebase.auth().currentUser.sendEmailVerification().then(function () {
        Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Welcome to Cargonaut!',
            text: 'a verification mail has been sent, please check your Email and verify your account',
            showCloseButton: true,
            showCancelButton: false,
            focusConfirm: false,
            confirmButtonText: '<i class="fa fa-thumbs-up"></i> Great!',
            timer: 5000
        });
    });
}


/**
 * TestUser&PW: test@test.test
 */
const singupForm = document.querySelector('#signupForm');
const singupBtn = document.getElementById("signup-btn");

singupBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const email = singupForm["signup-email"].value;
    const password = singupForm["signup-password"].value;
    const birthday = singupForm["signup-birthday"].value;
    const username = singupForm["signup-username"].value;
    firebaseIntegration.registerUser(email, password, username, birthday).then(() => {
        sendEmailVerification();
        window.location.href = "dash.html";
    }, function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
            Swal.fire({
                icon: 'error',
                title: 'Oops.. Something went wrong!',
                text: errorCode + ' : ' + errorMessage
            });
        console.log(error);
    });
    

    // auth.createUserWithEmailAndPassword(email, password).then(creds => {
    //     // creds.user has user account details.
    //     singupForm.reset();
    //     sendEmailVerification().then(() => {
    //         window.location.href = "dash.html";
    //     })
    // }, () => {
    //     Swal.fire({
    //         icon: 'error',
    //         title: 'Oops.. Something went wrong!',
    //         text: 'Make sure you filled up all fields correctly!'
    //     });
    // })
})

const loginForm = document.querySelector('#loginForm');
const loginBtn = document.getElementById("login-btn");

loginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const email = loginForm["login-email"].value;
    const password = loginForm["login-password"].value;
    firebaseIntegration.loginUser(email, password);
})


function sendPasswordReset() {
    Swal.fire({
        title: 'Please, enter your email adresse',
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Send Password Reset Email',
        showLoaderOnConfirm: true,
        preConfirm: (email) => {
            firebase.auth().sendPasswordResetEmail(email).then(function () {
                // Password Reset Email Sent!
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Password Reset Email Sent!',
                    showConfirmButton: false,
                    timer: 1500
                })
            }).catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;

                if (errorCode == 'auth/invalid-email') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops.. Something went wrong!',
                        text: errorMessage
                    });
                } else if (errorCode == 'auth/user-not-found') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops.. Something went wrong!',
                        text: errorMessage
                    });
                }
                console.log(error);
            });
        }
    });
}


const logoutBtn = document.getElementById("logout-btn");

logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    auth.signOut().then(() => {
        window.location.href = "index.html";
    })
})


/**
 * initApp handles setting up UI event listeners and registering Firebase auth listeners:
 *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
 *    out, and that is where we update the UI.
 */
// function initApp() {
//     // Listening for auth state changes.
//     // [START authstatelistener]
//     firebase.auth().onAuthStateChanged(function (user) {
//         if (user) {
//             // User is signed in.
//             var displayName = user.displayName;
//             var email = user.email;
//             var emailVerified = user.emailVerified;
//             var photoURL = user.photoURL;
//             var isAnonymous = user.isAnonymous;
//             var uid = user.uid;
//             var providerData = user.providerData;

//             document.getElementById('user-display-name').textContent = JSON.stringify(user, null, '  ');
//             loginForm.remove();
//             singupForm.remove();
//             loginBtn.remove();
//             singupBtn.remove();
//             // TO-DO
//             // if (!emailVerified) {
//             //     document.getElementById('Verification Button').disabled = false;
//             // }
//         } else {
//             // User is signed out.
//         }
//         // [START_EXCLUDE silent]
//         document.getElementById('quickstart-sign-in').disabled = false;
//         // [END_EXCLUDE]
//     }
// }
