/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import katex from 'katex';
import type {
	DOMConversionMap,
	DOMConversionOutput,
	EditorConfig,
	LexicalNode,
	NodeKey,
	SerializedLexicalNode,
	Spread,
} from 'lexical';
import { $applyNodeReplacement, DOMExportOutput, DecoratorNode } from 'lexical';
import * as React from 'react';
import { Suspense } from 'react';

const IFrameComponent = React.lazy(
	// @ts-ignore
	() => import('./IFrameComponent')
);

export type SerializedIFrameNode = Spread<
	{
		src: string;
		height?: string;
		width?: string;
	},
	SerializedLexicalNode
>;

function convertIFrameElement(
	domNode: HTMLElement
): null | DOMConversionOutput {
	let src = domNode.getAttribute('data-lexical-iframe');
	// const inline = domNode.getAttribute('data-lexical-iframe') === 'true';
	// Decode the equation from base64
	if (src) {
		const node = $createIFrameNodeNode(src, '', '');
		return { node };
	}

	return null;
}

export class IFrameNode extends DecoratorNode<JSX.Element> {
	__src: string;
	__height: string;
	__width: string;

	static getType(): string {
		return 'iframeNode';
	}

	static clone(node: IFrameNode): IFrameNode {
		return new IFrameNode(
			node.__src,

			node.__height,
			node.__width
		);
	}

	constructor(src: string, height?: string, width?: string, key?: NodeKey) {
		super(key);
		this.__src = src;
		this.__height = height ?? '';
		this.__width = width ?? '';
	}

	static importJSON(serializedNode: SerializedIFrameNode): IFrameNode {
		const node = $createIFrameNodeNode(
			serializedNode.src,
			serializedNode.height,
			serializedNode.width
		);
		return node;
	}

	exportJSON(): SerializedIFrameNode {
		return {
			src: this.getEquation(),
			height: this.__height,
			width: this.__width,
			type: 'iframeNode',
			version: 1,
		};
	}

	createDOM(_config: EditorConfig): HTMLElement {
		const element = document.createElement('span');
		// InlineTagNodes should implement `user-action:none` in their CSS to avoid issues with deletion on Android.
		element.className = 'editor-tag';
		return element;
	}

	exportDOM(): DOMExportOutput {
		const element = document.createElement('div');
		// Encode the equation as base64 to avoid issues with special characters
		const equation = this.__src;
		element.setAttribute('data-lexical-iframe', equation);
		// element.setAttribute('data-lexical-iframe', `${this.__inline}`);
		element.innerHTML = equation;
		return { element };
	}

	static importDOM(): DOMConversionMap | null {
		return {
			div: (domNode: HTMLElement) => {
				return {
					conversion: convertIFrameElement,
					priority: 0,
				};
			},
		};
	}

	updateDOM(prevNode: IFrameNode): boolean {
		// If the inline property changes, replace the element
		return this.__inline !== prevNode.__inline;
	}

	getTextContent(): string {
		return this.__src;
	}

	getEquation(): string {
		return this.__src;
	}

	setEquation(equation: string): void {
		const writable = this.getWritable();
		writable.__src = equation;
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
				<IFrameComponent
					src={this.__src}
					height={this.__height}
					width={this.__width}
					nodeKey={this.__key}
				/>
			</Suspense>
		);
	}
}

export function $createIFrameNodeNode(src = '', height, width): IFrameNode {
	const inlineTagNode = new IFrameNode(src, height, width);
	return $applyNodeReplacement(inlineTagNode);
}

export function $isIFrameNode(
	node: LexicalNode | null | undefined
): node is IFrameNode {
	return node instanceof IFrameNode;
}
