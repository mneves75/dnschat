export const enUS = {
  common: {
    ok: "OK",
    cancel: "Cancel",
    errorTitle: "Error",
    close: "Close",
    clear: "Clear",
    unknownError: "Something went wrong. Please try again.",
  },
  locales: {
    enUS: "English (United States)",
    ptBR: "Português (Brasil)",
  },
  navigation: {
    tabs: {
      chat: "DNS Chat",
      logs: "Logs",
      about: "About",
    },
    stack: {
      devLogs: "Dev DNS Logs",
      notFound: "404",
    },
    toolbar: {
      newChat: "New Chat",
    },
  },
  screen: {
    onboarding: {
      navigation: {
        skip: "Skip",
        skipHint: "Skips the tutorial and goes directly to the app",
        back: "Back",
        backHint: "Returns to the previous onboarding screen",
        getStarted: "Get Started",
        continue: "Continue",
        stepCounter: "Step {{current}} of {{total}}",
        continueHint: "Proceeds to the next onboarding step",
        completeHint: "Completes onboarding and opens the app",
      },
      welcome: {
        title: "Welcome to DNS Chat",
        subtitle:
          "Send short prompts in DNS TXT queries and receive TXT responses.",
        appIconLabel: "DNS Chat app icon",
        features: {
          revolutionary: {
            label: "DNS TXT",
            title: "DNS-Based Transport",
            description:
              "The app carries each short prompt and response in DNS TXT records.",
          },
          private: {
            label: "Observable",
            title: "DNS Is Observable",
            description:
              "Queries and responses cross the selected third-party DNS service and may be observed, retained, or altered. Do not send secrets or personal data.",
          },
          fast: {
            label: "Fallback",
            title: "Multiple DNS Transports",
            description:
              "Native DNS, UDP, and TCP provide an ordered fallback path.",
          },
        },
      },
      firstChat: {
        label: "Chat",
        title: "Try Your First Chat",
        subtitle: "Send a message and watch it travel through DNS",
        welcomeMessage:
          "Send a short prompt. The app carries it in a DNS TXT query.",
        failureMessage:
          "The DNS message could not be delivered. Check your network settings or try again later.",
        suggestions: {
          title: "Try one of these:",
          option1: "What is DNS?",
          option2: "How does this app work?",
          option3: "Tell me something interesting",
          option4: "What can you help me with?",
        },
        input: {
          placeholder: "Type your message…",
          sendingVia: "Sending via DNS…",
        },
        navigation: {
          continue: "Continue",
          skip: "Skip Tutorial",
        },
        accessibility: {
          suggestionLabel: "Suggestion: {{suggestion}}",
          suggestionHint:
            "Fills the message input with this suggested question",
          inputLabel: "Message input",
          inputHint:
            "Type your message to send via DNS. Maximum {{max}} characters.",
          sendLabel: "Send message",
          sendingLabel: "Sending message",
          sendHint: "Sends your message through DNS TXT query",
        },
      },
      dnsMagic: {
        label: "DNS",
        title: "DNS Transport in Action",
        subtitle:
          "Watch as your message travels through multiple DNS fallback methods",
        demoButton: "Start DNS Demo",
        demoButtonRunning: "DNS Query in Progress...",
        responseLabel: "DNS Response:",
        fallbackMethods: {
          native: {
            name: "Native DNS",
            pending: "Preparing native DNS query…",
            active: "Sending DNS query via native platform…",
            success: "Native DNS query successful",
            failed: "Native DNS failed, trying UDP…",
          },
          udp: {
            name: "UDP Fallback",
            pending: "UDP socket ready as backup…",
            active: "Attempting UDP DNS query…",
            success: "UDP fallback successful",
            failed: "UDP failed, trying TCP…",
          },
          tcp: {
            name: "TCP Fallback",
            pending: "TCP connection standing by…",
            active: "Attempting TCP DNS query…",
            success: "TCP fallback successful",
            failed: "TCP failed; no more DNS transports configured",
          },
        },
        status: {
          pending: "Pending",
          active: "Active",
          success: "Success",
          failed: "Failed",
        },
        demoResponse: "The response returned through the DNS transport path.",
        demoFailure:
          "No DNS response returned during this demo. You can continue and adjust Settings later.",
        accessibility: {
          idleLabel: "Start DNS demo",
          runningLabel: "DNS query in progress",
          demoHint:
            "Demonstrates how DNS queries work through the fallback chain. Watch as your message travels through Native DNS, UDP, and TCP methods.",
        },
      },
      networkSetup: {
        label: "Setup",
        title: "Network Configuration",
        subtitle: "Choose how DNS Chat should reach the LLM server",
        disclaimer:
          "This recommendation does not test network connectivity. You can change transport settings later in Settings.",
        tests: {
          native: {
            name: "Native DNS",
            description: "Platform DNS resolver",
          },
          udp: {
            name: "DNS over UDP",
            description: "Standard DNS transport",
          },
          tcp: {
            name: "DNS over TCP",
            description: "TCP fallback transport",
          },
        },
        status: { recommended: "Recommended" },
        optimization: {
          title: "Recommended Configuration",
          description:
            "Apply these settings to try Native DNS first, then UDP and TCP when needed. No test query is sent here.",
          applyButton: "Apply Recommended Settings",
          loading: "Saving settings...",
        },
        navigation: {
          continue: "Continue",
        },
        alerts: {
          errorTitle: "Error",
          errorMessage:
            "Could not finish applying network settings. Try again.",
          successTitle: "Settings Applied",
          successMessage:
            "Network configuration complete. DNS will use the automatic fallback chain.",
          successButton: "Great",
        },
        accessibility: {
          applyLabel: "Apply recommended settings",
          applyHint:
            "Configures DNS to use the automatic fallback chain across the supported transports",
        },
      },
      features: {
        logs: {
          label: "Logs",
          title: "DNS Query Logs",
          description:
            "Review transport attempts, status, timing, and fallback details.",
        },
        customize: {
          label: "Customize",
          title: "Customizable Settings",
          description:
            "Configure DNS servers, haptics, and transport behavior for your network.",
        },
        liquidGlass: {
          label: "iOS 26",
          title: "Native Interface",
          description:
            "Platform controls and navigation adapt across iOS and Android.",
        },
        i18n: {
          label: "Language",
          title: "English and Portuguese",
          description:
            "The interface follows your device language or your in-app choice.",
        },
        haptics: {
          label: "Haptics",
          title: "Optional Haptics",
          description:
            "Tactile feedback can be disabled independently in Settings.",
        },
        opensource: {
          label: "Open",
          title: "Open Source",
          description:
            "Built transparently - explore the code and contribute to the future of DNS chat.",
          action: "View on GitHub",
          accessibilityHint:
            "Opens the DNS Chat GitHub repository in your browser where you can view the source code and contribute",
        },
        themes: {
          label: "Theme",
          title: "Light, Dark, or System",
          description:
            "Choose a theme and use the high-contrast accessibility setting when needed.",
        },
        storage: {
          label: "Local",
          title: "Encrypted Local History",
          description:
            "Conversation history is encrypted and kept on this device.",
        },
        fallbacks: {
          label: "Order",
          title: "Explicit Fallback Chain",
          description:
            "The app tries supported transports in a defined order and records each attempt.",
        },
      },
      header: {
        label: "Reference",
        title: "Know What the App Does",
        subtitle:
          "Review local storage, settings, logs, and transport fallback behavior.",
      },
      ready: {
        title: "You're All Set",
        description:
          "You now know how DNS Chat sends short messages over DNS and where to adjust the transport settings. Start a conversation when you are ready.",
        button: "Start Chatting",
      },
    },
    chat: {
      errorAlertTitle: "Error",
      errorRetry: "Retry",
      errorMessage:
        "DNS request failed. Try again or check DNS logs in Settings.",
      storageRecovery: {
        recovered:
          "Chat storage was corrupted. Chats that could be recovered are still available.",
        reset: "Chat storage was corrupted and has been reset.",
      },
      placeholder: "Ask me anything...",
      emptyState: {
        title: "Start a conversation!",
        description: "Send a message to begin chatting with the AI assistant.",
      },
      missing: {
        navigationTitle: "Conversation Not Found",
        title: "Conversation not found",
        description:
          "This conversation is no longer on this device. You can return to your chats or start a new conversation.",
        startNew: "Start New Chat",
        backToChats: "Back to Chats",
      },
      listError: {
        title: "Couldn't display messages",
        description: "Something went wrong while showing this conversation.",
        retry: "Reload",
      },
      messageActions: {
        copy: "Copy",
        share: "Share",
      },
      accessibility: {
        userMessage: "Your message: {{content}}",
        assistantMessage: "Assistant message: {{content}}",
        loadingHint: "Message is loading",
        errorIndicator: "Message failed to send",
        menuHint: "Long press to show copy and share options",
        messageListLabel: "Conversation messages",
      },
      externalLink: {
        title: "Open external link?",
        message:
          "This link came from a DNS response. Check the destination before leaving DNS Chat:\n\n{{url}}",
        open: "Open Link",
      },
    },
    chatInput: {
      placeholder: "Message...",
    },
    chatList: {
      createErrorTitle: "Unable to create chat",
      createErrorMessage: "Failed to create chat",
    },
    glassChatList: {
      navigationTitle: "DNS Chat",
      untitledChat: "New Chat",
      newConversation: {
        title: "Start New Conversation",
        button: "New Chat",
        description: "Send a short prompt through a DNS TXT request.",
        observableNotice:
          "A third-party DNS service or network may observe, retain, or alter queries and responses.",
      },
      recent: {
        title: "Recent Conversations",
        footerSingle: "{{count}} conversation total",
        footerMultiple: "{{count}} conversations total",
      },
      empty: {
        title: "No Conversations Yet",
        subtitle: "Your conversations will appear here after you start one.",
      },
      badges: {
        messageSingular: "{{count}} message",
        messagePlural: "{{count}} messages",
      },
      itemAccessibilityLabel: "Chat: {{title}}. {{count}} messages. {{time}}.",
      itemAccessibilityHint:
        "Double tap to open. Use available actions to share or delete this conversation.",
      actionSheet: {
        message: "Choose an action for this conversation",
        openChat: "Open Chat",
        shareChat: "Share Chat",
        deleteChat: "Delete Chat",
        cancel: "Cancel",
      },
      alerts: {
        deleteTitle: "Delete Chat",
        deleteMessage:
          "Are you sure you want to delete “{{title}}”? This action cannot be undone.",
      },
    },
    logs: {
      navigationTitle: "DNS Query Logs",
      empty: {
        title: "No DNS Queries Yet",
        subtitle:
          "Send a message to record transport status and timing. Prompt and response text stay redacted.",
      },
      loadError: {
        title: "Unable to Load DNS Logs",
        subtitle:
          "No log data was removed. Pull down to try again when secure local storage is available.",
      },
      history: {
        title: "DNS Query History",
        footerSingle: "{{count}} query logged",
        footerMultiple: "{{count}} queries logged",
      },
      labels: {
        noMessage: "No message",
        redactedQuery: "DNS query",
        redactedResponse: "Response redacted",
        durationPending: "Duration pending",
        response: "Response:",
        querySteps: "Query Steps:",
        unknownMethod: "UNKNOWN",
        errorPrefix: "Error: {{message}}",
      },
      actions: {
        title: "Actions",
        clearAll: "Clear All Logs",
        clearAllSubtitle: "Remove all DNS query history",
      },
      alerts: {
        clearTitle: "Clear Logs",
        clearMessage: "Are you sure you want to clear all DNS query logs?",
        clearConfirm: "Clear",
        clearErrorTitle: "Unable to Clear Logs",
        clearErrorMessage:
          "DNS logs could not be removed from local storage. Please try again.",
      },
      accessibility: {
        expandRow: "Show DNS query details",
        collapseRow: "Hide DNS query details",
        rowLabel:
          "DNS query. Status: {{status}}. Method: {{method}}. Started at {{time}}. Duration: {{duration}}.",
      },
      status: {
        success: "Succeeded",
        failed: "Failed",
        pending: "Pending",
      },
    },
    settings: {
      navigationTitle: "Settings",
      sections: {
        dnsConfig: {
          title: "DNS Configuration",
          description:
            "Configure the DNS server used for LLM communication. This server will receive your messages via DNS TXT queries.",
          dnsServerLabel: "DNS TXT Service",
        },
        appBehavior: {
          enableHaptics: {
            label: "Enable Haptics",
            description:
              "Plays tactile feedback when supported and can be disabled independently here.",
          },
        },
        transportTest: {
          chainThrottleMessage: "Wait a moment before testing again.",
          forcedThrottleMessage:
            "Wait a moment before testing this transport again.",
          title: "Transport Test",
          description:
            "Send a test message using the selected preference or force a specific transport method. All tests are logged for debugging.",
          messageLabel: "Test Message",
          testButton: "Test Selected Preference",
          testingButton: "Testing...",
          testHint: "Runs the DNS test using the current transport preference",
          forceHint: "Runs the DNS test using only the {{transport}} transport",
          forceAccessibilityLabel: "Force {{transport}} transport",
          transports: {
            native: "Native",
            udp: "UDP",
            tcp: "TCP",
          },
        },
        development: {
          title: "App Tour",
          resetOnboardingTitle: "Reset Onboarding",
          resetOnboardingSubtitle: "Show the onboarding flow again",
        },
        language: {
          title: "Language",
          description:
            "Choose the interface language. System default follows the device setting.",
          systemOption: "Use device default",
          systemDescription: "Currently {{language}}",
          optionDescription: "Set interface language to {{language}}",
        },
        appearance: {
          title: "Appearance",
          description:
            "Choose the app theme. System follows your device setting.",
          summaryHint: "Summarized feature description",
          themeLabel: "Theme",
          themeHint: "Choose between system, light, or dark mode",
          options: {
            system: "Match device",
            light: "Light",
            dark: "Dark",
          },
          optionHint: "Use {{theme}} appearance in DNS Chat",
          sheetTitle: "Choose theme",
          sheetSubtitle: "Override the system appearance for DNS Chat only.",
        },
      },
      alerts: {
        onboardingTitle: "Reset Onboarding",
        onboardingMessage:
          "This will reset the onboarding process and show it again on next app launch. This is useful for testing or if you want to see the tour again.",
        onboardingConfirm: "Reset Onboarding",
        onboardingCancel: "Cancel",
        onboardingResetTitle: "Onboarding Reset",
        onboardingResetMessage:
          "The onboarding will be shown again when you restart the app.",
        saveSuccessMessage: "Settings have been updated successfully.",
        saveErrorTitle: "Error",
        saveErrorMessage: "Failed to save settings. Please try again.",
      },
    },
    glassSettings: {
      dnsServerSheet: {
        title: "Select DNS Service",
        subtitle: "Choose your preferred DNS resolver",
      },
      dnsOptions: {
        chAt: {
          label: "ch.at",
          description: "Original ChatDNS server (offline)",
        },
        llmPieter: {
          label: "llm.pieter.com (Default)",
          description: "Pieter's LLM service via DNS - recommended",
        },
      },
      aboutSheet: {
        title: "About DNSChat",
        subtitle: "Chat over DNS TXT queries",
        overview:
          "DNSChat delivers DNS-based messaging with modern glass UI, haptics, and full query logging.",
        featuresTitle: "Key Features",
        features: {
          line1: "AI chat via DNS TXT queries",
          line2: "Full transport fallback chain",
          line3: "Real-time query logging and debugging",
          line4: "Beautiful glass UI inspired by Apple's design",
          line5: "Cross-platform React Native implementation",
        },
      },
      supportSheet: {
        title: "Support Options",
        message: "How can we help you today?",
        docs: "View Documentation",
        community: "Join Community",
        email: "Send Email",
        cancel: "Cancel",
      },
      sections: {
        dnsConfig: {
          mockTitle: "Enable Mock DNS",
          mockSubtitle: "Use local mock responses when real DNS fails",
        },
        about: {
          title: "About",
          appVersionTitle: "App Version",
          appVersionSubtitle: "DNSChat v{{version}}",
          latestBadge: "Installed",
          githubTitle: "GitHub Repository",
          githubSubtitle: "View source code and contribute",
          shareTitle: "Share DNSChat",
          shareSubtitle: "Tell others about this app",
          shareMessage:
            "Check out DNSChat - a DNS TXT experiment for short AI prompts.",
        },
        advanced: {
          title: "Advanced",
          footer: "Advanced settings for power users. Use with caution.",
          clearCacheTitle: "Clear Local Data",
          clearCacheSubtitle:
            "Delete chat history and DNS logs from this device",
          resetTitle: "Reset Settings",
          resetSubtitle: "Restore all settings to default values",
        },
        support: {
          title: "Support",
          helpTitle: "Help & Feedback",
          helpSubtitle: "Get help or provide feedback",
          bugTitle: "Report Bug",
          bugSubtitle: "Found an issue? Let us know",
        },
      },
      alerts: {
        resetTitle: "Reset Settings",
        resetMessage:
          "Are you sure you want to reset all settings to default values?",
        resetConfirm: "Reset",
        clearCacheTitle: "Clear Local Data",
        clearCacheMessage:
          "This will permanently delete your chat history and DNS logs from this device.",
        clearCacheSuccessTitle: "Local Data Cleared",
        clearCacheSuccessMessage:
          "Your chat history and DNS logs have been cleared.",
        clearCacheErrorMessage: "Unable to clear local data. Please try again.",
      },
      results: {
        label: "Result: {{value}}",
        error: "Error: {{value}}",
      },
    },
    about: {
      navigationTitle: "About",
      fallbackInitials: "DNS",
      appName: "DNS Chat",
      tagline:
        "Short prompts go to a third-party service in DNS TXT queries. Traffic is observable and responses are not authenticated.",
      versionLabel: "v{{version}}",
      footer: "© 2025 DNSChat contributors • MIT Licensed",
      quickActions: {
        title: "Quick Actions",
        settingsTitle: "Settings",
        settingsSubtitle: "Adjust DNS preferences and language",
      },
      credits: {
        arxivDaily: "Ch.at original concept and LLM over DNS service",
        levels: "Retweeted @arxiv_daily",
        reactNative: "Cross-platform mobile framework",
        expo: "Expo app and build tooling platform",
        reactNavigation: "Navigation library for React Native",
        asyncStorage: "Local storage solution",
      },
      sections: {
        inspiration: {
          title: "Inspiration",
          footer:
            "This project was inspired by the incredible work of the open-source community",
          items: {
            arxivTweet: {
              title: "@Arxiv_Daily Tweet",
              subtitle: "Original LLM over DNS concept",
            },
            chatProject: {
              title: "Ch.at Project",
              subtitle: "Universal Basic Intelligence via DNS",
            },
            levelsio: {
              title: "@levelsio",
              subtitle: "Shared the original concept",
            },
          },
        },
        project: {
          title: "Project",
          items: {
            github: {
              title: "GitHub Repository",
              subtitle: "View source code and contribute",
            },
            issues: {
              title: "Report an Issue",
              subtitle: "Found a bug? Let us know",
            },
            updates: {
              title: "@dnschat on X",
              subtitle: "Follow for updates",
            },
          },
          settings: {
            title: "Settings",
            subtitle: "Adjust DNS preferences and appearance",
          },
        },
        developer: {
          title: "Maintainers",
          maintainersTitle: "DNSChat contributors",
          maintainersSubtitle: "Open-source project maintainers",
          devLogsTitle: "Developer Logs (Dev)",
          devLogsSubtitle: "Open DNS logs viewer screen",
        },
        specialThanks: {
          title: "Special Thanks",
          footer:
            "This project wouldn't be possible without these amazing open-source projects and services",
        },
      },
    },
    notFound: {
      title: "404",
      goHome: "Go to Home",
      navigationTitle: "Not Found",
      description:
        "The page you're looking for doesn't exist or has been moved.",
      quickLinks: "Quick Links",
      chatDescription: "Start a new conversation",
      logsDescription: "View DNS query logs",
      aboutDescription: "Learn more about DNSChat",
    },
  },
  components: {
    chatInput: {
      accessibilityLabel: "Message input",
      accessibilityHint: "Enter your message here",
      sendLabel: "Send message",
      sendHint: "Double tap to send your message",
      sendingLabel: "Sending message",
      charactersRemaining: "{{count}} characters remaining",
    },
    dnsLogViewer: {
      empty: "No DNS logs yet",
      responseLabel: "Response",
      redactedTitle: "DNS query",
      redactedResponse: "Response redacted",
    },
    share: {
      title: "Share Message",
      footer: "Shared from DNSChat on {{date}}",
      failedTitle: "Share Failed",
      failedMessage: "Unable to share this message. Please try again.",
    },
    skeleton: {
      message: "Loading message",
    },
  },
} as const;
