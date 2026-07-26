import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const nonEmptyString = z.string().trim().min(1);
const tagsSchema = z.array(nonEmptyString).default([]);
const draftSchema = z.boolean().default(false);

const noteCommonFields = {
  title: nonEmptyString,
  description: z.string().trim().default(""),
  topic: z.string().trim().default(""),
  type: z.enum(["knowledge", "problem", "mistake"]).default("knowledge"),
  tags: tagsSchema,
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  status: z.enum(["todo", "learning", "reviewing", "completed"]).default("learning"),
  related: z.array(nonEmptyString).default([]),
  created: z.coerce.date(),
  updated: z.coerce.date().optional(),
  draft: draftSchema,
};

const noteSchema = z
  .discriminatedUnion("domain", [
    z
      .object({
        ...noteCommonFields,
        domain: z.literal("mathematics"),
        subject: z.enum(["calculus", "linear-algebra", "probability"]),
      })
      .strict(),
    z
      .object({
        ...noteCommonFields,
        domain: z.literal("computer-science"),
        subject: z.enum([
          "data-structures",
          "computer-organization",
          "operating-systems",
          "computer-networks",
        ]),
      })
      .strict(),
  ])
  .refine(({ created, updated }) => !updated || updated >= created, {
    message: "updated 不能早于 created",
    path: ["updated"],
  });

const projectSchema = z
  .object({
    title: nonEmptyString,
    description: nonEmptyString,
    status: z.enum(["planning", "building", "completed", "archived"]),
    technologies: z.array(nonEmptyString).min(1),
    github: z.url().optional(),
    demo: z.url().optional(),
    featured: z.boolean().default(false),
    created: z.coerce.date(),
    updated: z.coerce.date().optional(),
    draft: draftSchema,
  })
  .strict()
  .refine(({ created, updated }) => !updated || updated >= created, {
    message: "updated 不能早于 created",
    path: ["updated"],
  });

const thoughtSchema = z
  .object({
    title: nonEmptyString,
    description: nonEmptyString,
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: tagsSchema,
    draft: draftSchema,
  })
  .strict()
  .refine(({ published, updated }) => !updated || updated >= published, {
    message: "updated 不能早于 published",
    path: ["updated"],
  });

const notes = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/notes",
  }),
  schema: noteSchema,
});

const projects = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/projects",
  }),
  schema: projectSchema,
});

const thoughts = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/thoughts",
  }),
  schema: thoughtSchema,
});

export const collections = { notes, projects, thoughts };
