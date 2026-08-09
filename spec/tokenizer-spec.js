const path = require("path");

describe("Ruby grammars", () => {
  beforeEach(async () => {
    await lumine.packages.activatePackage("language-ruby");
  });

  it("tokenizes the editor using TextMate parser", async () => {
    lumine.config.set("language.useTreeSitterParsers", false);

    await runGrammarTests(path.join(__dirname, "fixtures", "textmate-grammar.rb"), /#/);
  });
});
