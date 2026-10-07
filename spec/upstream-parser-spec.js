describe("Ruby heredoc scanner serialization", () => {
  let editor;

  beforeEach(async () => {
    await lumine.packages.activatePackage("language-ruby");
    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.ruby"));
  });

  afterEach(() => editor?.destroy());

  it("preserves heredoc terminators longer than 255 characters across edits", async () => {
    const terminator = "A".repeat(300);
    editor.setText(`value = <<~${terminator}\ncontent\n${terminator}\n`);
    await editor.languageMode.ready;
    expect(editor.languageMode.tree.rootNode.hasError).toBe(false);
    editor.getBuffer().setTextInRange(
      [
        [1, 0],
        [1, 7],
      ],
      "updated content",
    );
    await editor.languageMode.atTransactionEnd();
    const root = editor.languageMode.tree.rootNode;
    expect(root.hasError).toBe(false);
    expect(root.descendantsOfType("heredoc_end")[0].text).toBe(terminator);
  });
});
