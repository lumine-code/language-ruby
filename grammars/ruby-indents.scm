
; Prevent postfix modifiers from triggering indents on the next line.
(unless_modifier "unless" @_IGNORE_
  (#set! capture.final true))
(if_modifier "if" @_IGNORE_
  (#set! capture.final true))
(while_modifier "while" @_IGNORE_
  (#set! capture.final true))
(until_modifier "until" @_IGNORE_
  (#set! capture.final true))
(rescue_modifier "rescue" @_IGNORE_
  (#set! capture.final true))

; The opening interpolation token is `#{`, not an indentation delimiter.
; Its closing brace must not cancel an outer list or block on the same row.
(interpolation "}" @_IGNORE_ (#set! capture.final true))


[
  "class"
  ; (singleton_class)
  "def"
  ; (singleton_method)
  "module"
  "if"
  "in"
  "elsif"
  "else"
  "unless"
  "case"
  "when"
  "while"
  "until"
  "for"
  "begin"
  "do"
  "rescue"
  "ensure"
  "("
  "{"
  "["
  ; “Special” array notations. (Currently, they all have the same anonymous
  ; node, even if they’re delimited with another character pair instead of
  ; parentheses.)
  "%w("
  "%i("
] @indent

[
  "end"
  ")"
  "}"
  "]"
  "in"
  "when"
  "elsif"
  "else"
  "rescue"
  "ensure"
  ; (ensure)
] @dedent

(comment) @ignore
