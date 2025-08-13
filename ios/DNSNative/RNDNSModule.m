#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(RNDNSModule, NSObject)

RCT_EXTERN_METHOD(queryTXT:(NSString *)domain
                  message:(NSString *)message
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(isAvailable:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end