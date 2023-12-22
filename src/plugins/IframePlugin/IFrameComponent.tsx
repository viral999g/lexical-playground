/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import {
	$getNodeByKey,
	$getSelection,
	$isNodeSelection,
	COMMAND_PRIORITY_HIGH,
	KEY_ESCAPE_COMMAND,
	NodeKey,
	SELECTION_CHANGE_COMMAND,
} from 'lexical';
import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { $isIFrameNode } from './IFrameNode';

type IFrameComponentProps = {
	src: string;
	nodeKey: NodeKey;
	height?: string;
	width?: string;
};

export default function IFrameComponent({
	src: equation,
	nodeKey,
	height = '',
	width = '',
}: IFrameComponentProps): JSX.Element {
	const [editor] = useLexicalComposerContext();
	const [equationValue, setEquationValue] = useState(equation);
	const [showEquationEditor, setShowEquationEditor] =
		useState<boolean>(false);
	const inputRef = useRef(null);

	const onHide = useCallback(
		(restoreSelection?: boolean) => {
			setShowEquationEditor(false);
			editor.update(() => {
				const node = $getNodeByKey(nodeKey);
				if ($isIFrameNode(node)) {
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

	return (
		<div className="w-full">
			<iframe
				src={equationValue}
				height={height}
				width={width}
				className="w-full"
			/>
		</div>
	);
}
