document.getElementById("changePassword").addEventListener("click", changePassword);



function changePassword() {
    let newPassword = document.getElementById("newPass").value;

    FirebaseIntegration.changeUserPassword(newPassword);
}
