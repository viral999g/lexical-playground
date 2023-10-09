import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $findMatchingParent,
  $insertNodeToNearestRoot,
  mergeRegister,
  $wrapNodeInElement,
} from "@lexical/utils";
import {
  $createParagraphNode,
  $getPreviousSelection,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  DELETE_CHARACTER_COMMAND,
  ElementNode,
  INSERT_PARAGRAPH_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_LEFT_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_ARROW_UP_COMMAND,
  LexicalNode,
  NodeKey,
  $insertNodes,
  $isNodeSelection,
  $isRootOrShadowRoot,
} from "lexical";
import { useEffect } from "react";
import { $createInlineTagNode } from "./InlineTagNode";

import "./inlineTagPlugin.scss";

export const INSERT_INLINE_TAG_COMMAND = createCommand<void>();

export default function InlineTagPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        INSERT_INLINE_TAG_COMMAND,
        () => {
          const tagNode = $createInlineTagNode();
          $insertNodes([tagNode]);
          if ($isRootOrShadowRoot(tagNode.getParentOrThrow())) {
            $wrapNodeInElement(tagNode, $createParagraphNode).selectEnd();
          }

          return true;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor]);

  return null;
}
