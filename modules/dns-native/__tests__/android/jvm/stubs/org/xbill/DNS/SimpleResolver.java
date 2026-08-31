package org.xbill.DNS;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.time.Duration;

public class SimpleResolver implements Resolver {
    public SimpleResolver(String host) throws UnknownHostException {}

    public SimpleResolver(InetAddress address) {}

    public void setPort(int port) {}

    public void setTimeout(Duration timeout) {}
}
