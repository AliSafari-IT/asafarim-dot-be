import { Selector } from "testcafe";

fixture("Simple Test").page("https://example.com");

test("Example.com page loads", async (t) => {
  const heading = Selector("h1");
  await t.expect(heading.innerText).contains("Example Domain");
});
