import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Platform } from 'react-native';

type LinkProps = React.ComponentProps<typeof Link>;

export function ExternalLink(props: Omit<LinkProps, 'href'> & { href: LinkProps['href'] }) {
  return (
    <Link
      target="_blank"
      {...props}
      href={props.href}
      onPress={(e) => {
        if (Platform.OS !== 'web') {
          const targetHref = props.href;
          if (typeof targetHref !== 'string') {
            return;
          }
          // Prevent the default behavior of linking to the default browser on native.
          e.preventDefault();
          // Open the link in an in-app browser.
          void WebBrowser.openBrowserAsync(targetHref);
        }
      }}
    />
  );
}
