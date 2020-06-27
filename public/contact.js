document.getElementById("send").addEventListener("click", submitForm);

function submitForm() {

    var messagesRef = firebase.database().ref('Messages');

var name = getInput(name);
var email = getInput(email);
var subject = getInput(subject);
var msg = getInput(message);

    //console.log("it works");

    //TODO: check if all information were submitted
    messageToFirebase(name,email,subject,message);
    //TODO: send a feedback message to the user

}

function getInput(id) {
 return document.getElementById(id).value;
}

function messageToFirebase(name,email,subject,message) {
var newMessageRef = messagesRef.push();
    newMessageRef.set({
        name: name,
        email: email,
        subject: subject,
        message: message
    });
}
