#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ScreenshotModeModule, NSObject)

RCT_EXTERN_METHOD(isScreenshotMode:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

@end
