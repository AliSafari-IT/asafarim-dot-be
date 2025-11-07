import { Selector } from 'testcafe';

fixture('test-login-with-steps')
  .page('https://identity.asafarim.be/login');

test('test-login-with-steps', async t => {
    await t.typeText(Selector('#email'), 'ali@asafarim.com');
    await t.typeText(Selector('#password'), 'Ali+123456/');
    await t.click(Selector('#root > div.login-page > section > div.hero-container > div > div.hero-media > div > div > div > form > button'));
    await t.expect(Selector('#root > div.login-page > section > div.hero-container > div > div.hero-media > div > div > div > form > div.message.message-error > div > p').innerText).eql('Incorrect Password')
});