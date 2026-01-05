export const ptBR = {
  common: {
    ok: "OK",
    cancel: "Cancelar",
    delete: "Apagar",
    errorTitle: "Erro",
    close: "Fechar",
    reset: "Restaurar",
    save: "Salvar",
    saving: "Salvando...",
    clear: "Limpar",
    settings: "Configurações",
    language: "Idioma",
    followSystem: "Usar idioma do dispositivo",
  },
  locales: {
    enUS: "Inglês (Estados Unidos)",
    ptBR: "Português (Brasil)",
    deviceLabel: "Idioma do dispositivo ({{language}})",
  },
  navigation: {
    tabs: {
      chat: "DNS Chat",
      logs: "Logs",
      about: "Sobre",
    },
    stack: {
      chat: "Chat",
      settings: "Configurações",
      devLogs: "Logs DNS do Dev",
      notFound: "404",
    },
  },
  screen: {
    onboarding: {
      welcome: {
        title: "Bem-vindo ao DNS Chat",
        subtitle: "O primeiro aplicativo de chat do mundo que usa consultas DNS para se comunicar com IA",
        features: {
          revolutionary: {
            label: "Revolucionário",
            title: "Tecnologia Revolucionária",
            description: "Converse através de registros DNS TXT - sem APIs tradicionais",
          },
          private: {
            label: "Privado",
            title: "Focado em Privacidade",
            description: "Suas conversas viajam pela infraestrutura global de DNS",
          },
          fast: {
            label: "Rápido",
            title: "Resiliente à Rede",
            description: "Adapta-se automaticamente a diferentes condições de rede",
          },
        },
      },
      firstChat: {
        label: "Chat",
        title: "Experimente Seu Primeiro Chat",
        subtitle: "Envie uma mensagem e veja ela viajar pelo DNS",
        welcomeMessage: "Oi! Sou seu assistente de IA. Tente me enviar uma mensagem para ver como a magia do DNS funciona!",
        successMessage: "Ótimo! Você enviou com sucesso sua primeira mensagem DNS. Em um cenário real, isso retornaria uma resposta de IA via registros DNS TXT. A magia é que sua mensagem viajou pela infraestrutura DNS!",
        suggestions: {
          title: "Experimente uma destas:",
          option1: "O que é DNS?",
          option2: "Como este aplicativo funciona?",
          option3: "Me conte algo interessante",
          option4: "Com o que você pode me ajudar?",
        },
        input: {
          placeholder: "Digite sua mensagem...",
          send: "Enviar",
          sending: "...",
          sendingVia: "Enviando via DNS...",
        },
        navigation: {
          continue: "Incrível! Continuar",
          skip: "Pular Tutorial",
        },
      },
      dnsMagic: {
        label: "DNS",
        title: "Magia DNS em Ação",
        subtitle: "Veja sua mensagem viajar por múltiplos métodos de fallback DNS",
        demoButton: "Iniciar Demo DNS",
        demoButtonRunning: "Consulta DNS em Progresso...",
        responseLabel: "Resposta DNS:",
        fallbackMethods: {
          native: {
            name: "DNS Nativo",
            pending: "Preparando consulta DNS nativa...",
            active: "Enviando consulta DNS via plataforma nativa...",
            success: "Consulta DNS nativa bem-sucedida",
            failed: "DNS nativo falhou, tentando UDP...",
          },
          udp: {
            name: "Fallback UDP",
            pending: "Socket UDP pronto como backup...",
            active: "Tentando consulta DNS via UDP...",
            success: "Fallback UDP bem-sucedido",
            failed: "UDP falhou, tentando TCP...",
          },
          tcp: {
            name: "Fallback TCP",
            pending: "Conexão TCP em espera...",
            active: "Tentando consulta DNS via TCP...",
            success: "Fallback TCP bem-sucedido",
            failed: "TCP falhou, tentando HTTPS...",
          },
          https: {
            name: "Fallback HTTPS",
            pending: "API DNS Cloudflare pronta...",
            active: "Tentando consulta DNS via HTTPS...",
            success: "Fallback HTTPS bem-sucedido",
            failed: "Todos os métodos DNS esgotados",
          },
        },
        status: {
          pending: "Pendente",
          active: "Ativo",
          success: "Sucesso",
          failed: "Falhou",
        },
        demoResponse: "Bem-vindo ao DNS Chat! Esta é uma demonstração de como suas mensagens viajam através de consultas DNS. Bem legal, né?",
      },
      networkSetup: {
        label: "Configuração",
        title: "Otimização de Rede",
        subtitle: "Estamos testando sua rede para encontrar os métodos DNS mais rápidos",
        disclaimer: "Esta é uma demonstração simulada",
        tests: {
          native: {
            name: "DNS Nativo",
            description: "DNS otimizado para a plataforma",
          },
          udp: {
            name: "DNS via UDP",
            description: "Consultas DNS tradicionais",
          },
          tcp: {
            name: "DNS via TCP",
            description: "Fallback TCP confiável",
          },
        },
        status: {
          testing: "Testando",
          waiting: "Aguardando",
          success: "Sucesso",
          failed: "Falhou",
          skipped: "Pulado",
        },
        optimization: {
          title: "Otimização Completa",
          description: "Sua rede suporta todos os métodos DNS. O aplicativo usará automaticamente o método mais rápido disponível com fallback inteligente para desempenho ideal.",
          applyButton: "Aplicar Configurações Recomendadas",
          loading: "Otimizando suas configurações de DNS...",
        },
        navigation: {
          continue: "Continuar",
          skip: "Pular Otimização",
        },
        alerts: {
          errorTitle: "Erro",
          errorMessage: "Otimização de rede falhou. Usando configurações padrão.",
          successTitle: "Configurações Aplicadas",
          successMessage: "Otimização de rede completa. O DNS usará cadeia de fallback automática para melhor desempenho.",
          successButton: "Ótimo",
        },
      },
      features: {
        logs: {
          label: "Logs",
          title: "Logs de Consultas DNS",
          description: "Monitore todas as consultas DNS em tempo real com informações detalhadas de tempo e fallback.",
        },
        customize: {
          label: "Personalizar",
          title: "Configurações Personalizáveis",
          description: "Configure servidores DNS, ative preferências HTTPS e otimize para sua rede.",
        },
        liquidGlass: {
          label: "iOS 26",
          title: "Design Liquid Glass",
          description: "Bela interface iOS 26 com efeitos de vidro nativos e Material Design 3 no Android.",
        },
        i18n: {
          label: "i18n",
          title: "Suporte Multilíngue",
          description: "Internacionalização completa com idiomas Inglês e Português.",
        },
        haptics: {
          label: "Hápticos",
          title: "Feedback Háptico",
          description: "Feedback háptico personalizável para elementos e ações interativas.",
        },
        opensource: {
          label: "Aberto",
          title: "Código Aberto",
          description: "Construído de forma transparente - explore o código e contribua para o futuro do chat DNS.",
          action: "Ver no GitHub",
        },
        themes: {
          label: "Adapta",
          title: "Temas Claro e Escuro",
          description: "Interface bonita que se adapta às suas preferências do sistema com suporte a modo de alto contraste.",
        },
        storage: {
          label: "Local",
          title: "Armazenamento Local",
          description: "Todas as suas conversas são armazenadas com segurança no seu dispositivo - sem dependência de nuvem.",
        },
        fallbacks: {
          label: "Inteligente",
          title: "Fallbacks Inteligentes",
          description: "Sistema de fallback inteligente garante conectividade em diferentes condições de rede.",
        },
      },
      header: {
        label: "Recursos",
        title: "Recursos Poderosos",
        subtitle: "Descubra o que torna o DNS Chat especial",
      },
      ready: {
        title: "Tudo Pronto",
        description: "Agora você sabe como usar o DNS Chat e tem configurações otimizadas para sua rede. Comece a conversar e experimente a magia das conversas via DNS!",
        button: "Começar a Conversar",
      },
    },
    chat: {
      navigationTitle: "Chat",
      errorAlertTitle: "Erro",
      errorAlertDismiss: "OK",
      placeholder: "Pergunte qualquer coisa...",
      emptyState: {
        title: "Comece uma conversa!",
        description: "Envie uma mensagem para iniciar o chat com o assistente de IA.",
      },
      messageActions: {
        copy: "Copiar",
        share: "Compartilhar",
      },
    },
    chatInput: {
      placeholder: "Mensagem...",
    },
    chatList: {
      navigationTitle: "Conversas",
      emptyTitle: "Ainda não há conversas",
      emptySubtitle:
        "Crie uma nova conversa para começar a falar com o assistente de IA.",
      newChatButton: "Iniciar nova conversa",
      accessibility: {
        deleteButton: "Apagar conversa",
        deleteButtonHint: "Toque duas vezes para apagar esta conversa",
        chatItem: "Conversa: {{title}}",
        chatItemHint: "Toque duas vezes para abrir a conversa",
      },
    },
    glassChatList: {
      navigationTitle: "DNS Chat",
      newConversation: {
        title: "Iniciar nova conversa",
        subtitle: "Abra um novo tópico com a IA DNS",
        button: "Nova conversa",
        description: "Comece uma nova conversa com a IA DNS",
      },
      recent: {
        title: "Conversas recentes",
        footerSingle: "{{count}} conversa ao todo",
        footerMultiple: "{{count}} conversas ao todo",
      },
      empty: {
        title: "Nenhuma conversa ainda",
        subtitle:
          "Toque em \"Nova conversa\" para iniciar. Suas conversas aparecerão aqui.",
      },
      stats: {
        title: "Estatísticas",
        totalMessagesTitle: "Total de mensagens",
        totalMessagesSubtitle: "Quantas mensagens já foram enviadas",
        averageTitle: "Média por conversa",
        averageSubtitle: "Mensagens por conversa",
      },
      badges: {
        messageSingular: "{{count}} mensagem",
        messagePlural: "{{count}} mensagens",
      },
      actionSheet: {
        title: "Escolha uma ação",
        message: "Selecione o que fazer com esta conversa",
        openChat: "Abrir conversa",
        shareChat: "Compartilhar conversa",
        deleteChat: "Apagar conversa",
        cancel: "Cancelar",
      },
      alerts: {
        deleteTitle: "Apagar conversa",
        deleteMessage:
          "Tem certeza de que deseja apagar “{{title}}”? Essa ação não pode ser desfeita.",
      },
    },
    logs: {
      navigationTitle: "Logs de consultas DNS",
      empty: {
        title: "Sem consultas DNS ainda",
        subtitle:
          "Envie uma mensagem para ver os registros de consultas. Todas as tentativas ficam documentadas.",
      },
      history: {
        title: "Histórico de consultas DNS",
        footerSingle: "{{count}} consulta registrada",
        footerMultiple: "{{count}} consultas registradas",
      },
      labels: {
        noQuery: "Sem consulta",
        noMessage: "Sem mensagem",
        noResponse: "Sem resposta",
        response: "Resposta:",
        querySteps: "Etapas da consulta:",
        resultTitle: "Resultado do último teste:",
        errorTitle: "Erro do último teste:",
        unknownMethod: "DESCONHECIDO",
        errorPrefix: "Erro: {{message}}",
      },
      actions: {
        title: "Ações",
        clearAll: "Limpar todos os logs",
        clearAllSubtitle: "Remove todo o histórico de consultas DNS",
      },
      alerts: {
        clearTitle: "Limpar logs",
        clearMessage: "Tem certeza de que deseja limpar todos os logs DNS?",
        clearConfirm: "Limpar",
      },
    },
    settings: {
      navigationTitle: "Configurações",
      sections: {
        dnsConfig: {
          title: "Configuração de DNS",
          description:
            "Defina o servidor DNS usado na comunicação com o LLM. Ele receberá suas mensagens via consultas TXT.",
          dnsServerLabel: "Serviço DNS TXT",
          dnsServerPlaceholder: "ch.at",
          dnsServerHint: "Padrão: {{server}}",
        },
        appBehavior: {
          title: "Comportamento do App",
          description:
            "Configure recursos e comportamento do aplicativo.",
          enableMockDNS: {
            label: "Ativar DNS simulado",
            description:
              "Usa respostas DNS simuladas para desenvolvimento e testes.",
          },
          enableHaptics: {
            label: "Ativar hápticos",
            description:
              "Reproduz feedback tátil quando houver suporte e respeita Reduzir Movimento.",
          },
        },
        transportTest: {
          title: "Teste de transporte",
          description:
            "Envie uma mensagem de teste usando a preferência atual ou force um transporte específico. Tudo é registrado.",
          messageLabel: "Mensagem de teste",
          placeholder: "ping",
          testButton: "Testar preferência selecionada",
          testingButton: "Testando...",
          forceLabel: "Forçar transporte específico",
          transports: {
            native: "Nativo",
            udp: "UDP",
            tcp: "TCP",
          },
          resultLabel: "Resultado do último teste:",
          errorLabel: "Erro do último teste:",
          viewLogs: "Ver logs",
        },
        currentConfig: {
          title: "Configuração atual",
          dnsServerLabel: "Servidor DNS ativo:",
        },
        data: {
          title: "Gerenciamento de dados",
          description:
            "Gerencie chats e logs DNS armazenados localmente neste dispositivo.",
          clearDataTitle: "Limpar dados locais",
          clearDataSubtitle: "Excluir histórico de chats e logs DNS deste dispositivo",
          clearDataHint:
            "Exclui todos os chats e logs DNS armazenados localmente neste dispositivo",
        },
        development: {
          title: "Desenvolvimento",
          resetOnboardingTitle: "Redefinir onboarding",
          resetOnboardingSubtitle: "Exibir o tour novamente",
        },
        language: {
          title: "Idioma",
          description:
            "Escolha o idioma da interface. A opção sistema segue o idioma do dispositivo.",
          systemOption: "Usar padrão do dispositivo",
          systemDescription: "Atualmente {{language}}",
          optionDescription: "Definir interface para {{language}}",
        },
      },
      actions: {
        resetButton: "Restaurar padrão",
        saveButton: "Salvar alterações",
        saving: "Salvando...",
      },
      alerts: {
        resetTitle: "Restaurar padrão",
        resetMessage:
          "Tem certeza de que deseja restaurar todas as configurações?",
        resetConfirm: "Restaurar",
        onboardingTitle: "Redefinir onboarding",
        onboardingMessage:
          "Isso reiniciará o processo de onboarding e o mostrará novamente no próximo lançamento.",
        onboardingConfirm: "Redefinir onboarding",
        onboardingCancel: "Cancelar",
        onboardingResetTitle: "Onboarding redefinido",
        onboardingResetMessage:
          "O onboarding será exibido novamente quando você reabrir o app.",
        saveSuccessTitle: "Configurações salvas",
        saveSuccessMessage: "As configurações foram atualizadas com sucesso.",
        saveErrorTitle: "Erro",
        saveErrorMessage: "Falha ao salvar. Tente novamente.",
        dnsSaveErrorTitle: "Falha ao salvar",
        dnsSaveErrorMessage: "Não foi possível salvar o servidor DNS.",
        clearDataTitle: "Limpar dados locais",
        clearDataMessage:
          "Isso excluirá permanentemente seu histórico de chats e logs DNS deste dispositivo.",
        clearDataSuccessTitle: "Dados locais limpos",
        clearDataSuccessMessage:
          "Seu histórico de chats e logs DNS foi apagado.",
        clearDataErrorMessage:
          "Não foi possível limpar os dados locais. Tente novamente.",
      },
    },
    glassSettings: {
      dnsServerSheet: {
        title: "Selecionar serviço DNS",
        subtitle: "Escolha o resolvedor preferido",
      },
      dnsOptions: {
        chAt: {
          label: "ch.at (padrão)",
          description: "Servidor oficial do DNSChat com respostas de IA",
        },
        llmPieter: {
          label: "llm.pieter.com",
          description: "Serviço de LLM do Pieter via DNS",
        },
      },
      aboutSheet: {
        title: "Sobre o DNSChat",
        subtitle: "Converse via consultas DNS TXT",
        overview:
          "DNSChat oferece mensagens via DNS com UI de vidro, hápticos e logging completo.",
        featuresTitle: "Principais recursos",
        features: {
          line1: "Chat de IA por consultas DNS TXT",
          line2: "Cadeia completa de fallback de transporte",
          line3: "Registro em tempo real para depuração",
          line4: "UI translúcida inspirada no design da Apple",
          line5: "Implementação React Native multiplataforma",
        },
      },
      supportSheet: {
        title: "Opções de suporte",
        message: "Como podemos ajudar?",
        docs: "Ver documentação",
        community: "Entrar na comunidade",
        email: "Enviar e-mail",
        cancel: "Cancelar",
      },
      sections: {
        dnsConfig: {
          mockTitle: "Ativar Mock DNS",
          mockSubtitle: "Usar respostas simuladas quando o DNS real falhar",
        },
        about: {
          title: "Sobre",
          appVersionTitle: "Versão do app",
          appVersionSubtitle: "DNSChat v{{version}}",
          latestBadge: "Atual",
          githubTitle: "Repositório no GitHub",
          githubSubtitle: "Veja o código-fonte e contribua",
          shareTitle: "Compartilhar DNSChat",
          shareSubtitle: "Divulgue este aplicativo",
          shareMessage:
            "Conheça o DNSChat — converse via DNS! Uma forma única de comunicar usando consultas TXT.",
        },
        advanced: {
          title: "Avançado",
          footer: "Configurações para usuários avançados. Use com cautela.",
          clearCacheTitle: "Limpar dados locais",
          clearCacheSubtitle: "Excluir histórico de chats e logs DNS deste dispositivo",
          resetTitle: "Redefinir configurações",
          resetSubtitle: "Restaurar valores padrão",
        },
        support: {
          title: "Suporte",
          helpTitle: "Ajuda e feedback",
          helpSubtitle: "Peça ajuda ou envie sugestões",
          bugTitle: "Reportar bug",
          bugSubtitle: "Encontrou um problema? Avise-nos",
        },
        language: {
          title: "Idioma",
        },
      },
      alerts: {
        resetTitle: "Redefinir configurações",
        resetMessage:
          "Tem certeza de que deseja restaurar todos os valores padrão?",
        resetConfirm: "Redefinir",
        clearCacheTitle: "Limpar dados locais",
        clearCacheMessage:
          "Isso excluirá permanentemente seu histórico de chats e logs DNS deste dispositivo.",
        clearCacheSuccessTitle: "Dados locais limpos",
        clearCacheSuccessMessage:
          "Seu histórico de chats e logs DNS foi apagado.",
        clearCacheErrorMessage:
          "Não foi possível limpar os dados locais. Tente novamente.",
      },
      results: {
        label: "Resultado: {{value}}",
        error: "Erro: {{value}}",
      },
    },
    about: {
      navigationTitle: "Sobre",
      fallbackInitials: "DNS",
      appName: "DNS Chat",
      tagline:
        "Converse com IA por consultas DNS TXT – uma forma única de falar com modelos de linguagem.",
      versionLabel: "v{{version}}",
      footer: "© 2025 Marcus Neves • Licença MIT",
      quickActions: {
        title: "Ações rápidas",
        settingsTitle: "Configurações",
        settingsSubtitle: "Ajuste preferências de DNS e idioma",
      },
      credits: {
        arxivDaily: "Conceito original do Ch.at e serviço de LLM via DNS",
        levels: "Retweetou @arxiv_daily",
        reactNative: "Framework móvel multiplataforma",
        expo: "Plataforma de desenvolvimento e builds",
        reactNavigation: "Biblioteca de navegação para React Native",
        asyncStorage: "Solução de armazenamento local",
      },
      sections: {
        inspiration: {
          title: "Inspiração",
          footer:
            "Este projeto nasceu graças ao trabalho incrível da comunidade open-source",
          items: {
            arxivTweet: {
              title: "Tweet @Arxiv_Daily",
              subtitle: "Conceito original de LLM sobre DNS",
            },
            chatProject: {
              title: "Projeto Ch.at",
              subtitle: "Inteligência básica universal via DNS",
            },
            levelsio: {
              title: "@levelsio",
              subtitle: "Divulgou o conceito original",
            },
          },
        },
        project: {
          title: "Projeto",
          items: {
            github: {
              title: "Repositório no GitHub",
              subtitle: "Veja o código e contribua",
            },
            issues: {
              title: "Reportar problema",
              subtitle: "Achou um bug? Conte pra gente",
            },
            updates: {
              title: "@dnschat no X",
              subtitle: "Acompanhe as novidades",
            },
          },
          settings: {
            title: "Configurações",
            subtitle: "Ajuste preferências de DNS e aparência",
          },
        },
        developer: {
          title: "Desenvolvedor",
          creatorSubtitle: "Criado por {{handle}}",
          devLogsTitle: "Logs do desenvolvedor (Dev)",
          devLogsSubtitle: "Abrir visualizador de logs DNS",
        },
        specialThanks: {
          title: "Agradecimentos especiais",
          footer:
            "Nada disso existiria sem esses projetos e serviços open-source incríveis",
        },
      },
    },
    home: {
      title: "Tela inicial",
      subtitle: "Abra 'app/(tabs)/index.tsx' para começar a trabalhar no app!",
      goToProfile: "Ir para o perfil",
      goToSettings: "Ir para configurações",
    },
    profile: {
      title: "Perfil de {{user}}",
    },
    notFound: {
      title: "404",
      goHome: "Ir para início",
    },
  },
  components: {
    chatInput: {
      accessibilityLabel: "Campo de mensagem",
      accessibilityHint: "Digite sua mensagem aqui",
      sendLabel: "Enviar mensagem",
      sendHint: "Toque duas vezes para enviar",
      sendingLabel: "Enviando mensagem",
      charactersRemaining: "{{count}} caracteres restantes",
    },
    dnsLogViewer: {
      empty: "Nenhum log DNS ainda",
      responseLabel: "Resposta",
    },
  },
} as const;
