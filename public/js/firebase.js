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
   * @returns {Promise<{user: object, doc: object}>}
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
   * @returns {Promise<object>}
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
      })
    });
  }

  /**
   * Gets an Cargonaut user by id
   * @param id {string}
   * @returns {Promise<{id: string, data: object}>}
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
    return this._getXForUser("review", "reviewed", userID);
  }

  /**
   * Gets Rewies from a user
   * @param userID {string}
   * @returns {Promise<Array<{id: string, data: object}>>}
   */
  static getReviewsFromUser(userID) {
    return this._getXForUser("review", "reviewer", userID);
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
    const vehicle = firebase.firestore().collection(this.testify('vehicle')).doc(vehicleID);
    const creator = firebase.firestore().collection(this.testify('user')).doc(creatorID);
    return firebase.firestore().collection(this.testify('entry')).add({
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
    const owner = firebase.firestore().collection(this.testify('user')).doc(ownerID);
    return firebase.firestore().collection(this.testify('vehicle')).add({
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
    const drive = firebase.firestore().collection(this.testify('entry')).doc(driveID);
    const request = firebase.firestore().collection(this.testify('entry')).doc(requestID);
    const creator = firebase.firestore().collection(this.testify('user')).doc(creatorID);
    const createdFor = firebase.firestore().collection(this.testify('user')).doc(createForID);
    return firebase.firestore().collection(this.testify('offer')).add({
      drive,
      request,
      creator,
      createdFor,
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
    const reviewed = firebase.firestore().collection(this.testify('user')).doc(reviewedID);
    const reviewer = firebase.firestore().collection(this.testify('user')).doc(reviewerID);
    return firebase.firestore().collection(this.testify('review')).add({
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
    x = this.testify(x);
    const userRef = firebase.firestore().collection(this.testify('user')).doc(userID);
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
    var user = firebase.auth().currentUser;
    user.updatePassword(newPassword).then(function() {
      console.log("Passwrod updated successfully");
    }).catch(function(error) {
      console.log(error);
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

  /**
   * Appends 'testing/' to inp if testing is enabled
   * @param inp {string}
   * @returns {string}
   */
  static testify(inp) {
    if (this.testing) {
      return 'testing/data/' + inp;
    }
    return inp;
  }

  /**
   * Enables the testing mode
   * @private
   */
  static _enableTesting() {
    this.testing = true;
  }
}