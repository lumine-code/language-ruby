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

  it("distinguishes opening and closing block-parameter pipes", async () => {
    const editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.ruby"));
    editor.setText("[1].each { |a,b| a }\n[1].each { || 1 }");
    await editor.getBuffer().getLanguageMode().ready;

    const scopesAtPipe = (occurrence) => {
      const text = editor.getText();
      let index = -1;
      for (let count = 0; count <= occurrence; count++) index = text.indexOf("|", index + 1);
      return editor
        .scopeDescriptorForBufferPosition(editor.getBuffer().positionForCharacterIndex(index))
        .getScopesArray();
    };

    for (const opening of [0, 2]) {
      expect(scopesAtPipe(opening)).toContain("punctuation.separator.parameters.begin.ruby");
      expect(scopesAtPipe(opening)).not.toContain("punctuation.separator.parameters.end.ruby");
    }
    for (const closing of [1, 3]) {
      expect(scopesAtPipe(closing)).toContain("punctuation.separator.parameters.end.ruby");
      expect(scopesAtPipe(closing)).not.toContain("punctuation.separator.parameters.begin.ruby");
    }
  });

  it("distinguishes both delimiters of an empty regular expression", async () => {
    const editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.ruby"));
    editor.setText("pattern = //");
    await editor.getBuffer().getLanguageMode().ready;

    const opening = editor.scopeDescriptorForBufferPosition([0, 10]).getScopesArray();
    const closing = editor.scopeDescriptorForBufferPosition([0, 11]).getScopesArray();
    expect(opening).toContain("punctuation.definition.begin.regexp.ruby");
    expect(opening).not.toContain("punctuation.definition.end.regexp.ruby");
    expect(closing).toContain("punctuation.definition.end.regexp.ruby");
    expect(closing).not.toContain("punctuation.definition.begin.regexp.ruby");
  });

  it("distinguishes empty expression and percent-array delimiters", async () => {
    const editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.ruby"));
    editor.setText('value = ()\nwords = %w()\ntext = ""\nother = %q()\ntemplate = "#{}"');
    await editor.getBuffer().getLanguageMode().ready;

    const expressionOpening = editor.scopeDescriptorForBufferPosition([0, 8]).getScopesArray();
    const expressionClosing = editor.scopeDescriptorForBufferPosition([0, 9]).getScopesArray();
    expect(expressionOpening).toContain(
      "punctuation.definition.expression.begin.bracket.round.ruby",
    );
    expect(expressionOpening).not.toContain(
      "punctuation.definition.expression.end.bracket.round.ruby",
    );
    expect(expressionClosing).toContain("punctuation.definition.expression.end.bracket.round.ruby");
    expect(expressionClosing).not.toContain(
      "punctuation.definition.expression.begin.bracket.round.ruby",
    );

    expect(editor.scopeDescriptorForBufferPosition([1, 8]).getScopesArray()).toContain(
      "punctuation.definition.begin.array.bracket.round.ruby",
    );
    expect(editor.scopeDescriptorForBufferPosition([1, 11]).getScopesArray()).toContain(
      "punctuation.definition.end.array.bracket.round.ruby",
    );

    const stringOpening = editor.scopeDescriptorForBufferPosition([2, 7]).getScopesArray();
    const stringClosing = editor.scopeDescriptorForBufferPosition([2, 8]).getScopesArray();
    expect(stringOpening).toContain("punctuation.definition.string.begin.ruby");
    expect(stringOpening).not.toContain("punctuation.definition.string.end.ruby");
    expect(stringClosing).toContain("punctuation.definition.string.end.ruby");
    expect(stringClosing).not.toContain("punctuation.definition.string.begin.ruby");
    expect(editor.scopeDescriptorForBufferPosition([3, 8]).getScopesArray()).toContain(
      "punctuation.definition.string.begin.ruby",
    );
    expect(editor.scopeDescriptorForBufferPosition([3, 11]).getScopesArray()).toContain(
      "punctuation.definition.string.end.ruby",
    );
    expect(editor.scopeDescriptorForBufferPosition([4, 12]).getScopesArray()).toContain(
      "punctuation.section.embedded.begin.ruby",
    );
    expect(editor.scopeDescriptorForBufferPosition([4, 14]).getScopesArray()).toContain(
      "punctuation.section.embedded.end.ruby",
    );
  });
});
