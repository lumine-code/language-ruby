; Branches inside a complete inline expression do not open another level.
; Ignore only their own token so outer containers and later blocks still count.
([(if (else "else" @_IGNORE_))
  (unless (else "else" @_IGNORE_))
  (case (when "when" @_IGNORE_))
  (case (else "else" @_IGNORE_))
  (case_match (in_clause "in" @_IGNORE_))
  (case_match (else "else" @_IGNORE_))] @_inline
  (#match? @_inline "^[^\n]*\\bend$")
  (#set! capture.final true))

; Unterminated quoted text can expose braces and keywords as ERROR children.
; Only recovered quote tokens claim this row; complete strings do not.
(ERROR ["\"" "`"] @match.next
  (#set! indent.match startPosition))

; A complete inline block keeps its own row level, including ELSE/WHEN
; branches that would otherwise count as extra unmatched opening keywords.
([(class) (singleton_class) (method) (singleton_method) (module) (if) (unless) (case) (case_match) (while) (until) (for) (begin) (do_block)] @match.next
  (#is? test.startsOnSameRowAs endPosition)
  (#is? test.firstTextOnRow)
  (#is? test.lastTextOnRow)
  (#match? @match.next "\\bend$")
  (#set! indent.match startPosition))

; Reindent changes code structure, never the contents of multiline literals
; or the alignment a user chose inside a block comment.
([(string) (regex) (heredoc_body) (comment)] @preserve
  (#is? indent.reindent true)
  (#is-not? indent.matchesCurrentRow startPosition)
  (#set! indent.force true))


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

; Loop separators do not open a second block on the header row.
(in "in" @_IGNORE_ (#set! capture.final true))
(do "do" @_IGNORE_ (#set! capture.final true))

; Endless methods have no following body to indent.
(method "def" @_IGNORE_ "=" (#set! capture.final true))
(singleton_method "def" @_IGNORE_ "=" (#set! capture.final true))

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
