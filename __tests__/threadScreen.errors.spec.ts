import { DNSError, DNSErrorType } from "../modules/dns-native";
import { resolveDnsErrorMessage } from "../src/utils/dnsErrors";

describe("resolveDnsErrorMessage", () => {
  it("covers DNSErrorType mappings", () => {
    const entries: Array<[DNSErrorType, string]> = [
      [DNSErrorType.PLATFORM_UNSUPPORTED, "Módulo DNS nativo indisponível nesta plataforma."],
      [DNSErrorType.NETWORK_UNAVAILABLE, "Sem conexão de rede para consultar o servidor DNS."],
      [DNSErrorType.TIMEOUT, "Tempo limite esgotado ao consultar o servidor DNS."],
      [DNSErrorType.DNS_SERVER_UNREACHABLE, "Servidor DNS inacessível. Verifique se a rede bloqueia a porta 53."],
      [DNSErrorType.INVALID_RESPONSE, "Resposta DNS inválida recebida. Tente novamente."],
      [DNSErrorType.PERMISSION_DENIED, "Permissão negada ao abrir o transporte DNS."],
    ];

    entries.forEach(([type, expected]) => {
      const error = new DNSError(type, "test");
      expect(resolveDnsErrorMessage(error)).toBe(expected);
    });
  });

  it("falls back for unknown errors", () => {
    expect(resolveDnsErrorMessage(new Error("Nope"))).toBe("Nope");
  });

  it("handles unexpected values gracefully", () => {
    expect(resolveDnsErrorMessage(undefined)).toBe("Erro inesperado ao enviar mensagem.");
  });
});
