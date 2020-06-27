document.getElementById("send").addEventListener("click", submitForm);

function submitForm() {

    var messagesRef = firebase.database().ref('Messages');

var name = getInput(name);
var email = getInput(email);
var subject = getInput(subject);
var msg = getInput(message);

    //console.log("it works");
    messageToFirebase(name,email,subject,message);

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
