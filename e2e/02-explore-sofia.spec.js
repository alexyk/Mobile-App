describe('Explore Sofia - loc price websocket test', () => {

  before(async () => {
   
  });

  beforeEach(async () => {

  });

  // running tests
  
  it('Explore Screen - should have a "Discover" label.', async () => {
    // await waitFor(element(by.text('Discover'))).toBeVisible().withTimeout(10000);
    await expect(element(by.text('Discover'))).toBeVisible();
  });

  it('Explore Screen - should have a search text field', async () => {
    // await waitFor(element(by.id('date_guests_picker.search_button'))).toBeVisible().withTimeout(10000);
    await expect(element(by.id('date_guests_picker.search_button'))).toBeVisible();
  });  

  // searchbar.left-button

  it('Explore Screen - search for "Sofia, Bulgaria"', async () => {
    // await waitFor(element(by.id('searchbar.text-input'))).toBeVisible().withTimeout(10000);
    await expect(element(by.id('searchbar.text-input'))).toBeVisible();
    await element(by.id('searchbar.text-input')).tap();
    await element(by.id('searchbar.text-input')).typeText('Sofia, Bulgar');
    
    //await waitFor(element(by.id('explore.auto-complete'))).toBeVisible().withTimeout(5000);
  });
  
  it('Explore Screen - choose "Sofia, Bulgaria"', async () => {
    //await element(by.text('Sofia, Bulgaria')).tap();
    // await element(by.id('date_guests_picker.search_button')).tap()
    await element(by.id('Sofia__Bulgaria')).tap();
    await element(by.id('Sofia__Bulgaria')).tap();
    await expect(element(by.id('searchbar.text-input'))).toHaveText('Sofia, Bulgaria');
  });

  xit('Explore Screen - see results for "Sofia, Bulgaria"', async () => {
    await expect(element(by.id('date_guests_picker.search_button'))).toBeVisible();
    await expect(element(by.id('hotel_item_0'))).toBeVisible();
    // await waitFor(element(by.id('hotel_item_0'))).toBeVisible().withTimeout(5000);
    await element(by.id('hotel_item_0')).tap();
    await expect(element(by.id('searchbar.text-input'))).toHaveText('');
  });

  xit('Explore Screen - should be able to choose a hotel', async () => {
    await element(by.id('hotel_item_0')).tap()
    done();
  });

  xit('Explore Screen - should be able to search hotel Marinela', async () => {
    await expect(element(by.id('searchbar.text-input'))).toBeVisible();

  });

});
