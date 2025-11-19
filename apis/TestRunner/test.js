import { Selector } from "testcafe";
fixture("Test").page("https://example.com");
test("test", async (t) => {
  await t.wait(1000);
});
// Test using the reusable login function
test("Successful Login Behavior - Valid credentials authenticate", async (t) => {
  const dashboardTitle = Selector(".dash-title").withText("Dashboard");
  await login("ali@asafarim.com", "Ali+123456-");
  await t.expect(dashboardTitle.exists).ok({ timeout: 8000 });
});
