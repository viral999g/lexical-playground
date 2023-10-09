/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

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

type SerializedInlineTitleNode = SerializedElementNode;

export function convertInlineTitleElement(
  domNode: HTMLElement
): DOMConversionOutput | null {
  const node = $createInlineTitleNode();
  return {
    node,
  };
}

export class InlineTitleNode extends ElementNode {
  static getType(): string {
    return "inline-title";
  }

  static clone(node: InlineTitleNode): InlineTitleNode {
    return new InlineTitleNode(node.__key);
  }

  createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
    const dom = document.createElement("span");
    dom.classList.add("inline_title");
    return dom;
  }

  updateDOM(prevNode: InlineTitleNode, dom: HTMLElement): boolean {
    return true;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        return {
          conversion: convertInlineTitleElement,
          priority: 0,
        };
      },
    };
  }

  static importJSON(
    serializedNode: SerializedInlineTitleNode
  ): InlineTitleNode {
    return $createInlineTitleNode();
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("span");
    return { element };
  }

  exportJSON(): SerializedInlineTitleNode {
    return {
      ...super.exportJSON(),
      type: "inline-title",
      version: 0,
    };
  }

  collapseAtStart(_selection: RangeSelection): boolean {
    this.getParentOrThrow().insertBefore(this);
    return true;
  }

  insertNewAfter(_: RangeSelection, restoreSelection = true): ElementNode {
    const containerNode = this.getParentOrThrow();

    const paragraph = $createInlineTitleNode();
    return paragraph;
  }

  //   insertNewAfter(_: RangeSelection, restoreSelection = true): ElementNode {
  //     const containerNode = this.getParentOrThrow();

  //     if (!$isCollapsibleContainerNode(containerNode)) {
  //       throw new Error(
  //         "InlineTitleNode expects to be child of CollapsibleContainerNode"
  //       );
  //     }

  //     if (containerNode.getOpen()) {
  //       const contentNode = this.getNextSibling();
  //       if (!$isCollapsibleContentNode(contentNode)) {
  //         throw new Error(
  //           "InlineTitleNode expects to have CollapsibleContentNode sibling"
  //         );
  //       }

  //       const firstChild = contentNode.getFirstChild();
  //       if ($isElementNode(firstChild)) {
  //         return firstChild;
  //       } else {
  //         const paragraph = $createParagraphNode();
  //         contentNode.append(paragraph);
  //         return paragraph;
  //       }
  //     } else {
  //       const paragraph = $createParagraphNode();
  //       containerNode.insertAfter(paragraph, restoreSelection);
  //       return paragraph;
  //     }
  //   }
}

export function $createInlineTitleNode(): InlineTitleNode {
  return new InlineTitleNode();
}

export function $isInlineTitleNode(
  node: LexicalNode | null | undefined
): node is InlineTitleNode {
  return node instanceof InlineTitleNode;
}
