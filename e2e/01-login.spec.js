describe('Login - normal use case (username and password)', () => {

  before(async () => {
    // make  sure previously logged in state is cleared
    // if (element(by.text('Welcome')).toBeVisible()) {
      // TODO: (new quick version) If logged in instead of app reset do a profile logout (if, of course, this is faster)
    //}
    
    // old version
    await device.launchApp({delete: true});
  });

  beforeEach(async () => {
    // TODO: In what case is this needed?
    // await device.reloadReactNative();
  });


  // xit() / it.skip() ... tests are skipped
  // it.only() / describe.only() - only the first such test will be run


  // Running tests:

  // --------------------------- Welcome Screen ---------------------------

  it('Welcome Screen - should have label "Welcome"', async () => {
    await waitFor(element(by.text('Log In'))).toBeVisible().withTimeout(5000);
    await expect(element(by.text('Welcome'))).toBeVisible();
  });

  it('Welcome Screen - should have button "Log In"', async () => {
    // await waitFor(element(by.text('Log In'))).toBeVisible().withTimeout(5000);
    await expect(element(by.label('Log In'))).toBeVisible();
  });

  it('Welcome Screen - should have button "Continue with Facebook"', async () => {
    // await waitFor(element(by.text('Log In'))).toBeVisible().withTimeout(5000);
    await expect(element(by.label('Continue with Facebook'))).toBeVisible();
  });

  it('Welcome Screen - should have label "Create an Account"', async () => {
    // await waitFor(element(by.text('Log In'))).toBeVisible().withTimeout(5000);
    await expect(element(by.label('Create an Account'))).toBeVisible();
  });


  it('Welcome Screen - should be able to go to Login Screen', async () => {
    await element(by.label('Log In')).tap();
    await waitFor(element(by.id('login.email'))).toBeVisible().withTimeout(5000);
  });


  // --------------------------- Login Screen ---------------------------

  it('Login Screen - should have "Login" label', async () => {
    await expect(element(by.text('Login'))).toBeVisible();
  });

  it('Login Screen - should have email text field', async () => {
    await expect(element(by.id('login.email'))).toBeVisible();
  });

  it('Login Screen - should have password text field', async () => {
    await expect(element(by.id('login.password'))).toBeVisible();
  });

  it('Login Screen - should have "Log In" button', async () => {
    await expect(element(by.id('login.login_button'))).toBeVisible();
  });

  it('Login Screen - should be able to type a username - MAKE SURE TO DISABLE HARDWARE KEYBOARD ON THE SIMULATOR (CMD+K)', async () => {
    const user = '';
    await element(by.id('login.email')).tap();
    await element(by.id('login.email')).typeText(user);
    await expect(element(by.text(user))).toBeVisible()
  });

  it('Login Screen - should be able to type in a password', async () => {
    const pass = '';
    await element(by.id('login.password')).tap();
    await element(by.id('login.password')).typeText(pass);
    await expect(element(by.text(pass))).toBeVisible();
  });

  it('Login Screen - should be able to log in with a username and a password', async () => {
    await element(by.id('login.login_button')).tap();
    await waitFor(element(by.id('date_guests_picker.search_button'))).toBeVisible().withTimeout(10000); // Expore Screen
  });
  

  // --------------------------- Expore Screen ---------------------------

  xit('Expore Screen - have search button and search field', async () => {
    await element(by.id('login.login_button')).tap();
    await waitFor(element(by.id('date_guests_picker.search_button'))).toBeVisible().withTimeout(1000); 
  });



  // --------------------------- Other ---------------------------
  // skipped draft tests
  xit('console log tests', async () => {
    console.debug('Elements describe', element.describe)
    console.log(device)
  });

}); // describe
