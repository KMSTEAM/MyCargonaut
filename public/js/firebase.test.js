if (typeof require !== 'undefined') {
  FirebaseIntegration = require('./firebase.js');
  chai = require('chai');
}

const should = chai.should();

FirebaseIntegration._enableTesting();

let user, user2, userDoc, user2Doc;

describe('#registerUser()', function() {
  this.timeout(10000);
  it('creates a new user', async function()  {
    const _user = await FirebaseIntegration.registerUser(
        "test@example.org", "123456", "test",
        new Date(2020, 5, 23, 15, 28));
    user = _user.user;
    userDoc = _user.doc;
  });
  it('throws if the user already exists', async function()  {
    try {
      await FirebaseIntegration.registerUser(
          "test@example.org", "123456", "test",
          new Date(2020, 5, 23, 15, 28),
          new File([], "picture.jpg"));
    } catch (e) {
      return;
    }
    throw new Error('Does not throw if user already exists');
  });
  it('creates another user', async function()  {
     _user2 = await FirebaseIntegration.registerUser(
        "test2@example.org", "123456", "test2",
        new Date(2020, 5, 23, 15, 28));
     user2 = _user2.user;
     user2Doc = _user2.doc;
  });
  it('throw if password is to short', async function()  {
    try {
      await FirebaseIntegration.registerUser(
          "test3@example.org", "1234", "test",
          new Date(2020, 5, 23, 15, 28),
          new File([], "picture.jpg"));
    } catch (e) {
      return;
    }
    throw new Error('Does not throw if password is to short');
  });

  afterEach(async function() {
    await firebase.auth().signOut();
  });
});

describe('#loginUser()', function() {
  this.timeout(10000);

  it('logins in a user with valid email and password', async function()  {
    await FirebaseIntegration.loginUser("test@example.org", "123456");
  });
  it('throws with invalid email', async function()  {
    try {
      await FirebaseIntegration.loginUser("wrong@example.org", "123456");
    } catch (e) {
      return;
    }
    throw new Error('Does not throw if email is invalid');
  });
  it('throws with invalid password', async function()  {
    try {
      await FirebaseIntegration.loginUser("test@example.org", "098765");
    } catch (e) {
      return;
    }
    throw new Error('Does not throw if password is invalid');
  });
  it('throws with invalid email and password', async function()  {
    try {
      await FirebaseIntegration.loginUser("wrong@example.org", "098765");
    } catch (e) {
      return;
    }
    throw new Error('Does not throw if email and password are invalid');
  });
});

describe('#getUserByID()', function() {
  this.timeout(10000);

  it('gets an user by id if the user exists', async function() {
    const userByID = await FirebaseIntegration.getUserByID(user.uid);
    should.exist(userByID);
  });
  it('returns undefined if user does not exist', async function() {
    const userByID = await FirebaseIntegration.getUserByID('1er84JwYh7QIMJhght9lfOnJvc24');
    should.not.exist(userByID);
  });
});

let vehicle;

describe('#createVehicle()', function() {
  this.timeout(10000);

  it('creates a vehicle', async function() {
    vehicle = await FirebaseIntegration.createVehicle("mycar", user.uid,
        'car', 'a small car', 2, 2, 2, 2, 4);
    should.exist(vehicle);
  });
});

let drive, request;

describe('#createEntry()', function() {
  this.timeout(10000);

  it('creates an drive entry', async function() {
    console.log(user.uid);
    drive = await FirebaseIntegration.createEntry("drive", "Marburg",
        "Gießen", new Date(), new Date(), 15, 4,
        'driving from Marburg to Gießen', null, vehicle.id, user.uid);
  });
  it('creates an request entry', async function() {
    request = await FirebaseIntegration.createEntry("request",
        "Marburg", "Gießen", new Date(), new Date(),
        10, -1, 'looking for drive from Marburg to Gießen',
        [] , null, user2.uid);
  });
});

let offer;

describe('#createOffer()', function() {
  this.timeout(10000);

  it('creates an offer', async function() {
    offer = await FirebaseIntegration.createOffer(drive.id, request.id, user2.uid, user.uid, 10);
  });
});

let review;

describe('#createReview()', function() {
  this.timeout(10000);

  it('creates a review', async function() {
    review = await FirebaseIntegration.createReview(user.uid, user2.uid, "Top", 5);
  });
});

describe('#getVehiclesForUser()', function() {
  this.timeout(10000);

  it('lists vehicles for the user', async function() {
    const vehicles = await FirebaseIntegration.getVehiclesForUser(user.uid);
    vehicles.should.have.lengthOf(1);
  });
  it('does not list vehicles for other users', async function() {
    const vehicles = await FirebaseIntegration.getVehiclesForUser(user2.uid);
    vehicles.should.have.lengthOf(0);
  });
});

describe('#getEntriesForUser()', function() {
  this.timeout(10000);

  it('lists entries for the user', async function() {
    const entries = await FirebaseIntegration.getEntriesForUser(user.uid);
    entries.should.have.lengthOf(1);
  });
  it('list entries for other users', async function() {
    const entries = await FirebaseIntegration.getEntriesForUser(user2.uid);
    entries.should.have.lengthOf(1);
  });
});

describe('#getOffersForUser()', function() {
  this.timeout(10000);

  it('lists offers for the user', async function() {
    const offers = await FirebaseIntegration.getOffersForUser(user.uid);
    offers.should.have.lengthOf(1);
  });
  it('lists offers from the user', async function() {
    const offers = await FirebaseIntegration.getOffersForUser(user2.uid);
    offers.should.have.lengthOf(1);
  });
});

describe('#getReviewsForUser()', function() {
  this.timeout(10000);

  it('lists reviews for the user', async function() {
    const reviews = await FirebaseIntegration.getReviewsForUser(user.uid);
    reviews.should.have.lengthOf(1);
  });
  it('does not list reviews for other users', async function() {
    const reviews = await FirebaseIntegration.getReviewsForUser(user2.uid);
    reviews.should.have.lengthOf(0);
  });
});

describe('#getReviewsFromUser()', function() {
  this.timeout(10000);

  it('does not list reviews from other users', async function() {
    const reviews = await FirebaseIntegration.getReviewsFromUser(user.uid);
    reviews.should.have.lengthOf(0);
  });
  it('lists reviews from the user', async function() {
    const reviews = await FirebaseIntegration.getReviewsFromUser(user2.uid);
    reviews.should.have.lengthOf(1);
  });
});

before(async function() {
  this.timeout(10000);

  try {
    const {user} = await FirebaseIntegration.loginUser("test@example.org", "123456");
    const {id} = await FirebaseIntegration.getUserByID(user.uid);
    const userDoc = firebase.firestore().collection(FirebaseIntegration.testify('user')).doc(id);
    await Promise.all([user.delete(), userDoc.delete()]);
  } catch (e) {console.error(e);}
  try {
    const {user} = await FirebaseIntegration.loginUser("test2@example.org", "123456");
    const {id} = await FirebaseIntegration.getUserByID(user.uid);
    const userDoc = firebase.firestore().collection(FirebaseIntegration.testify('user')).doc(id);
    await Promise.all([user.delete(), userDoc.delete()]);
  } catch (e) {console.error(e);}
});

after(async function() {
  this.timeout(10000);

  const docs = [user, user2, userDoc, user2Doc, vehicle, drive, request, offer, review];
  await Promise.all(docs.map(doc => doc.delete()));
});
