import {TransitionSeries} from '@remotion/transitions';
import {LaunchCtaScene} from './scenes/LaunchCtaScene';
import {LaunchHookScene} from './scenes/LaunchHookScene';
import {LaunchProofScene} from './scenes/LaunchProofScene';
import {LaunchResponseScene} from './scenes/LaunchResponseScene';
import {LaunchSendScene} from './scenes/LaunchSendScene';
import {LaunchTransportScene} from './scenes/LaunchTransportScene';
import {LaunchTrustScene} from './scenes/LaunchTrustScene';

export const LaunchVideo = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={90} name="Hook">
        <LaunchHookScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence durationInFrames={150} name="Send">
        <LaunchSendScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence durationInFrames={150} name="Transport">
        <LaunchTransportScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence durationInFrames={150} name="Response">
        <LaunchResponseScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence durationInFrames={150} name="Product proof">
        <LaunchProofScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence durationInFrames={120} name="Trust boundary">
        <LaunchTrustScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence durationInFrames={90} name="CTA">
        <LaunchCtaScene />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
