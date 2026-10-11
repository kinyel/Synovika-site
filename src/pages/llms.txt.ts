import type { APIRoute } from 'astro';
import { llmsIndex } from '../lib/llms';

/** A plain-text map of the site for AI assistants (https://llmstxt.org). */
export const GET: APIRoute = async () => new Response(await llmsIndex(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
