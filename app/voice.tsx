'use client';

import React, { useMemo } from 'react';

import { WhisperTranscription } from './transcription';
import { editsFromStrings } from './typewriter';
import { Observable, distinctUntilChanged, map, repeat, retry, scan, share, startWith, switchMap } from 'rxjs';
import { useObservableState } from 'observable-hooks';
import { typewriterEffect } from './typewriterEffect';

async function fetchTranscription(
  blob: Blob,
  apiKey: string,
):
  Promise<WhisperTranscription>
{
  const formData = new FormData();
  formData.append("file", blob, "audio.webm");
  formData.append("model", "whisper-1");
  formData.append("response_format", "verbose_json");

  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
      body: formData,
    });

  const data: WhisperTranscription = await response.json();
  return data;
}

interface Line {
  text: string;
  final: boolean;
  certainty: number;
}

function doSpeechRecognition(
  speech: SpeechRecognition
): Observable<Line> {
  return new Observable<Line>(line$ => {

    speech.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const { transcript, confidence } = result[0];
      const { isFinal } = result;

      line$.next({
        text: transcript,
        final: isFinal,
        certainty: confidence
      });
    };

    speech.onerror = (event) => {
      line$.error(event.error);
    };

    speech.onend = () => {
      console.log("speech recognition ended");
      line$.complete();
    };

    speech.start();
  });
}


const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const makeSpeechRecognition = (): SpeechRecognition => {
  const speech = new SpeechRecognition();
  speech.continuous = true;
  speech.interimResults = true;
  return speech;
};

const LineView: React.FC<{ line: Line; className: string }> = ({
  line,
  className,
}) => {
  const getBorderColor = ({ certainty, final, text }: Line) => {
    if (text == "") return "border-gray-800 h-6";
    if (!final) return "border-gray-600";
    if (certainty > 0.9) return "border-green-600";
    if (certainty > 0.66) return "border-yellow-600";
    if (certainty > 0.33) return "border-orange-600";

    return "border-red-600";
  };

  const border = getBorderColor(line);

  console.log(line)

  return (
    <span
      className={
        `transition ease-in-out delay-150 lowercase border-l-4 px-2 mr-4 pb-0.5 leading-6 min-h-full  ${border} ${className}`
      }
    >{line.text || " "}</span>
  );
};


export const SpeechRecognitionDisplay: React.FC = () => {
  const speech = useMemo(makeSpeechRecognition, []);

  const emptyLine = { text: "", final: false, certainty: 0 };

  const history$ = useMemo(
    () =>
      doSpeechRecognition(speech).pipe(
        repeat(),
        retry({ count: 5, delay: 100, resetOnSuccess: true }),
        startWith(emptyLine),
        scan(
          (history, line) =>
            line.final
              ? [...history.slice(0, -1), line, emptyLine]
              : [...history.slice(0, -1), line],
          [] as Line[]
        ),
        share(),
      ),
    [speech]
  );

  const history = useObservableState(history$, []);

  const currentLine$ = useMemo(
    () =>
      history$.pipe(
        map(history => history[history.length - 1]),
        share(),
      ),
    [history$]
  );

  const newText$: Observable<boolean> = useMemo(
    () => currentLine$.pipe(
      map(line => line.text.length == 0),
      distinctUntilChanged(),
    ),
    [currentLine$]
  );

  const text$ = useMemo(
    () => newText$.pipe(
      switchMap(newText => {
        console.log('newText', newText);
        return currentLine$.pipe(
          map(line => line.text),
          editsFromStrings,
          edits$ => typewriterEffect(edits$, 20),
          startWith(''),
        );
      }),
    ),
    [newText$, currentLine$]
  );

  const text = useObservableState(text$, '');
  const lastIndex = history.length - 1;

  return (
    <article
      className="flex flex-col p-2"
    >
      {history.slice(0, -1).map((line, index) => (
        <LineView
          key={index}
          line={line}
          className={"text-gray-400"}
        />
      ))}
      <LineView
        key={lastIndex}
        line={{ text, final: false, certainty: 0 }}
        className="text-gray-600"
      />
    </article>
  );
};
