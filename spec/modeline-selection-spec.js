const fs = require("fs");
const path = require("path");

describe("Ruby modeline selection", () => {
  let grammar;

  beforeEach(async () => {
    const pkg = await lumine.packages.activatePackage("language-ruby");
    expect(fs.realpathSync(pkg.path)).toBe(path.resolve(__dirname, ".."));
    grammar = lumine.grammars.grammarForScopeName("source.ruby");
  });

  it("selects extensionless files from Vim filetype, ft, and syntax modelines", () => {
    for (const key of ["filetype", "ft", "syntax"]) {
      const text = "// vim: set tabstop=4 set " + key + "=ruby:";
      expect(lumine.grammars.selectGrammar("modeline", text).scopeName).toBe("source.ruby");
    }
  });

  it("preserves token order and modelines on a later supplied prefix line", () => {
    expect(grammar.firstLineRegex.test("vim: ft=ruby")).toBe(false);
    expect(grammar.firstLineRegex.test("ft=ruby // vim: set tabstop=4")).toBe(false);
    expect(grammar.firstLineRegex.test("preceding line\n// vim: set ft=ruby:")).toBe(true);
  });

  it("keeps failed modelines from revisiting Vim and set tokens", () => {
    expect(grammar.firstLineRegex.source).toContain("(?:(?!vim\\b).)*vim\\b");
    expect(grammar.firstLineRegex.source).toContain("(?:(?!\\bset\\b).)*\\bset\\b");
    for (const text of ["vim " + " set ".repeat(16000) + "x", "vim ".repeat(16000) + "x"]) {
      expect(grammar.firstLineRegex.test(text)).toBe(false);
      expect(lumine.grammars.selectGrammar("modeline", text).scopeName).not.toBe("source.ruby");
    }
  });
});
