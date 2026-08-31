import {Composition} from 'remotion';
import {LaunchVideo} from './launch/LaunchVideo';
import {TutorialVideo} from './tutorial/TutorialVideo';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="DNSChatLaunch"
        component={LaunchVideo}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DNSChatTutorial"
        component={TutorialVideo}
        durationInFrames={2250}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
