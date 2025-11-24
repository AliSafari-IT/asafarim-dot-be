// login.test.ts
import { Selector, ClientFunction } from 'testcafe';
require('dotenv').config(); // <-- loads .env

// Environment variables
const TEST_EMAIL = process.env.TESTORA__EMAIL;
const TEST_PASSWORD = process.env.TESTORA__PASSWORD;
const TEST_ROLES = process.env.TESTORA__ROLES;
const TEST_USERNAME = process.env.TESTORA__USERNAME;
const TEST_PROJECTID = process.env.TESTORA__PROJECTID;
const TEST_PROJECTNAME = process.env.TESTORA__PROJECTNAME;
const TEST_API_KEY = process.env.TESTORA__API_KEY;
const TEST_API_SECRET = process.env.TESTORA__API_SECRET;
const TEST_API_URL = process.env.TESTORA__API_URL;

const authIndicator = Selector('.auth-status-indicator.auth-status-authenticated');
const selectors = {
  email: Selector('#email'),
  password: Selector('#password'),
  confirmPassword: Selector('#confirmPassword'),
  loginSubmit: Selector('button[type="submit"]').withText(/sign in|login/i),
  loginForm: Selector('form.login-form'),
  loginBtn: Selector('button[type="submit"]').withText(/sign in|login/i),
  registerForm: Selector('form.auth-form'),
  firstName: Selector('#firstName'),
  lastName: Selector('#lastName'),
  createAccountBtn: Selector('button[type="submit"]').withText(/Create Account/i),
  loginLink: Selector('a.form-link[href="/login"]'),
  errorMessage: Selector('.message.message-error .message-content'),
  errorTitle: Selector('.message.message-error .message-title'),
  errorContent: Selector('.message.message-error .message-content'),
  errorAction: Selector('.message.message-error .message-action'),
  appSwitcherBtn: Selector('.app-switcher-button'),
  accountCard: Selector('article.card').withText(/Account/i),
  accessCard: Selector('article.card').withText(/Access/i),
  actionsCard: Selector('section.card.actions'),
  forgotPassword: Selector('a[href="/forgot-password"]'),
  forgotPasswordHeading: Selector('h1, h2').withText(/forgot password|reset password/i),
  accountEmail: Selector('article.card')
    .withText(/Account/i)
    .find('input.field-input')
    .withAttribute('readonly', '')
    .withAttribute('value', TEST_EMAIL),
  accountUsername: Selector('article.card')
    .withText(/Account/i)
    .find('input.field-input')
    .withAttribute('value', TEST_USERNAME),
  accessRoles: Selector('article.card')
    .withText(/Access/i)
    .find('input.field-input')
    .withAttribute('value', TEST_ROLES),
  navRow: Selector('.nav-row'),
  brand: Selector('.brand'),
  brandLogo: Selector('.brand__logo'),
  brandText: Selector('.brand__text'),
  nav: Selector('nav'),
  resumes: Selector('a.nav-link, a.nav-link--mobile').withText(/Resumes|CV's/i).filterVisible(),
  portfolio: Selector('a.nav-link, a.nav-link--mobile').withText(/Portfolio/i).filterVisible(),
  showcases: Selector('a.nav-link, a.nav-link--mobile').withText(/Showcases/i).filterVisible(),
  aboutBtn: Selector('a.nav-link, a.nav-link--mobile').withText(/(About|Over ons)/i).filterVisible(),
  contactBtn: Selector('a.nav-link, a.nav-link--mobile').withText(/Contact/i).filterVisible(),
  authIndicator,
  authBadge: authIndicator.find('svg circle'),
  editProfileBtn: Selector('button').withText(/Edit profile/i),
  changePasswordBtn: Selector('button').withText(/Change password/i),
  manageUsersBtn: Selector('button').withText(/Manage users/i),
  tasksBtn: Selector('button').withText(/Tasks/i),
  smartOpsBtn: Selector('button').withText(/SmartOps/i),
  testAutomationBtn: Selector('button').withText(/Test Automation/i),
};
async function login(
  email = TEST_EMAIL,
  password = TEST_PASSWORD,
  returnUrl = ''
 ) {
  // Navigate to login page first
  await t.navigateTo('https://identity.asafarim.be/login');
  // Wait for login form to appear
  await t.expect(selectors.email.exists).ok({ timeout: 8000 });

  if (email !== undefined && email !== null && email !== '') {
    await t.typeText(selectors.email, email, { replace: true });
  }

  if (password !== undefined && password !== null && password !== '') {
    await t.typeText(selectors.password, password, { replace: true });
  }

  await t.click(selectors.loginSubmit);

  // Navigate to fixture page url
  if (returnUrl!== undefined && returnUrl !== null && returnUrl !== '') {
      await t.navigateTo(returnUrl);
      await t.expect(selectors.navRow.exists).ok({ timeout: 8000 });
  }
}
const getColorSchemeInline = ClientFunction(() => {
    return document.documentElement.style.colorScheme;
});
const getThemeVariable = ClientFunction(name =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim()
);
const getDataTheme = ClientFunction(() => {
    return document.documentElement.getAttribute('data-theme');
});
const checkServer = ClientFunction(() =>
    fetch(window.location.href, { method: 'HEAD' })
        .then(res => res.status)
        .catch(() => 504)
);
const waitForThemeVariable = ClientFunction((name) => {
    return new Promise((resolve) => {
        const check = () => {
            const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
            if (value !== '') {
                resolve(value);
            } else {
                setTimeout(check, 100); // retry every 100ms
            }
        };
        check();
    });
});
const getHtmlStyle = ClientFunction(() =>
  document.documentElement.getAttribute('style')
);