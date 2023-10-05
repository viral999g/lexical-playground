import {
  NodeKey,
  EditorConfig,
  LexicalNode,
  ElementNode,
  SerializedElementNode,
} from "lexical";

type SerializedCollapsibleContentNode = SerializedElementNode;

export class ToggleInnerNode extends ElementNode {
  static getType(): string {
    return "ToggleInnerNode";
  }

  static clone(node: ToggleInnerNode): ToggleInnerNode {
    return new ToggleInnerNode(node.__key);
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  createDOM<EditorContext>(config: EditorConfig<EditorContext>): HTMLElement {
    const element = document.createElement("div");
    element.className = "Toggle-inner";
    return element;
  }

  updateDOM(): false {
    return false;
  }

  exportJSON(): SerializedCollapsibleContentNode {
    return {
      ...super.exportJSON(),
      type: "ToggleInnerNode",
      version: 1,
    };
  }
}

export const $createToggleInnerNode = (): ToggleInnerNode => {
  return new ToggleInnerNode();
};

export const $isToggleInnerNode = (
  node?: LexicalNode
): node is ToggleInnerNode => {
  return node instanceof ToggleInnerNode;
};
