describe("Conservative ruby indentation", () => {
  let editor;

  beforeEach(async () => {
    await lumine.packages.activatePackage("language-ruby");
    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.ruby"));
    editor.update({ tabLength: 4, softTabs: true });
    await editor.whenGrammarSettled();
  });

  afterEach(() => editor?.destroy());

  for (const [name, source, row, columns] of [
    ["a complete for loop", "for item in [1]; puts item; end", 0, 0],
    ["a complete while loop", "while ready do work end", 0, 0],
    ["an endless method", "def value = 1", 0, 0],
    ["an endless singleton method", "def self.value = 1", 0, 0],
    ["a for loop header", "for item in [1]\nend", 0, 4],
    ["a do loop header", "while ready do\nend", 0, 4],
    ["a postfix modifier", "work if ready", 0, 0],
    ["a literal and comment", 'value = "if class do" # end', 0, 0],
  ]) {
    it(`keeps the intended level after ${name}`, async () => {
      editor.setText(source);
      await editor.whenGrammarSettled();
      editor.setCursorBufferPosition([row, Infinity]);
      editor.insertText("\n", { autoIndent: true, autoIndentNewline: true });
      await editor.whenGrammarSettled();
      expect(editor.lineTextForBufferRow(row + 1)).toBe(" ".repeat(columns));
      expect(editor.getCursorBufferPosition().column).toBe(columns);
    });
  }

  it("dedents a closing delimiter only when it is typed at the start of a row", async () => {
    editor.setText("values = [" + "\n    ");
    await editor.whenGrammarSettled();
    editor.setCursorBufferPosition([1, Infinity]);
    editor.insertText("]", { autoIndent: true, autoDecreaseIndent: true });
    await editor.whenGrammarSettled();
    expect(editor.lineTextForBufferRow(1)).toBe("]");
  });

  it("preserves multiline literal contents during explicit reindent", async () => {
    const source = 'text = "first\n\tkeep this tab\n  keep these spaces"\n';
    editor.setText(source);
    await editor.whenGrammarSettled();
    editor.getBuffer().clearUndoStack();
    editor.autoIndentBufferRows(0, editor.getLastBufferRow() - 1);
    await editor.whenGrammarSettled();
    expect(editor.getText()).toBe(source);
    editor.autoIndentBufferRows(0, editor.getLastBufferRow() - 1);
    expect(editor.getText()).toBe(source);
  });

  it("does not add a level after a complete inline branch", async () => {
    for (const source of ["if ready; work; else; other; end", "case value; when 1; work; end"]) {
      editor.setText(source);
      await editor.whenGrammarSettled();
      editor.setCursorBufferPosition([0, Infinity]);
      editor.insertText("\n", { autoIndent: true, autoIndentNewline: true });
      await editor.whenGrammarSettled();
      expect(editor.lineTextForBufferRow(1)).toBe("");
    }
  });
});
