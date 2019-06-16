# in progress

## Emacs Like Keymap

### Motion

| Command        | Desc                           | Conflicted Command  | Solve Conflict |
| -------------- | ------------------------------ | ------------------- | -------------- |
| `C-f`          | forward-char                   | Find                | `ctrl+alt+f`   |
| `C-b`          | backward-char                  | -                   | -              |
| `C-n`          | next-line                      | newUntitleFile      | -              |
| `C-p`          | previous-line                  | -                   | -              |
| `C-a`          | move-beginning-of-line         | selectAll           | `C-x h`        |
| `C-e`          | move-end-of-line               | quickOpen           | -              |
| `C-l`          | recenter-top-bottom            | expandLineSelection | -              |
| `M-l` &#x00B9; | move-to-window-line-top-bottom | -                   | -              |
| `M-f`          | forward-word                   | -                   | -              |
| `M-b`          | backward-word                  | -                   | -              |
| `M-<`          | beginning-of-buffer            | -                   | -              |
| `M->`          | end-of-buffer                  | -                   | -              |
| `C-v`          | scroll-up-command              | Paste               | `ctrl+shift+v` |
| `M-v`          | scroll-down-command            | -                   | -              |
| `M-m`          | back-to-indentation            | -                   | -              |
| `M-g g`        | goto-line                      | -                   | -              |

### Selection

| Command     | Desc                    | Conflicted Command | Solve Conflict |
| ----------- | ----------------------- | ------------------ | -------------- |
| `C-Spc`     | set-mark-command        | triggerSuggest     | `alt+'`        |
| `C-x C-x`   | exchange-point-and-mark | -                  | -              |
| `C-x h`     | mark-whole-buffer       | -                  | -              |
| `C-x C-Spc` | pop-global-mark         | -                  | -              |

### Edit

| Command            | Desc                    | Conflicted Command          | Solve Conflict |
| ------------------ | ----------------------- | --------------------------- | -------------- |
| `C-d`              | delete-char             | addSelectionToNextFindMatch | -              |
| `M-d`              | kill-word               | -                           | -              |
| `M-del`            | backward-kill-word      | -                           | -              |
| `C-k`              | kill-line               | -                           | -              |
| `C-w`              | kill-region             | closeWindow                 | `C-x k`        |
| `M-w`              | kill-ring-save          | toggleFindWholeWord         | -              |
| `C-y`              | yank                    | -                           | -              |
| `M-y`              | yank-pop                | -                           | -              |
| `C-j` &#x00B2;     | -                       | togglePanel                 | -              |
| `C-m`              | newline                 | toggleTabFocusMode          | -              |
| `C-o`              | open-line               | openFile                    | -              |
| `C-x C-o`          | delete-blank-lines      | -                           | -              |
| `M-\`              | delete-horizontal-space | -                           | -              |
| `C-x r k`          | kill-rectangle &#x00B3; | -                           | -              |
| `C-x r w` &#x2074; | copy-rectangle-as-kill  | -                           | -              |
| `C-x r y`          | yank-rectangle          | -                           | -              |
| `C-x C-;`          | comment-line            | -                           | -              |
| `C-x ;`            | comment-region          | -                           | -              |

### Search

| Command        | Desc             | Conflicted Command | Solve Conflict |
| -------------- | ---------------- | ------------------ | -------------- |
| `C-s`          | isearch-forward  | save               | `C-x C-s`      |
| `C-r`          | isearch-backward | -                  | -              |
| `M-s` &#x2075; | -                | -                  | -              |
| `M-r` &#x2076; | -                | toggleFindRegex    | -              |

### Control

| Command   | Desc                     | Conflicted Command | Solve Conflict |
| --------- | ------------------------ | ------------------ | -------------- |
| `M-x`     | execute-extended-command |                    | -              |
| `C-/`     | undo                     |                    | -              |
| `C-?`     | redo                     |                    | -              |
| `C-g`     | keyboard-quit            |                    | -              |
| `C-u`     | universal-argument       | softUndo           | -              |
| `C-x z`   | repeat                   |                    | -              |
| `C-x C-q` | (incomplete)             |                    | -              |

### File

| Command   | Desc                                 | Conflicted Command | Solve Conflict |
| --------- | ------------------------------------ | ------------------ | -------------- |
| `C-x C-f` | *workbench.action.quickOpen*         | -                  | -              |
| `C-x C-s` | *workbench.action.files.save*        | -                  | -              |
| `C-x s`   | *workbench.action.files.saveAll*     | -                  | -              |
| `C-x k`   | *workbench.action.closeActiveEditor* | -                  | -              |
| `C-x C-c` | *workbench.action.quit*              | -                  | -              |

### Window

| Command   | Desc                                       |
| --------- | ------------------------------------------ |
| `C-x o`   | *workbench.action.focusNextGroup*          |
| `C-x 2`   | *workbench.action.toggleEditorGroupLayout* |
| `C-x 3`   | *workbench.action.splitEditor*             |
| `C-x 4`   | *workbench.action.toggleEditorGroupLayout* |
| `C-x C-z` | *workbench.action.toggleZenMode*           |

## VSC Keymap

| Command         | Desc                                        |
| --------------- | ------------------------------------------- |
| `alt+[`         | *workbench.action.nextEditor,Panel,SideBar* |
| `alt+]`         | *workbench.action.nextEditor,Panel,SideBar* |
| `ctrl+alt+f]`   | *actions.find*                              |
| `ctrl+h]`       | *editor.action.smartSelect.expand*          |
| `alt+h]`        | *editor.action.smartSelect.shrink*          |
| `ctrl+shift+n]` | *editor.action.moveLinesDownAction*         |
| `ctrl+shift+p]` | *editor.action.moveLinesUpAction*           |
| `alt+shift+n]`  | *editor.action.copyLinesDownAction*         |
| `alt+shift+p]`  | *editor.action.copyLinesUpAction*           |
| `ctrl+n`        | *selectNextSuggestion*                      |
| `ctrl+p`        | *selectPrevSuggestion*                      |
| `alt+'`         | *editor.action.triggerSuggest*              |

## Prefix

| Command | Conflicted Command | Solve Conflict |
| ------- | ------------------ | -------------- |
| `C-x`   | cut                | `C-w`          |

## Reserve

| Command | Conflicted Command | Solve Conflict |
| ------- | ------------------ | -------------- |
| `C-c`   | copy               | `M-w`          |
| `C-q`   | quit               | `C-x C-c`      |
| `C-z`   | undo               | `C-/`          |
| `C-;`   | -                  | -              |

---

&#x00B9; : In Emacs, this command is mapped to `M-r`.

&#x00B2; : `C-j` will insert line break at the end of line rather than cursor's position.

&#x00B3; : `C-x r k` will kill whole lines in the rectangle when the left-top and right-bottom points at the same column, while Emacs has different behavior.

&#x2074; : In Emacs, this command is mapped to `C-x r M-w`. Copy behavior is similar to `C-x r k`.

&#x2075; : `M-s` searchs **character** rather than **word** increasingly like vim's `f` command.

&#x2076; : Reverse version of `M-s`.

## Tricks

trailing mode.

## Notes

1. Most Emacs's shortcuts will be triggered only when `textEditorFocus`.

2. Conflicts can be occurred when install other extensions with keyboard shortcuts.
