import { Observable, of, from, concat } from 'rxjs';
import { concatMap, mergeMap, delay, scan, tap } from 'rxjs/operators';

interface Edit {
  del: string;
  ins: string;
}

export function typewriterEffect(edits$: Observable<Edit>, speed: number): Observable<string> {
  const backspaceSpeed = speed / 20;

  return edits$.pipe(
    mergeMap(edit => {
      const backspaces = Array(edit.del.length).fill('\b');
      const insertions = edit.ins.split('');
      return concat(from(backspaces), from(insertions));
    }),

    tap(char => console.log(`char: ${char}`)),

    // Delay each character by the given speed, but make backspaces faster
    concatMap(char => of(char).pipe(delay(char === '\b' ? backspaceSpeed : speed))),

    // Handle backspaces in the accumulated string
    scan((acc, char) => {
      if (char === '\b') {
        return acc.slice(0, acc.length - 1);
      } else {
        return acc + char;
      }
    }, ''),
  );
}
