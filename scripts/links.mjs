/**
 * No broken links (brief section 19): linkinator crawls dist/ from the home
 * page. External links (WhatsApp, email, phone, other sites) are skipped:
 * they are checked by hand before launch.
 *   npm run build && npm run qa:links
 */
import { LinkChecker } from 'linkinator';

const checker = new LinkChecker();
const broken = [];
let local = 0;
checker.on('link', (l) => {
  if (l.state !== 'SKIPPED') local++;
  if (l.state === 'BROKEN') broken.push(`${l.status} ${l.url}  (from ${l.parent})`);
});
const result = await checker.check({
  path: 'dist',
  recurse: true,
  // Only the site's own pages: anything not on the local server linkinator starts is skipped.
  linksToSkip: async (url) => !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(url),
});
if (broken.length || !result.passed) {
  console.log(broken.join('\n'));
  process.exit(1);
}
console.log(`Links: ${local} internal links checked, none broken.`);
