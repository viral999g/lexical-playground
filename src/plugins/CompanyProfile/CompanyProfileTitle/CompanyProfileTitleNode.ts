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

type SerializedCompanyProfileTitleNode = SerializedElementNode;

export function convertCompanyProfileTitleElement(
	domNode: HTMLElement
): DOMConversionOutput | null {
	const node = $createCompanyProfileTitleNode();
	return {
		node,
	};
}

export class CompanyProfileTitleNode extends ElementNode {
	static getType(): string {
		return 'company-profile-title';
	}

	static clone(node: CompanyProfileTitleNode): CompanyProfileTitleNode {
		return new CompanyProfileTitleNode(node.__key);
	}

	createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
		const dom = document.createElement('div');
		dom.classList.add('company-profile-title-container');
		return dom;
	}

	updateDOM(prevNode: CompanyProfileTitleNode, dom: HTMLElement): boolean {
		return false;
	}

	static importDOM(): DOMConversionMap | null {
		return {
			p: (domNode: HTMLElement) => {
				return {
					conversion: convertCompanyProfileTitleElement,
					priority: 0,
				};
			},
		};
	}

	static importJSON(
		serializedNode: SerializedCompanyProfileTitleNode
	): CompanyProfileTitleNode {
		const node = $createCompanyProfileTitleNode();
		node.setIndent(serializedNode.indent);
		node.setDirection(serializedNode.direction);
		return node;
	}

	exportDOM(): DOMExportOutput {
		const element = document.createElement('p');
		return { element };
	}

	exportJSON(): SerializedCompanyProfileTitleNode {
		return {
			...super.exportJSON(),
			type: this.getType(),
			version: 1,
		};
	}

	collapseAtStart(_selection: RangeSelection): boolean {
		this.getParentOrThrow().insertBefore(this);
		return true;
	}
}

export function $createCompanyProfileTitleNode(): CompanyProfileTitleNode {
	return new CompanyProfileTitleNode();
}

export function $isCompanyProfileTitleNode(
	node: LexicalNode | null | undefined
): node is CompanyProfileTitleNode {
	return node instanceof CompanyProfileTitleNode;
}
