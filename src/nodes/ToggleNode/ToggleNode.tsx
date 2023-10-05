import {
  NodeKey,
  EditorConfig,
  LexicalNode,
  ElementNode,
  SerializedElementNode,
} from "lexical";
import { addClassNamesToElement } from "@lexical/utils";

import "./ToggleNode.css";

type SerializedCollapsibleContentNode = SerializedElementNode;

export class ToggleNode extends ElementNode {
  __isExpand: boolean = false;

  static getType(): string {
    return "ToggleNode";
  }

  static clone(node: ToggleNode): ToggleNode {
    return new ToggleNode(node.__key);
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  createDOM<EditorContext>(config: EditorConfig<EditorContext>): HTMLElement {
    const element = document.createElement("div");
    addClassNamesToElement(element, "Toggle", this.__isExpand && "isExpand");
    return element;
  }

  updateDOM<EditorContext>(
    prevNode: ToggleNode,
    dom: HTMLElement,
    config: EditorConfig<EditorContext>
  ): boolean {
    return prevNode.__isExpand !== this.__isExpand;
  }

  getIsExpand(): boolean {
    return this.getLatest<ToggleNode>().__isExpand;
  }

  setIsExpand(isExpand: boolean): boolean {
    const writable = this.getWritable<ToggleNode>();
    writable.__isExpand = isExpand;
    return this.__isExpand;
  }

  toggle(): void {
    this.setIsExpand(!this.getIsExpand());
  }

  exportJSON(): SerializedCollapsibleContentNode {
    return {
      ...super.exportJSON(),
      type: "ToggleNode",
      version: 1,
    };
  }
}

export const $createToggleNode = (): ToggleNode => {
  return new ToggleNode();
};

export const $isToggleNode = (node?: LexicalNode): node is ToggleNode => {
  return node instanceof ToggleNode;
};
