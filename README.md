# swa.sh: dictaphonic web thinking

Swash is a tool for thought web app that you can use with your voice.

## Technical notes

The Swash system is a Next.js app, but right now it's all client-side.

### Speech recognition

We use `SpeechRecognition` to listen continuously for speech events, and
`MediaRecorder` to record audio blobs that we can send to the OpenAI Whisper
API for accurate transcription.

I call the `SpeechRecognition` API "the recognizer" and the `MediaRecorder`
API "the recorder".

The recognizer gives us a stream of recognition events, both interim and
final, final meaning that the recognizer considers the current utterance to be
complete.

The recorder gives us a stream of audio chunks. We can accumulate these chunks
into a single blob, and then send that blob to the Whisper API for
transcription.

The recorder API can use fixed time chunks, or it can listen until you
explicitly stop it. We use the former.

It's good to send relatively long audio blobs to the Whisper API, because it
gives the API more context to work with. But we want to do this progressively,
in a way that optimizes for the user's experience.

There is no inherent connection between the recognizer and the recorder. The
second-long chunks that the recorder gives us are not necessarily aligned with
the utterances that the recognizer gives us.
