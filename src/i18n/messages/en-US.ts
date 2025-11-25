export const enUS = {
  common: {
    ok: "OK",
    cancel: "Cancel",
    delete: "Delete",
    errorTitle: "Error",
    close: "Close",
    reset: "Reset",
    save: "Save",
    saving: "Saving...",
    clear: "Clear",
    settings: "Settings",
    language: "Language",
    followSystem: "Use device language",
  },
  locales: {
    enUS: "English (United States)",
    ptBR: "Português (Brasil)",
    deviceLabel: "Device language ({{language}})",
  },
  navigation: {
    tabs: {
      chat: "DNS Chat",
      logs: "Logs",
      about: "About",
    },
    stack: {
      chat: "Chat",
      settings: "Settings",
      devLogs: "Dev DNS Logs",
      notFound: "404",
    },
  },
  screen: {
    onboarding: {
      welcome: {
        title: "Welcome to DNS Chat",
        subtitle: "The world's first chat app that uses DNS queries to communicate with AI",
        features: {
          revolutionary: {
            label: "Revolutionary",
            title: "Revolutionary Technology",
            description: "Chat through DNS TXT records - no traditional APIs needed",
          },
          private: {
            label: "Private",
            title: "Privacy-Focused",
            description: "Your conversations travel through the global DNS infrastructure",
          },
          fast: {
            label: "Fast",
            title: "Network Resilient",
            description: "Automatically adapts to different network conditions",
          },
        },
      },
      firstChat: {
        label: "Chat",
        title: "Try Your First Chat",
        subtitle: "Send a message and watch it travel through DNS",
        welcomeMessage: "Hi! I'm your AI assistant. Try sending me a message to see how DNS magic works!",
        successMessage: "Great! You've successfully sent your first DNS message. In a real scenario, this would return an AI response via DNS TXT records. The magic is that your message traveled through the DNS infrastructure!",
        suggestions: {
          title: "Try one of these:",
          option1: "What is DNS?",
          option2: "How does this app work?",
          option3: "Tell me something interesting",
          option4: "What can you help me with?",
        },
        input: {
          placeholder: "Type your message...",
          send: "Send",
          sending: "...",
          sendingVia: "Sending via DNS...",
        },
        navigation: {
          continue: "Amazing! Continue",
          skip: "Skip Tutorial",
        },
      },
      dnsMagic: {
        label: "DNS",
        title: "DNS Magic in Action",
        subtitle: "Watch as your message travels through multiple DNS fallback methods",
        demoButton: "Start DNS Demo",
        demoButtonRunning: "DNS Query in Progress...",
        responseLabel: "DNS Response:",
        fallbackMethods: {
          native: {
            name: "Native DNS",
            pending: "Preparing native DNS query...",
            active: "Sending DNS query via native platform...",
            success: "Native DNS query successful",
            failed: "Native DNS failed, trying UDP...",
          },
          udp: {
            name: "UDP Fallback",
            pending: "UDP socket ready as backup...",
            active: "Attempting UDP DNS query...",
            success: "UDP fallback successful",
            failed: "UDP failed, trying TCP...",
          },
          tcp: {
            name: "TCP Fallback",
            pending: "TCP connection standing by...",
            active: "Attempting TCP DNS query...",
            success: "TCP fallback successful",
            failed: "TCP failed, trying HTTPS...",
          },
          https: {
            name: "HTTPS Fallback",
            pending: "Cloudflare DNS API ready...",
            active: "Attempting HTTPS DNS query...",
            success: "HTTPS fallback successful",
            failed: "All DNS methods exhausted",
          },
        },
        status: {
          pending: "Pending",
          active: "Active",
          success: "Success",
          failed: "Failed",
        },
        demoResponse: "Welcome to DNS Chat! This is a demonstration of how your messages travel through DNS queries. Pretty cool, right?",
      },
      networkSetup: {
        label: "Setup",
        title: "Network Optimization",
        subtitle: "We're testing your network to find the fastest DNS methods",
        disclaimer: "This is a simulated demonstration",
        tests: {
          native: {
            name: "Native DNS",
            description: "Platform-optimized DNS",
          },
          udp: {
            name: "DNS over UDP",
            description: "Traditional DNS queries",
          },
          tcp: {
            name: "DNS over TCP",
            description: "Reliable TCP fallback",
          },
        },
        status: {
          testing: "Testing",
          waiting: "Waiting",
          success: "Success",
          failed: "Failed",
          skipped: "Skipped",
        },
        optimization: {
          title: "Optimization Complete",
          description: "Your network supports all DNS methods. The app will automatically use the fastest available method with intelligent fallback for optimal performance.",
          applyButton: "Apply Recommended Settings",
          loading: "Optimizing your DNS settings...",
        },
        navigation: {
          continue: "Continue",
          skip: "Skip Optimization",
        },
        alerts: {
          errorTitle: "Error",
          errorMessage: "Network optimization failed. Using default settings.",
          successTitle: "Settings Applied",
          successMessage: "Network optimization complete. DNS will use automatic fallback chain for best performance.",
          successButton: "Great",
        },
      },
      features: {
        logs: {
          label: "Logs",
          title: "DNS Query Logs",
          description: "Monitor all DNS queries in real-time with detailed timing and fallback information.",
        },
        customize: {
          label: "Customize",
          title: "Customizable Settings",
          description: "Configure DNS servers, enable HTTPS preferences, and optimize for your network.",
        },
        liquidGlass: {
          label: "iOS 26",
          title: "Liquid Glass Design",
          description: "Beautiful iOS 26 interface with native glass effects and Material Design 3 on Android.",
        },
        i18n: {
          label: "i18n",
          title: "Multilingual Support",
          description: "Full internationalization with English and Portuguese languages.",
        },
        haptics: {
          label: "Haptics",
          title: "Haptic Feedback",
          description: "Customizable haptic feedback for interactive elements and actions.",
        },
        opensource: {
          label: "Open",
          title: "Open Source",
          description: "Built transparently - explore the code and contribute to the future of DNS chat.",
          action: "View on GitHub",
        },
        themes: {
          label: "Adapt",
          title: "Dark and Light Themes",
          description: "Beautiful interface that adapts to your system preferences with high contrast mode support.",
        },
        storage: {
          label: "Local",
          title: "Local Storage",
          description: "All your conversations are stored securely on your device - no cloud dependency.",
        },
        fallbacks: {
          label: "Smart",
          title: "Smart Fallbacks",
          description: "Intelligent fallback system ensures connectivity across different network conditions.",
        },
      },
      header: {
        label: "Features",
        title: "Powerful Features",
        subtitle: "Discover what makes DNS Chat special",
      },
      ready: {
        title: "You're All Set",
        description: "You now know how to use DNS Chat and have optimized settings for your network. Start chatting and experience the magic of DNS-powered conversations!",
        button: "Start Chatting",
      },
    },
    chat: {
      navigationTitle: "Chat",
      errorAlertTitle: "Error",
      errorAlertDismiss: "OK",
      placeholder: "Ask me anything...",
      messageActions: {
        copy: "Copy",
        share: "Share",
      },
    },
    chatInput: {
      placeholder: "Message...",
    },
    chatList: {
      navigationTitle: "Chats",
      emptyTitle: "No chats yet",
      emptySubtitle:
        "Start a new conversation to begin chatting with the AI assistant.",
      newChatButton: "Start New Chat",
      accessibility: {
        deleteButton: "Delete chat",
        deleteButtonHint: "Double tap to delete this conversation",
        chatItem: "Chat: {{title}}",
        chatItemHint: "Double tap to open conversation",
      },
    },
    glassChatList: {
      navigationTitle: "DNS Chat",
      newConversation: {
        title: "Start New Conversation",
        subtitle: "Spin up a fresh thread with DNS AI",
        button: "New Chat",
        description: "Start a new conversation with DNS AI",
      },
      recent: {
        title: "Recent Conversations",
        footerSingle: "{{count}} conversation total",
        footerMultiple: "{{count}} conversations total",
      },
      empty: {
        title: "No Conversations Yet",
        subtitle:
          "Start your first conversation by tapping \"New Chat\" above. Your chats will appear here.",
      },
      stats: {
        title: "Statistics",
        totalMessagesTitle: "Total Messages",
        totalMessagesSubtitle: "Messages sent so far",
        averageTitle: "Average per Chat",
        averageSubtitle: "Messages per conversation",
      },
      badges: {
        messageSingular: "{{count}} message",
        messagePlural: "{{count}} messages",
      },
      actionSheet: {
        title: "Choose an action",
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
          "Send a message to see DNS query logs appear here. All query attempts and methods will be tracked.",
      },
      history: {
        title: "DNS Query History",
        footerSingle: "{{count}} query logged",
        footerMultiple: "{{count}} queries logged",
      },
      labels: {
        noQuery: "No query",
        noMessage: "No message",
        noResponse: "No response",
        response: "Response:",
        querySteps: "Query Steps:",
        resultTitle: "Last Test Result:",
        errorTitle: "Last Test Error:",
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
          dnsServerPlaceholder: "ch.at",
          dnsServerHint: "Default: {{server}}",
        },
        appBehavior: {
          title: "App Behavior",
          description:
            "Configure app features and behavior settings.",
          enableMockDNS: {
            label: "Enable Mock DNS",
            description:
              "Use simulated DNS responses for development and testing.",
          },
          enableHaptics: {
            label: "Enable Haptics",
            description:
              "Plays tactile feedback when supported; suppressed if Reduce Motion is enabled.",
          },
        },
        transportTest: {
          title: "Transport Test",
          description:
            "Send a test message using the selected preference or force a specific transport method. All tests are logged for debugging.",
          messageLabel: "Test Message",
          placeholder: "ping",
          testButton: "Test Selected Preference",
          testingButton: "Testing...",
          forceLabel: "Force Specific Transport",
          transports: {
            native: "Native",
            udp: "UDP",
            tcp: "TCP",
          },
          resultLabel: "Last Test Result:",
          errorLabel: "Last Test Error:",
          viewLogs: "View Logs",
        },
        currentConfig: {
          title: "Current Configuration",
          dnsServerLabel: "Active DNS Server:",
        },
        development: {
          title: "Development",
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
      },
      actions: {
        resetButton: "Reset to Default",
        saveButton: "Save Changes",
        saving: "Saving...",
      },
      alerts: {
        resetTitle: "Reset to Default",
        resetMessage:
          "Are you sure you want to reset all settings to default?",
        resetConfirm: "Reset",
        onboardingTitle: "Reset Onboarding",
        onboardingMessage:
          "This will reset the onboarding process and show it again on next app launch. This is useful for testing or if you want to see the tour again.",
        onboardingConfirm: "Reset Onboarding",
        onboardingResetTitle: "Onboarding Reset",
        onboardingResetMessage:
          "The onboarding will be shown again when you restart the app.",
        saveSuccessTitle: "Settings Saved",
        saveSuccessMessage: "Settings have been updated successfully.",
        saveErrorTitle: "Error",
        saveErrorMessage: "Failed to save settings. Please try again.",
        dnsSaveErrorTitle: "Save Failed",
        dnsSaveErrorMessage: "Could not save DNS server.",
      },
    },
    glassSettings: {
      dnsServerSheet: {
        title: "Select DNS Service",
        subtitle: "Choose your preferred DNS resolver",
      },
      dnsOptions: {
        chAt: {
          label: "ch.at (Default)",
          description: "Official ChatDNS server with AI responses",
        },
        llmPieter: {
          label: "llm.pieter.com",
          description: "Pieter's LLM service via DNS",
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
          latestBadge: "Latest",
          githubTitle: "GitHub Repository",
          githubSubtitle: "View source code and contribute",
          shareTitle: "Share DNSChat",
          shareSubtitle: "Tell others about this app",
          shareMessage:
            "Check out DNSChat - Chat over DNS! A unique way to communicate using DNS TXT queries.",
        },
        advanced: {
          title: "Advanced",
          footer:
            "Advanced settings for power users. Use with caution.",
          clearCacheTitle: "Clear Cache",
          clearCacheSubtitle: "Remove all cached DNS responses",
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
        language: {
          title: "Language",
        },
      },
      alerts: {
        resetTitle: "Reset Settings",
        resetMessage:
          "Are you sure you want to reset all settings to default values?",
        resetConfirm: "Reset",
        clearCacheTitle: "Clear Cache",
        clearCacheMessage:
          "This will clear all cached DNS responses and conversation history.",
        clearCacheSuccessTitle: "Cache Cleared",
        clearCacheSuccessMessage:
          "All cached data has been cleared.",
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
        "Chat with AI using DNS TXT queries - a unique approach to LLM communication.",
      versionLabel: "v{{version}}",
      footer: "© 2025 Marcus Neves • MIT Licensed",
      quickActions: {
        title: "Quick Actions",
        settingsTitle: "Settings",
        settingsSubtitle: "Adjust DNS preferences and language",
      },
      credits: {
        arxivDaily: "Ch.at original concept and LLM over DNS service",
        levels: "Retweeted @arxiv_daily",
        reactNative: "Cross-platform mobile framework",
        expo: "Development build and tooling platform",
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
          title: "Developer",
          creatorSubtitle: "Created by {{handle}}",
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
    home: {
      title: "Home Screen",
      subtitle: "Open up 'src/App.tsx' to start working on your app!",
      goToProfile: "Go to Profile",
      goToSettings: "Go to Settings",
    },
    profile: {
      title: "{{user}}'s Profile",
    },
    notFound: {
      title: "404",
      goHome: "Go to Home",
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
    },
  },
} as const;

export type EnUSMessages = typeof enUS;
