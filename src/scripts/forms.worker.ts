import { dna, FORMS, type Spine } from '../lib/forms';

/** Builds the hero's forms off the main thread, so a phone never waits for them (D-064). */
self.onmessage = (e: MessageEvent<{ id: number; N: number; shape?: Spine }>) => {
  const { id, N, shape } = e.data;
  const post = (self as unknown as Worker).postMessage.bind(self);
  if (shape) {
    const { big, spine, count } = dna(N, shape);
    post({ id, big, spine, count }, [big.buffer, spine.buffer]);
  } else {
    const data = FORMS[id]!(N);
    post({ id, data }, [data.buffer]);
  }
};
