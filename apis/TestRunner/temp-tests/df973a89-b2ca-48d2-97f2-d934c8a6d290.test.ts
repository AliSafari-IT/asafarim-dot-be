import { Selector } from 'testcafe';

fixture('test-login-with-script')
  .page('https://identity.asafarim.be/login');

test('test-login-with-script', async t => {
    // Enter wrong email
  await t
    .typeText('#email', 'ali@wrongemail.com', { replace: true })
    .typeText('#password', 'wrongpass', { replace: true })
    .click('#root > div.login-page > section > div.hero-container > div > div.hero-media > div > div > div > form > button')
    // Verify error message
    .expect(Selector('#root > div.login-page > section > div.hero-container > div > div.hero-media > div > div > div > form > div.message.message-error > div > p')
      .innerText)
    .eql('Email Not Found');
});