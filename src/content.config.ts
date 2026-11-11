import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string(),
      kind: z.enum(['commercial', 'personal']),
      /** Projects Inspector group (list label and short tag). Independent of `kind`, which drives the Commercial/Personal label in the panel and modal. */
      group: z.enum(['systems', 'websites', 'small']),
      /** Present only for projects with a /projects/<slug>/ case study. */
      caseStudy: z.object({
        lede: z.string(),
        facts: z.array(z.object({ label: z.string(), value: z.string() })).min(1),
        coverCaption: z.string().optional(),
        problem: z.string(),
        constraints: z.array(z.string()).min(1),
        diagram: z.enum(['omni-reviewer', 'cafe-dashboard', 'fundsicles']),
        diagramCaption: z.string(),
        decisions: z.array(z.object({ title: z.string(), body: z.string() })).min(1),
        proof: z.array(z.object({ lead: z.string(), body: z.string() })).min(1),
        next: z.string().optional(),
        /** Shown beside "Try the demo" once the project has a liveUrl. */
        demoNote: z.string().optional()
      }).optional(),
      displayOrder: z.number().int().positive(),
      clientType: z.string(),
      stack: z.array(z.string()),
      liveUrl: z.string().optional(),
      /** Overrides the default live-link button label (e.g. when the link is a demo build). */
      liveLabel: z.string().optional(),
      /** Short note shown beside the live link — e.g. demo credentials. */
      demoNote: z.string().optional(),
      repoUrl: z.string().optional(),
      year: z.number(),
      summary: z.string(),
      blurb: z.string().optional(),
      outcome: z.string().optional(),
      coverAlt: z.string().optional(),
      cover: image(),
      /** Live captures for the Projects Inspector; thumb falls back to cover. */
      shots: z.object({ desktop: image(), phone: image(), thumb: image().optional() })
    })
});

export const collections = { projects };
