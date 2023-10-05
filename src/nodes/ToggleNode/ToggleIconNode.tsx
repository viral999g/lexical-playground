import { FC, ReactNode, useCallback } from "react";
import {
  NodeKey,
  EditorConfig,
  LexicalNode,
  DecoratorNode,
  LexicalEditor,
  SerializedElementNode,
  ElementNode,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNearestNodeOfType } from "@lexical/utils";
import { ToggleNode } from "./ToggleNode";

type SerializedCollapsibleContentNode = SerializedElementNode;

const innerHTML = `<div onClick={onToggle}>
{isExpand ? (
  <svg
    width="1.2em"
    height="1.2em"
    preserveAspectRatio="xMidYMid meet"
    viewBox="0 0 256 256"
  >
    <path
      d="M213.7 101.7l-80 80a8.2 8.2 0 0 1-11.4 0l-80-80a8.4 8.4 0 0 1-1.7-8.8A8 8 0 0 1 48 88h160a8 8 0 0 1 7.4 4.9a8.4 8.4 0 0 1-1.7 8.8z"
      fill="currentColor"
    ></path>
  </svg>
) : (
  <svg
    width="1.2em"
    height="1.2em"
    preserveAspectRatio="xMidYMid meet"
    viewBox="0 0 256 256"
  >
    <path
      d="M181.7 133.7l-80 80A8.3 8.3 0 0 1 96 216a8.5 8.5 0 0 1-3.1-.6A8 8 0 0 1 88 208V48a8 8 0 0 1 4.9-7.4a8.4 8.4 0 0 1 8.8 1.7l80 80a8.1 8.1 0 0 1 0 11.4z"
      fill="currentColor"
    ></path>
  </svg>
)}
</div>`;

export class ToggleIconNode extends DecoratorNode<ReactNode> {
  static getType(): string {
    return "ToggleIconNode";
  }

  static clone(node: ToggleIconNode): ToggleIconNode {
    return new ToggleIconNode(node.__key);
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  createDOM<EditorContext>(config: EditorConfig<EditorContext>): HTMLElement {
    const element = document.createElement("div");
    element.className = "Toggle-icon";
    // element.innerHTML = innerHTML;
    return element;
  }

  updateDOM(): false {
    return false;
  }

  decorate(editor: LexicalEditor): ReactNode {
    const toggleNode = $getNearestNodeOfType<ToggleNode>(this, ToggleNode);
    return <ToggleIconComponent toggleNode={toggleNode} />;
  }

  exportJSON(): SerializedCollapsibleContentNode {
    return {
      ...super.exportJSON(),
      type: "ToggleIconNode",
      version: 1,
    };
  }
}

export const $createToggleIconNode = (): ToggleIconNode => {
  return new ToggleIconNode();
};

export const $isToggleIconNode = (
  node?: LexicalNode
): node is ToggleIconNode => {
  return node instanceof ToggleIconNode;
};

const ToggleIconComponent: FC<Props> = ({ toggleNode }) => {
  const [editor] = useLexicalComposerContext();
  const onToggle = useCallback(() => {
    editor.update(() => {
      toggleNode.toggle();
    });
  }, [editor, toggleNode]);
  const isExpand = editor.getEditorState().read(() => toggleNode.getIsExpand());
  return (
    <div onClick={onToggle}>
      {isExpand ? (
        <svg
          width="1.2em"
          height="1.2em"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 256 256"
        >
          <path
            d="M213.7 101.7l-80 80a8.2 8.2 0 0 1-11.4 0l-80-80a8.4 8.4 0 0 1-1.7-8.8A8 8 0 0 1 48 88h160a8 8 0 0 1 7.4 4.9a8.4 8.4 0 0 1-1.7 8.8z"
            fill="currentColor"
          ></path>
        </svg>
      ) : (
        <svg
          width="1.2em"
          height="1.2em"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 256 256"
        >
          <path
            d="M181.7 133.7l-80 80A8.3 8.3 0 0 1 96 216a8.5 8.5 0 0 1-3.1-.6A8 8 0 0 1 88 208V48a8 8 0 0 1 4.9-7.4a8.4 8.4 0 0 1 8.8 1.7l80 80a8.1 8.1 0 0 1 0 11.4z"
            fill="currentColor"
          ></path>
        </svg>
      )}
    </div>
  );
};

interface Props {
  toggleNode: ToggleNode;
}
