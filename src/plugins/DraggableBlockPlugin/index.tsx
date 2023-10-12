/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import "./index.css";
import { useMemo } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createHeadingNode,
  $createQuoteNode,
  eventFiles,
} from "@lexical/rich-text";
import { $insertNodeToNearestRoot, mergeRegister } from "@lexical/utils";
import {
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $getRoot,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  DRAGOVER_COMMAND,
  DROP_COMMAND,
  LexicalEditor,
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_ELEMENT_COMMAND,
  TextNode,
} from "lexical";
import * as React from "react";
import {
  DragEvent as ReactDragEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { isHTMLElement } from "../../utils/guard";
import { Point } from "../../utils/point";
import { Rect } from "../../utils/rect";
import ColorPicker from "../../ui/ColorPicker";
import { MenuOption } from "@lexical/react/LexicalNodeMenuPlugin";
import { $setBlocksType } from "@lexical/selection";
import { InsertNewTableDialog, InsertTableDialog } from "../TablePlugin";
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { $createCodeNode } from "@lexical/code";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { INSERT_PAGE_BREAK } from "../PageBreakPlugin";
import { INSERT_EXCALIDRAW_COMMAND } from "../ExcalidrawPlugin";
import { InsertPollDialog } from "../PollPlugin";
import { INSERT_EMBED_COMMAND } from "@lexical/react/LexicalAutoEmbedPlugin";
import { InsertEquationDialog } from "../EquationsPlugin";
import { INSERT_IMAGE_COMMAND, InsertImageDialog } from "../ImagesPlugin";

import catTypingGif from "./../../images/cat-typing.gif";
import { EmbedConfigs } from "../AutoEmbedPlugin";
import { INSERT_COLLAPSIBLE_COMMAND } from "../CollapsiblePlugin";
import { INSERT_TOGGLE_COMMAND } from "../../nodes/ToggleNode";
import { INSERT_INLINE_BLOCK_COMMAND } from "../InlineBlockPlugin";
import { InsertTagDialog } from "../InlineTagPlugin";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import useModal from "../../hooks/useModal";

const SPACE = 4;
const TARGET_LINE_HALF_HEIGHT = 2;
const DRAGGABLE_BLOCK_MENU_CLASSNAME = "draggable-block-menu";
const DRAG_DATA_FORMAT = "application/x-lexical-drag-block";
const TEXT_BOX_HORIZONTAL_PADDING = 28;

const Downward = 1;
const Upward = -1;
const Indeterminate = 0;

let prevIndex = Infinity;

class ComponentPickerOption extends MenuOption {
  // What shows up in the editor
  title: string;
  // Icon for display
  icon?: JSX.Element;
  // For extra searching.
  keywords: Array<string>;
  // TBD
  keyboardShortcut?: string;
  // What happens when you select this option?
  onSelect: (queryString: string) => void;

  constructor(
    title: string,
    options: {
      icon?: JSX.Element;
      keywords?: Array<string>;
      keyboardShortcut?: string;
      onSelect: (queryString: string) => void;
    }
  ) {
    super(title);
    this.title = title;
    this.keywords = options.keywords || [];
    this.icon = options.icon;
    this.keyboardShortcut = options.keyboardShortcut;
    this.onSelect = options.onSelect.bind(this);
  }
}

function ComponentPickerMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: ComponentPickerOption;
}) {
  let className = "item";
  if (isSelected) {
    className += " selected";
  }
  return (
    <div
      key={option.key}
      tabIndex={-1}
      className={className}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={"typeahead-item-" + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      {option.icon}
      <span className="text">{option.title}</span>
    </div>
  );
}

function getCurrentIndex(keysLength: number): number {
  if (keysLength === 0) {
    return Infinity;
  }
  if (prevIndex >= 0 && prevIndex < keysLength) {
    return prevIndex;
  }

  return Math.floor(keysLength / 2);
}

function getTopLevelNodeKeys(editor: LexicalEditor): string[] {
  return editor.getEditorState().read(() => $getRoot().getChildrenKeys());
}

function getCollapsedMargins(elem: HTMLElement): {
  marginTop: number;
  marginBottom: number;
} {
  const getMargin = (
    element: Element | null,
    margin: "marginTop" | "marginBottom"
  ): number =>
    element ? parseFloat(window.getComputedStyle(element)[margin]) : 0;

  const { marginTop, marginBottom } = window.getComputedStyle(elem);
  const prevElemSiblingMarginBottom = getMargin(
    elem.previousElementSibling,
    "marginBottom"
  );
  const nextElemSiblingMarginTop = getMargin(
    elem.nextElementSibling,
    "marginTop"
  );
  const collapsedTopMargin = Math.max(
    parseFloat(marginTop),
    prevElemSiblingMarginBottom
  );
  const collapsedBottomMargin = Math.max(
    parseFloat(marginBottom),
    nextElemSiblingMarginTop
  );

  return { marginBottom: collapsedBottomMargin, marginTop: collapsedTopMargin };
}

function getBlockElement(
  anchorElem: HTMLElement,
  editor: LexicalEditor,
  event: MouseEvent,
  useEdgeAsDefault = false
): HTMLElement | null {
  const anchorElementRect = anchorElem.getBoundingClientRect();
  const topLevelNodeKeys = getTopLevelNodeKeys(editor);

  let blockElem: HTMLElement | null = null;

  editor.getEditorState().read(() => {
    if (useEdgeAsDefault) {
      const [firstNode, lastNode] = [
        editor.getElementByKey(topLevelNodeKeys[0]),
        editor.getElementByKey(topLevelNodeKeys[topLevelNodeKeys.length - 1]),
      ];

      const [firstNodeRect, lastNodeRect] = [
        firstNode?.getBoundingClientRect(),
        lastNode?.getBoundingClientRect(),
      ];

      if (firstNodeRect && lastNodeRect) {
        if (event.y < firstNodeRect.top) {
          blockElem = firstNode;
        } else if (event.y > lastNodeRect.bottom) {
          blockElem = lastNode;
        }

        if (blockElem) {
          return;
        }
      }
    }

    let index = getCurrentIndex(topLevelNodeKeys.length);
    let direction = Indeterminate;

    while (index >= 0 && index < topLevelNodeKeys.length) {
      const key = topLevelNodeKeys[index];
      const elem = editor.getElementByKey(key);
      if (elem === null) {
        break;
      }
      const point = new Point(event.x, event.y);
      const domRect = Rect.fromDOM(elem);
      const { marginTop, marginBottom } = getCollapsedMargins(elem);

      const rect = domRect.generateNewRect({
        bottom: domRect.bottom + marginBottom,
        left: anchorElementRect.left,
        right: anchorElementRect.right,
        top: domRect.top - marginTop,
      });

      const {
        result,
        reason: { isOnTopSide, isOnBottomSide },
      } = rect.contains(point);

      if (result) {
        blockElem = elem;
        prevIndex = index;
        break;
      }

      if (direction === Indeterminate) {
        if (isOnTopSide) {
          direction = Upward;
        } else if (isOnBottomSide) {
          direction = Downward;
        } else {
          // stop search block element
          direction = Infinity;
        }
      }

      index += direction;
    }
  });

  return blockElem;
}

function isOnMenu(element: HTMLElement): boolean {
  return !!element.closest(`.${DRAGGABLE_BLOCK_MENU_CLASSNAME}`);
}

function setMenuPosition(
  targetElem: HTMLElement | null,
  floatingElem: HTMLElement,
  anchorElem: HTMLElement
) {
  if (!targetElem) {
    floatingElem.style.opacity = "0";
    floatingElem.style.transform = "translate(-10000px, -10000px)";
    return;
  }

  const targetRect = targetElem.getBoundingClientRect();
  const targetStyle = window.getComputedStyle(targetElem);
  const floatingElemRect = floatingElem.getBoundingClientRect();
  const anchorElementRect = anchorElem.getBoundingClientRect();

  const top =
    targetRect.top +
    (parseInt(targetStyle.lineHeight, 10) - floatingElemRect.height) / 2 -
    anchorElementRect.top;

  const left = SPACE;

  floatingElem.style.opacity = "1";
  floatingElem.style.transform = `translate(${left}px, ${top}px)`;
}

function setDragImage(
  dataTransfer: DataTransfer,
  draggableBlockElem: HTMLElement
) {
  const { transform } = draggableBlockElem.style;

  // Remove dragImage borders
  draggableBlockElem.style.transform = "translateZ(0)";
  dataTransfer.setDragImage(draggableBlockElem, 0, 0);

  setTimeout(() => {
    draggableBlockElem.style.transform = transform;
  });
}

function setTargetLine(
  targetLineElem: HTMLElement,
  targetBlockElem: HTMLElement,
  mouseY: number,
  anchorElem: HTMLElement
) {
  const { top: targetBlockElemTop, height: targetBlockElemHeight } =
    targetBlockElem.getBoundingClientRect();
  const { top: anchorTop, width: anchorWidth } =
    anchorElem.getBoundingClientRect();

  const { marginTop, marginBottom } = getCollapsedMargins(targetBlockElem);
  let lineTop = targetBlockElemTop;
  if (mouseY >= targetBlockElemTop) {
    lineTop += targetBlockElemHeight + marginBottom / 2;
  } else {
    lineTop -= marginTop / 2;
  }

  const top = lineTop - anchorTop - TARGET_LINE_HALF_HEIGHT;
  const left = TEXT_BOX_HORIZONTAL_PADDING - SPACE;

  targetLineElem.style.transform = `translate(${left}px, ${top}px)`;
  targetLineElem.style.width = `${
    anchorWidth - (TEXT_BOX_HORIZONTAL_PADDING - SPACE) * 2
  }px`;
  targetLineElem.style.opacity = ".4";
}

function hideTargetLine(targetLineElem: HTMLElement | null) {
  if (targetLineElem) {
    targetLineElem.style.opacity = "0";
    targetLineElem.style.transform = "translate(-10000px, -10000px)";
  }
}

function useDraggableBlockMenu(
  editor: LexicalEditor,
  anchorElem: HTMLElement,
  isEditable: boolean
): JSX.Element {
  const scrollerElem = anchorElem.parentElement;

  const menuButtonRef = useRef(null);
  const menuRootRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modal, showModal] = useModal();

  const [queryString, setQueryString] = useState<string | null>(null);

  const [scrollY, setScrollY] = useState(0);

  const [initialYScroll, setInitialYScroll] = useState(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const targetLineRef = useRef<HTMLDivElement>(null);
  const isDraggingBlockRef = useRef<boolean>(false);
  const [draggableBlockElem, setDraggableBlockElem] =
    useState<HTMLElement | null>(null);
  const [addCompBlockElem, setAddCompBlockElem] = useState<HTMLElement | null>(
    null
  );

  useEffect(() => {
    function onMouseMove(event: MouseEvent) {
      const target = event.target;
      if (!isHTMLElement(target)) {
        setDraggableBlockElem(null);
        return;
      }

      if (isOnMenu(target)) {
        return;
      }

      const _draggableBlockElem = getBlockElement(anchorElem, editor, event);

      setDraggableBlockElem(_draggableBlockElem);
    }

    function onMouseLeave() {
      if (!isMenuOpen) {
        setDraggableBlockElem(null);
      }
    }

    scrollerElem?.addEventListener("mousemove", onMouseMove);
    scrollerElem?.addEventListener("mouseleave", onMouseLeave);

    return () => {
      scrollerElem?.removeEventListener("mousemove", onMouseMove);
      scrollerElem?.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [scrollerElem, anchorElem, editor]);

  useEffect(() => {
    if (menuRef.current && !isMenuOpen) {
      setMenuPosition(draggableBlockElem, menuRef.current, anchorElem);
    }
  }, [anchorElem, draggableBlockElem, isMenuOpen]);

  useEffect(() => {
    function onDragover(event: DragEvent): boolean {
      if (!isDraggingBlockRef.current) {
        return false;
      }
      const [isFileTransfer] = eventFiles(event);
      if (isFileTransfer) {
        return false;
      }
      const { pageY, target } = event;
      if (!isHTMLElement(target)) {
        return false;
      }
      const targetBlockElem = getBlockElement(anchorElem, editor, event, true);
      const targetLineElem = targetLineRef.current;
      if (targetBlockElem === null || targetLineElem === null) {
        return false;
      }
      setTargetLine(targetLineElem, targetBlockElem, pageY, anchorElem);
      // Prevent default event to be able to trigger onDrop events
      event.preventDefault();
      return true;
    }

    function onDrop(event: DragEvent): boolean {
      if (!isDraggingBlockRef.current) {
        return false;
      }
      const [isFileTransfer] = eventFiles(event);
      if (isFileTransfer) {
        return false;
      }
      const { target, dataTransfer, pageY } = event;
      const dragData = dataTransfer?.getData(DRAG_DATA_FORMAT) || "";
      const draggedNode = $getNodeByKey(dragData);
      if (!draggedNode) {
        return false;
      }
      if (!isHTMLElement(target)) {
        return false;
      }
      const targetBlockElem = getBlockElement(anchorElem, editor, event, true);
      if (!targetBlockElem) {
        return false;
      }
      const targetNode = $getNearestNodeFromDOMNode(targetBlockElem);
      if (!targetNode) {
        return false;
      }
      if (targetNode === draggedNode) {
        return true;
      }
      const targetBlockElemTop = targetBlockElem.getBoundingClientRect().top;
      if (pageY >= targetBlockElemTop) {
        targetNode.insertAfter(draggedNode);
      } else {
        targetNode.insertBefore(draggedNode);
      }
      setDraggableBlockElem(null);

      return true;
    }

    return mergeRegister(
      editor.registerCommand(
        DRAGOVER_COMMAND,
        (event) => {
          return onDragover(event);
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        DROP_COMMAND,
        (event) => {
          return onDrop(event);
        },
        COMMAND_PRIORITY_HIGH
      )
    );
  }, [anchorElem, editor]);

  function onDragStart(event: ReactDragEvent<HTMLDivElement>): void {
    const dataTransfer = event.dataTransfer;
    if (!dataTransfer || !draggableBlockElem) {
      return;
    }
    setDragImage(dataTransfer, draggableBlockElem);
    let nodeKey = "";
    editor.update(() => {
      const node = $getNearestNodeFromDOMNode(draggableBlockElem);
      if (node) {
        nodeKey = node.getKey();
      }
    });
    isDraggingBlockRef.current = true;
    dataTransfer.setData(DRAG_DATA_FORMAT, nodeKey);
  }

  function onDragEnd(): void {
    isDraggingBlockRef.current = false;
    hideTargetLine(targetLineRef.current);
  }

  type TableCellActionMenuProps = Readonly<{
    contextRef: { current: null | HTMLElement };
    onClose: () => void;
    setIsMenuOpen: (isOpen: boolean) => void;
    options: any;
    draggableBlockElem?: any;
  }>;

  function getDynamicOptions(editor: LexicalEditor, queryString: string) {
    const options: Array<ComponentPickerOption> = [];

    if (queryString == null) {
      return options;
    }

    const tableMatch = queryString.match(/^([1-9]\d?)(?:x([1-9]\d?)?)?$/);

    if (tableMatch !== null) {
      const rows = tableMatch[1];
      const colOptions = tableMatch[2]
        ? [tableMatch[2]]
        : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(String);

      options.push(
        ...colOptions.map(
          (columns) =>
            new ComponentPickerOption(`${rows}x${columns} Table`, {
              icon: <i className="icon table" />,
              keywords: ["table"],
              onSelect: () =>
                editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns, rows }),
            })
        )
      );
    }

    return options;
  }

  type ShowModal = ReturnType<typeof useModal>[1];

  function getBaseOptions(editor: LexicalEditor, showModal: ShowModal) {
    return [
      new ComponentPickerOption("Paragraph", {
        icon: <i className="icon paragraph" />,
        keywords: ["normal", "paragraph", "p", "text"],
        onSelect: () =>
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createParagraphNode());
            }
            setIsMenuOpen(false);
          }),
      }),
      ...([1, 2, 3] as const).map(
        (n) =>
          new ComponentPickerOption(`Heading ${n}`, {
            icon: <i className={`icon h${n}`} />,
            keywords: ["heading", "header", `h${n}`],
            onSelect: () =>
              editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                  $setBlocksType(selection, () => $createHeadingNode(`h${n}`));
                }
                setIsMenuOpen(false);
              }),
          })
      ),
      new ComponentPickerOption("Table", {
        icon: <i className="icon table" />,
        keywords: ["table", "grid", "spreadsheet", "rows", "columns"],
        onSelect: () => {
          showModal("Insert Table", (onClose) => (
            <InsertTableDialog
              activeEditor={editor}
              onClose={() => {
                onClose();
                setIsMenuOpen(false);
              }}
            />
          ));
        },
      }),
      new ComponentPickerOption("Table (Experimental)", {
        icon: <i className="icon table" />,
        keywords: ["table", "grid", "spreadsheet", "rows", "columns"],
        onSelect: () =>
          showModal("Insert Table", (onClose) => (
            <InsertNewTableDialog
              activeEditor={editor}
              onClose={() => {
                onClose();
                setIsMenuOpen(false);
              }}
            />
          )),
      }),
      new ComponentPickerOption("Numbered List", {
        icon: <i className="icon number" />,
        keywords: ["numbered list", "ordered list", "ol"],
        onSelect: () => {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
          setIsMenuOpen(false);
        },
      }),
      new ComponentPickerOption("Bulleted List", {
        icon: <i className="icon bullet" />,
        keywords: ["bulleted list", "unordered list", "ul"],
        onSelect: () => {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
          setIsMenuOpen(false);
        },
      }),
      new ComponentPickerOption("Check List", {
        icon: <i className="icon check" />,
        keywords: ["check list", "todo list"],
        onSelect: () => {
          editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
          setIsMenuOpen(false);
        },
      }),
      new ComponentPickerOption("Quote", {
        icon: <i className="icon quote" />,
        keywords: ["block quote"],
        onSelect: () =>
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createQuoteNode());
            }
            setIsMenuOpen(false);
          }),
      }),
      new ComponentPickerOption("Code", {
        icon: <i className="icon code" />,
        keywords: ["javascript", "python", "js", "codeblock"],
        onSelect: () =>
          editor.update(() => {
            const selection = $getSelection();

            if ($isRangeSelection(selection)) {
              if (selection.isCollapsed()) {
                $setBlocksType(selection, () => $createCodeNode());
              } else {
                // Will this ever happen?
                const textContent = selection.getTextContent();
                const codeNode = $createCodeNode();
                selection.insertNodes([codeNode]);
                selection.insertRawText(textContent);
              }
            }
            setIsMenuOpen(false);
          }),
      }),
      new ComponentPickerOption("Divider", {
        icon: <i className="icon horizontal-rule" />,
        keywords: ["horizontal rule", "divider", "hr"],
        onSelect: () => {
          editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
          setIsMenuOpen(false);
        },
      }),
      new ComponentPickerOption("Page Break", {
        icon: <i className="icon page-break" />,
        keywords: ["page break", "divider"],
        onSelect: () => {
          editor.dispatchCommand(INSERT_PAGE_BREAK, undefined);
          setIsMenuOpen(false);
        },
      }),
      new ComponentPickerOption("Excalidraw", {
        icon: <i className="icon diagram-2" />,
        keywords: ["excalidraw", "diagram", "drawing"],
        onSelect: () => {
          editor.dispatchCommand(INSERT_EXCALIDRAW_COMMAND, undefined);
          setIsMenuOpen(false);
        },
      }),
      new ComponentPickerOption("Poll", {
        icon: <i className="icon poll" />,
        keywords: ["poll", "vote"],
        onSelect: () =>
          showModal("Insert Poll", (onClose) => (
            <InsertPollDialog
              activeEditor={editor}
              onClose={() => {
                onClose();
                setIsMenuOpen(false);
              }}
            />
          )),
      }),
      ...EmbedConfigs.map(
        (embedConfig) =>
          new ComponentPickerOption(`Embed ${embedConfig.contentName}`, {
            icon: embedConfig.icon,
            keywords: [...embedConfig.keywords, "embed"],
            onSelect: () => {
              editor.dispatchCommand(INSERT_EMBED_COMMAND, embedConfig.type);
              setIsMenuOpen(false);
            },
          })
      ),
      new ComponentPickerOption("Equation", {
        icon: <i className="icon equation" />,
        keywords: ["equation", "latex", "math"],
        onSelect: () =>
          showModal("Insert Equation", (onClose) => (
            <InsertEquationDialog
              activeEditor={editor}
              onClose={() => {
                console.log("Image close called");

                onClose();
                // setIsMenuOpen(false);
              }}
            />
          )),
      }),
      new ComponentPickerOption("GIF", {
        icon: <i className="icon gif" />,
        keywords: ["gif", "animate", "image", "file"],
        onSelect: () => {
          editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
            altText: "Cat typing on a laptop",
            src: catTypingGif,
          });
          setIsMenuOpen(false);
        },
      }),
      new ComponentPickerOption("Image", {
        icon: <i className="icon image" />,
        keywords: ["image", "photo", "picture", "file"],
        onSelect: () =>
          showModal("Insert Image", (onClose) => (
            <InsertImageDialog
              activeEditor={editor}
              onClose={() => {
                console.log("Image close called");

                onClose();
                setIsMenuOpen(false);
              }}
            />
          )),
      }),
      new ComponentPickerOption("Inline Rounded Image", {
        icon: <i className="icon image" />,
        keywords: ["image", "photo", "picture", "file"],
        onSelect: () =>
          showModal("Insert Image", (onClose) => (
            <InsertImageDialog
              activeEditor={editor}
              onClose={() => {
                onClose();
                setIsMenuOpen(false);
              }}
              rounded
              size={24}
            />
          )),
      }),
      new ComponentPickerOption("Collapsible", {
        icon: <i className="icon caret-right" />,
        keywords: ["collapse", "collapsible", "toggle"],
        onSelect: () => {
          editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined);
          setIsMenuOpen(false);
        },
      }),
      new ComponentPickerOption("Toggle", {
        icon: <i className="icon caret-right" />,
        keywords: ["collapse", "collapsible", "toggle"],
        onSelect: () => {
          editor.dispatchCommand(INSERT_TOGGLE_COMMAND, undefined);
          setIsMenuOpen(false);
        },
      }),
      ...(["left", "center", "right", "justify"] as const).map(
        (alignment) =>
          new ComponentPickerOption(`Align ${alignment}`, {
            icon: <i className={`icon ${alignment}-align`} />,
            keywords: ["align", "justify", alignment],
            onSelect: () => {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment);
              setIsMenuOpen(false);
            },
          })
      ),
      new ComponentPickerOption("Inline Block", {
        icon: <i className="icon caret-right" />,
        keywords: ["inline", "block"],
        onSelect: () => {
          editor.dispatchCommand(INSERT_INLINE_BLOCK_COMMAND, undefined);
          setIsMenuOpen(false);
        },
      }),
      new ComponentPickerOption("Tag", {
        icon: <i className="icon caret-right" />,
        keywords: ["tag"],
        onSelect: () =>
          showModal("Insert Tag", (onClose) => (
            <InsertTagDialog
              activeEditor={editor}
              onClose={() => {
                onClose();
                setIsMenuOpen(false);
              }}
            />
          )),
      }),
      new ComponentPickerOption("Bulleted Point", {
        icon: <i className="icon caret-right" />,
        keywords: ["bullet"],
        onSelect: () =>
          showModal("Insert Bulleted Point", (onClose) => (
            <InsertTagDialog
              activeEditor={editor}
              onClose={() => {
                onClose();
                setIsMenuOpen(false);
              }}
              bullet
            />
          )),
      }),
    ];
  }

  function TableActionMenu({
    onClose,
    setIsMenuOpen,
    contextRef,
    options,
    draggableBlockElem,
  }: TableCellActionMenuProps) {
    const [editor] = useLexicalComposerContext();
    const dropDownRef = useRef<HTMLDivElement | null>(null);
    const [scrollY, setScrollY] = useState(0);

    console.log("draggableBlockElem", draggableBlockElem);

    function logit() {
      setScrollY(window.scrollY);
    }

    useEffect(() => {
      function watchScroll() {
        window.addEventListener("scroll", logit);
      }
      watchScroll();
      return () => {
        window.removeEventListener("scroll", logit);
      };
    });

    useEffect(() => {
      const menuButtonElement = contextRef.current;
      const dropDownElement = dropDownRef.current;
      const rootElement = editor.getRootElement();

      if (
        menuButtonElement != null &&
        dropDownElement != null &&
        rootElement != null
      ) {
        const rootEleRect = rootElement.getBoundingClientRect();
        const menuButtonRect = menuButtonElement.getBoundingClientRect();
        dropDownElement.style.opacity = "1";
        const dropDownElementRect = dropDownElement.getBoundingClientRect();
        const margin = 5;
        let leftPosition = menuButtonRect.right + margin;
        if (
          leftPosition + dropDownElementRect.width > window.innerWidth ||
          leftPosition + dropDownElementRect.width > rootEleRect.right
        ) {
          const position =
            menuButtonRect.left - dropDownElementRect.width - margin;
          leftPosition =
            (position < 0 ? margin : position) + window.pageXOffset;
        }
        dropDownElement.style.left = `${leftPosition + window.pageXOffset}px`;

        let topPosition = menuButtonRect.top;

        if (topPosition + dropDownElementRect.height > window.innerHeight) {
          const position = menuButtonRect.bottom - dropDownElementRect.height;
          topPosition = position < 0 ? margin : position;
        }

        dropDownElement.style.top = `${topPosition}px`;
      }
    }, [contextRef, dropDownRef, editor]);

    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (
          dropDownRef.current != null &&
          contextRef.current != null &&
          !dropDownRef.current.contains(event.target as Node) &&
          !contextRef.current.contains(event.target as Node)
        ) {
          setIsMenuOpen(false);
        }
      }

      window.addEventListener("click", handleClickOutside);

      return () => window.removeEventListener("click", handleClickOutside);
    }, [setIsMenuOpen, contextRef]);

    const componentOnClick = (onClick) => {
      editor.update(() => {
        const node = $getNearestNodeFromDOMNode(draggableBlockElem);
        const paragraph = $createParagraphNode();
        node?.insertAfter(paragraph);
        paragraph?.select();
        onClick();
      });
    };

    return createPortal(
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <>
        <div
          className={`dropdown ${scrollY} add-comp-menu`}
          ref={dropDownRef}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {options.map((option, i: number) => (
            <ComponentPickerMenuItem
              index={i}
              // isSelected={selectedIndex === i}
              onClick={() => {
                componentOnClick(option.onSelect);
              }}
              key={option.key}
              option={option}
            />
          ))}
        </div>
      </>,
      document.body
    );
  }

  const options = useMemo(() => {
    const baseOptions = getBaseOptions(editor, showModal);

    if (!queryString) {
      return baseOptions;
    }

    const regex = new RegExp(queryString, "i");

    return [
      ...getDynamicOptions(editor, queryString),
      ...baseOptions.filter(
        (option) =>
          regex.test(option.title) ||
          option.keywords.some((keyword) => regex.test(keyword))
      ),
    ];
  }, [editor, queryString, isMenuOpen]);

  const onAddClickHandler = (e) => {
    // editor.update(() => {
    //   const node = $getNearestNodeFromDOMNode(draggableBlockElem);
    //   const paragraph = $createParagraphNode();
    //   node?.insertAfter(paragraph);
    //   paragraph?.select();
    // });
    setAddCompBlockElem(draggableBlockElem);
    e.stopPropagation();
    setIsMenuOpen(true);
    setInitialYScroll(scrollY);
  };

  return createPortal(
    <>
      {modal}

      <div
        className="icon draggable-block-menu flex items-center"
        ref={menuRef}
        draggable={true}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div
          className={isEditable ? "icon2" : ""}
          onClick={onAddClickHandler}
          ref={menuRootRef}
        />
        <div className={`${isEditable ? "icon" : ""}`} />
      </div>
      <div className="draggable-block-target-line" ref={targetLineRef} />
      {isMenuOpen && (
        <TableActionMenu
          contextRef={menuRootRef}
          setIsMenuOpen={setIsMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          options={options}
          draggableBlockElem={addCompBlockElem}
        />
      )}
    </>,
    anchorElem
  );
}

export default function DraggableBlockPlugin({
  anchorElem = document.body,
}: {
  anchorElem?: HTMLElement;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  return useDraggableBlockMenu(editor, anchorElem, editor._editable);
}
