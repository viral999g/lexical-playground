/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import "katex/dist/katex.css";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement } from "@lexical/utils";
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand,
  LexicalEditor,
} from "lexical";
import { useCallback, useEffect } from "react";
import * as React from "react";

import { $createEquationNode, EquationNode } from "../../nodes/EquationNode";
import KatexEquationAlterer from "../../ui/KatexEquationAlterer";
import { $createInlineTagNode } from "./InlineTagNode";

type CommandPayload = {
  equation: string;
  inline: boolean;
  bullet?: boolean;
  fontColor?: string;
  bgColor?: string;
  icon?: string;
};

export const INSERT_INLINE_TAG_COMMAND: LexicalCommand<CommandPayload> =
  createCommand("INSERT_INLINE_TAG_COMMAND");

export function InsertTagDialog({
  activeEditor,
  onClose,
  bullet,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
  bullet?: boolean;
}): JSX.Element {
  const onEquationConfirm = useCallback(
    (
      equation: string,
      inline: boolean,
      fontColor?: string,
      bgColor?: string,
      icon?: string
    ) => {
      activeEditor.dispatchCommand(INSERT_INLINE_TAG_COMMAND, {
        equation,
        inline,
        bullet,
        fontColor,
        bgColor,
        icon,
      });
      onClose();
    },
    [activeEditor, onClose]
  );

  return (
    <KatexEquationAlterer
      inputLabel={bullet ? "Text" : "Tag value"}
      onConfirm={onEquationConfirm}
      showPreview={false}
      type={bullet ? "bullet" : "tag"}
    />
  );
}

export default function InlineTagPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand<CommandPayload>(
      INSERT_INLINE_TAG_COMMAND,
      (payload) => {
        const { equation, inline, bullet, fontColor, bgColor, icon } = payload;
        const equationNode = $createInlineTagNode(
          equation,
          inline,
          bullet,
          fontColor,
          bgColor,
          icon
        );

        $insertNodes([equationNode]);
        if ($isRootOrShadowRoot(equationNode.getParentOrThrow())) {
          $wrapNodeInElement(equationNode, $createParagraphNode).selectEnd();
        }

        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
}
