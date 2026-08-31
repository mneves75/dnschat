import {COLORS, FONT_MONO} from './tokens';

type ChatMockProps = {
  prompt: string;
  response?: string;
  pending?: boolean;
};

export const ChatMock = ({prompt, response, pending = false}: ChatMockProps) => {
  return (
    <div
      style={{
        height: '100%',
        padding: '28px 28px 24px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 18}}>
        {prompt ? (
          <div
            style={{
              alignSelf: 'flex-end',
              maxWidth: '86%',
              padding: '18px 20px',
              borderRadius: '24px 24px 7px 24px',
              backgroundColor: COLORS.cobalt,
              color: COLORS.white,
              fontSize: 24,
              lineHeight: 1.28,
            }}
          >
            {prompt}
          </div>
        ) : null}
        {pending ? (
          <div
            style={{
              alignSelf: 'flex-start',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px 20px',
              borderRadius: '24px 24px 24px 7px',
              backgroundColor: '#E8EDF5',
              color: COLORS.mutedDark,
              fontSize: 24,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: COLORS.cobalt,
              }}
            />
            Consultando TXT...
          </div>
        ) : null}
        {response ? (
          <div
            style={{
              alignSelf: 'flex-start',
              maxWidth: '90%',
              padding: '19px 20px',
              borderRadius: '24px 24px 24px 7px',
              backgroundColor: '#E8EDF5',
              color: COLORS.ink,
              fontSize: 24,
              lineHeight: 1.32,
            }}
          >
            {response}
          </div>
        ) : null}
      </div>
      <div
        style={{
          height: 78,
          borderRadius: 22,
          border: '1px solid rgba(7,17,31,0.15)',
          backgroundColor: COLORS.paperRaised,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '0 13px 0 22px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 0,
            color: prompt ? COLORS.ink : COLORS.mutedDark,
            fontSize: 24,
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {prompt || 'Escreva uma pergunta curta'}
        </div>
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 18,
            backgroundColor: COLORS.cobalt,
            color: COLORS.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONT_MONO,
            fontWeight: 800,
            fontSize: 24,
          }}
        >
          OK
        </div>
      </div>
    </div>
  );
};

export const TransportLogMock = ({
  activeIndex = 0,
}: {
  activeIndex?: number;
}) => {
  const rows = [
    ['Nativo', 'Concluído', '12 ms'],
    ['UDP', 'Não usado', '--'],
    ['TCP', 'Não usado', '--'],
  ];

  return (
    <div
      style={{
        height: '100%',
        padding: 28,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      <div style={{fontSize: 24, fontWeight: 740}}>Log de transporte</div>
      <div
        style={{
          padding: '14px 16px',
          borderRadius: 16,
          backgroundColor: '#E9EEFA',
          fontFamily: FONT_MONO,
          fontSize: 24,
          lineHeight: 1.45,
          color: COLORS.mutedDark,
          overflowWrap: 'anywhere',
        }}
      >
        TXT [conteúdo redigido] - 29 caracteres
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
        {rows.map(([transport, state, timing], index) => (
          <div
            key={transport}
            style={{
              display: 'grid',
              gridTemplateColumns: '110px 1fr 70px',
              alignItems: 'center',
              gap: 12,
              minHeight: 64,
              borderRadius: 16,
              padding: '0 16px',
              backgroundColor:
                index === activeIndex ? 'rgba(47,107,255,0.12)' : '#FFFFFF',
              border:
                index === activeIndex
                  ? '1px solid rgba(47,107,255,0.28)'
                  : '1px solid rgba(7,17,31,0.08)',
              fontSize: 24,
            }}
          >
            <div style={{fontFamily: FONT_MONO, fontWeight: 720}}>
              {transport}
            </div>
            <div style={{color: COLORS.mutedDark}}>{state}</div>
            <div
              style={{
                fontFamily: FONT_MONO,
                textAlign: 'right',
                color: COLORS.mutedDark,
              }}
            >
              {timing}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 'auto',
          padding: '16px 18px',
          borderRadius: 16,
          backgroundColor: 'rgba(105,217,176,0.14)',
          border: '1px solid rgba(105,217,176,0.34)',
          fontSize: 24,
          lineHeight: 1.35,
        }}
      >
        A ordem de reserva só avança quando a rede ou o runtime exige.
      </div>
    </div>
  );
};

export const SettingsMock = () => {
  return (
    <div
      style={{
        height: '100%',
        padding: 28,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      <div style={{fontSize: 24, fontWeight: 740}}>Preferências</div>
      {[
        ['Serviço DNS', 'llm.pieter.com'],
        ['Tema', 'Sistema'],
        ['Idioma', 'Português (Brasil)'],
      ].map(([label, value], index) => (
        <div
          key={label}
          style={{
            minHeight: 86,
            borderRadius: 18,
            padding: '15px 18px',
            boxSizing: 'border-box',
            backgroundColor: index === 0 ? 'rgba(47,107,255,0.1)' : '#FFFFFF',
            border:
              index === 0
                ? '1px solid rgba(47,107,255,0.28)'
                : '1px solid rgba(7,17,31,0.09)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <div
            style={{
              fontSize: 24,
              textTransform: 'uppercase',
              letterSpacing: 1.2,
              color: COLORS.mutedDark,
              fontWeight: 700,
            }}
          >
            {label}
          </div>
          <div style={{fontSize: 24, fontWeight: 700}}>{value}</div>
        </div>
      ))}
      <div
        style={{
          marginTop: 'auto',
          fontSize: 24,
          lineHeight: 1.35,
          color: COLORS.mutedDark,
        }}
      >
        Somente serviços pré-aprovados podem ser selecionados.
      </div>
    </div>
  );
};

export const HistoryMock = () => {
  return (
    <div
      style={{
        height: '100%',
        padding: 28,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div
        style={{
          minHeight: 44,
          padding: '0 2px',
          display: 'flex',
          alignItems: 'center',
          color: COLORS.mutedDark,
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
        }}
      >
        Conversas recentes
      </div>
      {['Fundamentos de DNS', 'Como funciona o cache', 'Exemplo de registro TXT'].map(
        (title, index) => (
          <div
            key={title}
            style={{
              minHeight: 78,
              borderRadius: 18,
              padding: '14px 18px',
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(7,17,31,0.08)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 5,
            }}
          >
            <div style={{fontSize: 24, fontWeight: 700}}>{title}</div>
            <div style={{fontSize: 24, color: COLORS.mutedDark}}>
              {index === 0 ? 'Agora' : index === 1 ? 'Demonstração' : 'Exemplo local'}
            </div>
          </div>
        ),
      )}
      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: COLORS.mutedDark,
          fontSize: 24,
        }}
      >
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: COLORS.mint,
          }}
        />
        Histórico criptografado neste dispositivo
      </div>
    </div>
  );
};
