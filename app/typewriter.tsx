import { from, concat, of, Observable } from 'rxjs';
import { mergeMap, delay, scan, tap, throttleTime, concatMap } from 'rxjs/operators';

/**
 * Find the length of the longest prefix of 'n' that is a substring of 'c'.
 *
 * @param c - The current transcription.
 * @param n - The new transcription.
 * @returns The length of the longest prefix of 'n' that is a substring of 'c'.
 */
function longestPrefixSubstring(c: string, n: string): number {
  for (let i = n.length; i > 0; i--) {
      if (c.includes(n.slice(0, i))) {
          return i;
      }
  }
  return 0;
}

/**
 * Find the length of the longest substring of 'a' that ends 'a' and starts 'b'.
 *
 * @param a - The string to find the substring in.
 * @param b - The string to find the substring of.
 * @returns The length of the longest substring.
 */
function longestSuffixSubstring(a: string, b: string): number {
  const minLength = Math.min(a.length, b.length);
  for (let i = 0; i < minLength; i++) {
      if (a[a.length - 1 - i] !== b[b.length - 1 - i]) {
          return i;
      }
  }
  return minLength;
}

export interface Edit {
  old: string;
  now: string;
  del: string;
  ins: string;
}

export function determineEdit(c: string, n: string): Edit {
  if (n.startsWith(c)) {
    // Append case:
    //    c "hello there"
    //    n "hello there buddy"
    //   => "hello there buddy"
    const delta = n.slice(c.length);
    return { old: c, now: n, ins: delta, del: ""};
  }

  if (c.endsWith(n)) {
    //   c "hello there"
    //   n "there"
    //  => "hello there"
    return { old: c, now: c, ins: "", del: ""};
  }

  // Overlap case:
  //   c "hello there"
  //   n "there buddy"
  //  => "hello there buddy"
  for (let i = c.length - 1; i >= 0; i--) {
    const del = c.slice(i);

    if (n.startsWith(del)) {
      const ins = n.slice(del.length);
      const now = c + ins;
      return { old: c, now, ins, del: ""};
    }
  }

  // Correction case:
  //   c "hello there buddy"
  //   n "there buddies"
  //  => "hello there buddies"
  const i = longestPrefixSubstring(c, n);
  if (i > 3) {
    const del = c.slice(i);
    const ins = n.slice(i);
    const now = c.slice(0, i) + ins;
    return { old: c, now, ins, del };
  }

  // Append case with no overlap:
  //   c "hello there"
  //   n "buddy"
  //  => "hello there buddy"
  return { old: c, now: c + n, ins: n, del: ""};
}

/**
 * Turn an observable of strings into an observable of edits.
 */
export function editsFromStrings(strings$: Observable<string>): Observable<Edit> {
  return strings$.pipe(
    scan(
      (acc: Edit, cur: string) => {
        return determineEdit(acc.now, cur);
      },
      { old: '', now: '', del: '', ins: '' }
    )
  );
}

/**
* Merge the new transcription into the current transcription.
*
* If the new transcription extends the current one, it appends the difference.
* If not, it finds the longest prefix of the new transcription that is
* a substring of the current transcription and replaces the tail of the
* current transcription based on this overlap.
*/
export function mergeTranscriptions(c: string, n: string): string {
  const edit = determineEdit(c, n);
  return edit.now;
}
