package org.xbill.DNS;

public class Record {
    private final Name name;
    private final int type;
    private final int dclass;

    public Record() {
        this(new Name(""), 0, 0);
    }

    protected Record(Name name, int type, int dclass) {
        this.name = name;
        this.type = type;
        this.dclass = dclass;
    }

    public int getType() {
        return type;
    }

    public int getDClass() {
        return dclass;
    }

    public Name getName() {
        return name;
    }
}
