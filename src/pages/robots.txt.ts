import type { APIRoute } from 'astro';
import { SHOW_DRAFTS } from '../lib/drafts';

/**
 * Production welcomes every crawler, and names the AI search and assistant
 * crawlers one by one so there's no doubt they may read the site: being
 * found and quoted by AI assistants is how many customers will meet us.
 * A draft build asks not to be crawled at all.
 */
const AI_CRAWLERS = [
  // OpenAI: search, on-demand browsing for users, and training.
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  // Anthropic.
  'Claude-SearchBot',
  'Claude-User',
  'ClaudeBot',
  // Perplexity.
  'PerplexityBot',
  'Perplexity-User',
  // Google and Apple AI features.
  'Google-Extended',
  'Applebot-Extended',
  // Others.
  'Amazonbot',
  'DuckAssistBot',
  'MistralAI-User',
  'meta-externalagent',
  'cohere-ai',
  'CCBot',
];

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('/sitemap-index.xml', site).toString();
  const body =
    SHOW_DRAFTS && import.meta.env.PROD
      ? 'User-agent: *\nDisallow: /\n'
      : [
          '# Synovika Technologies: software products and custom software, Nigeria and worldwide.',
          `# A plain-text guide for AI assistants: ${new URL('/llms.txt', site)}`,
          '',
          'User-agent: *',
          'Allow: /',
          '',
          ...AI_CRAWLERS.flatMap((bot) => [`User-agent: ${bot}`, 'Allow: /', '']),
          `Sitemap: ${sitemap}`,
          '',
        ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
