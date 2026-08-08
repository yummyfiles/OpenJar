import { z } from "zod";

const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(32, "Username must be at most 32 characters")
  .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers and underscores allowed");

const hexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color like #a3e635")
  .optional();

export const pageLinkSchema = z.object({
  id: z.string().min(1).max(64).optional(),
  label: z.string().min(1, "Label is required").max(60),
  url: z.string().min(1, "URL is required").max(2048)
});

export const pageLayoutSchema = z.object({
  links: z.array(pageLinkSchema).max(12).optional(),
  layout: z
    .object({
      sections: z
        .array(z.enum(["stats", "links", "goals", "posts", "projects", "github", "supporters"]))
        .max(10)
        .optional(),
      colors: z
        .object({
          pageBg: hexColorSchema,
          card: hexColorSchema,
          text: hexColorSchema,
          accent: hexColorSchema,
          btnBg: hexColorSchema,
          btnText: hexColorSchema,
          border: hexColorSchema
        })
        .optional()
    })
    .optional()
});

export const onboardingSchema = z.object({
  username: usernameSchema,
  displayName: z.string().min(1).max(60).optional().or(z.literal("")),
  bio: z.string().max(2000).optional().or(z.literal("")),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  github: z
    .string()
    .regex(/^[a-zA-Z0-9-]+$/, "GitHub usernames can only contain letters, numbers and dashes")
    .max(39)
    .optional()
    .or(z.literal("")),
  twitter: z.string().max(60).optional().or(z.literal("")),
  location: z.string().max(120).optional().or(z.literal("")),
  category: z.string().max(30).optional().or(z.literal("")),
  tags: z.array(z.string().max(30)).max(6).optional(),
  isCreator: z.boolean().optional(),
  currency: z.string().max(5).optional(),
  accent: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Accent must be a hex color")
    .optional()
    .or(z.literal("")),
  image: z.string().url("Enter a valid image URL").optional().or(z.literal("")),
  banner: z.string().url("Enter a valid image URL").optional().or(z.literal("")),
  customLinks: pageLayoutSchema.optional()
});

export const profileUpdateSchema = onboardingSchema.partial();

export const postSchema = z.object({
  title: z.string().max(160).optional().or(z.literal("")),
  content: z.string().min(1, "Post content is required").max(100_000),
  excerpt: z.string().max(300).optional().or(z.literal("")),
  coverImage: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "scheduled", "archived"]).optional(),
  pinned: z.boolean().optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
  poll: z
    .object({
      question: z.string().min(1).max(200),
      options: z.array(z.string().min(1).max(120)).min(2).max(8)
    })
    .optional()
    .nullable()
});

export const commentSchema = z.object({
  content: z.string().min(1, "Comment is required").max(4000),
  parentId: z.string().optional().nullable()
});

export const donationIntentSchema = z.object({
  creatorId: z.string().min(1).optional(),
  amount: z.number().int().positive("Amount must be positive"),
  currency: z.string().length(3).default("usd"),
  kind: z.enum(["one_time", "membership"]).default("one_time"),
  tierId: z.string().optional(),
  interval: z.enum(["month", "year"]).optional(),
  message: z.string().max(1000).optional().or(z.literal("")),
  anonymous: z.boolean().optional()
});

export const tierSchema = z.object({
  name: z.string().min(1).max(60),
  description: z.string().max(500).optional().or(z.literal("")),
  price: z.number().int().min(50, "Minimum tier price is $0.50").max(100_000_00),
  currency: z.string().length(3).default("usd"),
  perks: z.array(z.string().max(200)).max(10).optional(),
  active: z.boolean().optional()
});

export const goalSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional().or(z.literal("")),
  amount: z.number().int().min(100, "Goal must be at least $1"),
  deadline: z.string().datetime().optional().nullable()
});

export const projectSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().max(120).optional().or(z.literal("")),
  description: z.string().max(5000).optional().or(z.literal("")),
  repoUrl: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string().max(30)).max(6).optional(),
  pinned: z.boolean().optional()
});

export const apiKeySchema = z.object({
  name: z.string().min(1).max(60),
  scopes: z.array(z.enum(["profile:read", "donations:read", "donations:write", "posts:read", "posts:write"])).min(1)
});

export const reportSchema = z.object({
  targetType: z.enum(["user", "post", "comment", "project"]),
  targetId: z.string().min(1),
  reason: z.string().min(1).max(200),
  details: z.string().max(2000).optional().or(z.literal(""))
});

export const verificationRequestSchema = z.object({
  evidence: z.string().max(4000).optional().or(z.literal("")),
  note: z.string().max(1000).optional().or(z.literal(""))
});

export const featuredSchema = z.object({
  creatorId: z.string().min(1),
  label: z.enum(["featured", "open-source", "new"]).default("featured"),
  slot: z.number().int().min(0).max(100).optional()
});

export const contactSchema = z.object({
  email: z.string().email("Enter a valid email"),
  message: z.string().min(5, "Message is too short").max(4000)
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20)
});
