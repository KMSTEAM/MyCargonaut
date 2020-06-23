const should = chai.should();

describe('#registerUser()', function() {
  this.timeout(10000);
  it('creates a new user', async function()  {
    await FirebaseIntegration.registerUser(
        "test@example.org", "123456", "test",
        new Date(2020, 5, 23, 15, 28),
        new File([], "picture.jpg"));
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
  it('creates a new user without profile picture', async function()  {
    await FirebaseIntegration.registerUser(
        "test2@example.org", "123456", "test2",
        new Date(2020, 5, 23, 15, 28));
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

  after(async function() {
    await FirebaseIntegration.loginUser("test@example.org", "123456");
    await firebase.auth().currentUser.delete();
    await FirebaseIntegration.loginUser("test2@example.org", "123456");
    await firebase.auth().currentUser.delete();
  });
  afterEach(async function() {
    await firebase.auth().signOut();
  });
});

describe('#loginUser()', function() {
  this.timeout(10000);
  before(async function() {
    await FirebaseIntegration.registerUser(
        "test@example.org", "123456", "test",
        new Date(2020, 5, 23, 15, 28),
        new File([], "picture.jpg"));
  });

  it('logins in a user with valid email and password', async function()  {
    await FirebaseIntegration.loginUser("test@example.org", "123456");
  });
  it('throws with invalid email', async function()  {
    try {
      await FirebaseIntegration.loginUser("wrong@example.org", "123456");
    } catch (e) {
      return;
    }
    throw new Error('Does not throw if email is inbalid');
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

  after(async function() {
    await FirebaseIntegration.loginUser("test@example.org", "123456");
    await firebase.auth().currentUser.delete();
  });
  afterEach(async function() {
    await firebase.auth().signOut();
  });
});

describe('#getUserByID()', function() {
  this.timeout(10000);
  before(async function() {
    await FirebaseIntegration.registerUser(
        "test@example.org", "123456", "test",
        new Date(2020, 5, 23, 15, 28),
        new File([], "picture.jpg"));
  });

  it('gets an user by id if the user exists', async function() {
    const user = await FirebaseIntegration.getUserByID(firebase.auth().currentUser.uid);
    should.exist(user);
  });
  it('returns undefined if user does not exist', async function() {
    const user = await FirebaseIntegration.getUserByID('1er84JwYh7QIMJhght9lfOnJvc24');
    should.not.exist(user);
  });

  after(async function() {
    await firebase.auth().currentUser.delete();
  });
});
