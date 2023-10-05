import {
  NodeKey,
  EditorConfig,
  LexicalNode,
  ElementNode,
  SerializedElementNode,
} from "lexical";

type SerializedCollapsibleContentNode = SerializedElementNode;

export class ToggleContentNode extends ElementNode {
  static getType(): string {
    return "ToggleContentNode";
  }

  static clone(node: ToggleContentNode): ToggleContentNode {
    return new ToggleContentNode(node.__key);
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  createDOM<EditorContext>(config: EditorConfig<EditorContext>): HTMLElement {
    const element = document.createElement("div");
    element.className = "Toggle-content";
    return element;
  }

  updateDOM(): false {
    return false;
  }

  exportJSON(): SerializedCollapsibleContentNode {
    return {
      ...super.exportJSON(),
      type: "ToggleContentNode",
      version: 1,
    };
  }
}

export const $createToggleContentNode = (): ToggleContentNode => {
  return new ToggleContentNode();
};

export const $isToggleContentNode = (
  node?: LexicalNode
): node is ToggleContentNode => {
  return node instanceof ToggleContentNode;
};
