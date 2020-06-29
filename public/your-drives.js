window.onload = loadDrives;

function loadDrives() {
    //FirebaseIntegration.loginUser("seckeichhorn@gmail.com", "cargonaut")

    console.log("load")

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            console.log("user")
            FirebaseIntegration.getEntriesForUser(user.uid).then(
                (drives) => {
                    console.log(drives)
                    let i;
                    let drivesListHtml = '';
                    if (drives.length > 0) {
                        for (i = 0; i < drives.length; i++) {
                            if (drives[i].data.type == 'drive') {
                                console.log(drives[i].id)
                                const date = new Date(drives[i].data.arrivalTime)
                                const vehicleName = "VW Bus";
                                drivesListHtml += "<tr><td>" + date.toLocaleDateString() + "</td><td>" + drives[i].data.fromCity + "</td><td>" + drives[i].data.toCity + "</td><td>" + drives[i].data.price + "€</td><td>" + vehicleName + "</td><td><button class=\"btn btn-primary p-centered\" id=\"" + drives[i].id + "\" onClick=\"cancelDrive(this.id)\">Cancel</button></td></tr>"
                            }
                        }
                    } else {
                        drivesListHtml += "<tr><td colspan=\"5\">You haven't got any drives yet</td></tr>";
                    }
                    document.getElementById("drivesList").innerHTML = drivesListHtml;
                }
            )
        }
    })
}

function cancelDrive(id) {

    FirebaseIntegration.deleteXFromUser(id, "entry", "creator", firebase.auth().currentUser.uid);
    loadDrives();

}
