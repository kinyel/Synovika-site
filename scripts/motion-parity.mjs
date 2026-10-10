/** Every page with reduced motion carries the same text as with full motion. npm run qa:motion */
import { parity } from './lib/parity.mjs';
await parity('with reduced motion', { reducedMotion: 'reduce' });
