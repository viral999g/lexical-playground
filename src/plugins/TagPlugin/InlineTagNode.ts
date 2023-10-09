import { SerializedDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
import {
  $createParagraphNode,
  $isElementNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementNode,
  DecoratorNode,
  LexicalEditor,
  LexicalNode,
  RangeSelection,
  SerializedElementNode,
  SerializedLexicalNode,
  $applyNodeReplacement,
} from "lexical";

import "./inlineTagPlugin.scss";

type SerializedInlineTagNode = SerializedElementNode;

export function convertInlineTagElement(
  domNode: HTMLElement
): DOMConversionOutput | null {
  const node = $createInlineTagNode();
  return {
    node,
  };
}

export class InlineTagNode extends ElementNode {
  static getType(): string {
    return "inline-tag";
  }

  static clone(node: InlineTagNode): InlineTagNode {
    return new InlineTagNode(node.__key);
  }

  createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
    const dom = document.createElement("span");
    dom.classList.add("inline-tag-container");
    return dom;
  }

  updateDOM(prevNode: InlineTagNode, dom: HTMLElement): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        return {
          conversion: convertInlineTagElement,
          priority: 0,
        };
      },
    };
  }

  static importJSON(serializedNode: SerializedInlineTagNode): InlineTagNode {
    return $createInlineTagNode();
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("span");
    return { element };
  }

  exportJSON(): SerializedInlineTagNode {
    return {
      ...super.exportJSON(),
      type: "inline-tag",
      version: 1,
    };
  }

  collapseAtStart(_selection: RangeSelection): boolean {
    this.getParentOrThrow().insertBefore(this);
    return true;
  }
}

export function $createInlineTagNode(): InlineTagNode {
  return new InlineTagNode();
}

export function $isInlineTagNode(
  node: LexicalNode | null | undefined
): node is InlineTagNode {
  return node instanceof InlineTagNode;
}
