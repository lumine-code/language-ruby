exports.activate = function () {
  if (!lumine.grammars.addInjectionPoint) return;

  lumine.grammars.addInjectionPoint("source.ruby", {
    type: "heredoc_body",
    language(node) {
      return node.lastChild.text;
    },
    content(node) {
      return node.descendantsOfType("heredoc_content");
    },
  });

  lumine.grammars.addInjectionPoint("source.ruby", {
    type: "regex",
    language() {
      return "rb-regex";
    },
    content(node) {
      return node;
    },
    languageScope: null,
    includeChildren: true,
    // coverShallowerScopes: false
  });
};

exports.consumeHyperlinkInjection = (hyperlink) => {
  hyperlink.addInjectionPoint("source.ruby", {
    types: ["comment", "string_content"],
  });
};

exports.consumeTodoInjection = (todo) => {
  todo.addInjectionPoint("source.ruby", { types: ["comment"] });
};
