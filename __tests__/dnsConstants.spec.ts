import { getLLMServers } from "../modules/dns-native/constants";

describe("DNS constants", () => {
  it("returns defensive copies of exported server lists", () => {
    const first = getLLMServers();
    first[0]!.host = "mutated.example";
    first.pop();

    const second = getLLMServers();
    expect(second.map((server) => server.host)).toEqual(["llm.pieter.com"]);
  });
});
