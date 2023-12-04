/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils';
import {
	$getSelection,
	$isRangeSelection,
	COMMAND_PRIORITY_EDITOR,
	LexicalCommand,
	createCommand,
} from 'lexical';
import { useEffect } from 'react';

import {
	$createCompanyProfileDetailsNode,
	CompanyProfileDetailsNode,
} from '../../nodes/CompanyProfile/CompanyProfileDetailsNode';

export const INSERT_COMPANY_PROFILE_DETAILS: LexicalCommand<undefined> =
	createCommand();

export default function CompanyProfileDetailsPlugin(): JSX.Element | null {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		if (!editor.hasNodes([CompanyProfileDetailsNode]))
			throw new Error(
				'CompanyProfileDetailsPlugin: CompanyProfileDetailsNode is not registered on editor'
			);

		return mergeRegister(
			editor.registerCommand(
				INSERT_COMPANY_PROFILE_DETAILS,
				() => {
					const selection = $getSelection();

					if (!$isRangeSelection(selection)) return false;

					const focusNode = selection.focus.getNode();
					if (focusNode !== null) {
						const pgBreak = $createCompanyProfileDetailsNode({});
						$insertNodeToNearestRoot(pgBreak);
					}

					return true;
				},
				COMMAND_PRIORITY_EDITOR
			)
		);
	}, [editor]);

	return null;
}
