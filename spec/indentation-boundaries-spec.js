describe("language-ruby indentation boundaries", () => {
  let editor;
  beforeEach(async () => {
    await lumine.packages.activatePackage("language-ruby");
    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.ruby"));
    editor.update({ tabLength: 4, softTabs: true });
    await editor.whenGrammarSettled();
  });
  afterEach(() => editor?.destroy());

  it("preserves an open list after string interpolation", async () => {
    editor.setText('items = ["#{value}",\n]');
    await editor.whenGrammarSettled();
    editor.setCursorBufferPosition([0, Infinity]);
    editor.insertText("\n", { autoIndent: true, autoIndentNewline: true });
    await editor.whenGrammarSettled();
    expect(editor.lineTextForBufferRow(1)).toBe(" ".repeat(4));
    expect(editor.getCursorBufferPosition().column).toBe(4);
  });

  it("does not indent after a rescue modifier", async () => {
    editor.setText("value = risky rescue nil");
    await editor.whenGrammarSettled();
    editor.setCursorBufferPosition([0, Infinity]);
    editor.insertText("\n", { autoIndent: true, autoIndentNewline: true });
    await editor.whenGrammarSettled();
    expect(editor.lineTextForBufferRow(1)).toBe(" ".repeat(0));
    expect(editor.getCursorBufferPosition().column).toBe(0);
  });

  it("still indents block keywords", async () => {
    editor.setText("if ready\nend");
    await editor.whenGrammarSettled();
    editor.setCursorBufferPosition([0, Infinity]);
    editor.insertText("\n", { autoIndent: true, autoIndentNewline: true });
    await editor.whenGrammarSettled();
    expect(editor.lineTextForBufferRow(1)).toBe(" ".repeat(4));
    expect(editor.getCursorBufferPosition().column).toBe(4);
  });
});
