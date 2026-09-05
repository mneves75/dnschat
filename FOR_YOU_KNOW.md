# DNSChat, sem mapa complicado

DNSChat parece um aplicativo de mensagens, mas o caminho da mensagem é
deliberadamente incomum. Em vez de enviar um pedido HTTP para uma API, ele
transforma um prompt curto em uma consulta DNS TXT. Pense no DNS como uma
estrada pública: o aplicativo controla o carro e confere o pacote recebido, mas
os operadores da estrada ainda conseguem observar o destino e podem observar a
consulta. Por isso, o produto nunca deve prometer privacidade para prompts.

## Onde cada responsabilidade mora

- `app/` registra as rotas. `src/navigation/screens/` contém telas importadas
  pelas rotas, mas arquivos ali não criam rotas por conta própria.
- `src/services/dnsService.ts` coordena a ordem native -> UDP -> TCP -> mock.
  `src/services/dnsWire.ts` cuida do pacote DNS, do framing TCP e da validação
  das respostas.
- `modules/dns-native/` contém as implementações iOS e Android. As cópias sob
  `ios/` e `android/` precisam permanecer sincronizadas.
- `src/services/storageService.ts` guarda conversas e logs cifrados localmente;
  `encryptionService.ts` é o limite criptográfico e usa uma chave do
  SecureStore que não deve migrar entre dispositivos.
- `src/components/SafeMarkdown.tsx` é a única porta permitida para renderizar
  Markdown vindo do modelo. As regras de ast-grep impedem atalhos ao redor
  dessa porta.

## Decisões que parecem estranhas, mas são intencionais

O limite do prompt existe porque um label DNS aceita no máximo 63 bytes e o
nome completo tem outro teto. A aplicação falha de forma explícita em vez de
truncar silenciosamente. A resposta também é rejeitada por inteiro quando um
registro TXT está incompleto ou malformado; aceitar a parte boa esconderia
alterações e bugs de transporte.

No Android, `InetAddress` não oferece deadline real no piso de API suportado.
Um pool separado, com duas lanes e sem fila, permite que uma segunda resolução
progrida quando a primeira ignora cancelamento. Se ambas ficarem presas, novas
chamadas falham rapidamente em vez de criar threads sem limite.

Na recuperação de armazenamento, dado cifrado não é lixo só porque a chave está
temporariamente indisponível. O app preserva o payload e só remove um primário
danificado depois de criar e verificar um backup cifrado.

## Como provar uma mudança

`pnpm run verify:all` é o gate agregado, mas não substitui runtime. Mudanças de
DNS nativo precisam de testes do módulo e build nativo; mudanças visuais precisam
de um app compilado no Argent; um release precisa de archive/export assinados e
validação do artefato realmente enviado.

A versão nasce em `package.json`. `scripts/sync-versions.js` propaga a versão e
incrementa o build em `app.json`, Xcode e Gradle. TestFlight usa tags
`vX.Y.Z-betaN`; a tag limpa `vX.Y.Z` fica reservada para produção autorizada.

## Lições da auditoria de setembro de 2026

A tela de conversas e seu provedor carregavam o mesmo histórico na montagem.
Agora o provedor é o único responsável: uma leitura inicial, com atualização
explícita quando necessária. Na serialização, o próprio JSON já transforma datas;
um segundo passeio reconstruía objetos sem acrescentar informação.

O onboarding também esperava por uma sequência que parecia testar a rede, mas
não fazia nenhuma consulta. As recomendações agora aparecem imediatamente e a
espera corresponde apenas à gravação das configurações. Os testes exercitam
essa gravação, sua falha e a nova tentativa, em vez de conferir comentários.

Também removemos a ação de exportação que só mostrava um aviso de recurso futuro.
Testes nativos que validavam apenas seus próprios mocks saíram: a cobertura real
continua nos testes do parser, nos limites de segurança e no app compilado. O
verificador Android agora rejeita um AAB vazio mesmo quando encontra bibliotecas
válidas em outro artefato próximo.

Um verificador precisa saber dizer que não conseguiu verificar. Corrigimos saídas
de sucesso quando um linter era interrompido, um arquivo de versão não podia ser
gravado ou uma conexão DNS terminava sem resposta completa. Fixtures com falhas
reais protegem esses caminhos. Metadados de recuperação também merecem cuidado:
um erro de JSON ou de validação de campos pode repetir parte do conteúdo privado.
O fechamento da versão 4.4.3 encontrou esse segundo caminho no histórico: o
conteúdo continuava criptografado, mas o diagnóstico copiava um campo inválido.
Agora os backups de histórico e logs guardam somente um hash da mensagem de
erro; testes com dados legados e criptografados protegem a recuperação.

## Riscos que o cliente sozinho não resolve

O provedor DNS padrão ainda precisa documentar retenção, uso secundário,
exclusão e seu papel como prestador de serviço. Além disso, validar um pacote
DNS não autentica criptograficamente quem produziu a resposta. TestFlight pode
ser usado como staging informado, mas uma promoção pública exige resolver ou
aceitar explicitamente esses dois riscos.
