describe('Login - quick test case (username and password, but no elements check)', () => {

  it('NabBar should be visible', async () => {
    await expect(element(by.id('navbar.profile'))).toBeVisible();
  });


  it('Profile Screen - should have "Log Out" button', async () => {
    await element(by.id('navbar.profile')).tap();
    await expect(element(by.id('profile.logout'))).toBeVisible();
  });

  it('Profile Screen - should be able to logout', async () => {
    await element(by.id('profile.logout')).tap();
    await waitFor(element(by.text('Log In'))).toBeVisible().withTimeout(5000);
  });

}); // describe
