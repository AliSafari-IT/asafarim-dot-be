import { Selector, t } from "testcafe";
fixture("Test").page("https://example.com");
test("test", async (t) => {
  await t.wait(1000);
});

fixture("Login").page("https://identity.asafarim.be/");

async function login(t, email, password) {
  await t.typeText("#email", email);
  await t.typeText("#password", password);
  await t.click("button[type='submit']");
}
// Test using the reusable login function
test("Successful Login Behavior - Valid credentials authenticate", async (t) => {
  const dashboardTitle = Selector(".dash-title").withText("Dashboard");
  await login(t, "ali@asafarim.com", "Ali+123456/");
  await t.expect(dashboardTitle.exists).ok({ timeout: 8000 });
});
