/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$insertNodeToNearestRoot, mergeRegister} from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand,
} from 'lexical';
import {useEffect} from 'react';

import {$createStatsCardNode,StatsCardNode} from '../../nodes/StatsCardNode';

export const INSERT_STATS_CARD: LexicalCommand<undefined> = createCommand();

export default function StatsCardPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([StatsCardNode]))
      throw new Error(
        'StatsCardPlugin: StatsCardNode is not registered on editor',
      );

    return mergeRegister(
      editor.registerCommand(
        INSERT_STATS_CARD,
        () => {
          const selection = $getSelection();

          if (!$isRangeSelection(selection)) return false;

          const focusNode = selection.focus.getNode();
          if (focusNode !== null) {
            const pgBreak = $createStatsCardNode({});
            $insertNodeToNearestRoot(pgBreak);
          }

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    );
  }, [editor]);

  return null;
}
