package org.xbill.DNS;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class TXTRecord extends Record {
    private final List<byte[]> strings;

    public TXTRecord() {
        this.strings = Collections.emptyList();
    }

    public TXTRecord(Name name, int dclass, List<byte[]> strings) {
        super(name, Type.TXT, dclass);
        this.strings = strings;
    }

    // Mirrors dnsjava 3.6.2 TXTBase.getStrings: presentation format, so every byte
    // outside 0x20..0x7E becomes \DDD and a UTF-8 answer comes back escaped
    // (verified against the real jar: "n\195\163o").
    public List<String> getStrings() {
        List<String> result = new ArrayList<>(strings.size());
        for (byte[] string : strings) {
            StringBuilder text = new StringBuilder();
            for (byte value : string) {
                int b = value & 0xFF;
                if (b < 0x20 || b >= 0x7F) {
                    text.append('\\');
                    if (b < 100) text.append('0');
                    if (b < 10) text.append('0');
                    text.append(b);
                } else {
                    if (b == '"' || b == '\\') text.append('\\');
                    text.append((char) b);
                }
            }
            result.add(text.toString());
        }
        return result;
    }

    public List<byte[]> getStringsAsByteArrays() {
        return strings;
    }
}
