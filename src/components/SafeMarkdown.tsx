import React from "react";
import Markdown, { MarkdownIt } from "react-native-markdown-display";
import type { MarkdownProps, RenderRules } from "react-native-markdown-display";
import { Text } from "react-native";
import { useTranslation } from "../i18n";
import { appAlert } from "../utils/appAlert";
import {
  describeExternalUrlTarget,
  openExternalLink,
} from "../utils/externalLinks";

export type SafeMarkdownStyle = MarkdownProps["style"];

interface SafeMarkdownProps {
  children: string;
  style?: SafeMarkdownStyle;
}

const safeMarkdownRules: RenderRules = {
  image: () => null,
};

// react-native-markdown-display declares `markdownit`, `topLevelMaxExceededItem`
// and `allowedImageHandlers` as DEFAULT PARAMETERS. Omitting them re-evaluates
// each default on every render, which breaks the library's own memoization and
// rebuilds the parser, the AstRenderer and its ~50-key StyleSheet per bubble.
// These module-scope values keep all three identities stable.
// `typographer: true` mirrors the library default so rendering is unchanged.
const safeMarkdownParser = MarkdownIt({ typographer: true });
// Images never render (see `safeMarkdownRules`), so no handler is allowed.
const safeMarkdownAllowedImageHandlers: string[] = [];
const safeMarkdownTopLevelMaxExceededItem = <Text key="dotdotdot">...</Text>;

type SafeMarkdownRendererProps = MarkdownProps & {
  topLevelMaxExceededItem: React.ReactNode;
  allowedImageHandlers: string[];
};

// The shipped typings omit the two overflow/image props the component accepts.
const MarkdownRenderer = Markdown as React.ComponentType<
  React.PropsWithChildren<SafeMarkdownRendererProps>
>;

export function SafeMarkdown({ children, style }: SafeMarkdownProps) {
  const { t } = useTranslation();
  const markdownProps = style ? { style } : {};

  const handleLinkPress = (url: string): boolean => {
    appAlert(
      t("screen.chat.externalLink.title"),
      // Show the resolved target, not the raw href: this text comes from model
      // output, and a userinfo or padded URL can read as a trusted host while
      // pointing somewhere else.
      t("screen.chat.externalLink.message", {
        url: describeExternalUrlTarget(url),
      }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("screen.chat.externalLink.open"),
          onPress: () => {
            openExternalLink(url);
          },
        },
      ],
    );
    return false;
  };

  return (
    <MarkdownRenderer
      {...markdownProps}
      onLinkPress={handleLinkPress}
      rules={safeMarkdownRules}
      markdownit={safeMarkdownParser}
      topLevelMaxExceededItem={safeMarkdownTopLevelMaxExceededItem}
      allowedImageHandlers={safeMarkdownAllowedImageHandlers}
    >
      {children}
    </MarkdownRenderer>
  );
}
