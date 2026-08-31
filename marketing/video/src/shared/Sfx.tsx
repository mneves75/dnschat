import {Audio} from '@remotion/media';
import {Sequence, staticFile} from 'remotion';

type TypingSfxProps = {
  characterCount: number;
  startFrame?: number;
  framesPerCharacter?: number;
};

export const TypingSfx = ({
  characterCount,
  startFrame = 0,
  framesPerCharacter = 2,
}: TypingSfxProps) => {
  return (
    <>
      {Array.from({length: characterCount}, (_, index) => (
        <Sequence
          key={index}
          from={startFrame + index * framesPerCharacter}
          durationInFrames={4}
        >
          <Audio
            src={staticFile(`audio/key-${(index % 3) + 1}.wav`)}
            volume={0.12}
          />
        </Sequence>
      ))}
    </>
  );
};

export const ClickSfx = ({from}: {from: number}) => {
  return (
    <Sequence from={from} durationInFrames={8}>
      <Audio src={staticFile('audio/click.wav')} volume={0.2} />
    </Sequence>
  );
};

export const SuccessSfx = ({from}: {from: number}) => {
  return (
    <Sequence from={from} durationInFrames={20}>
      <Audio src={staticFile('audio/success.wav')} volume={0.18} />
    </Sequence>
  );
};
