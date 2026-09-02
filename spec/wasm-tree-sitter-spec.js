const path = require("path");

describe("WASM Tree-sitter Ruby grammar", () => {
  beforeEach(async () => {
    await lumine.packages.activatePackage("language-ruby");
  });

  it("tokenizes classes, methods and keywords", async () => {
    await runGrammarTests(path.join(__dirname, "fixtures", "classes-wasm-ts.rb"), /#/);
  });

  it("folds code", async () => {
    await runFoldsTests(path.join(__dirname, "fixtures", "folds.rb"), /#/);
  });

  it("injects the shared Tree-sitter regex grammar", async () => {
    await lumine.packages.activatePackage("language-regex");

    const grammar = lumine.grammars.grammarForScopeName("source.ruby");
    const editor = await lumine.workspace.open();
    editor.setGrammar(grammar);
    editor.setText("pattern = /^([a-z]+)$/");

    const languageMode = editor.getBuffer().getLanguageMode();
    await languageMode.ready;
    await languageMode.atTransactionEnd();

    const scopesAt = (needle) => {
      const index = editor.getText().indexOf(needle);
      const point = editor.getBuffer().positionForCharacterIndex(index);
      return editor.scopeDescriptorForBufferPosition(point).getScopesArray();
    };

    expect(scopesAt("^")).toContain("keyword.control.anchor.regexp");
    expect(scopesAt("+")).toContain("keyword.operator.quantifier.regexp");
    expect(scopesAt("$")).toContain("keyword.control.anchor.regexp");
  });
});
