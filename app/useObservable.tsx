import { useState, useEffect } from 'react';
import { Observable } from 'rxjs';

export function useObservable<T>(observable: Observable<T>, initialValue: T): T {
  const [state, setState] = useState<T>(initialValue);

  useEffect(() => {
    const subscription = observable.subscribe(value => setState(value));
    return () => subscription.unsubscribe();
  }, [observable]);

  return state;
}
