import { FC, useEffect } from "react";
import {
  $findMatchingParent,
  $insertNodeToNearestRoot,
  mergeRegister,
} from "@lexical/utils";
import {
  $createParagraphNode,
  $getPreviousSelection,
  $getSelection,
  $isElementNode,
  $isParagraphNode,
  $isRangeSelection,
  $setSelection,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DELETE_CHARACTER_COMMAND,
  ElementNode,
  INSERT_PARAGRAPH_COMMAND,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_LEFT_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_ARROW_UP_COMMAND,
  LexicalNode,
  NodeKey,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isToggleTitleNode } from "./ToggleTitleNode";
import { $createToggleNodeUtil } from "./ToggleNodeUtils";

export const INSERT_TOGGLE_COMMAND = createCommand<void>();

export const TogglePlugin: FC = () => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    // Prevent Backspace key from deleting ToggleNode
    return mergeRegister(
      editor.registerCommand(
        DELETE_CHARACTER_COMMAND,
        () => {
          const selection = $getSelection();
          if (
            !(
              $isRangeSelection(selection) &&
              selection.isCollapsed() &&
              selection.anchor.offset === 0
            )
          ) {
            return false;
          }
          const toggleTitleNode = $findMatchingParent(
            selection.anchor.getNode(),
            (n) => $isToggleTitleNode(n)
          );
          if (!toggleTitleNode) {
            return false;
          }
          const paragraphNode = $findMatchingParent(
            selection.anchor.getNode(),
            (n) => $isParagraphNode(n)
          );
          if (paragraphNode.getPreviousSiblings().length === 0) {
            return true;
          }
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand(
        INSERT_TOGGLE_COMMAND,
        () => {
          editor.update(() => {
            const title = $createToggleNodeUtil({
              title: "Toggle Node",
              content: "Content",
            });
            $insertNodeToNearestRoot(title);
            title.select();
          });
          return true;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  });
  return null;
};
