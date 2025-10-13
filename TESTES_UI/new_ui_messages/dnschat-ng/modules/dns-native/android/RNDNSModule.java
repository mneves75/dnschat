package com.dnsnative;

import android.content.Context;
import android.net.ConnectivityManager;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.fbreact.specs.NativeRNDNSModuleSpec;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@ReactModule(name = RNDNSModule.NAME)
public class RNDNSModule extends NativeRNDNSModuleSpec {
    static final String NAME = "RNDNSModule";
    private final DNSResolver dnsResolver;

    public RNDNSModule(ReactApplicationContext reactContext) {
        super(reactContext);
        ConnectivityManager connectivityManager = (ConnectivityManager) 
            reactContext.getSystemService(Context.CONNECTIVITY_SERVICE);
        this.dnsResolver = new DNSResolver(connectivityManager);
    }

    @Override
    public String getName() {
        return NAME;
    }

    @Override
    public void queryTXT(String domain, String message, Promise promise) {
        CompletableFuture<List<String>> future = dnsResolver.queryTXT(domain, message);
        
        future
            .thenAccept(txtRecords -> {
                WritableArray result = Arguments.createArray();
                for (String record : txtRecords) {
                    result.pushString(record);
                }
                promise.resolve(result);
            })
            .exceptionally(throwable -> {
                String errorMessage = throwable.getCause() != null 
                    ? throwable.getCause().getMessage() 
                    : throwable.getMessage();
                promise.reject("DNS_QUERY_FAILED", errorMessage, throwable);
                return null;
            });
    }

    @Override
    public void isAvailable(Promise promise) {
        DNSResolver.DNSCapabilities capabilities = new DNSResolver.DNSCapabilities();
        
        WritableMap result = Arguments.createMap();
        result.putBoolean("available", capabilities.available);
        result.putString("platform", capabilities.platform);
        result.putBoolean("supportsCustomServer", capabilities.supportsCustomServer);
        result.putBoolean("supportsAsyncQuery", capabilities.supportsAsyncQuery);
        result.putInt("apiLevel", capabilities.apiLevel);
        
        promise.resolve(result);
    }

    @Override
    public void configure(ReadableMap options, Promise promise) {
        Double timeoutMs = null;
        Integer maxConcurrent = null;

        if (options.hasKey("timeoutMs") && !options.isNull("timeoutMs")) {
            timeoutMs = options.getDouble("timeoutMs");
        }
        if (options.hasKey("maxConcurrent") && !options.isNull("maxConcurrent")) {
            maxConcurrent = options.getInt("maxConcurrent");
        }

        dnsResolver.configure(timeoutMs, maxConcurrent);
        promise.resolve(null);
    }
}
