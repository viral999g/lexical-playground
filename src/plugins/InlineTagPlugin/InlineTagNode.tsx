/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  DOMConversionMap,
  DOMConversionOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";

import katex from "katex";
import { $applyNodeReplacement, DecoratorNode, DOMExportOutput } from "lexical";
import * as React from "react";
import { Suspense } from "react";

import "./inlineTag.scss";

const InlineTagComponent = React.lazy(
  // @ts-ignore
  () => import("./InlineTagComponent")
);

export type SerializedInlineTagNode = Spread<
  {
    equation: string;
    inline: boolean;
    bullet?: boolean;
    fontColor?: string;
    bgColor?: string;
    icon?: string;
  },
  SerializedLexicalNode
>;

function convertEquationElement(
  domNode: HTMLElement
): null | DOMConversionOutput {
  let equation = domNode.getAttribute("data-lexical-tag");
  const inline = domNode.getAttribute("data-lexical-tag") === "true";
  // Decode the equation from base64
  if (equation) {
    const node = $createInlineTagNode(equation, inline, false, "", "", "");
    return { node };
  }

  return null;
}

export class InlineTagNode extends DecoratorNode<JSX.Element> {
  __equation: string;
  __inline: boolean;
  __bullet: boolean;
  __fontColor: string;
  __bgColor: string;
  __icon?: string;

  static getType(): string {
    return "inlineTag";
  }

  static clone(node: InlineTagNode): InlineTagNode {
    return new InlineTagNode(
      node.__equation,
      node.__inline,
      node.__bullet,
      node.__fontColor,
      node.__bgColor,
      node.__icon,
      node.__key
    );
  }

  constructor(
    equation: string,
    inline?: boolean,
    bullet?: boolean,
    fontColor?: string,
    bgColor?: string,
    icon?: string,
    key?: NodeKey
  ) {
    super(key);
    this.__equation = equation;
    this.__inline = inline ?? false;
    this.__bullet = bullet ?? false;
    this.__fontColor = fontColor ?? "";
    this.__bgColor = bgColor ?? "";
    this.__icon = icon;
  }

  static importJSON(serializedNode: SerializedInlineTagNode): InlineTagNode {
    const node = $createInlineTagNode(
      serializedNode.equation,
      serializedNode.inline,
      serializedNode.bullet,
      serializedNode.fontColor,
      serializedNode.bgColor,
      serializedNode.icon
    );
    return node;
  }

  exportJSON(): SerializedInlineTagNode {
    return {
      equation: this.getEquation(),
      inline: this.__inline,
      bullet: this.__bullet,
      fontColor: this.__fontColor,
      bgColor: this.__bgColor,
      icon: this.getIcon(),
      type: "inlineTag",
      version: 1,
    };
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const element = document.createElement(this.__inline ? "span" : "div");
    // InlineTagNodes should implement `user-action:none` in their CSS to avoid issues with deletion on Android.
    element.className = "editor-tag";
    return element;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement(this.__inline ? "span" : "div");
    // Encode the equation as base64 to avoid issues with special characters
    const equation = this.__equation;
    element.setAttribute("data-lexical-tag", equation);
    element.setAttribute("data-lexical-tag", `${this.__inline}`);
    element.innerHTML = equation;
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-tag")) {
          return null;
        }
        return {
          conversion: convertEquationElement,
          priority: 2,
        };
      },
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-tag")) {
          return null;
        }
        return {
          conversion: convertEquationElement,
          priority: 1,
        };
      },
    };
  }

  updateDOM(prevNode: InlineTagNode): boolean {
    // If the inline property changes, replace the element
    return this.__inline !== prevNode.__inline;
  }

  getTextContent(): string {
    return this.__equation;
  }

  getEquation(): string {
    return this.__equation;
  }

  setEquation(equation: string): void {
    const writable = this.getWritable();
    writable.__equation = equation;
  }

  getIcon(): string | undefined {
    return this.__icon;
  }

  setIcon(icon: string): void {
    const writable = this.getWritable();
    writable.__icon = icon;
  }

  decorate(): JSX.Element {
    return (
      <Suspense fallback={null}>
        <InlineTagComponent
          equation={this.__equation}
          inline={this.__inline}
          bullet={this.__bullet}
          fontColor={this.__fontColor}
          bgColor={this.__bgColor}
          icon={this.__icon}
          nodeKey={this.__key}
        />
      </Suspense>
    );
  }
}

export function $createInlineTagNode(
  equation = "",
  inline = false,
  bullet = false,
  fontColor,
  bgColor,
  icon
): InlineTagNode {
  const inlineTagNode = new InlineTagNode(
    equation,
    inline,
    bullet,
    fontColor,
    bgColor,
    icon
  );
  return $applyNodeReplacement(inlineTagNode);
}

export function $isInlineTagNode(
  node: LexicalNode | null | undefined
): node is InlineTagNode {
  return node instanceof InlineTagNode;
}
