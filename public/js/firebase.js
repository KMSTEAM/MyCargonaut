if (typeof require !== 'undefined') {
  firebase = require('firebase');
}

if (typeof process !== 'undefined') {
  if (process.env.FIREBASE_CONF !== undefined) {
    const confJSON = Buffer.from(process.env.FIREBASE_CONF, 'base64').toString();
    const conf = JSON.parse(confJSON);
    firebase.initializeApp(conf);
  }
}

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
    return firebase.auth().
        createUserWithEmailAndPassword(email, password)
        .then(({
          user,
        }) => {
          _user = user;
          if (profilePicture) {
            const storageRef = firebase.storage().
                ref('users/' + user.uid + '/profilePicture/' +
                    profilePicture.name);
            return storageRef.put(profilePicture).
                then((profilePictureUploadTask) => {
                  return profilePictureUploadTask.ref.getDownloadURL();
                });
          } else {
            return Promise.resolve(
                "https://firebasestorage.googleapis.com/v0/b/" +
                "mycargonaut-b6f0d.appspot.com/o/users%2Fdefault" +
                "%2FprofilePicture%2Fabstract-user-flat-1.png" +
                "?alt=media&token=814ddce4-cea9-4150-a2a2-9f634e6ebe13");
          }
        })
        .then((downloadURL) => {
          const docRef = firebase.firestore().
              collection(this.testify('user')).
              doc(_user.uid);
          return docRef.set({
            username,
            birthDate,
            profilePictureURL: downloadURL,
          }).then(() => docRef);
        }).
        then((userDoc) => {
          return {user: _user, doc: userDoc};
        });
  }

  /**
   * Login in Cargonaut user
   * @param email {string}
   * @param password {string}
   * @returns {Promise<object>}
   */
  static loginUser(email, password) {
    return firebase.auth().signInWithEmailAndPassword(email, password);
  }

  /**
   * Logout Cargonaut user
   * @returns {Promise<object>}
   */
  static logoutUser() {
    return firebase.auth().signOut();
  }

  /**
   * Gets an Cargonaut user by id
   * @param id {string}
   * @returns {Promise<{id: string, data: object}>}
   */
  static getUserByID(id) {
    return this._getXById('user', id);
  }

  /**
   * Gets an Cargonaut entry by id
   * @param id {string}
   * @returns {Promise<{id: string, data: object}>}
   */
  static getEntryByID(id) {
    return this._getXById('entry', id);
  }

  /**
   * Gets an Cargonaut offer by id
   * @param id {string}
   * @returns {Promise<{id: string, data: object}>}
   */
  static getOfferByID(id) {
    return this._getXById('offer', id);
  }

  /**
   * Gets an Cargonaut review by id
   * @param id {string}
   * @returns {Promise<{id: string, data: object}>}
   */
  static getReviewByID(id) {
    return this._getXById('review', id);
  }

  /**
   * Gets an Cargonaut vehicle by id
   * @param id {string}
   * @returns {Promise<{id: string, data: object}>}
   */
  static getVehicleById(id) {
    return this._getXById('vehicle', id);
  }

  /**
   * Gets Entries for a user
   * @param userID {string}
   * @returns {Promise<Array<{id: string, data: object}>>}
   */
  static getEntriesForUser(userID) {
    return this._getXForUser('entry', 'creator', userID);
  }

  /**
   * Gets Drive Entries for a user
   * @param userID {string}
   * @returns {Promise<Array<{id: string, data: object}>>}
   */
  static getDriveEntriesForUser(userID) {
    return this.getEntriesForUser(userID)
      .then((entries) => entries
        .filter(({data}) => data.type === 'drive'));
  }

  /**
   * Gets Vehicles for a user
   * @param userID {string}
   * @returns {Promise<Array<{id: string, data: object}>>}
   */
  static getVehiclesForUser(userID) {
    return this._getXForUser('vehicle', 'owner', userID);
  }

  /**
   * Gets Reviews for a user
   * @param userID {string}
   * @returns {Promise<Array<{id: string, data: object}>>}
   */
  static getReviewsForUser(userID) {
    return this._getXForUser('review', 'reviewed', userID);
  }

  /**
   * Gets Rewies from a user
   * @param userID {string}
   * @returns {Promise<Array<{id: string, data: object}>>}
   */
  static getReviewsFromUser(userID) {
    return this._getXForUser('review', 'reviewer', userID);
  }

  /**
   * Gets Offers from and to a user
   * @param userID {string}
   * @returns {Promise<Array<{id: string, data: object}>>}
   */
  static getOffersForUser(userID) {
    return Promise.all([
      this._getXForUser('offer', 'creator', userID),
      this._getXForUser('offer', 'createdFor', userID),
    ]).then((offers) => {
      return offers.flat();
    });
  }

  /**
   * Gets Requests from a user
   * @param userID {string}
   * @returns {Promise<Array<{id: string, data: object}>>}
   */
  static getRequestsForUser(userID) {
    return Promise.all([
      this._getXForUser('entry', 'creator', userID)
    ]).then((entries) => {
      const requests = entries[0].filter(entry => entry.data.type == 'request');
      return requests;
    });
  }

  /**
   * List all futures Drives
   * @returns {Promise<Array<{id: string, data: object}>>}
   */
  static getDrivesList() {
    return firebase.firestore().
    collection(x).
    where('departureTime', '>', new Date()).
    get().
    then((snapshot) => snapshot.docs.map((doc) => {
      return {
        id: doc.id,
        data: doc.data()
      };
    }));
  }

  /**
   * List all open offers of the User
   * @returns {Promise<Array<{id: string, data: object}>>}
   */
  static getAllMyOpenOffers(userID) {
    return this.getOffersForUser(userID).
    then((offers) => offers.filter((offer) => {
      return !['rejected', 'paid'].includes(offer.data.state);
    }));
  }

  /**
   * Create a new cargonaut entry
   * @param type {string} - Possible values: drive, driveRequest
   * @param fromCity {string}
   * @param toCity {string}
   * @param departureTime {Date}
   * @param arrivalTime {Date}
   * @param price {number}
   * @param seats {number}
   * @param description {string}
   * @param vehicleID {string}
   * @param creatorID {string}
   * @param cargo {Array<{height: number, width: number, depth: number, weight: number, description: string}> | null}
   * @returns {Promise<object>}
   */
  static createEntry(
      type, fromCity, toCity, departureTime, arrivalTime, price, seats, description,
      cargo, vehicleID, creatorID) {
    let vehicle;

    if (vehicleID){
        vehicle = firebase.firestore()
        .collection(this.testify('vehicle'))
        .doc(vehicleID);
    } else {
        vehicle = -1;
    }

    const creator = firebase.firestore()
      .collection(this.testify('user')).doc(creatorID);
    return firebase.firestore().collection(this.testify('entry')).add({
      type,
      fromCity,
      toCity,
      departureTime,
      arrivalTime,
      price,
      seats,
      description,
      cargo,
      vehicle,
      creator,
    });
  }

  /**
   * Creates a new Vehicle
   * @param name {string}
   * @param ownerID {string}
   * @param type {string}
   * @param description {string}
   * @param maxCargoDepth {number}
   * @param maxCargoHeight {number}
   * @param maxCargoWidth {number}
   * @param maxCargoWeight {number}
   * @param maxSeats {number}
   * @return {Promise<object>}
   */
  static createVehicle(
      name, ownerID, type, description,
      maxCargoDepth, maxCargoHeight, maxCargoWidth,
      maxCargoWeight, maxSeats) {
    const owner = firebase.firestore().
    collection(this.testify('user')).
    doc(ownerID);
    return firebase.firestore().collection(this.testify('vehicle')).add({
      name,
      owner,
      type,
      description,
      maxCargoDepth,
      maxCargoHeight,
      maxCargoWidth,
      maxCargoWeight,
      maxSeats,
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
    const drive = firebase.firestore().
    collection(this.testify('entry')).
    doc(driveID);
    const request = firebase.firestore().
    collection(this.testify('entry')).
    doc(requestID);
    const creator = firebase.firestore().
    collection(this.testify('user')).
    doc(creatorID);
    const createdFor = firebase.firestore().
    collection(this.testify('user')).
    doc(createForID);
    const state = 'created';
    return firebase.firestore().collection(this.testify('offer')).add({
      drive,
      request,
      creator,
      createdFor,
      state,
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
    const reviewed = firebase.firestore().
    collection(this.testify('user')).
    doc(reviewedID);
    const reviewer = firebase.firestore().
    collection(this.testify('user')).
    doc(reviewerID);
    return firebase.firestore().collection(this.testify('review')).add({
      reviewed,
      reviewer,
      review,
      stars,
    });
  }

  /**
   * Updates an offers state
   * @param offerID {string}
   * @param newState {string}
   */
  static updateOfferState(offerID, newState) {
    return firebase.firestore().
    collection(this.testify('offer')).
    doc(offerID).
    update({
      state: newState
    });
  }

  /**
   * @param userID
   * @returns {Promise<Array<{id: string, data: object}>>}
   */
  static matchRequestAndDrives(userID) {
    const creator = firebase.firestore().
    collection(this.testify('user')).
    doc(userID);
    return firebase.firestore().
    collection(this.testify('entry')).
    where('type', '==', 'driveRequest').
    where('creator', '==', creator).
    where('departureTime', '>', new Date()).
    get().
    then((requests) => {
      return Promise.all(requests.docs.map((request) => {
        const {
          fromCity,
          toCity
        } = request.data();
        return firebase.firestore().
        collection(this.testify('entry')).
        where('type', '==', 'drive').
        where('departureTime', '>', new Date()).
        where('fromCity', '==', fromCity).
        where('toCity', '==', toCity).
        get();
      })).then((driveRefs) => {
        return driveRefs.flat().map((driveRef) => {
          return driveRef.docs.map((drive) => {
            return {
              id: drive.id,
              data: drive.data()
            };
          });
        }).flat();
      });
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
    const userRef = firebase.firestore().
    collection(this.testify('user')).
    doc(userID);
    return firebase.firestore().
        collection(x).
        where(userFieldName, '==', userRef).
        get().
        then((snapshot) => snapshot.docs.map((doc) => {
              return {id: doc.id, data: doc.data()};
        }));
  }

  /**
   * Internal method to get an firebase object by id
   * @param x <string>
   * @param id <string>
   * @returns {Promise<Array<{id: string, data: object}>>}
   * @private
   */
  static _getXById(x, id) {
    x = this.testify(x);
    const ref = firebase.firestore().collection(x).doc(id);
    return ref.get().then((doc) => {
      if (!doc.data()) {
        return undefined;
      }
      return {
        id: doc.id,
        data: doc.data()
      };
    });
  }


  static getXByRef(ref) {
    return ref.get().then((doc) => {
      if (!doc.data()) {
        return undefined;
      }
      return {
        id: doc.id,
        data: doc.data()
      };
    });
  }


  static createMessage(name, email, subject, message) {
    // const messageCreator = firebase.firestore().collection('user').doc(UserID);
    return firebase.firestore().collection('contactData').add({
      name: name,
      email: email,
      subject: subject,
      message: message,
    }).then(function () {
      console.log('Data sent');

    }).catch(function (error) {
      console.log(error);
    });

  }

  static changeUserPassword(newPassword) {
    var user = firebase.auth().currentUser;
    user.updatePassword(newPassword).then(function () {
      console.log('Passwrod updated successfully');
    }).catch(function (error) {
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
    firebase.firestore().
    collection(collection).
    doc(x).
    delete().
    then(function () {
      console.log('Document successfully deleted!');
      return true;
    }).
    catch(function (error) {
      console.error('Error removing document: ', error);
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

  static checkForRedirect() {
    firebase.auth().onAuthStateChanged(function (user) {
      if (!user) {
        window.location.href = 'index.html';
      }
    });
  }
}

if (typeof module !== 'undefined') {
  module.exports = FirebaseIntegration;
}
