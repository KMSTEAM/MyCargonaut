document.getElementById("deleteAccount").addEventListener("click", deleteAccount);

function deleteAccount() {
    FirebaseIntegration.deleteUserAccount();
}
function loadUser() {

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            let info = FirebaseIntegration.getUserInfo(user.uid);
            let name = user.data.username;

            console.log(name);
            //   document.getElementsByClassName("userName").innerHTML = userName;
        }
        });
}
