/**
 * A class Handling the Firebase integration for Cargonaut
 */
class FirebaseIntegration {

  /**
   * Creates a new Firebase Integration Object
   * @param projectID {string}
   * @param apiKey {string}
   * @param sendID {string}
   * @param appID {string}
   * @param measurementID {string}
   */
  constructor(projectID, apiKey, sendID, appID, measurementID) {
    this.firebaseConfig = {
      apiKey: apiKey,
      authDomain: `${projectID}.firebaseapp.com`,
      databaseURL: `https://${projectID}.firebaseio.com`,
      projectId: projectID,
      storageBucket: `${projectID}.appspot.com`,
      messagingSenderId: sendID,
      appId: appID,
      measurementId: measurementID,
    };
  }

  init() {
    return firebase.initializeApp(this.firebaseConfig);
  }

  /**
   * Registers a Cargonaut user in firebase
   * @param email {string}
   * @param password {string}
   * @param username {string}
   * @param birthDate {Date}
   * @param profilePicture {File}
   * @returns {Promise<void>}
   */
  registerUser(email, password, username, birthDate, profilePicture) {
    let _user;
    return firebase.auth().createUserWithEmailAndPassword(email, password).then(({user}) => {
      _user = user;
      const storageRef = firebase.storage().ref(user.uid + '/profilePicture/' + profilePicture.name);
      return storageRef.put(profilePicture);
    }).then((profilePictureUploadTask) => {
      return profilePictureUploadTask.ref.getDownloadURL();
    }).then((downloadURL) => {
      return firebase.firestore().collection('user').doc(_user.uid).set({username, birthDate, profilePictureURL: downloadURL});
    }).then(() => undefined);
  }

  /**
   * Login in Cargonaut user
   * @param email {string}
   * @param password {string}
   * @returns {Promise<void>}
   */
  loginUser(email, password) {
    return firebase.auth().signInWithEmailAndPassword(email, password).then(() => undefined);
  }

  /**
   * Gets an Cargonaut user by id
   * @param id {string}
   * @returns {Promise<object>}
   */
  getUserByID(id) {
    return firebase.firestore().collection('user').doc(id).get()
    .then((doc) => doc.data());
  }

  /**
   * Gets Entries for a user
   * @param userID {string}
   * @returns {Promise<Array<{id: string, data: object}>>}
   */
  getEntriesForUser(userID) {
    return this._getXForUser("entry", "creator", userID);
  }
  /**
   * Gets Vehicles for a user
   * @param userID {string}
   * @returns {Promise<Array<{id: string, data: object}>>}
   */
  getVehiclesForUser(userID) {
    return this._getXForUser("vehicle", "owner", userID);
  }
  /**
   * Gets Reviews for a user
   * @param userID {string}
   * @returns {Promise<Array<{id: string, data: object}>>}
   */
  getReviewsForUser(userID) {
    return this._getXForUser("review", "for", userID);
  }
  /**
   * Gets Entries from a user
   * @param userID {string}
   * @returns {Promise<Array<{id: string, data: object}>>}
   */
  getReviewsFromUser(userID) {
    return this._getXForUser("review", "from", userID);
  }
  /**
   * Gets Offers from and to a user
   * @param userID {string}
   * @returns {Promise<Array<{id: string, data: object}>>}
   */
  getOffersForUser(userID) {
    return Promise.all([this._getXForUser("offer", "createdBy", userID),
      this._getXForUser("offer", "createdFor", userID)]).then((offers) => {
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
  createEntry(type, fromCity, toCity, departureTime, arrivalTime, price, vehicleID, creatorID) {
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
  createVehicle(name, ownerID, type, maxCargoDepth, maxCargoHeight, maxCargoWidth, maxCargoWeight) {
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
  createOffer(driveID, requestID, creatorID, createForID, price) {
    const drive = firebase.firestore().collection('entry').doc(driveID);
    const request = firebase.firestore().collection('entry').doc(requestID);
    const creator = firebase.firestore().collection('user').doc(creatorID);
    const createFor = firebase.firestore().collection('user').doc(createForID);
    return firebase.firestore().collection('offer').add({
      drive,
      request,
      creator,
      createFor,
      prive,
    });
  }

  /**
   * Creates a new review
   * @param reviewedID {string}
   * @param reviewerID {string}
   * @param review {string}
   * @param stars {number}
   */
  createReview(reviewedID, reviewerID, review, stars) {
    const reviewed = firebase.firestore().collection('user').doc(reviewedID);
    const reviewer = firebase.firestore().collection('user').doc(reviewerID);
    return firebase.firestore().collection('review').add({
      reviewed,
      reviewer,
      review,
      stars,
    })
  }

  /**
   * Internal method for user queries on x
   * @param x <string>
   * @param userFieldName <string>
   * @param userID <string>
   * @returns {Promise<Array<{id: string, data: object}>>}
   * @private
   */
  _getXForUser(x, userFieldName, userID) {
    const userRef = firebase.firestore().collection('user').doc(userID);
    return firebase.firestore().collection(x).where(userFieldName, "==", userRef).get()
      .then((snapshot) => snapshot.docs.map((doc) => {
        return {id: doc.id, data: doc.data()}
      })
    );
  }
}
