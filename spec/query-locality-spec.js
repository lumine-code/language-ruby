const fs = require("fs");
const path = require("path");
const { Point } = require("lumine");

describe("Ruby highlight query locality", () => {
  let editor;

  beforeEach(async () => {
    await lumine.packages.activatePackage("language-ruby");
    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.ruby"));
  });

  afterEach(() => editor?.destroy());

  async function setUp(text) {
    editor.setText(text);
    await editor.languageMode.ready;
  }

  function captures() {
    const layer = editor.languageMode.rootLanguageLayer;
    return layer.queries.highlightsQuery.captures(layer.tree.rootNode, {
      startPosition: new Point(2998, 0),
      endPosition: new Point(3004, 0),
    });
  }

  it("keeps hash and block-parameter punctuation leaf-rooted", async () => {
    const query = fs.readFileSync(
      path.join(__dirname, "..", "grammars", "ruby-highlights.scm"),
      "utf8",
    );
    expect(query).not.toContain('(hash\n "{"');
    expect(query).not.toContain('(block_parameters\n  ","');
    expect(query).not.toContain("(block_parameters (identifier)");
    expect(query).not.toContain("(destructured_parameter (identifier)");
    expect(query).not.toContain("(lambda_parameters (identifier)");
    expect(query).not.toContain("(method_parameters (identifier)");
    expect(query).not.toContain('(parenthesized_statements\n "("');
    expect(query).not.toContain('((string_array ")"');
    expect(query).not.toContain('((symbol_array ")"');
    expect(query).not.toMatch(/\(string\s*\n\s*"\\""/);
    expect(query).not.toMatch(/\(subshell\s*\n\s*"`"/);
    expect(query).not.toMatch(/\(interpolation\s*\n\s*"#\{"/);
    expect(query).toContain("(#is? test.childOfType block_parameters)");

    await setUp("value = { key: 1 }\n[1].each { |a,b| a }");
    expect(editor.scopeDescriptorForBufferPosition([0, 8]).getScopesArray()).toContain(
      "punctuation.definition.hash.begin.bracket.curly.ruby",
    );
    expect(editor.scopeDescriptorForBufferPosition([1, 13]).getScopesArray()).toContain(
      "punctuation.separator.parameters.ruby",
    );
    expect(editor.scopeDescriptorForBufferPosition([1, 12]).getScopesArray()).toContain(
      "variable.parameter.function.block.ruby",
    );

    const hashLines = ["value = {"];
    for (let i = 0; i < 6000; i++) hashLines.push(`  key_${i}: value_${i},`);
    hashLines.push("}");
    await setUp(hashLines.join("\r\n"));
    expect(captures().length).toBeLessThanOrEqual(96);

    const blockLines = ["foo do |"];
    for (let i = 0; i < 6000; i++) blockLines.push(`  value_${i}${i === 5999 ? "" : ","}`);
    blockLines.push("|", "end");
    await setUp(blockLines.join("\r\n"));
    expect(captures().length).toBeLessThanOrEqual(96);

    const methodLines = ["def benchmark("];
    for (let i = 0; i < 6000; i++) {
      methodLines.push(`  value_${i}${i === 5999 ? "" : ","}`);
    }
    methodLines.push(")", "  nil", "end");
    await setUp(methodLines.join("\r\n"));
    expect(captures().length).toBeLessThanOrEqual(96);

    const lambdaLines = ["value = ->("];
    for (let i = 0; i < 6000; i++) {
      lambdaLines.push(`  value_${i}${i === 5999 ? "" : ","}`);
    }
    lambdaLines.push(") { nil }");
    await setUp(lambdaLines.join("\r\n"));
    expect(captures().length).toBeLessThanOrEqual(96);

    const expressionLines = ["value = ("];
    for (let i = 0; i < 6000; i++) expressionLines.push(`  value_${i}`);
    expressionLines.push(")");
    await setUp(expressionLines.join("\r\n"));
    expect(captures().length).toBeLessThanOrEqual(96);

    const wordLines = ["value = %w("];
    for (let i = 0; i < 6000; i++) wordLines.push(`  value_${i}`);
    wordLines.push(")");
    await setUp(wordLines.join("\r\n"));
    expect(captures().length).toBeLessThanOrEqual(96);

    const stringLines = ['value = "'];
    for (let i = 0; i < 6000; i++) stringLines.push(`  line #{value_${i}}`);
    stringLines.push('"');
    await setUp(stringLines.join("\r\n"));
    expect(captures().length).toBeLessThanOrEqual(96);

    const subshellLines = ["value = `"];
    for (let i = 0; i < 6000; i++) subshellLines.push(`  line #{value_${i}}`);
    subshellLines.push("`");
    await setUp(subshellLines.join("\r\n"));
    expect(captures().length).toBeLessThanOrEqual(96);

    const interpolationLines = ['value = "#{'];
    for (let i = 0; i < 6000; i++) interpolationLines.push(`  value_${i}`);
    interpolationLines.push('}"');
    await setUp(interpolationLines.join("\r\n"));
    expect(captures().length).toBeLessThanOrEqual(96);
  });
});
