describe('Login - quick test case (username and password, but no elements check)', () => {

  // --------------------------- Welcome Screen ---------------------------

  it('Welcome Screen - should have button "Log In"', async () => {
    // await waitFor(element(by.text('Log In'))).toBeVisible().withTimeout(5000);
    await expect(element(by.label('Log In'))).toBeVisible();
  });


  it('Welcome Screen - should be able to go to Login Screen', async () => {
    await element(by.label('Log In')).tap();
    await waitFor(element(by.id('login.email'))).toBeVisible().withTimeout(5000);
  });


  // --------------------------- Login Screen ---------------------------

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

}); // describe
