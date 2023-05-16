import React from 'react';

import RatioSigil from './RatioSigil';

export interface Segment {
  text: string;
}

export interface WhisperTranscription {
  task: "transcribe"
  language: string
  duration: number
  segments: WhisperSegment[]
}

export interface WhisperSegment extends Segment {
  text: string
  id: number
  start: number
  end: number
  tokens: number[]
  temperature: number
  avg_logprob: number
  compression_ratio: number
  no_speech_prob: number
  transient: boolean
}

export interface TranscriptionProps {
  transcription: WhisperTranscription;
}

function secondsToHHMMSS(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60) % 60;
  const secondsRemainder = seconds % 60;

  const hourPart = hours ? `${hours}h ` : '';
  const minutePart = minutes ? `${minutes}m ` : '';
  const secondPart = `${secondsRemainder.toFixed(0)}s`;

  return hourPart + minutePart + secondPart;
}

const goodSegment = (segment: WhisperSegment): boolean => {
  return segment.temperature < 0.5 && segment.avg_logprob > -2 && segment.no_speech_prob < 0.5;
};

export const TranscriptionView: React.FC<TranscriptionProps> = ({ transcription }) => {
  const goodSegments = transcription.segments //.filter(goodSegment);

  return (
    <div className="">
      {goodSegments.map((segment: WhisperSegment) => (
        <div
          key={segment.id}
          className={`
            ${goodSegment(segment) ? '' : 'opacity-50'}
          `}>
          <div className="flex flex-row">
            <p className="grow">{segment.text}</p>
            {true ? ratioSigils(segment) : null}
          </div>
        </div>
      ))}
    </div>
  );
};

function ratioSigils(segment: WhisperSegment): JSX.Element {
  return (
    <div className="flex flex-col justify-center">
      <div className="flex gap-2">
        <RatioSigil
          value={segment.temperature}
          min={0}
          max={1}
          label="T"
          title="Temperature: how intense is the model's creativity?"
          classNames="text-rose-500"
        />
        <RatioSigil
          value={segment.avg_logprob}
          min={-4}
          max={0}
          label="P"
          title="Average Log Probability: how likely is the transcription?"
          classNames="text-green-400"
        />
        <RatioSigil
          value={segment.no_speech_prob}
          min={0}
          max={1}
          label="X"
          title="No Speech Probability - how likely is it that no speech is present?"
          classNames="text-neutral-400 "
        />
      </div>
    </div>
  );
}

export default TranscriptionView;
