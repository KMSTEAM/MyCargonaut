document.getElementById("changePassword").addEventListener("click", changePassword);

function changePassword() {
    var newPass = document.getElementById("newPass1").value;
    var newPassword = document.getElementById("newPass2").value;
if (newPass == newPassword){
    FirebaseIntegration.changeUserPassword(newPassword);
    }else{
    window.alert("Passwords mismatch");
}
}
