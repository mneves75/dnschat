#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(RNDNSModule, NSObject)

RCT_EXTERN_METHOD(queryTXT:(NSString *)domain
                  message:(NSString *)message
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(isAvailable:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end