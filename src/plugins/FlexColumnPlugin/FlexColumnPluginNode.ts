import {
	DOMConversionMap,
	DOMConversionOutput,
	DOMExportOutput,
	EditorConfig,
	ElementNode,
	LexicalEditor,
	LexicalNode,
	RangeSelection,
	SerializedElementNode,
} from 'lexical';

type SerializedFlexColumnNode = SerializedElementNode;

export function convertFlexColumnElement(
	domNode: HTMLElement
): DOMConversionOutput | null {
	const node = $createFlexColumnNode();
	return {
		node,
	};
}

export class FlexColumnPluginNode extends ElementNode {
	static getType(): string {
		return 'column-layout';
	}

	static clone(node: FlexColumnPluginNode): FlexColumnPluginNode {
		return new FlexColumnPluginNode(node.__key);
	}

	createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
		const dom = document.createElement('div');
		dom.classList.add('column-layout-container');
		return dom;
	}

	updateDOM(prevNode: FlexColumnPluginNode, dom: HTMLElement): boolean {
		return false;
	}

	static importDOM(): DOMConversionMap | null {
		return {
			p: (domNode: HTMLElement) => {
				return {
					conversion: convertFlexColumnElement,
					priority: 0,
				};
			},
		};
	}

	static importJSON(
		serializedNode: SerializedFlexColumnNode
	): FlexColumnPluginNode {
		const node = $createFlexColumnNode();
		node.setIndent(serializedNode.indent);
		node.setDirection(serializedNode.direction);
		return node;
	}

	exportDOM(): DOMExportOutput {
		const element = document.createElement('div');
		return { element };
	}

	exportJSON(): SerializedFlexColumnNode {
		return {
			...super.exportJSON(),
			type: 'column-layout',
			version: 1,
		};
	}

	collapseAtStart(_selection: RangeSelection): boolean {
		this.getParentOrThrow().insertBefore(this);
		return true;
	}
}

export function $createFlexColumnNode(): FlexColumnPluginNode {
	return new FlexColumnPluginNode();
}

export function $isFlexColumnNode(
	node: LexicalNode | null | undefined
): node is FlexColumnPluginNode {
	return node instanceof FlexColumnPluginNode;
}
