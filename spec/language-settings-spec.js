describe("language-ruby editing defaults", () => {
  let editor;
  beforeEach(async () => {
    jasmine.useRealClock();
    await lumine.packages.activatePackage("language-source");
    await lumine.packages.activatePackage("language-ruby");

    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.ruby"));
    editor.setText("empty?(value)");
    await editor.whenGrammarSettled();
  });
  afterEach(() => editor?.destroy());

  it("selects a complete language identifier without including adjacent syntax", () => {
    const index = editor.getText().indexOf("empty?");
    editor.setCursorBufferPosition(editor.getBuffer().positionForCharacterIndex(index + 2));
    editor.selectWordsContainingCursors();
    expect(editor.getSelectedText()).toBe("empty?");
  });
  it("keeps explicit user word-boundary overrides", () => {
    const options = { scopeSelector: ".source.ruby" };
    try {
      lumine.config.set("editor.nonWordCharacters", "?", options);
      const index = editor.getText().indexOf("empty?");
      editor.setCursorBufferPosition(editor.getBuffer().positionForCharacterIndex(index + 2));
      editor.selectWordsContainingCursors();
      expect(editor.getSelectedText()).not.toBe("empty?");
    } finally {
      lumine.config.unset("editor.nonWordCharacters", options);
    }
  });

  it("selects an extensionless executable from an exact interpreter shebang", () => {
    for (const text of [
      "#!/usr/bin/env ruby.exe",
      "#!/ruby/bin/ruby.exe",
      "#!C:\\ruby\\bin\\ruby.exe",
      "#!/usr/bin/env.exe -S ruby.exe --version",

      "#!/usr/bin/ruby",
      "#!/usr/bin/env ruby\n",
      "#!/usr/bin/env -S ruby --version\n",
    ]) {
      expect(lumine.grammars.selectGrammar("executable", text).scopeName).toBe("source.ruby");
    }
    for (const text of [
      "#!/usr/bin/not-ruby",
      "#!/usr/bin/env ruby-wrapper",
      "#!/usr/bin/env ruby.exe-wrapper",
      "some ruby prose",
    ]) {
      expect(lumine.grammars.selectGrammar("executable", text).scopeName).not.toBe("source.ruby");
    }
  });

  it("selects canonical Ruby DSL filenames and RBI source", () => {
    for (const filename of [
      "Guardfile",
      "Vagrantfile",
      "Thorfile",
      "Dangerfile",
      "definitions.rbi",
    ]) {
      expect(lumine.grammars.selectGrammar(filename, "").scopeName).toBe("source.ruby");
    }
  });

  it("honors explicit user file-type associations", async () => {
    await lumine.packages.activatePackage("language-text");
    try {
      lumine.config.set("core.customFileTypes", { "text.plain": ["rbi"] });
      expect(lumine.grammars.selectGrammar("definitions.rbi", "").scopeName).toBe("text.plain");
    } finally {
      lumine.config.unset("core.customFileTypes");
    }
  });
});
