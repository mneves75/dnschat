package org.xbill.DNS;

public class Name {
    // dnsjava exposes the root name as a constant; an absolute name built against
    // it never expands through the resolver search path.
    public static final Name root = new Name(".");

    private final String value;

    public Name(String value) {
        this.value = value;
    }

    public static Name fromString(String name, Name origin) throws TextParseException {
        if (name == null || name.isEmpty()) {
            throw new TextParseException("empty name");
        }
        if (name.endsWith(".")) {
            return new Name(name);
        }
        if (origin == null) {
            return new Name(name);
        }
        return new Name(root.equals(origin) ? name + "." : name + "." + origin);
    }

    public boolean isAbsolute() {
        return value.endsWith(".");
    }

    @Override
    public boolean equals(Object other) {
        return other instanceof Name && value.equals(((Name) other).value);
    }

    @Override
    public int hashCode() {
        return value.hashCode();
    }

    @Override
    public String toString() {
        return value;
    }
}
