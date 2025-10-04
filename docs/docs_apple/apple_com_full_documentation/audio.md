  * [ Technology Overviews ](/documentation/technologyoverviews)
  * [ Audio and video ](/documentation/technologyoverviews/audio-and-video)
  * Audio and music 

# Audio and music

Play, record, and process audio, and find and play content from Apple Music
and someone’s music library.

Whether you’re adding audio touches to your app’s UI, or building your own
audio-editing app, Apple has the audio technologies you need. Audio plays an
important role in many apps, with specialized audio hardware built in to all
Apple devices. The software you use to access that hardware ensures playback
is efficient, and helps you work with a wide variety of audio formats.

### [Add user interface sounds and haptic
feedback](/documentation/technologyoverviews/audio-and-music#Add-user-
interface-sounds-and-haptic-feedback)

You can enhance your app with audio and haptic feedback. Consider the feedback
that the system apps provide: Mail plays a whoosh when you send an email,
Camera plays a shutter click when you take a photo, and Photos provides haptic
feedback when editing photos. These sensory cues create engaging and tactile
experiences.

Apple offers several APIs that support audio playback, including:

[System Sound Services](/documentation/AudioToolbox/audio-services)

    

A C-based set of APIs available as part of the [Audio
Toolbox](/documentation/AudioToolbox) framework. Provides interfaces to
[play](/documentation/AudioToolbox/AudioServicesPlaySystemSound\(_:\)) short,
uncompressed audio files of 30 seconds or less. These APIs don’t provide
playback controls, support volume adjustments, or allow simultaneous sound
playback, but do offer an efficient, low-latency solution to add audio
feedback.

[`AVAudioPlayer`](/documentation/AVFAudio/AVAudioPlayer)

    

Enables you to play compressed and uncompressed audio files of any length.
Gives you full control over playback, looping, and volume that makes it an
ideal choice when you need greater control than what’s available with system
sound services.

Haptic feedback delivers a tactile effect that draws attention and reinforces
actions and events. While many system-provided UI components like pickers,
switches, and sliders automatically provide haptic feedback, you can also add
feedback to custom views and controls in your app:

  * The simplest way to support custom [haptic feedback](https://developer.apple.com/documentation/ApplePencil/playing-haptic-feedback-in-your-app) is to use the support available in your app’s UI framework. For example, provide [sensory feedback](/documentation/SwiftUI/SensoryFeedback) in SwiftUI or [generate feedback](/documentation/UIKit/UIFeedbackGenerator) in UIKit, to provide feedback for common interactions like selection events or value changes.

  * When you require more advanced control, use [Core Haptics](/documentation/CoreHaptics) to deliver customized haptic feedback on supported devices like iPhone and Apple Watch. This framework allows you to deliver nuanced tactile feedback by combining haptic patterns with audio. Using Core Haptics, you can define continuous or transient haptic events with precise control over intensity and sharpness, making it ideal for enhancing interactions in games, music apps, or productivity tools.

### [Play music from the Apple Music catalog and user
libraries](/documentation/technologyoverviews/audio-and-music#Play-music-from-
the-Apple-Music-catalog-and-user-libraries)

Add music playback to your app for a rich, engaging experience that feels
deeply personal. You might create an app to help people find new music or
rediscover their old favorites, a fitness app that plays a motivating
soundtrack to power someone’s workout, or a meditation app with a playlist of
ambient soundscapes.

Play music from Apple Music’s vast catalog with
[MusicKit](https://developer.apple.com/musickit/), a combination of client
frameworks and the [Apple Music API](/documentation/AppleMusicAPI). Discover
and fetch content from Apple Music, including artists, albums, playlists, and
more, with features that enable you search the catalog and browse the latest
charts. You can also use MusicKit to provide access to personalized features,
including a person’s music library, recommendations, and recently played
history. MusicKit client frameworks provide the APIs needed to authenticate
subscribers and start and control playback on a device. Client frameworks are
available for apps on [Apple platforms](/documentation/MusicKit), [web
applications](https://js-cdn.music.apple.com/musickit/v1/index.html) using
JavaScript, and [Android
applications](https://developer.apple.com/musickit/android/) using the
available SDK.

### [Perform basic playback and recording of audio
files](/documentation/technologyoverviews/audio-and-music#Perform-basic-
playback-and-recording-of-audio-files)

You can provide audio feedback in response to user input, play background
music for your app or game, or record audio in a journaling or note-taking
app.

Two classes in the [AVFAudio](/documentation/AVFAudio) framework provide high-
level interfaces for audio playback and recording across Apple platforms.
These classes simplify working with audio, which makes them accessible to
developers without requiring an understanding how to perform low-level audio
processing:

  * Use [AVAudioPlayer](https://developer.apple.com/documentation/avfaudio/avaudioplayer) to play audio files in a variety of formats, including AAC, WAV, and MP3. It supports features that enable you to start and stop playback, adjust the volume level and playback rate, enable seamless looping, and more. It also provides features that you can use to respond to events like playback completion or decoding errors. Use it for a variety of audio playback tasks, including background music, user interface sound effects, and synchronizing multiple players.

  * Use [AVAudioRecorder](https://developer.apple.com/documentation/avfaudio/avaudioplayer) to add basic microphone capture and recording capabilities to your app. It provides the interface to configure the recording settings, such as sample rate, number of channels, and audio format, and provides real-time metering of the input signal. It offers you a robust feature set to create apps that capture voice memos, audio notes, and more.

Together, these classes provide a straightforward way to add rich audio
features into your app.

### [Perform advanced playback, recording, and
processing](/documentation/technologyoverviews/audio-and-music#Perform-
advanced-playback-recording-and-processing)

When your needs grow beyond simple playback and recording of local audio
files, Apple provides APIs that support advanced cases. For example, you can
use these APIs to play streaming audio, enable musicians to mix custom backing
tracks for practice or performance, or support a singer in a karaoke app by
adding effects like reverb or delay.

Use the [AVFAudio](/documentation/AVFAudio) framework’s
[`AVAudioEngine`](/documentation/AVFAudio/AVAudioEngine) API to perform real-
time audio processing and mixing. It provides a node-based design that enables
you to connect audio sources, effects, and outputs, making it ideal for apps
that need to create advanced audio pipelines for real-time audio processing.
For example, a game could use `AVAudioEngine` to blend background music, sound
effects, and spatial audio cues, or a podcasting app could apply live noise
cancellation or equalization.

Note

In addition to the robust capabilities that `AVAudioEngine` provides on its
own, it also works great when integrating with other audio technologies. For
example, it provides a convenient way to capture and process audio buffers for
use with frameworks like [Sound Analysis](/documentation/SoundAnalysis) and
[Speech](/documentation/Speech).

### [Play spatial audio in games and immersive
experiences](/documentation/technologyoverviews/audio-and-music#Play-spatial-
audio-in-games-and-immersive-experiences)

Spatial audio enhances games and immersive experiences by providing realistic,
directional sounds that react to a person’s position and environment. In
games, you can use it to simulate sounds like footsteps approaching from
behind, explosions on a distant battlefield, or ambient noises tied to virtual
locations, making gameplay more engaging. For immersive experiences on Apple
Vision Pro, spatial audio supports environmental sounds that change with the
listener’s position and head movements. These use cases rely on precise sound
positioning, head-tracking, and environmental effects to align audio with
visual and interactive elements.

Apple provides several frameworks that you can use to play Spatial Audio,
depending on the features you need:

  * [RealityKit Audio](/documentation/RealityKit/scene-content-audio) creates immersive experiences, particularly for games and apps built for Apple Vision Pro. It allows you to attach audio sources to entities in a 3D scene, and automatically handle spatialization based on their position relative to the listener. With support for head-tracked audio and environmental effects like occlusion, it tightly integrates with RealityKit’s visual rendering, making it ideal for apps or games.

  * [`AVAudioEngine`](/documentation/AVFAudio/AVAudioEngine) supports spatial audio mixing with its [`AVAudioEnvironmentNode`](/documentation/AVFAudio/AVAudioEnvironmentNode), which enables 3D sound positioning, reverb, and distance attenuation. It’s integrated into a flexible node-based architecture, which makes it ideal for games or apps that need to support spatial audio mixing alongside general audio tasks like playback, recording, or effects processing. While effective for simpler spatial audio needs, it’s best suited for apps with mixed audio requirements.

  * [PHASE](/documentation/PHASE) is Apple’s most advanced framework for immersive spatial audio, specifically intended for 3D games and immersive experiences. It manages a dynamic environment where sound sources and listeners are positioned in 3D space, and supports head-tracked audio, occlusion, reverb, and distance-based effects. Its focus is spatial audio over general audio processing, making it ideal for highly immersive apps.

### [Intelligently identify music and
sounds](/documentation/technologyoverviews/audio-and-music#Intelligently-
identify-music-and-sounds)

Build apps that intelligently identify sounds and music by creating dynamic,
context-aware interactions that respond to music and audio. You can use this
functionality to add recognition of songs, ambient sounds, or specific audio
cues, and to power features like identifying a song that someone hears while
walking down the street, syncing workout apps with music tempo for custom
exercise cues, or prompting questions in a companion app during the
presentation of educational content.

Two frameworks perform intelligent identification of music and sounds:

  * [ShazamKit](/documentation/ShazamKit) integrates audio recognition into your apps, enabling identification of music from Shazam’s expansive catalog or custom audio from your own catalog. Use ShazamKit to synchronize your app state with audio cues to enhance its experience with context-aware interactions.

  * [Sound Analysis](/documentation/SoundAnalysis) enables you to analyze and classify sounds in real-time or from recorded files, including environmental sound detection and activity identification. For example, it can identify sounds like a dog barking, a siren, or glass breaking to drive app actions, such as alerting people to emergencies, enhancing accessibility apps by describing ambient sounds, or powering interactive experiences that respond to specific noises. You can train custom models with tools like Create ML to recognize unique sounds relevant to your app, such as musical instruments for a music education tool or appliance beeps for a smart home app. The framework’s on-device processing ensures private, low-latency performance.

### [Support speech synthesis and
transcription](/documentation/technologyoverviews/audio-and-music#Support-
speech-synthesis-and-transcription)

Integrating speech synthesis or transcription into your app can create
intuitive and accessible user experiences. Speech synthesis enables apps to
vocalize text, which you can use to read content aloud to people with visual
impairments, power language learning tools with accurate pronunciation, or
enhance navigation apps with spoken directions. Speech transcription converts
spoken words to text, which enables features like hands-free note taking or
real-time captioning during video playback or voice calls. These capabilities
make apps more inclusive and capable by supporting a wide variety of use
cases.

To synthesize speech, use
[`AVSpeechSynthesizer`](/documentation/AVFAudio/AVSpeechSynthesizer) from the
AVFAudio framework. This API allows you to generate spoken audio from text,
supports multiple languages, and uses built-in or
[custom](https://developer.apple.com/videos/play/wwdc2023/10033/) voices. It’s
ideal for creating natural-sounding narration in apps, like reading books,
providing audio feedback in educational apps, or voice prompts in navigation
tools. It provides a variety of controls to customize pitch, rate, and volume,
ensuring custom audio experiences that enhance accessibility and user
engagement.

The [Speech](/documentation/Speech) framework provides speech transcription,
converting audio to text in real-time or from recordings. It supports voice
command interfaces, dictation for note-taking apps, or live captioning for
accessibility in video conferencing. With on-device and cloud-based options,
developers can balance privacy and accuracy, enabling features like
transcribing voice memos or live speeches.

### [Play and process MIDI data](/documentation/technologyoverviews/audio-and-
music#Play-and-process-MIDI-data)

MIDI (Musical Instrument Digital Interface) is a protocol that enables precise
control of virtual instruments, enabling you to compose music, trigger
synthesized sounds or audio samples, or teach music theory through interactive
playback. Recording MIDI data enables people to capture performances, edit
compositions, or integrate with digital audio workstations (DAWs), making it
ideal for music creation apps, virtual instrument simulators, or educational
tools that provide real-time feedback to students.

Apple provides several technologies to play and process MIDI data:

[`AVAudioEngine`](/documentation/AVFAudio/AVAudioEngine)

    

A powerful audio processing engine that includes
[`AVAudioUnitSampler`](/documentation/AVFAudio/AVAudioUnitSampler) for MIDI-
driven sound generation. You can use it to play MIDI notes through built-in or
custom sounds, enabling people to play sampled instruments like pianos, horns,
or drums. This technology is ideal for apps that need high-quality audio
output, such as music composition tools or live performance apps, offering
flexibility to process and mix MIDI-triggered audio in real time.

[Audio Toolbox](/documentation/AudioToolbox)

    

A framework that defines the
[`MusicSequence`](/documentation/AudioToolbox/MusicSequence) and [Music
Player](/documentation/AudioToolbox/music-player) APIs that allow you to
create, edit, and play MIDI sequences. A music sequence manages MIDI events
and tracks, enabling your app to record, edit, and sequence musical
performances, while a music player handles playback. These tools are perfect
for building apps that compose or arrange music, such as educational platforms
that teach songs or DAW-like apps that create complex MIDI arrangements.

[Core MIDI](/documentation/CoreMIDI)

    

A framework that handles MIDI data communication between apps, hardware
devices, and virtual instruments. It enables you to send and receive MIDI
messages for real-time playback of virtual instruments or control of external
synthesizers and devices. With support for MIDI over USB, Bluetooth, and
network connections, Core MIDI is essential for building apps that integrate
with MIDI controllers or DAWs, ensuring low-latency music production.

### [Create and host Audio Unit plug-
ins](/documentation/technologyoverviews/audio-and-music#Create-and-host-Audio-
Unit-plug-ins)

Creating Audio Unit plug-ins enables you to build advanced audio processing
tools for music production, sound design, or multimedia apps. These plug-ins
enable people to apply effects like equalization, delay, or reverb, or
generate sounds through virtual instruments. Developing Audio Unit plug-ins
enables you to provide customizable audio solutions for musicians and
producers, while hosting plugins in your app expands its capabilities for
people seeking professional-grade audio processing. This is ideal for building
DAWs, audio editors, or live performance tools within Apple’s audio ecosystem.

You create Audio Unit plug-ins using the APIs available in the [Audio
Toolbox](/documentation/AudioToolbox) framework. Here you’ll find the support
for creating [AUv3](/documentation/AudioToolbox/audio-unit-v3-plug-ins) plug-
ins, which is the latest standard built on the [App
Extensions](https://developer.apple.com/app-extensions/) model, or the
[AUv2](/documentation/AudioToolbox/audio-unit-v2-c-api) standard. These APIs
allow you to create plug-ins for effects, instruments, or MIDI processing,
providing people with customizable parameters to dynamically tailor processing
to meet their needs. With support for real-time, low-latency processing,
AudioToolbox ensures DAWs can integrate plugins efficiently, offering a robust
platform for professional audio workflows compatible with apps like Logic Pro
and GarageBand.

To host Audio Units, use [Audio Component
Services](/documentation/AudioToolbox/audio-components) and
[`AVAudioUnit`](/documentation/AVFAudio/AVAudioUnit) to discover and load
Audio Unit plug-ins across the system. You can use these APIs to support
third-party plugins, ensuring compatibility with a broad ecosystem of audio
tools. You can use Audio Unit plug-ins in the audio processing graph using
AVAudioEngine. You can instantiate plugins for effects or instruments,
enabling dynamic sound generation or processing. With features like parameter
automation and preset management, `AVAudioUnit` supports DAWs in delivering
flexible, high-quality audio that’s ideal for music creation or mixing
environments.

