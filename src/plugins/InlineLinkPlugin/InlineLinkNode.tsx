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

import './inlineTag.scss';

const InlineLinkComponent = React.lazy(
	// @ts-ignore
	() => import('./InlineLinkComponent')
);
const DEFAULT_MIMETYPE = 'url'
export type SerializedInlineLinkNode = Spread<
	{
		link: string;
		mimetype: string;
	},
	SerializedLexicalNode
>;

function convertEquationElement(
	domNode: HTMLElement
): null | DOMConversionOutput {
	let equation = domNode.getAttribute('data-lexical-link');
	const inline = domNode.getAttribute('data-lexical-link') === 'true';
	// Decode the equation from base64
	if (equation) {
		const node = $createInlineLinkNode(equation);
		return { node };
	}

	return null;
}

export class InlineLinkNode extends DecoratorNode<JSX.Element> {
	__link?: string;
	__mimetype?: string;

	static getType(): string {
		return 'inlineLink';
	}

	static clone(node: InlineLinkNode): InlineLinkNode {
		return new InlineLinkNode(node.__link, node.__mimetype);
	}

	constructor(link: string, mimetype: string, key?: NodeKey) {
		super(key);
		this.__link = link;
		this.__mimetype = mimetype;
	}

	static importJSON(
		serializedNode: SerializedInlineLinkNode
	): InlineLinkNode {
		const node = $createInlineLinkNode(serializedNode.link, serializedNode.mimetype);
		return node;
	}

	exportJSON(): SerializedInlineLinkNode {
		return {
			link: this.getEquation(),
			mimetype: this.__mimetype,
			type: 'inlineLink',
			version: 1,
		};
	}

	createDOM(_config: EditorConfig): HTMLElement {
		const element = document.createElement('a');
		// InlineLinkNodes should implement `user-action:none` in their CSS to avoid issues with deletion on Android.
		element.className = 'title-link';
		return element;
	}

	exportDOM(): DOMExportOutput {
		const element = document.createElement('a');
		// Encode the equation as base64 to avoid issues with special characters
		const equation = this.__link;
		element.setAttribute('data-lexical-link', equation);
		element.setAttribute('href', equation);
		element.setAttribute('target', '_blank');
		return { element };
	}

	static importDOM(): DOMConversionMap | null {
		return {
			a: (domNode: HTMLElement) => {
				if (!domNode.hasAttribute('data-lexical-link')) {
					return null;
				}
				return {
					conversion: convertEquationElement,
					priority: 2,
				};
			},
		};
	}

	updateDOM(prevNode: InlineLinkNode): boolean {
		// If the inline property changes, replace the element
		return this.__inline !== prevNode.__inline;
	}

	getTextContent(): string {
		return this.__link;
	}

	getEquation(): string {
		return this.__link;
	}

	setEquation(equation: string): void {
		const writable = this.getWritable();
		writable.__link = equation;
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
				<InlineLinkComponent
					equation={this.__link}
					nodeKey={this.__key}
					mimetype={this.__mimetype}
				/>
			</Suspense>
		);
	}
}

export function $createInlineLinkNode(
	link = 'https://www.google.com',
	mimetype = DEFAULT_MIMETYPE
): InlineLinkNode {
	const inlineLinkNode = new InlineLinkNode(link, mimetype);
	return $applyNodeReplacement(inlineLinkNode);
}

export function $isInlineLinkNode(
	node: LexicalNode | null | undefined
): node is InlineLinkNode {
	return node instanceof InlineLinkNode;
}
