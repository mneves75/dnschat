#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(LiquidGlassViewManager, RCTViewManager)
RCT_EXPORT_VIEW_PROPERTY(variant, NSString)
RCT_EXPORT_VIEW_PROPERTY(shape, NSString)
RCT_EXPORT_VIEW_PROPERTY(cornerRadius, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(tintColor, NSString)
RCT_EXPORT_VIEW_PROPERTY(isInteractive, BOOL)
RCT_EXPORT_VIEW_PROPERTY(sensorAware, BOOL)
RCT_EXPORT_VIEW_PROPERTY(enableContainer, BOOL)
RCT_EXPORT_VIEW_PROPERTY(containerSpacing, NSNumber)
@end
