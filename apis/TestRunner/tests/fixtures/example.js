import { Selector } from 'testcafe';
import { url, selectors } from '../config';

fixture('Example Tests')
    .page(url);

test('Check page title', async t => {
    await t
        .expect(Selector('h1').innerText)
        .eql('Example');
});

test('Fill out form', async t => {
    await t
        .typeText('#developer-name', 'John Doe')
        .click('#submit-button')
        .expect(Selector('#article-header').innerText)
        .eql('Thank you, John Doe!');
});