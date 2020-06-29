document.getElementById("deleteAccount").addEventListener("click", deleteAccount);

function deleteAccount() {
    FirebaseIntegration.deleteUserAccount();
}
