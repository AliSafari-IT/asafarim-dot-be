import { Selector } from "testcafe";
fixture("Test").page("https://example.com");
test("test", async (t) => {
  await t.wait(1000);
});
