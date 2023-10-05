import { $createParagraphNode, $createTextNode } from "lexical";
import { $createToggleNode } from "./ToggleNode";
import { $createToggleIconNode } from "./ToggleIconNode";
import { $createToggleInnerNode } from "./ToggleInnerNode";
import { $createToggleTitleNode } from "./ToggleTitleNode";
import { $createToggleContentNode } from "./ToggleContentNode";

export const $createToggleNodeUtil = ({
  title,
  content,
}: {
  title: string;
  content: string;
}) => {
  console.log("createToggleNodeUtil");

  return $createToggleNode().append(
    $createToggleIconNode(),
    $createToggleInnerNode().append(
      $createToggleTitleNode().append(
        $createParagraphNode().append($createTextNode(title))
      ),
      $createToggleContentNode().append(
        $createParagraphNode().append($createParagraphNode())
      )
    )
  );
};
