import {TransitionSeries} from '@remotion/transitions';
import {TutorialCloseScene} from './scenes/TutorialCloseScene';
import {TutorialHistoryScene} from './scenes/TutorialHistoryScene';
import {TutorialIntroScene} from './scenes/TutorialIntroScene';
import {TutorialLogsScene} from './scenes/TutorialLogsScene';
import {TutorialNewChatScene} from './scenes/TutorialNewChatScene';
import {TutorialSafetyScene} from './scenes/TutorialSafetyScene';
import {TutorialSendReceiveScene} from './scenes/TutorialSendReceiveScene';
import {TutorialSettingsScene} from './scenes/TutorialSettingsScene';

export const TutorialVideo = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={150} name="Introduction">
        <TutorialIntroScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence durationInFrames={270} name="Safety">
        <TutorialSafetyScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence durationInFrames={330} name="New chat">
        <TutorialNewChatScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence durationInFrames={360} name="Send and receive">
        <TutorialSendReceiveScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence durationInFrames={390} name="Logs">
        <TutorialLogsScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence durationInFrames={300} name="Settings">
        <TutorialSettingsScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence durationInFrames={270} name="History">
        <TutorialHistoryScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence durationInFrames={180} name="Close">
        <TutorialCloseScene />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
