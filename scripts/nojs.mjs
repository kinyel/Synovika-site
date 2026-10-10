/** Every page without JavaScript carries the same text as with it. npm run qa:nojs */
import { parity } from './lib/parity.mjs';
await parity('without JavaScript', { javaScriptEnabled: false });
