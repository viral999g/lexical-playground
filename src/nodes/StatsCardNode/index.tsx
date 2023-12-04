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

export type SerializedStatsCardNode = Spread<
	{
		children?: ILabelInstance[];
		backgrounds: string[];
	},
	SerializedLexicalNode
>;

const cellEditorConfig = {
	namespace: 'StatsCard',
	nodes: [...TableCellNodes],
	onError: (error: Error) => {
		throw error;
	},
	theme: PlaygroundEditorTheme,
};

function StatsCardComponent({
	nodeKey,
	initialLabels,
	backgrounds = [],
}: {
	nodeKey: NodeKey;
	initialLabels: LexicalEditor[];
	backgrounds: string[];
}) {
	const [labels, setLabels] = useState(initialLabels);
	const [backgroundList, setBackgroundList] = useState(backgrounds);
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
				if ($isStatsCardNode(node)) {
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
		backgrounds.splice(index, 1);
		setLabels([...initialLabels]);
		setBackgroundList([...backgrounds]);

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
		<div className="grid lg:grid-cols-3 auto-cols-auto gap-3 stats-card-group-wrapper">
			{labels.map((ele, i) => {
				return (
					<EditableNodeCard
						background={backgroundList[i]}
						label={ele}
						key={ele.getKey()}
						handleDelete={() => handleDelete(i)}
					/>
				);
			})}
		</div>
	);
}

const EditableNodeCard = ({
	background,
	label,
	handleDelete,
}: {
	background: string;
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

	// useEffect(() => {
	// 	label.registerUpdateListener((update) => {
	// 		if (update.dirtyElements?.size) {
	// 			editor.getEditorState().read(() => {
	// 				const state = editor.getEditorState();
	// 				editor.setEditorState(state);
	// 			});
	// 		}
	// 	});
	// }, []);

	return (
		<div
			className="relative flex stats-card min-h-[100px] px-6 rounded-2xl overflow-hidden items-center"
			ref={nodeRef}
			onClick={handleClickInside}
			style={
				background && {
					backgroundImage: `url("${background}")`,
				}
			}
		>
			<MemoDelete
				className=" absolute top-2 right-2 scale-75 cursor-pointer"
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

export class StatsCardNode extends DecoratorNode<JSX.Element> {
	__children: LexicalEditor[];
	__backgrounds: string[];

	constructor(
		children: LexicalEditor[] = [],
		backgrounds: string[] = [],
		key?: NodeKey
	) {
		super(key);
		this.__children = children || [];
		this.__backgrounds = backgrounds || [];
	}

	static getType(): string {
		return 'stats-card';
	}

	static clone(node: StatsCardNode): StatsCardNode {
		return new StatsCardNode(node.__children, node.__backgrounds, node.__key);
	}

	static importJSON(serializedNode: SerializedStatsCardNode): StatsCardNode {
		const { children, backgrounds } = serializedNode;
		const node = $createStatsCardNode({});
		node.__backgrounds = backgrounds;
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
					conversion: convertStatsCardElement,
					priority: COMMAND_PRIORITY_EDITOR,
				};
			},
		};
	}

	exportJSON(): SerializedStatsCardNode {
		return {
			children: this.__children.map((editor) => editor.toJSON()),
			backgrounds: this.__backgrounds,
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
			<StatsCardComponent
				nodeKey={this.__key}
				initialLabels={this.__children}
				backgrounds={this.__backgrounds}
			/>
		);
	}
}

function convertStatsCardElement(): DOMConversionOutput {
	return { node: $createStatsCardNode({}) };
}

export function $createStatsCardNode(params: {
	children?: LexicalEditor[];
}): StatsCardNode {
	const { children } = params || {};
	return new StatsCardNode(children);
}

export function $isStatsCardNode(
	node: LexicalNode | null | undefined
): node is StatsCardNode {
	return node instanceof StatsCardNode;
}
