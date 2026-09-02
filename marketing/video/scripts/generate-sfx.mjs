import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = resolve(root, "public/audio");
const sampleRate = 48000;

const writeUInt32LE = (buffer, value, offset) => {
  buffer.writeUInt32LE(value, offset);
};

const writeUInt16LE = (buffer, value, offset) => {
  buffer.writeUInt16LE(value, offset);
};

const createWav = ({ durationSeconds, frequencies, amplitude = 0.25 }) => {
  const sampleCount = Math.ceil(durationSeconds * sampleRate);
  const dataSize = sampleCount * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  writeUInt32LE(buffer, 36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  writeUInt32LE(buffer, 16, 16);
  writeUInt16LE(buffer, 1, 20);
  writeUInt16LE(buffer, 1, 22);
  writeUInt32LE(buffer, sampleRate, 24);
  writeUInt32LE(buffer, sampleRate * 2, 28);
  writeUInt16LE(buffer, 2, 32);
  writeUInt16LE(buffer, 16, 34);
  buffer.write("data", 36);
  writeUInt32LE(buffer, dataSize, 40);

  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / sampleRate;
    const attack = Math.min(1, time / 0.004);
    const release = Math.max(0, 1 - time / durationSeconds);
    const envelope = attack * release * release;
    const wave =
      frequencies.reduce(
        (sum, frequency, harmonicIndex) =>
          sum + Math.sin(2 * Math.PI * frequency * time) / (harmonicIndex + 1),
        0,
      ) / frequencies.length;
    const sample = Math.max(-1, Math.min(1, wave * envelope * amplitude));
    buffer.writeInt16LE(Math.round(sample * 32767), 44 + index * 2);
  }

  return buffer;
};

const sounds = [
  [
    "key-1.wav",
    { durationSeconds: 0.055, frequencies: [1280, 2180], amplitude: 0.18 },
  ],
  [
    "key-2.wav",
    { durationSeconds: 0.05, frequencies: [1420, 2310], amplitude: 0.17 },
  ],
  [
    "key-3.wav",
    { durationSeconds: 0.06, frequencies: [1160, 2040], amplitude: 0.19 },
  ],
  [
    "click.wav",
    { durationSeconds: 0.09, frequencies: [760, 1220], amplitude: 0.2 },
  ],
  [
    "success.wav",
    { durationSeconds: 0.34, frequencies: [440, 660, 880], amplitude: 0.2 },
  ],
];

await mkdir(outputDir, { recursive: true });
for (const [filename, options] of sounds) {
  await writeFile(resolve(outputDir, filename), createWav(options));
}
