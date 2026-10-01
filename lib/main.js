let injectionRegistrations = [];

// Heredoc content can descend into nested heredocs inside interpolations.
exports.activate = function () {
  injectionRegistrations.push(
    lumine.grammars.addInjectionPoint("source.ruby", {
      type: "heredoc_body",
      language(node) {
        return node.lastChild.text;
      },
      content(node) {
        return node.descendantsOfType("heredoc_content");
      },
    }),
  );
};

exports.deactivate = function () {
  for (const registration of injectionRegistrations.splice(0)) registration.dispose();
};
