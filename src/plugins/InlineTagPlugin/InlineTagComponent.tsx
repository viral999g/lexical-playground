/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  COMMAND_PRIORITY_HIGH,
  KEY_ESCAPE_COMMAND,
  NodeKey,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { $isInlineTagNode } from "./InlineTagNode";
import KatexRenderer from "../../ui/KatexRenderer";
import EquationEditor from "../../ui/EquationEditor";
import DotIcon from "./DotIcon.svg";

// import EquationEditor from '../ui/EquationEditor';
// import KatexRenderer from '../ui/KatexRenderer';
// import {$isInlineTagNode} from './EquationNode';

type EquationComponentProps = {
  equation: string;
  inline: boolean;
  nodeKey: NodeKey;
  bullet?: boolean;
};

export default function EquationComponent({
  equation,
  inline,
  nodeKey,
  bullet,
}: EquationComponentProps): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [equationValue, setEquationValue] = useState(equation);
  const [showEquationEditor, setShowEquationEditor] = useState<boolean>(false);
  const inputRef = useRef(null);

  const onHide = useCallback(
    (restoreSelection?: boolean) => {
      setShowEquationEditor(false);
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isInlineTagNode(node)) {
          node.setEquation(equationValue);
          if (restoreSelection) {
            node.selectNext(0, 0);
          }
        }
      });
    },
    [editor, equationValue, nodeKey]
  );

  useEffect(() => {
    if (!showEquationEditor && equationValue !== equation) {
      setEquationValue(equation);
    }
  }, [showEquationEditor, equation, equationValue]);

  useEffect(() => {
    if (showEquationEditor) {
      return mergeRegister(
        editor.registerCommand(
          SELECTION_CHANGE_COMMAND,
          (payload) => {
            const activeElement = document.activeElement;
            const inputElem = inputRef.current;
            if (inputElem !== activeElement) {
              onHide();
            }
            return false;
          },
          COMMAND_PRIORITY_HIGH
        ),
        editor.registerCommand(
          KEY_ESCAPE_COMMAND,
          (payload) => {
            const activeElement = document.activeElement;
            const inputElem = inputRef.current;
            if (inputElem === activeElement) {
              onHide(true);
              return true;
            }
            return false;
          },
          COMMAND_PRIORITY_HIGH
        )
      );
    } else {
      return editor.registerUpdateListener(({ editorState }) => {
        const isSelected = editorState.read(() => {
          const selection = $getSelection();
          return (
            $isNodeSelection(selection) &&
            selection.has(nodeKey) &&
            selection.getNodes().length === 1
          );
        });
        if (isSelected) {
          setShowEquationEditor(true);
        }
      });
    }
  }, [editor, nodeKey, onHide, showEquationEditor]);

  if (bullet) {
    return (
      <span className="inline-tag-bullet">
        <span className="dot-icon-container">
          <img src={DotIcon}></img>
        </span>
        <span className="eqValue">{equationValue}</span>
      </span>
    );
  }

  return <span className="inline-tag-span">{equationValue}</span>;

  return (
    <>
      {/* <ErrorBoundary onError={(e) => editor._onError(e)} fallback={null}>
        <KatexRenderer
          equation={equationValue}
          inline={inline}
          onDoubleClick={() => setShowEquationEditor(true)}
        />
      </ErrorBoundary> */}
      {showEquationEditor ? (
        <EquationEditor
          equation={equationValue}
          setEquation={setEquationValue}
          inline={inline}
          ref={inputRef}
        />
      ) : (
        <ErrorBoundary onError={(e) => editor._onError(e)} fallback={null}>
          {/* <KatexRenderer
            equation={equationValue}
            inline={inline}
            onDoubleClick={() => setShowEquationEditor(true)}
          /> */}
        </ErrorBoundary>
      )}
    </>
  );
}
