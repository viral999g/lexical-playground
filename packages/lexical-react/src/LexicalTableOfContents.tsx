/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
	$isHeadingNode,
	HeadingNode,
	HeadingTagType,
} from '@lexical/rich-text';
import type { LexicalEditor, NodeKey, NodeMutation } from 'lexical';
import { $getNodeByKey, $getRoot, TextNode } from 'lexical';
import { useEffect, useState } from 'react';

import {
	$isMainHeaderNode,
	MainHeaderNode,
} from './../../../src/plugins/MainHeader/index';

export type TableOfContentsEntry = [
	key: NodeKey,
	text: string,
	tag: HeadingTagType
];

function toEntry(heading: HeadingNode | MainHeaderNode): TableOfContentsEntry {
	return [
		heading.getKey(),
		heading.getTextContent(),
		$isMainHeaderNode(heading) ? 'h1' : heading.getTag(),
	];
}

function $insertHeadingIntoTableOfContents(
	prevHeading: HeadingNode | MainHeaderNode | null,
	newHeading: HeadingNode | MainHeaderNode | null,
	currentTableOfContents: Array<TableOfContentsEntry>
): Array<TableOfContentsEntry> {
	if (newHeading === null) {
		return currentTableOfContents;
	}
	const newEntry: TableOfContentsEntry = toEntry(newHeading);
	let newTableOfContents: Array<TableOfContentsEntry> = [];
	if (prevHeading === null) {
		newTableOfContents = [newEntry, ...currentTableOfContents];
	} else {
		for (let i = 0; i < currentTableOfContents.length; i++) {
			const key = currentTableOfContents[i][0];
			newTableOfContents.push(currentTableOfContents[i]);
			if (key === prevHeading.getKey() && key !== newHeading.getKey()) {
				newTableOfContents.push(newEntry);
			}
		}
	}
	return newTableOfContents;
}

function $deleteHeadingFromTableOfContents(
	key: NodeKey,
	currentTableOfContents: Array<TableOfContentsEntry>
): Array<TableOfContentsEntry> {
	const newTableOfContents = [];
	for (const heading of currentTableOfContents) {
		if (heading[0] !== key) {
			newTableOfContents.push(heading);
		}
	}
	return newTableOfContents;
}

function $updateHeadingInTableOfContents(
	heading: HeadingNode | MainHeaderNode,
	currentTableOfContents: Array<TableOfContentsEntry>
): Array<TableOfContentsEntry> {
	const newTableOfContents: Array<TableOfContentsEntry> = [];
	for (const oldHeading of currentTableOfContents) {
		if (oldHeading[0] === heading.getKey()) {
			newTableOfContents.push(toEntry(heading));
		} else {
			newTableOfContents.push(oldHeading);
		}
	}
	return newTableOfContents;
}

/**
 * Returns the updated table of contents, placing the given `heading` before the given `prevHeading`. If `prevHeading`
 * is undefined, `heading` is placed at the start of table of contents
 */
function $updateHeadingPosition(
	prevHeading: HeadingNode | MainHeaderNode | null,
	heading: HeadingNode | MainHeaderNode | null,
	currentTableOfContents: Array<TableOfContentsEntry>
): Array<TableOfContentsEntry> {
	const newTableOfContents: Array<TableOfContentsEntry> = [];
	const newEntry: TableOfContentsEntry = toEntry(heading);

	if (!prevHeading) {
		newTableOfContents.push(newEntry);
	}
	for (const oldHeading of currentTableOfContents) {
		if (oldHeading[0] === heading.getKey()) {
			continue;
		}
		newTableOfContents.push(oldHeading);
		if (prevHeading && oldHeading[0] === prevHeading.getKey()) {
			newTableOfContents.push(newEntry);
		}
	}

	return newTableOfContents;
}

type Props = {
	children: (
		values: Array<TableOfContentsEntry>,
		editor: LexicalEditor
	) => JSX.Element;
};

export default function LexicalTableOfContentsPlugin({
	children,
}: Props): JSX.Element {
	const [tableOfContents, setTableOfContents] = useState<
		Array<TableOfContentsEntry>
	>([]);
	const [editor] = useLexicalComposerContext();
	useEffect(() => {
		// Set table of contents initial state
		let currentTableOfContents: Array<TableOfContentsEntry> = [];
		editor.getEditorState().read(() => {
			const root = $getRoot();
			const rootChildren = root.getChildren();
			for (const child of rootChildren) {
				console.log(
					'child123',
					child,
					child.getKey(),
					child.getTextContent()
				);

				if (
					($isHeadingNode(child) && child.getTag() == 'h1') ||
					$isMainHeaderNode(child)
				) {
					currentTableOfContents.push([
						child.getKey(),
						child.getTextContent(),
						$isHeadingNode(child) ? child?.getTag() : 'h1',
					]);
				}
			}
			console.log('currentTableOfContents123', currentTableOfContents);

			setTableOfContents(currentTableOfContents);
		});

		// Listen to updates to heading mutations and update state
		const removeHeaderMutationListener = editor.registerMutationListener(
			HeadingNode,
			(mutatedNodes: Map<string, NodeMutation>) => {
				editor.getEditorState().read(() => {
					for (const [nodeKey, mutation] of mutatedNodes) {
						if (mutation === 'created') {
							const newHeading =
								$getNodeByKey<HeadingNode>(nodeKey);
							if (newHeading !== null) {
								let prevHeading =
									newHeading.getPreviousSibling();
								while (
									prevHeading !== null &&
									!$isHeadingNode(prevHeading)
								) {
									prevHeading =
										prevHeading.getPreviousSibling();
								}
								currentTableOfContents =
									$insertHeadingIntoTableOfContents(
										prevHeading,
										newHeading,
										currentTableOfContents
									);
							}
						} else if (mutation === 'destroyed') {
							currentTableOfContents =
								$deleteHeadingFromTableOfContents(
									nodeKey,
									currentTableOfContents
								);
						} else if (mutation === 'updated') {
							const newHeading =
								$getNodeByKey<HeadingNode>(nodeKey);
							if (newHeading !== null) {
								let prevHeading =
									newHeading.getPreviousSibling();
								while (
									prevHeading !== null &&
									!$isHeadingNode(prevHeading)
								) {
									prevHeading =
										prevHeading.getPreviousSibling();
								}
								currentTableOfContents = $updateHeadingPosition(
									prevHeading,
									newHeading,
									currentTableOfContents
								);
							}
						}
					}
					setTableOfContents(currentTableOfContents);
				});
			}
		);

		// Listen to text node mutation updates
		const removeTextNodeMutationListener = editor.registerMutationListener(
			TextNode,
			(mutatedNodes: Map<string, NodeMutation>) => {
				editor.getEditorState().read(() => {
					for (const [nodeKey, mutation] of mutatedNodes) {
						if (mutation === 'updated') {
							const currNode = $getNodeByKey(nodeKey);
							if (currNode !== null) {
								const parentNode = currNode.getParentOrThrow();
								if ($isHeadingNode(parentNode)) {
									currentTableOfContents =
										$updateHeadingInTableOfContents(
											parentNode,
											currentTableOfContents
										);
									setTableOfContents(currentTableOfContents);
								}
							}
						}
					}
				});
			}
		);

		// Listen to updates to main heading mutations and update state
		const removeMainHeaderMutationListener =
			editor.registerMutationListener(
				MainHeaderNode,
				(mutatedNodes: Map<string, NodeMutation>) => {
					editor.getEditorState().read(() => {
						for (const [nodeKey, mutation] of mutatedNodes) {
							if (mutation === 'created') {
								const newHeading =
									$getNodeByKey<MainHeaderNode>(nodeKey);
								if (newHeading !== null) {
									let prevHeading =
										newHeading.getPreviousSibling();
									while (
										prevHeading !== null &&
										!$isMainHeaderNode(prevHeading)
									) {
										prevHeading =
											prevHeading.getPreviousSibling();
									}
									currentTableOfContents =
										$insertHeadingIntoTableOfContents(
											prevHeading,
											newHeading,
											currentTableOfContents
										);
								}
							} else if (mutation === 'destroyed') {
								currentTableOfContents =
									$deleteHeadingFromTableOfContents(
										nodeKey,
										currentTableOfContents
									);
							} else if (mutation === 'updated') {
								const newHeading =
									$getNodeByKey<MainHeaderNode>(nodeKey);
								if (newHeading !== null) {
									let prevHeading =
										newHeading.getPreviousSibling();
									while (
										prevHeading !== null &&
										!$isMainHeaderNode(prevHeading)
									) {
										prevHeading =
											prevHeading.getPreviousSibling();
									}
									currentTableOfContents =
										$updateHeadingPosition(
											prevHeading,
											newHeading,
											currentTableOfContents
										);
								}
							}
						}
						setTableOfContents(currentTableOfContents);
					});
				}
			);

		return () => {
			removeHeaderMutationListener();
			removeTextNodeMutationListener();
			removeMainHeaderMutationListener();
		};
	}, [editor]);

	return children(tableOfContents, editor);
}
