export const DEMO = {
  repoUrl: 'github.com/mneves75/dnschat',
  launchPrompt: 'Explique DNS em uma frase',
  tutorialPrompt: 'Explique cache DNS brevemente',
  response:
    'O DNS guarda respostas por um tempo para acelerar consultas e reduzir tráfego.',
  queryLabel: 'explique-cache-dns-brevemente.llm.pieter.com',
  selectedService: 'llm.pieter.com',
  services: ['llm.pieter.com', '8.8.8.8', '1.1.1.1'],
  threads: ['Fundamentos de DNS', 'Como funciona o cache', 'Exemplo de registro TXT'],
  logs: [
    {transport: 'Nativo', state: 'Disponível', detail: 'Tentativa principal'},
    {transport: 'UDP', state: 'Reserva', detail: 'Somente se necessário'},
    {transport: 'TCP', state: 'Reserva', detail: 'Somente se necessário'},
  ],
  privacyWarning:
    'O serviço DNS ou a rede pode observar, reter ou alterar consultas e respostas. Não envie segredos nem dados pessoais.',
} as const;
