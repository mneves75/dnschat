import React from "react";
import Markdown from "react-native-markdown-display";
import type { MarkdownProps, RenderRules } from "react-native-markdown-display";
import { useTranslation } from "../i18n";
import { appAlert } from "../utils/appAlert";
import { openExternalLink } from "../utils/externalLinks";

export type SafeMarkdownStyle = MarkdownProps["style"];

interface SafeMarkdownProps {
  children: string;
  style?: SafeMarkdownStyle;
}

const safeMarkdownRules: RenderRules = {
  image: () => null,
};

export function SafeMarkdown({ children, style }: SafeMarkdownProps) {
  const { t } = useTranslation();
  const markdownProps = style ? { style } : {};

  const handleLinkPress = (url: string): boolean => {
    appAlert(
      t("screen.chat.externalLink.title"),
      t("screen.chat.externalLink.message", { url }),
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
    <Markdown
      {...markdownProps}
      onLinkPress={handleLinkPress}
      rules={safeMarkdownRules}
    >
      {children}
    </Markdown>
  );
}
