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
import { $createCompanyProfileTitleNode } from "./CompanyProfileTitleNode";

import { $createInlineTitleNode } from "../../InlineBlockPlugin/InlineTitleNode";

export const INSERT_COMPANY_TITLE_COMMAND = createCommand<void>();

export default function CompanyProfileTitlePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {

    return mergeRegister(
      editor.registerCommand(
        INSERT_COMPANY_TITLE_COMMAND,
        () => {
          const title = $createInlineTitleNode();
          const companyProfileTitle = $createCompanyProfileTitleNode().append(title);
          $insertNodeToNearestRoot(companyProfileTitle);
          title.select();
          return true;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor]);

  return null;
}
