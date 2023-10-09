import {
  $createParagraphNode,
  $isElementNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementNode,
  LexicalEditor,
  LexicalNode,
  RangeSelection,
  SerializedElementNode,
} from "lexical";

type SerializedInlineBlockNode = SerializedElementNode;

export function convertInlineBlockElement(
  domNode: HTMLElement
): DOMConversionOutput | null {
  const node = $createInlineBlockNode();
  return {
    node,
  };
}

export class InlineBlockNode extends ElementNode {
  static getType(): string {
    return "inline-block";
  }

  static clone(node: InlineBlockNode): InlineBlockNode {
    return new InlineBlockNode(node.__key);
  }

  createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
    const dom = document.createElement("p");
    dom.classList.add("inline-block-container");
    return dom;
  }

  updateDOM(prevNode: InlineBlockNode, dom: HTMLElement): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      p: (domNode: HTMLElement) => {
        return {
          conversion: convertInlineBlockElement,
          priority: 0,
        };
      },
    };
  }

  static importJSON(
    serializedNode: SerializedInlineBlockNode
  ): InlineBlockNode {
    const node = $createInlineBlockNode();
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("p");
    return { element };
  }

  exportJSON(): SerializedInlineBlockNode {
    return {
      ...super.exportJSON(),
      type: "inline-block",
      version: 1,
    };
  }

  collapseAtStart(_selection: RangeSelection): boolean {
    this.getParentOrThrow().insertBefore(this);
    return true;
  }
}

export function $createInlineBlockNode(): InlineBlockNode {
  return new InlineBlockNode();
}

export function $isInlineBlockNode(
  node: LexicalNode | null | undefined
): node is InlineBlockNode {
  return node instanceof InlineBlockNode;
}
