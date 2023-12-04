import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $findMatchingParent,
  $insertNodeToNearestRoot,
  mergeRegister,
} from "@lexical/utils";
import {
  COMMAND_PRIORITY_LOW,
  createCommand,
} from "lexical";
import { useEffect } from "react";
import { $createFlexColumnNode } from "./FlexColumnPluginNode";

import "./FlexColumnPlugin.scss";

export const INSERT_FLEX_COLUMN_COMMAND = createCommand<void>();

export default function FlexColumnPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {

    return mergeRegister(
      editor.registerCommand(
        INSERT_FLEX_COLUMN_COMMAND,
        () => {
          const createFlexColumn = $createFlexColumnNode()
          $insertNodeToNearestRoot(createFlexColumn);
          return true;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor]);

  return null;
}
