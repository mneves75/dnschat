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
    unknownError: "Something went wrong. Please try again.",
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
    toolbar: {
      newChat: "New Chat",
      share: "Share",
      clearChat: "Clear Chat",
      dnsInfo: "DNS Info",
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
        continueHint: "Proceeds to the next onboarding step",
        completeHint: "Completes onboarding and opens the app",
      },
      welcome: {
        title: "Welcome to DNS Chat",
        subtitle: "The world's first chat app that uses DNS queries to communicate with AI",
        appIconLabel: "DNS Chat app icon",
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
        accessibility: {
          suggestionLabel: "Suggestion: {{suggestion}}",
          suggestionHint: "Fills the message input with this suggested question",
          inputLabel: "Message input",
          inputHint: "Type your message to send via DNS. Maximum {{max}} characters.",
          sendLabel: "Send message",
          sendingLabel: "Sending message",
          sendHint: "Sends your message through DNS TXT query",
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
        accessibility: {
          idleLabel: "Start DNS demo",
          runningLabel: "DNS query in progress",
          demoHint: "Demonstrates how DNS queries work through the fallback chain. Watch as your message travels through Native DNS, UDP, TCP, and HTTPS methods.",
        },
      },
      networkSetup: {
        label: "Setup",
        title: "Network Configuration",
        subtitle: "Choose how DNS Chat should reach the LLM server",
        disclaimer: "You can change the transport order later in Settings",
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
        status: {
          testing: "Configuring",
          waiting: "Waiting",
          success: "Configured",
          failed: "Unavailable",
          skipped: "Skipped",
        },
        optimization: {
          title: "Configuration Applied",
          description: "DNS Chat will use the automatic fallback chain across these transports. You can adjust this anytime in Settings.",
          applyButton: "Apply Recommended Settings",
          loading: "Configuring transport order...",
        },
        navigation: {
          continue: "Continue",
          skip: "Skip",
        },
        alerts: {
          errorTitle: "Error",
          errorMessage: "Network configuration failed. Using default settings.",
          successTitle: "Settings Applied",
          successMessage: "Network configuration complete. DNS will use the automatic fallback chain.",
          successButton: "Great",
        },
        accessibility: {
          applyLabel: "Apply recommended settings",
          applyHint: "Configures DNS to use the automatic fallback chain across the supported transports",
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
          accessibilityHint: "Opens the DNS Chat GitHub repository in your browser where you can view the source code and contribute",
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
      emptyState: {
        title: "Start a conversation!",
        description: "Send a message to begin chatting with the AI assistant.",
      },
      messageActions: {
        copy: "Copy",
        share: "Share",
      },
      accessibility: {
        userMessage: "Your message: {{content}}",
        assistantMessage: "Assistant message: {{content}}",
        loadingHint: "Message is loading",
        menuHint: "Long press to show copy and share options",
        messageListLabel: "Conversation messages",
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
      itemAccessibilityLabel: "Chat: {{title}}. {{count}} messages. {{time}}.",
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
      accessibility: {
        expandRow: "Show DNS query details",
        collapseRow: "Hide DNS query details",
      },
      status: {
        success: "Succeeded",
        failed: "Failed",
        unknown: "Unknown",
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
          dnsServerPlaceholder: "llm.pieter.com",
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
        data: {
          title: "Data Management",
          description:
            "Manage locally stored chats and DNS logs on this device.",
          clearDataTitle: "Clear Local Data",
          clearDataSubtitle: "Delete chat history and DNS logs from this device",
          clearDataHint:
            "Deletes all local chats and DNS logs stored on this device",
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
        onboardingCancel: "Cancel",
        onboardingResetTitle: "Onboarding Reset",
        onboardingResetMessage:
          "The onboarding will be shown again when you restart the app.",
        saveSuccessTitle: "Settings Saved",
        saveSuccessMessage: "Settings have been updated successfully.",
        saveErrorTitle: "Error",
        saveErrorMessage: "Failed to save settings. Please try again.",
        dnsSaveErrorTitle: "Save Failed",
        dnsSaveErrorMessage: "Could not save DNS server.",
        clearDataTitle: "Clear Local Data",
        clearDataMessage:
          "This will permanently delete your chat history and DNS logs from this device.",
        clearDataSuccessTitle: "Local Data Cleared",
        clearDataSuccessMessage:
          "Your chat history and DNS logs have been cleared.",
        clearDataErrorMessage:
          "Unable to clear local data. Please try again.",
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
          clearCacheTitle: "Clear Local Data",
          clearCacheSubtitle: "Delete chat history and DNS logs from this device",
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
        clearCacheTitle: "Clear Local Data",
        clearCacheMessage:
          "This will permanently delete your chat history and DNS logs from this device.",
        clearCacheSuccessTitle: "Local Data Cleared",
        clearCacheSuccessMessage:
          "Your chat history and DNS logs have been cleared.",
        clearCacheErrorMessage:
          "Unable to clear local data. Please try again.",
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
    home: {
      title: "Home Screen",
      subtitle: "Open up 'app/(tabs)/index.tsx' to start working on your app!",
      goToProfile: "Go to Profile",
      goToSettings: "Go to Settings",
      navigationTitle: "Home",
      dnsConnected: "Connected",
      dnsDisconnected: "Not configured",
      dnsStatus: "DNS Status",
      configureButton: "Configure DNS",
      configure: "Configure",
      quickActions: {
        title: "Quick Actions",
        newChat: "New Chat",
        newChatDescription: "Start a new DNS conversation",
        viewLogs: "View Logs",
        viewLogsDescription: "Inspect DNS query history",
      },
      recentChats: {
        title: "Recent Chats",
        footer: "Your latest conversations",
      },
      allChats: "All Chats",
      allChatsDescription: "Open the full chat list",
    },
    profile: {
      title: "{{user}}'s Profile",
      navigationTitle: "Profile",
      noChatsYet: "No chats yet",
      defaultUser: "User",
      avatarLabel: "Profile avatar",
      memberSince: "First chat {{date}}",
      alerts: {
        clearDataTitle: "Clear All Data",
        clearDataMessage:
          "This will delete all your chats and messages. This action cannot be undone.",
        clearDataConfirm: "Clear Data",
        exportTitle: "Export Data",
        exportMessage: "Data export will be available in a future update.",
      },
      statistics: {
        title: "Statistics",
        footer: "Your chat activity summary",
        totalChats: "Total Conversations",
        totalMessages: "Total Messages",
        averageMessages: "Avg. Messages per Chat",
      },
      preferences: {
        title: "Preferences",
        settings: "Settings",
        settingsDescription: "DNS, accessibility, and more",
      },
      data: {
        title: "Data Management",
        footer: "Manage your chat history and personal data",
        export: "Export Data",
        exportDescription: "Download your chat history",
        clearAll: "Clear All Data",
        clearAllDescription: "Delete all chats and messages",
      },
    },
    notFound: {
      title: "404",
      goHome: "Go to Home",
      navigationTitle: "Not Found",
      description: "The page you're looking for doesn't exist or has been moved.",
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
    },
  },
} as const;

export type EnUSMessages = typeof enUS;
