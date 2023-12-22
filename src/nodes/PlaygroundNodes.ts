/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { HashtagNode } from '@lexical/hashtag';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { MarkNode } from '@lexical/mark';
import { OverflowNode } from '@lexical/overflow';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import type { Klass, LexicalNode } from 'lexical';

import { CollapsibleContainerNode } from '../plugins/CollapsiblePlugin/CollapsibleContainerNode';
import { CollapsibleContentNode } from '../plugins/CollapsiblePlugin/CollapsibleContentNode';
import { CollapsibleTitleNode } from '../plugins/CollapsiblePlugin/CollapsibleTitleNode';
import { CompanyProfileTitleNode } from '../plugins/CompanyProfile/CompanyProfileTitle/CompanyProfileTitleNode';
import { FlexColumnPluginNode } from '../plugins/FlexColumnPlugin/FlexColumnPluginNode';
import { IFrameNode } from '../plugins/IframePlugin/IFrameNode';
import { InlineBlockNode } from '../plugins/InlineBlockPlugin/InlineBlockNode';
import { InlineTitleNode } from '../plugins/InlineBlockPlugin/InlineTitleNode';
import { InlineLinkNode } from '../plugins/InlineLinkPlugin/InlineLinkNode';
import { InlineTagNode } from '../plugins/InlineTagPlugin/InlineTagNode';
import { MainHeaderNode } from '../plugins/MainHeader';
import { AutocompleteNode } from './AutocompleteNode';
import { CompanyProfileDetailsNode } from './CompanyProfile/CompanyProfileDetailsNode';
import { EmojiNode } from './EmojiNode';
import { EquationNode } from './EquationNode';
import { ExcalidrawNode } from './ExcalidrawNode';
import { FigmaNode } from './FigmaNode';
import { ImageNode } from './ImageNode';
import { InlineImageNode } from './InlineImageNode';
import { KeywordNode } from './KeywordNode';
import { LayoutContainerNode } from './LayoutContainerNode';
import { LayoutItemNode } from './LayoutItemNode';
import { MentionNode } from './MentionNode';
import { PageBreakNode } from './PageBreakNode';
import { PollNode } from './PollNode';
import {
	ToggleNode,
	ToggleIconNode,
	ToggleInnerNode,
	ToggleTitleNode,
	ToggleContentNode,
	$createToggleNodeUtil,
	TogglePlugin,
  } from "./ToggleNode";
import { StatsCardNode } from './StatsCardNode';
import { StickyNode } from './StickyNode';
import { TableNode as NewTableNode } from './TableNode';
import { TweetNode } from './TweetNode';
import { YouTubeNode } from './YouTubeNode';
// import { InlineTagNode } from "../plugins/InlineTagPlugin/InlineTagNode";

const PlaygroundNodes: Array<Klass<LexicalNode>> = [
	HeadingNode,
	ListNode,
	ListItemNode,
	QuoteNode,
	CodeNode,
	NewTableNode,
	TableNode,
	TableCellNode,
	TableRowNode,
	HashtagNode,
	CodeHighlightNode,
	AutoLinkNode,
	LinkNode,
	OverflowNode,
	PollNode,
	StickyNode,
	ImageNode,
	InlineImageNode,
	MentionNode,
	EmojiNode,
	ExcalidrawNode,
	EquationNode,
	AutocompleteNode,
	KeywordNode,
	HorizontalRuleNode,
	TweetNode,
	YouTubeNode,
	FigmaNode,
	MarkNode,
	CollapsibleContainerNode,
	CollapsibleContentNode,
	CollapsibleTitleNode,
	PageBreakNode,
	LayoutContainerNode,
	LayoutItemNode,
	ToggleNode,
	ToggleIconNode,
	ToggleInnerNode,
	ToggleTitleNode,
	ToggleContentNode,
	InlineBlockNode,
	InlineTitleNode,
	InlineTagNode,
	InlineLinkNode,
	StatsCardNode,
	CompanyProfileDetailsNode,
	FlexColumnPluginNode,
	CompanyProfileTitleNode,
	IFrameNode,
	MainHeaderNode,
];

export default PlaygroundNodes;
