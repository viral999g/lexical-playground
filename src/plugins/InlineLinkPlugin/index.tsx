/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $wrapNodeInElement } from '@lexical/utils';
import 'katex/dist/katex.css';
import {
	$createParagraphNode,
	$createTextNode,
	$insertNodes,
	$isRootOrShadowRoot,
	COMMAND_PRIORITY_EDITOR,
	LexicalCommand,
	LexicalEditor,
	createCommand,
} from 'lexical';
import { useCallback, useEffect } from 'react';
import * as React from 'react';

import { $createEquationNode, EquationNode } from '../../nodes/EquationNode';
import KatexEquationAlterer from '../../ui/KatexEquationAlterer';
import { $createInlineLinkNode } from './InlineLinkNode';

type CommandPayload = {
	link: string;
};

export const INSERT_INLINE_LINK_COMMAND: LexicalCommand<CommandPayload> =
	createCommand('INSERT_INLINE_LINK_COMMAND');

export default function InlineLinkPlugin(): JSX.Element | null {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		return editor.registerCommand<CommandPayload>(
			INSERT_INLINE_LINK_COMMAND,
			(payload) => {
				const { link } = payload;
				const equationNode = $createInlineLinkNode(link);

				$insertNodes([equationNode]);
				if ($isRootOrShadowRoot(equationNode.getParentOrThrow())) {
					$wrapNodeInElement(
						equationNode,
						$createParagraphNode
					).selectEnd();
				}
				const textNode = $createTextNode();
				$insertNodes([textNode]);

				return true;
			},
			COMMAND_PRIORITY_EDITOR
		);
	}, [editor]);

	return null;
}
