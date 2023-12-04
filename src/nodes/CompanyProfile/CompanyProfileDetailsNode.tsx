/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { addClassNamesToElement, mergeRegister } from '@lexical/utils';
import {
	$getNodeByKey,
	$getSelection,
	$isNodeSelection,
	CLICK_COMMAND,
	COMMAND_PRIORITY_CRITICAL,
	COMMAND_PRIORITY_EDITOR,
	COMMAND_PRIORITY_HIGH,
	COMMAND_PRIORITY_LOW,
	DOMConversionMap,
	DOMConversionOutput,
	DecoratorNode,
	EditorConfig,
	KEY_BACKSPACE_COMMAND,
	KEY_DELETE_COMMAND,
	LexicalEditor,
	LexicalNode,
	NodeKey,
	SerializedEditor,
	SerializedLexicalNode,
	Spread,
	createEditor,
} from 'lexical';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';

import { CAN_USE_DOM } from '../../../packages/shared/src/canUseDOM';
import MemoDelete from '../../components/icons/Delete';
import FloatingTextFormatToolbarPlugin from '../../plugins/FloatingTextFormatToolbarPlugin';
import PlaygroundEditorTheme from '../../themes/PlaygroundEditorTheme';
import ContentEditable from '../../ui/ContentEditable';
import Placeholder from '../../ui/Placeholder';
import TableCellNodes from '../TableCellNodes';

type ILabelInstance = SerializedEditor & {};

export type SerializedCompanyProfileDetailsNode = Spread<
	{
		children?: ILabelInstance[];
	},
	SerializedLexicalNode
>;

const cellEditorConfig = {
	namespace: 'CompanyProfileDetails',
	nodes: [...TableCellNodes],
	onError: (error: Error) => {
		throw error;
	},
	theme: PlaygroundEditorTheme,
};

function CompanyProfileDetailsComponent({
	nodeKey,
	initialLabels,
}: {
	nodeKey: NodeKey;
	initialLabels: LexicalEditor[];
}) {
	const [labels, setLabels] = useState(initialLabels);
	const [editor] = useLexicalComposerContext();
	const [isSelected, setSelected, clearSelection] =
		useLexicalNodeSelection(nodeKey);

	const onDelete = useCallback(
		(event?: KeyboardEvent) => {
			if (event) {
				event.preventDefault();
			}
			if (isSelected && $isNodeSelection($getSelection())) {
				const node = $getNodeByKey(nodeKey);
				if ($isCompanyProfileDetailsNode(node)) {
					node.remove();
					return true;
				}
			}
			return false;
		},
		[isSelected, nodeKey]
	);

	useEffect(() => {
		return mergeRegister(
			editor.registerCommand(
				CLICK_COMMAND,
				(event: MouseEvent) => {
					const pbElem = editor.getElementByKey(nodeKey);
					if (event.target === pbElem) {
						if (!event.shiftKey) {
							clearSelection();
						}
						setSelected(!isSelected);
						return true;
					}

					return false;
				},
				COMMAND_PRIORITY_CRITICAL
			),
			editor.registerCommand(
				KEY_DELETE_COMMAND,
				onDelete,
				COMMAND_PRIORITY_LOW
			),
			editor.registerCommand(
				KEY_BACKSPACE_COMMAND,
				onDelete,
				COMMAND_PRIORITY_LOW
			)
		);
	}, [clearSelection, editor, isSelected, nodeKey, onDelete, setSelected]);

	useEffect(() => {
		const pbElem = editor.getElementByKey(nodeKey);
		if (pbElem !== null) {
			pbElem.className = isSelected ? 'selected' : '';
		}
	}, [editor, isSelected, nodeKey]);

	const handleDelete = (index) => {
		initialLabels.splice(index, 1);
		setLabels([...initialLabels]);

		if (initialLabels.length === 0) {
			editor.update(() => {
				const node = $getNodeByKey(nodeKey);
				if (node) {
					node.remove();
				}
			});
		}
		editor.update(() => {
			const state = editor.getEditorState();
			editor.setEditorState(state);
		});
	};

	return (
		<div className="grid lg:grid-cols-3 auto-cols-auto gap-x-3 gap-y-2 company-profile-card-group-wrapper">
			{labels.map((ele, i) => {
				return (
					<CompanyProfileDetailsNodeCards
						label={ele}
						key={ele.getKey()}
						handleDelete={() => handleDelete(i)}
					/>
				);
			})}
		</div>
	);
}

const CompanyProfileDetailsNodeCards = ({
	label,
	handleDelete,
}: {
	label: LexicalEditor;
	handleDelete: () => void;
}) => {
	const [editor] = useLexicalComposerContext();
	const nodeRef = React.useRef<any>();
	const [clickedOutside, setClickedOutside] = useState(false);

	const [isSmallWidthViewport, setIsSmallWidthViewport] = useState(false);

	useEffect(() => {
		const updateViewPortWidth = () => {
			const isNextSmallWidthViewport =
				CAN_USE_DOM && window.matchMedia('(max-width: 1025px)').matches;

			if (isNextSmallWidthViewport !== isSmallWidthViewport) {
				setIsSmallWidthViewport(isNextSmallWidthViewport);
			}
		};
		updateViewPortWidth();
		window.addEventListener('resize', updateViewPortWidth);

		return () => {
			window.removeEventListener('resize', updateViewPortWidth);
		};
	}, [isSmallWidthViewport]);

	const handleClickOutside = (e) => {
		if (
			nodeRef &&
			nodeRef.current &&
			!nodeRef.current?.contains(e.target)
		) {
			// Save state when clicked outside
			if (label._dirtyElements.size) {
				editor.getEditorState().read(() => {
					const state = editor.getEditorState();
					editor.setEditorState(state);
				});
			}

			setClickedOutside(true);
		}
	};
	const handleClickInside = () => setClickedOutside(false);

	useEffect(() => {
		const ele = editor.getRootElement();
		if (ele) {
			ele.addEventListener('mousedown', handleClickOutside);
			return () =>
				ele.removeEventListener('mousedown', handleClickOutside);
		}
	}, []);

	return (
		<div
			className="relative flex details-card min-h-[70px]  rounded-2xl overflow-hidden group/item "
			ref={nodeRef}
			onClick={handleClickInside}
		>
			<MemoDelete
				className=" absolute top-2 right-2 scale-75 cursor-pointer group/edit invisible group-hover/item:visible"
				onClick={(e) => {
					e.stopPropagation();
					handleDelete();
				}}
			/>
			<LexicalNestedComposer
				initialEditor={label}
				initialTheme={cellEditorConfig.theme}
				initialNodes={cellEditorConfig.nodes}
				skipCollabChecks={true}
			>
				{!isSmallWidthViewport && !clickedOutside && (
					<>
						<FloatingTextFormatToolbarPlugin />
					</>
				)}

				<PlainTextPlugin
					contentEditable={
						<div className="w-full">
							<ContentEditable className="ContentEditable__root stats-card-editable  w-full" />
						</div>
					}
					placeholder={<Placeholder>What's up?</Placeholder>}
					ErrorBoundary={LexicalErrorBoundary}
				/>
			</LexicalNestedComposer>
		</div>
	);
};

export class CompanyProfileDetailsNode extends DecoratorNode<JSX.Element> {
	__children: LexicalEditor[];

	constructor(children: LexicalEditor[] = [], key?: NodeKey) {
		super(key);
		this.__children = children || [];
	}

	static getType(): string {
		return 'company-details';
	}

	static clone(node: CompanyProfileDetailsNode): CompanyProfileDetailsNode {
		return new CompanyProfileDetailsNode(node.__children, node.__key);
	}

	static importJSON(
		serializedNode: SerializedCompanyProfileDetailsNode
	): CompanyProfileDetailsNode {
		const { children } = serializedNode;
		const node = $createCompanyProfileDetailsNode({});
		if (children?.length) {
			children.forEach(function (label) {
				node.__children.push(createEditor());
			});
		}

		const nestedEditors = node.__children;
		nestedEditors.forEach((nestedEditor, i) => {
			const editorState = nestedEditor.parseEditorState(
				children[i].editorState
			);
			if (!editorState.isEmpty()) {
				nestedEditor.setEditorState(editorState);
			}
		});
		return node;
	}

	static importDOM(): DOMConversionMap | null {
		return {
			div: (domNode: HTMLElement) => {
				const tp = domNode.getAttribute('type');
				if (tp !== this.getType()) return null;

				return {
					conversion: convertCompanyProfileDetailsElement,
					priority: COMMAND_PRIORITY_EDITOR,
				};
			},
		};
	}

	exportJSON(): SerializedCompanyProfileDetailsNode {
		return {
			children: this.__children.map((editor) => editor.toJSON()),
			type: this.getType(),
			version: 1,
		};
	}

	createDOM(config: EditorConfig, _editor: LexicalEditor): HTMLElement {
		const el = document.createElement('div');
		el.setAttribute('type', this.getType());
		addClassNamesToElement(el, config.theme.statsCard);
		return el;
	}

	getTextContent(): string {
		return '\n';
	}

	isInline(): false {
		return false;
	}

	updateDOM(): boolean {
		return true;
	}

	decorate(): JSX.Element {
		return (
			<CompanyProfileDetailsComponent
				nodeKey={this.__key}
				initialLabels={this.__children}
			/>
		);
	}
}

function convertCompanyProfileDetailsElement(): DOMConversionOutput {
	return { node: $createCompanyProfileDetailsNode({}) };
}

export function $createCompanyProfileDetailsNode(params: {
	children?: LexicalEditor[];
}): CompanyProfileDetailsNode {
	const { children } = params || {};
	return new CompanyProfileDetailsNode(children);
}

export function $isCompanyProfileDetailsNode(
	node: LexicalNode | null | undefined
): node is CompanyProfileDetailsNode {
	return node instanceof CompanyProfileDetailsNode;
}
