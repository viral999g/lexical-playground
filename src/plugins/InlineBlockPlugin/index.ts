import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
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
  $isRangeSelection,
  $setSelection,
  COMMAND_PRIORITY_LOW,
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
} from "lexical";
import { useEffect } from "react";
import { $createInlineBlockNode } from "./InlineBlockNode";

import "./inlineBlockPlugin.scss";
import { $createInlineTitleNode } from "./InlineTitleNode";

export const INSERT_INLINE_BLOCK_COMMAND = createCommand<void>();

export default function InlineBlockPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // const onEscapeUp = () => {
    //   const selection = $getSelection();
    //   if (
    //     $isRangeSelection(selection) &&
    //     selection.isCollapsed() &&
    //     selection.anchor.offset === 0
    //   ) {
    //     const container = $findMatchingParent(
    //       selection.anchor.getNode(),
    //       $isCollapsibleContainerNode,
    //     );

    //     if ($isCollapsibleContainerNode(container)) {
    //       const parent = container.getParent<ElementNode>();
    //       if (
    //         parent !== null &&
    //         parent.getFirstChild<LexicalNode>() === container &&
    //         selection.anchor.key ===
    //           container.getFirstDescendant<LexicalNode>()?.getKey()
    //       ) {
    //         container.insertBefore($createParagraphNode());
    //       }
    //     }
    //   }

    //   return false;
    // };

    // const onEscapeDown = () => {
    //   const selection = $getSelection();
    //   if ($isRangeSelection(selection) && selection.isCollapsed()) {
    //     const container = $findMatchingParent(
    //       selection.anchor.getNode(),
    //       $isCollapsibleContainerNode,
    //     );

    //     if ($isCollapsibleContainerNode(container)) {
    //       const parent = container.getParent<ElementNode>();
    //       if (
    //         parent !== null &&
    //         parent.getLastChild<LexicalNode>() === container
    //       ) {
    //         const lastDescendant = container.getLastDescendant<LexicalNode>();
    //         if (
    //           lastDescendant !== null &&
    //           selection.anchor.key === lastDescendant.getKey() &&
    //           selection.anchor.offset === lastDescendant.getTextContentSize()
    //         ) {
    //           container.insertAfter($createParagraphNode());
    //         }
    //       }
    //     }
    //   }

    //   return false;
    // };

    return mergeRegister(
      editor.registerCommand(
        INSERT_INLINE_BLOCK_COMMAND,
        () => {
          const title = $createInlineTitleNode();
          const inlineBlock = $createInlineBlockNode().append(title);
          $insertNodeToNearestRoot(inlineBlock);
          title.select();
          return true;
        },
        COMMAND_PRIORITY_LOW
      )
      //   editor.registerCommand<KeyboardEvent | null>(
      //     KEY_ENTER_COMMAND,
      //     (event) => {
      //       const selection = $getSelection();
      //       if (!$isRangeSelection(selection)) {
      //         return false;
      //       }
      //       return editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);
      //     },
      //     COMMAND_PRIORITY_LOW
      //   )
    );
  }, [editor]);

  return null;
}
