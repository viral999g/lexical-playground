import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
	$insertNodeToNearestRoot,
	addClassNamesToElement,
	mergeRegister,
} from '@lexical/utils';
import {
	$applyNodeReplacement,
	$createParagraphNode,
	$getSelection,
	$isRangeSelection,
	COMMAND_PRIORITY_EDITOR,
	type CommandPayloadType,
	type DOMConversionMap,
	type DOMConversionOutput,
	type DOMExportOutput,
	type EditorConfig,
	type ElementFormatType,
	ElementNode,
	type LexicalCommand,
	type LexicalEditor,
	type LexicalNode,
	type NodeKey,
	type ParagraphNode,
	type PasteCommandType,
	type RangeSelection,
	type SerializedElementNode,
	type Spread,
	type TextFormatType,
	createCommand,
	isHTMLElement,
} from 'lexical';
import { useEffect } from 'react';

type CommandPayload = {
	background?: string;
};

export const INSERT_MAIN_HEADER_COMMAND: LexicalCommand<CommandPayload> =
	createCommand('INSERT_MAIN_HEADER_COMMAND');

export type SerializedMainHeaderNode = Spread<
	{
		background: string;
	},
	SerializedElementNode
>;

export function $createMainHeaderNode(background: string): MainHeaderNode {
	return $applyNodeReplacement(new MainHeaderNode(background));
}

function convertMainHeaderElement(element: HTMLElement): DOMConversionOutput {
	const background = element.style.background || 'transparent';
	const node = $createMainHeaderNode(background);
	if (element.style !== null) {
		node.setFormat(element.style.textAlign as ElementFormatType);
	}
	return { node };
}

export class MainHeaderNode extends ElementNode {
	__background?: string;

	static getType(): string {
		return 'main-header';
	}

	static clone(node: MainHeaderNode): MainHeaderNode {
		return new MainHeaderNode(node.__background, node.__key);
	}

	constructor(background: string, key?: NodeKey) {
		super(key);
		this.__background = background;
	}

	getBackground(): string {
		return this.__background;
	}
	// View

	createDOM(): HTMLElement {
		const element = document.createElement('h1');
		element.style.background = this.__background || 'transparent';
		addClassNamesToElement(element, 'main__header');
		return element;
	}

	updateDOM(prevNode: MainHeaderNode, dom: HTMLElement): boolean {
		return false;
	}

	static importDOM(): DOMConversionMap | null {
		return {
			h1: (node: Node) => ({
				conversion: convertMainHeaderElement,
				priority: 0,
			}),
		};
	}

	exportDOM(editor: LexicalEditor): DOMExportOutput {
		const { element } = super.exportDOM(editor);

		if (element && isHTMLElement(element)) {
			if (this.isEmpty()) element.append(document.createElement('br'));

			const formatType = this.getFormatType();
			element.style.textAlign = formatType;

			const direction = this.getDirection();
			if (direction) {
				element.dir = direction;
			}
		}

		return {
			element,
		};
	}

	static importJSON(
		serializedNode: SerializedMainHeaderNode
	): MainHeaderNode {
		const node = $createMainHeaderNode(serializedNode.background);
		node.setFormat(serializedNode.format);
		node.setIndent(serializedNode.indent);
		node.setDirection(serializedNode.direction);
		return node;
	}

	exportJSON(): SerializedMainHeaderNode {
		return {
			...super.exportJSON(),
			background: this.getBackground(),
			type: 'main-header',
			version: 1,
		};
	}

	// Mutation
	insertNewAfter(
		selection?: RangeSelection,
		restoreSelection = true
	): ParagraphNode | MainHeaderNode {
		const anchorOffet = selection ? selection.anchor.offset : 0;
		const newElement =
			anchorOffet > 0 && anchorOffet < this.getTextContentSize()
				? $createMainHeaderNode(this.getBackground())
				: $createParagraphNode();
		const direction = this.getDirection();
		newElement.setDirection(direction);
		this.insertAfter(newElement, restoreSelection);
		return newElement;
	}

	collapseAtStart(): true {
		const newElement = !this.isEmpty()
			? $createMainHeaderNode(this.getBackground())
			: $createParagraphNode();
		const children = this.getChildren();
		children.forEach((child) => newElement.append(child));
		this.replace(newElement);
		return true;
	}

	extractWithChild(): boolean {
		return true;
	}
}

export function $isMainHeaderNode(
	node: LexicalNode | null | undefined
): node is MainHeaderNode {
	return node instanceof MainHeaderNode;
}

export default function MainHeaderPlugin(): JSX.Element | null {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		return mergeRegister(
			editor.registerCommand(
				INSERT_MAIN_HEADER_COMMAND,
				(payload) => {
					const { background } = payload;
					const selection = $getSelection();

					if (!$isRangeSelection(selection)) return false;

					const focusNode = selection.focus.getNode();
					if (focusNode !== null) {
						const pgBreak = $createMainHeaderNode(background);
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
