/**
 * A class Handling the Firebase integration for Cargonaut
 */
class FirebaseIntegration {
  /**
   * Registers a Cargonaut user in firebase
   * @param email {string}
   * @param password {string}
   * @param username {string}
   * @param birthDate {Date}
   * @param profilePicture {File}
   * @returns {Promise<void>}
   */
  static registerUser(email, password, username, birthDate, profilePicture) {
    let _user;
    return firebase.auth().createUserWithEmailAndPassword(email, password).then(({
      user
    }) => {
      _user = user;
      if (profilePicture) {
        const storageRef = firebase.storage().ref('users/' + user.uid + '/profilePicture/' + profilePicture.name);
        return storageRef.put(profilePicture).then((profilePictureUploadTask) => {
          return profilePictureUploadTask.ref.getDownloadURL();
        });
      } else {
        return firebase.storage().ref('users/default/profilePicture/abstract-user-flat-1.png').getDownloadURL();
      }
    }).then((downloadURL) => {
      return firebase.firestore().collection('user').doc(_user.uid).set({
        username,
        birthDate,
        profilePictureURL: downloadURL
      });
    }).then(() => undefined);
  }

  /**
   * Login in Cargonaut user
   * @param email {string}
   * @param password {string}
   * @returns {Promise<void>}
   */
  static loginUser(email, password) {
    return firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
      window.location.href = "dash.html";
    }, (error) => {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      Swal.fire({
        icon: 'error',
        title: 'Oops.. Something went wrong!',
        text: errorMessage,
        footer: 'Error Code: ' + errorCode
      });
    });
  }

  /**
   * Gets an Cargonaut user by id
   * @param id {string}
   * @returns {Promise<object>}
   */
  static getUserByID(id) {
    return firebase.firestore().collection('user').doc(id).get()
      .then((doc) => doc.data());
  }

  /**
   * Gets Entries for a user
   * @param userID {string}
   * @returns {Promise<Array<{id: string, data: object}>>}
   */
  static getEntriesForUser(userID) {
    return this._getXForUser("entry", "creator", userID);
  }

  /**
   * Gets Vehicles for a user
   * @param userID {string}
   * @returns {Promise<Array<{id: string, data: object}>>}
   */
  static getVehiclesForUser(userID) {
    return this._getXForUser("vehicle", "owner", userID);
  }

  /**
   * Gets Reviews for a user
   * @param userID {string}
   * @returns {Promise<Array<{id: string, data: object}>>}
   */
  static getReviewsForUser(userID) {
    return this._getXForUser("review", "for", userID);
  }

  /**
   * Gets Entries from a user
   * @param userID {string}
   * @returns {Promise<Array<{id: string, data: object}>>}
   */
  static getReviewsFromUser(userID) {
    return this._getXForUser("review", "from", userID);
  }

  /**
   * Gets Offers from and to a user
   * @param userID {string}
   * @returns {Promise<Array<{id: string, data: object}>>}
   */
  static getOffersForUser(userID) {
    return Promise.all([this._getXForUser("offer", "createdBy", userID),
      this._getXForUser("offer", "createdFor", userID)
    ]).then((offers) => {
      return offers.flat();
    });
  }

  /**
   * Create a new cargonaut entry
   * @param type {string} - Possible values: drive, driveRequest
   * @param fromCity {string}
   * @param toCity {string}
   * @param departureTime {Date}
   * @param arrivalTime {Date}
   * @param price {number}
   * @param vehicleID {string}
   * @param creatorID {string}
   * @returns {Promise<object>}
   */
  static createEntry(type, fromCity, toCity, departureTime, arrivalTime, price, vehicleID, creatorID) {
    const vehicle = firebase.firestore().collection('vehicle').doc(vehicleID);
    const creator = firebase.firestore().collection('user').doc(creatorID);
    return firebase.firestore().collection('entry').add({
      type,
      fromCity,
      toCity,
      departureTime,
      arrivalTime,
      price,
      vehicle,
      creator,
    });
  }

  /**
   * Creates a new Vehicle
   * @param name {string}
   * @param ownerID {string}
   * @param type {string}
   * @param maxCargoDepth {number}
   * @param maxCargoHeight {number}
   * @param maxCargoWidth {number}
   * @param maxCargoWeight {number}
   * @return {Promise<object>}
   */
  static createVehicle(name, ownerID, type, maxCargoDepth, maxCargoHeight, maxCargoWidth, maxCargoWeight) {
    const owner = firebase.firestore().collection('user').doc(ownerID);
    return firebase.firestore().collection('vehicle').add({
      name,
      owner,
      type,
      maxCargoDepth,
      maxCargoHeight,
      maxCargoWidth,
      maxCargoWeight,
    });
  }

  /**
   * Creates a new offer
   * @param driveID {string}
   * @param requestID {string}
   * @param creatorID {string}
   * @param createForID {string}
   * @param price {number}
   * @returns {Promise<object>}
   */
  static createOffer(driveID, requestID, creatorID, createForID, price) {
    const drive = firebase.firestore().collection('entry').doc(driveID);
    const request = firebase.firestore().collection('entry').doc(requestID);
    const creator = firebase.firestore().collection('user').doc(creatorID);
    const createFor = firebase.firestore().collection('user').doc(createForID);
    return firebase.firestore().collection('offer').add({
      drive,
      request,
      creator,
      createFor,
      price,
    });
  }

  /**
   * Creates a new review
   * @param reviewedID {string}
   * @param reviewerID {string}
   * @param review {string}
   * @param stars {number}
   */
  static createReview(reviewedID, reviewerID, review, stars) {
    const reviewed = firebase.firestore().collection('user').doc(reviewedID);
    const reviewer = firebase.firestore().collection('user').doc(reviewerID);
    return firebase.firestore().collection('review').add({
      reviewed,
      reviewer,
      review,
      stars,
    });
  }

  /**
   * Internal method for user queries on x
   * @param x <string>
   * @param userFieldName <string>
   * @param userID <string>
   * @returns {Promise<Array<{id: string, data: object}>>}
   * @private
   */
  static _getXForUser(x, userFieldName, userID) {
    const userRef = firebase.firestore().collection('user').doc(userID);
    return firebase.firestore().collection(x).where(userFieldName, "==", userRef).get()
        .then((snapshot) => snapshot.docs.map((doc) => {
              return {id: doc.id, data: doc.data()};
            })
        );
  }

  static createMessage(name, email, subject, message) {
   // const messageCreator = firebase.firestore().collection('user').doc(UserID);
    return firebase.firestore().collection('contactData').add({
      name: name,
      email: email,
      subject: subject,
      message: message
    })
        .then(function () {
      console.log("Data sent");

    })
        .catch(function (error) {
          console.log(error);
        });

  }
  static changeUserPassword(newPassword){
    //var user = firebase.auth().currentUser;
    firebase.auth().onAuthStateChanged(function (user){
      if(user){
        user.updatePassword(newPassword).then(function() {
          console.log("Passwrod updated successfully");
          //window.alert("Passwrod updated successfully");
          window.open("dash.html", "_self");
        }).catch(function(error) {
          console.log(error);
        });
      }
    });
  }

  static deleteUserAccount(){
    firebase.auth().onAuthStateChanged(function (user){
      if(user){
        user.delete().then(function() {
          console.log("User account deleted successfully");
        }).catch(function(error) {
          console.log(error);
        });
      }
    });
  }

  static loadUserName(){
let currentUser;
let userName;
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        currentUser = FirebaseIntegration.getUserByID(user.uid);
        currentUser.then(function (x) {
          userName = x.username;
          document.getElementById("userName1").innerHTML = userName;
          document.getElementById("userName2").innerHTML = userName;
          var dateOfBirth = new Date(x.birthDate);
          var today = new Date();
          var diff = today.getUTCFullYear() - dateOfBirth.getUTCFullYear();
          document.getElementById("age").innerHTML = diff;
        });
        FirebaseIntegration.getEntriesForUser(user.uid).then(
            (drives) => {
              document.getElementById("executedDrives").innerHTML = drives.length;
            }
        );
      }
    });
  }
    /**
     * Internal method for deleting a document of a specific user
     * @param x <string>
     * @param collection <string>
     * @param userFieldName <string>
     * @param userID <string>
     * @returns boolean
     * @private
     */
  static deleteXFromUser(x, collection, userFieldName, userID) {

    const userRef = firebase.firestore().collection('user').doc(userID);
    firebase.firestore().collection(collection).doc(x).delete().then(function () {
      console.log("Document successfully deleted!");
      return true;
    }).catch(function (error) {
      console.error("Error removing document: ", error);
      return false;
    });
  }

}