import { Selector } from 'testcafe';

class ExamplePage {
    constructor() {
        this.header = Selector('h1');
        this.nameInput = Selector('#developer-name');
        this.submitButton = Selector('#submit-button');
        this.resultHeader = Selector('#article-header');
    }

    async submitForm(t, name) {
        await t
            .typeText(this.nameInput, name)
            .click(this.submitButton);
    }
}

export default new ExamplePage();