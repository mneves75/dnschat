[AI SDK Core](/docs/ai-sdk-core)generateSpeech

Copy markdown

# `generateSpeech()`

`generateSpeech` is an experimental feature.

Generates speech audio from text.

    
    
    import { experimental_generateSpeech as generateSpeech } from 'ai';
    
    import { openai } from '@ai-sdk/openai';
    
    
    
    
    const { audio } = await generateSpeech({
    
      model: openai.speech('tts-1'),
    
      text: 'Hello from the AI SDK!',
    
      voice: 'alloy',
    
    });
    
    
    
    
    console.log(audio);

## Examples

### OpenAI

    
    
    import { experimental_generateSpeech as generateSpeech } from 'ai';
    
    import { openai } from '@ai-sdk/openai';
    
    
    
    
    const { audio } = await generateSpeech({
    
      model: openai.speech('tts-1'),
    
      text: 'Hello from the AI SDK!',
    
      voice: 'alloy',
    
    });

### ElevenLabs

    
    
    import { experimental_generateSpeech as generateSpeech } from 'ai';
    
    import { elevenlabs } from '@ai-sdk/elevenlabs';
    
    
    
    
    const { audio } = await generateSpeech({
    
      model: elevenlabs.speech('eleven_multilingual_v2'),
    
      text: 'Hello from the AI SDK!',
    
      voice: 'your-voice-id', // Required: get this from your ElevenLabs account
    
    });

## Import

    
    
    import { experimental_generateSpeech as generateSpeech } from "ai"

## API Signature

### Parameters

### model:

SpeechModelV2

The speech model to use.

### text:

string

The text to generate the speech from.

### voice?:

string

The voice to use for the speech.

### outputFormat?:

string

The output format to use for the speech e.g. "mp3", "wav", etc.

### instructions?:

string

Instructions for the speech generation.

### speed?:

number

The speed of the speech generation.

### language?:

string

The language for speech generation. This should be an ISO 639-1 language code
(e.g. "en", "es", "fr") or "auto" for automatic language detection. Provider
support varies.

### providerOptions?:

Record<string, Record<string, JSONValue>>

Additional provider-specific options.

### maxRetries?:

number

Maximum number of retries. Default: 2.

### abortSignal?:

AbortSignal

An optional abort signal to cancel the call.

### headers?:

Record<string, string>

Additional HTTP headers for the request.

### Returns

### audio:

GeneratedAudioFile

The generated audio.

GeneratedAudioFile

### base64:

string

Audio as a base64 encoded string.

### uint8Array:

Uint8Array

Audio as a Uint8Array.

### mimeType:

string

MIME type of the audio (e.g. "audio/mpeg").

### format:

string

Format of the audio (e.g. "mp3").

### warnings:

SpeechWarning[]

Warnings from the model provider (e.g. unsupported settings).

### responses:

Array<SpeechModelResponseMetadata>

Response metadata from the provider. There may be multiple responses if we
made multiple calls to the model.

SpeechModelResponseMetadata

### timestamp:

Date

Timestamp for the start of the generated response.

### modelId:

string

The ID of the response model that was used to generate the response.

### body?:

unknown

Optional response body.

### headers?:

Record<string, string>

Response headers.

[Previoustranscribe](/docs/reference/ai-sdk-core/transcribe)

[Nexttool](/docs/reference/ai-sdk-core/tool)

