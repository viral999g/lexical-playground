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
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedGridCellNode,
  Spread,
} from 'lexical';

import { addClassNamesToElement } from '@lexical/utils';
import {
  $applyNodeReplacement,
  $createParagraphNode,
  $isElementNode,
  $isLineBreakNode,
  DEPRECATED_GridCellNode,
} from 'lexical';

import { PIXEL_VALUE_REG_EXP } from './constants';
import { $sortTableColumn } from './LexicalTableUtils';

export const TableCellHeaderStates = {
  BOTH: 3,
  COLUMN: 2,
  NO_STATUS: 0,
  ROW: 1,
};

export type TableCellHeaderState =
  typeof TableCellHeaderStates[keyof typeof TableCellHeaderStates];

export type SerializedTableCellNode = Spread<
  {
    headerState: TableCellHeaderState;
    width?: number;
    backgroundColor?: null | string;
    sortable: boolean;
    sortDirection: 'ascending' | 'descending';
  },
  SerializedGridCellNode
>;

/** @noInheritDoc */
export class TableCellNode extends DEPRECATED_GridCellNode {
  /** @internal */
  __headerState: TableCellHeaderState;
  /** @internal */
  __width?: number;
  /** @internal */
  __backgroundColor: null | string;
  __sortable: boolean = false;
  __sortDirection: 'ascending' | 'descending';

  static getType(): string {
    return 'tablecell';
  }

  static clone(node: TableCellNode): TableCellNode {
    const cellNode = new TableCellNode(
      node.__headerState,
      node.__colSpan,
      node.__width,
      node.__key,
    );
    cellNode.__rowSpan = node.__rowSpan;
    cellNode.__backgroundColor = node.__backgroundColor;
    return cellNode;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      td: (node: Node) => ({
        conversion: convertTableCellNodeElement,
        priority: 0,
      }),
      th: (node: Node) => ({
        conversion: convertTableCellNodeElement,
        priority: 0,
      }),
    };
  }

  static importJSON(serializedNode: SerializedTableCellNode): TableCellNode {
    const colSpan = serializedNode.colSpan || 1;
    const rowSpan = serializedNode.rowSpan || 1;
    const cellNode = $createTableCellNode(
      serializedNode.headerState,
      colSpan,
      serializedNode.width || undefined,
    );
    cellNode.__rowSpan = rowSpan;
    cellNode.__sortable = serializedNode.sortable;
    if (serializedNode.sortDirection) {
      cellNode.__sortDirection = serializedNode.sortDirection;
    }
    cellNode.__backgroundColor = serializedNode.backgroundColor || null;
    return cellNode;
  }

  constructor(
    headerState = TableCellHeaderStates.NO_STATUS,
    colSpan = 1,
    width?: number,
    key?: NodeKey,
  ) {
    super(colSpan, key);
    this.__headerState = headerState;
    this.__width = width;
    this.__backgroundColor = null;
  }

  createDOM(config: EditorConfig, editor): HTMLElement {
    const element = document.createElement(
      this.getTag(),
    ) as HTMLTableCellElement;

    if (this.__width) {
      element.style.width = `${this.__width}px`;
    }
    if (this.__colSpan > 1) {
      element.colSpan = this.__colSpan;
    }
    if (this.__rowSpan > 1) {
      element.rowSpan = this.__rowSpan;
    }
    if (this.__backgroundColor !== null) {
      element.style.backgroundColor = this.__backgroundColor;
    }
    if (this.__headerState === TableCellHeaderStates.ROW && this.__sortable) {
      const toggleEle = document.createElement('div')
      const tempContainer = document.createElement('div');

      const svgString = `
        <svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 5L5 1L1 5L9 5Z" fill="${this.__sortDirection === 'ascending' ? '#000' : '#B1B5C4'}" stroke="#B1B5C3" stroke-width="0.3" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M1 7L5 11L9 7H1Z" fill="${this.__sortDirection === 'descending' ? '#000' : '#B1B5C4'}"  stroke="#B1B5C3" stroke-width="0.3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
      tempContainer.innerHTML = svgString;

      const svgElement = tempContainer.firstChild as ChildNode;
      toggleEle.appendChild(svgElement as ChildNode);
      tempContainer.classList.add('custom-table-sorting-icon')
      tempContainer.addEventListener('click', (e) => {
        editor.update(() => {
          const newDir = this.__sortDirection === 'ascending' ? 'descending' : 'ascending'
          this.setSortDirection(newDir)
          $sortTableColumn(editor, this, newDir)
        })
      });
      element.append(tempContainer);
    }
    addClassNamesToElement(
      element,
      config.theme.tableCell,
      this.hasHeader() && config.theme.tableCellHeader,
      this.__sortable && 'custom-sortable-header'
    );

    return element;
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const { element } = super.exportDOM(editor);

    if (element) {
      const element_ = element as HTMLTableCellElement;
      const maxWidth = 700;
      const colCount = this.getParentOrThrow().getChildrenSize();
      element_.style.border = '1px solid black';
      if (this.__colSpan > 1) {
        element_.colSpan = this.__colSpan;
      }
      if (this.__rowSpan > 1) {
        element_.rowSpan = this.__rowSpan;
      }
      element_.style.width = `${this.getWidth() || Math.max(90, maxWidth / colCount)
        }px`;

      element_.style.verticalAlign = 'top';
      element_.style.textAlign = 'start';

      const backgroundColor = this.getBackgroundColor();
      if (backgroundColor !== null) {
        element_.style.backgroundColor = backgroundColor;
      } else if (this.hasHeader()) {
        element_.style.backgroundColor = '#f2f3f5';
      }
    }

    return {
      element,
    };
  }

  exportJSON(): SerializedTableCellNode {
    return {
      ...super.exportJSON(),
      backgroundColor: this.getBackgroundColor(),
      headerState: this.__headerState,
      type: 'tablecell',
      width: this.getWidth(),
      sortable: this.__sortable,
      sortDirection: this.__sortDirection,
    };
  }

  getTag(): string {
    return this.hasHeader() ? 'th' : 'td';
  }

  setSortDirection(direction: 'ascending' | 'descending'): 'ascending' | 'descending' {
    const self = this.getWritable();
    self.__sortDirection = direction;
    self.__sortable = true;
    return this.__sortDirection;
  }

  setHeaderStyles(headerState: TableCellHeaderState): TableCellHeaderState {
    const self = this.getWritable();
    self.__headerState = headerState;
    return this.__headerState;
  }

  getHeaderStyles(): TableCellHeaderState {
    return this.getLatest().__headerState;
  }

  setWidth(width: number): number | null | undefined {
    const self = this.getWritable();
    self.__width = width;
    return this.__width;
  }

  getWidth(): number | undefined {
    return this.getLatest().__width;
  }

  getBackgroundColor(): null | string {
    return this.getLatest().__backgroundColor;
  }

  setBackgroundColor(newBackgroundColor: null | string): void {
    this.getWritable().__backgroundColor = newBackgroundColor;
  }

  toggleHeaderStyle(headerStateToToggle: TableCellHeaderState): TableCellNode {
    const self = this.getWritable();

    if ((self.__headerState & headerStateToToggle) === headerStateToToggle) {
      self.__headerState -= headerStateToToggle;
    } else {
      self.__headerState += headerStateToToggle;
    }

    return self;
  }

  hasHeaderState(headerState: TableCellHeaderState): boolean {
    return (this.getHeaderStyles() & headerState) === headerState;
  }

  hasHeader(): boolean {
    return this.getLatest().__headerState !== TableCellHeaderStates.NO_STATUS;
  }

  updateDOM(prevNode: TableCellNode): boolean {
    return (
      prevNode.__headerState !== this.__headerState ||
      prevNode.__width !== this.__width ||
      prevNode.__colSpan !== this.__colSpan ||
      prevNode.__rowSpan !== this.__rowSpan ||
      prevNode.__backgroundColor !== this.__backgroundColor ||
      prevNode.__sortDirection !== this.__sortDirection ||
      prevNode.__sortable !== this.__sortable
    );
  }

  isShadowRoot(): boolean {
    return true;
  }

  collapseAtStart(): true {
    return true;
  }

  canBeEmpty(): false {
    return false;
  }

  canIndent(): false {
    return false;
  }
}

export function convertTableCellNodeElement(
  domNode: Node,
): DOMConversionOutput {
  const domNode_ = domNode as HTMLTableCellElement;
  const nodeName = domNode.nodeName.toLowerCase();

  let width: number | undefined = undefined;

  if (PIXEL_VALUE_REG_EXP.test(domNode_.style.width)) {
    width = parseFloat(domNode_.style.width);
  }

  const tableCellNode = $createTableCellNode(
    nodeName === 'th'
      ? TableCellHeaderStates.ROW
      : TableCellHeaderStates.NO_STATUS,
    domNode_.colSpan,
    width,
  );

  tableCellNode.__rowSpan = domNode_.rowSpan;
  const backgroundColor = domNode_.style.backgroundColor;
  if (backgroundColor !== '') {
    tableCellNode.__backgroundColor = backgroundColor;
  }

  return {
    forChild: (lexicalNode, parentLexicalNode) => {
      if ($isTableCellNode(parentLexicalNode) && !$isElementNode(lexicalNode)) {
        const paragraphNode = $createParagraphNode();
        if (
          $isLineBreakNode(lexicalNode) &&
          lexicalNode.getTextContent() === '\n'
        ) {
          return null;
        }
        paragraphNode.append(lexicalNode);
        return paragraphNode;
      }

      return lexicalNode;
    },
    node: tableCellNode,
  };
}

export function $createTableCellNode(
  headerState: TableCellHeaderState,
  colSpan = 1,
  width?: number,
): TableCellNode {
  return $applyNodeReplacement(new TableCellNode(headerState, colSpan, width));
}

export function $isTableCellNode(
  node: LexicalNode | null | undefined,
): node is TableCellNode {
  return node instanceof TableCellNode;
}
