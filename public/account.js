document.getElementById("deleteAccount").addEventListener("click", deleteAccount);
document.getElementById("paymentBtn").addEventListener("click", addPayment);

function deleteAccount() {
    FirebaseIntegration.deleteUserAccount();
}
function loadUser() {
   let name = "";
   name = FirebaseIntegration.loadUserName();
  // console.log(name);
 //
   // document.getElementsByClassName("userName2").innerHTML = name;
}
function addPayment() {
    document.getElementById("paymentElement").innerHTML = "Payment is currently just in cash.";
}

//FirebaseIntegration.getUserByID();
//<figure class="avatar" data-initial="JB" style="background-color: #5755d9; alignment: right"></figure>
