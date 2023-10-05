import {
  NodeKey,
  EditorConfig,
  LexicalNode,
  ElementNode,
  SerializedElementNode,
} from "lexical";

type SerializedCollapsibleContentNode = SerializedElementNode;

export class ToggleTitleNode extends ElementNode {
  static getType(): string {
    return "ToggleTitleNode";
  }

  static clone(node: ToggleTitleNode): ToggleTitleNode {
    return new ToggleTitleNode(node.__key);
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  createDOM<EditorContext>(config: EditorConfig<EditorContext>): HTMLElement {
    const element = document.createElement("div");
    element.className = "Toggle-title";
    return element;
  }

  updateDOM(): false {
    return false;
  }

  exportJSON(): SerializedCollapsibleContentNode {
    return {
      ...super.exportJSON(),
      type: "ToggleTitleNode",
      version: 1,
    };
  }
}

export const $createToggleTitleNode = (): ToggleTitleNode => {
  return new ToggleTitleNode();
};

export const $isToggleTitleNode = (
  node?: LexicalNode
): node is ToggleTitleNode => {
  return node instanceof ToggleTitleNode;
};
