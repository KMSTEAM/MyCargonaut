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
