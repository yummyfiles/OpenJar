/*
 * OpenJar seed — creates an admin + a handful of believable creators with
 * tiers, goals, projects, posts, follows and donations so the homepage,
 * discovery and dashboards have real data to show.
 *
 *   npm run db:seed
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const usd = (dollars: number) => Math.round(dollars * 100);
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);

interface CreatorSeed {
  username: string;
  displayName: string;
  name: string;
  email: string;
  bio: string;
  image: string;
  banner: string | null;
  website: string | null;
  github: string | null;
  twitter: string | null;
  category: string;
  tags: string[];
  verified: boolean;
  monthlyGoal: number | null;
  accent: string;
  tiers: { name: string; price: number; description: string; perks: string[] }[];
  goals: { title: string; amount: number; daysAgo: number; deadlineDays: number }[];
  projects: { name: string; description: string; tags: string[]; repoUrl?: string; likes: number }[];
  posts: { title: string; excerpt: string; content: string; daysAgo: number }[];
}

const creators: CreatorSeed[] = [
  {
    username: "yummyfiles",
    displayName: "Yummy Files",
    name: "Yuki Tanaka",
    email: "yuki@example.com",
    bio: "Building tiny, fast open-source tools for developers. Author of fresh-cli and the jarvm toy runtime. TypeScript by day, Rust by night.",
    image: "https://i.pravatar.cc/300?img=12",
    banner: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1600&q=80",
    website: "https://yummyfiles.dev",
    github: "yummyfiles",
    twitter: "@yummyfiles",
    category: "open-source",
    tags: ["Typescript", "Rust", "DevTools"],
    verified: true,
    monthlyGoal: usd(800),
    accent: "#e5e5e5",
    tiers: [
      { name: "Supporter", price: usd(3), description: "Thank you for keeping the tools free.", perks: ["Early access to releases", "Name on the README"] },
      { name: "Maintainer", price: usd(10), description: "Covers CI + hosting costs.", perks: ["All supporter perks", "Monthly changelog video", "Vote on roadmap"] },
      { name: "Patron", price: usd(25), description: "Lets me work on open source full-time.", perks: ["All maintainer perks", "1:1 office hours", "Your issue gets priority"] }
    ],
    goals: [
      { title: "fresh-cli 2.0 rewrite", amount: usd(1200), daysAgo: 40, deadlineDays: 20 },
      { title: "New docs site", amount: usd(500), daysAgo: 12, deadlineDays: 30 },
      { title: "jarvm 1.0 release", amount: usd(3000), daysAgo: 60, deadlineDays: -10 }
    ],
    projects: [
      { name: "fresh-cli", description: "A blazing fast scaffolding tool for modern web apps. Zero config, zero lock-in.", tags: ["Typescript", "open-source"], repoUrl: "https://github.com/yummyfiles/fresh-cli", likes: 1820 },
      { name: "jarvm", description: "A tiny JVM written in Rust, built to learn. Passes the spec tests, barely.", tags: ["Rust", "open-source"], repoUrl: "https://github.com/yummyfiles/jarvm", likes: 340 },
      { name: "openjar-stack", description: "The reference stack we use to build OpenJar itself — Next.js + Prisma + Better Auth, battle-tested on a real product.", tags: ["Typescript", "Boilerplate"], likes: 210 }
    ],
    posts: [
      {
        title: "fresh-cli 2.0 is coming — here's the plan",
        excerpt: "A rewrite focused on speed, plugins and first-class templates.",
        content: `## Why the rewrite

fresh-cli has served us well, but the 1.x architecture assumed a simpler world. Plugins were an afterthought, templates were static, and cold start was slower than I liked.

## What's new

- **Plugin system** — first-class, type-safe plugins with a tiny API
- **Template registry** — share and install templates from anywhere
- **Speed** — cold start under 100ms, measured on CI

## Timeline

The goal of **$1,200** funds the rewrite. We're about halfway there. If you've ever shipped a project with \`npx fresh-cli create\`, consider [supporting the work](/) right here on OpenJar.

More soon. — Yuki`,
        daysAgo: 6
      },
      {
        title: "Walking through jarvm's bytecode interpreter",
        excerpt: "A deep dive into the class-file parser and the interpreter loop.",
        content: `## The interpreter loop

\`\`\`rust
loop {
    let opcode = code.read_u8()?;
    match opcode {
        0x10 => push(read_u16()?), // bipush
        0x60 => add(),             // iadd
        _ => bail!(opcode),
    }
}
\`\`\`

Reading the JVM spec is a rite of passage. Doing it in Rust makes it fun.

More write-ups as the release goal approaches.`,
        daysAgo: 14
      }
    ]
  },
  {
    username: "nora",
    displayName: "Nora Venn",
    name: "Nora Venn",
    email: "nora@example.com",
    bio: "Digital artist painting machines and cities that never were. Commission-friendly, tips appreciated.",
    image: "https://i.pravatar.cc/300?img=47",
    banner: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1600&q=80",
    website: "https://noravenn.art",
    github: null,
    twitter: "@noravenn",
    category: "art",
    tags: ["digital", "cyberpunk", "commissions"],
    verified: true,
    monthlyGoal: usd(420),
    accent: "#a3a3a3",
    tiers: [
      { name: "Brush club", price: usd(4), description: "A coffee a week keeps the palette alive.", perks: ["Monthly wallpaper", "Process videos"] },
      { name: "Studio key", price: usd(10), description: "Unlocks longer-form tutorials and WIP streams.", perks: ["All brush club perks", "Monthly tutorial", "Early access to drops"] },
      { name: "Patron", price: usd(20), description: "For serious fans of the machines.", perks: ["All studio key perks", "Commissions priority slot", "Prints"] }
    ],
    goals: [{ title: "New print run: Neon Districts", amount: usd(900), daysAgo: 22, deadlineDays: 18 }],
    projects: [
      { name: "Neon Districts", description: "A twelve-piece series on cities overrun by light and weather.", tags: ["digital", "series"], likes: 640 },
      { name: "Machine Studies", description: "Portraits of robots reading books, because why not.", tags: ["digital"], likes: 430 }
    ],
    posts: [
      {
        title: "Neon Districts is funded — prints shipping next month",
        excerpt: "We hit the goal. Here's the cover art and the timeline.",
        content: `## We did it

Thanks to everyone who chipped in, **Neon Districts** is fully funded. The cover piece is the one I teased on socials last week — a train station drowning in violet.

**Timeline**
- Prints: shipping in 3–4 weeks
- Digital pack: emailed right after launch
- Tutorial: streaming the full process

New goal going up soon for the next series. Stay weird. — Nora`,
        daysAgo: 3
      }
    ]
  },
  {
    username: "piper",
    displayName: "Piper Moons",
    name: "Piper Moons",
    email: "piper@example.com",
    bio: "Lo-fi synth music for people who need a quiet place. Album '36th Floor' out now.",
    image: "https://i.pravatar.cc/300?img=32",
    banner: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1600&q=80",
    website: "https://pipermoons.bandcamp.com",
    github: null,
    twitter: "@pipermoons",
    category: "music",
    tags: ["lo-fi", "synthwave", "albums"],
    verified: false,
    monthlyGoal: null,
    accent: "#d4d4d4",
    tiers: [
      { name: "Listener", price: usd(2), description: "For the people who put '36th Floor' on repeat.", perks: ["Monthly demo tape", "Discord role"] },
      { name: "Studio friend", price: usd(7), description: "Helps pay for gear + mastering.", perks: ["All listener perks", "Early releases", "Stems for one track / month"] }
    ],
    goals: [
      { title: "'Roof Access' EP", amount: usd(650), daysAgo: 18, deadlineDays: 25 },
      { title: "Hardware synth upgrade", amount: usd(1400), daysAgo: 55, deadlineDays: 5 }
    ],
    projects: [
      { name: "36th Floor", description: "Full album: twelve tracks of rain, neon and tape hiss.", tags: ["album", "lo-fi"], likes: 310 },
      { name: "Roof Access", description: "The upcoming EP. Darker, more ambient, mostly the Juno.", tags: ["album", "EP"], likes: 95 }
    ],
    posts: [
      {
        title: "Roof Access — first single out Friday",
        excerpt: "A preview, what it's about, and where the proceeds go.",
        content: `## Friday, noon CET

First single from **Roof Access**: a six-minute ambient piece built around a rooftop storm recording from last summer.

Proceeds from this EP go toward the hardware goal. The Juno lives on a shelf and whispers to me at night. It deserves to be played loud.

— Piper`,
        daysAgo: 2
      }
    ]
  },
  {
    username: "vex",
    displayName: "Vex",
    name: "Alex Vexler",
    email: "vex@example.com",
    bio: "Indie game dev. Making 'Deep Module' — a submarine horror game. Rust + Bevy. Open source by default.",
    image: "https://i.pravatar.cc/300?img=59",
    banner: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1600&q=80",
    website: "https://deepmodule.game",
    github: "vex",
    twitter: "@vexdev",
    category: "games",
    tags: ["Rust", "Bevy", "indie"],
    verified: false,
    monthlyGoal: usd(600),
    accent: "#f5f5f5",
    tiers: [
      { name: "Crew", price: usd(5), description: "Get a shoutout in the credits.", perks: ["Name in credits", "Devlog access"] },
      { name: "Engine room", price: usd(12), description: "Funds the asset pass + sound design.", perks: ["All crew perks", "Monthly devlog video", "Betas before public"] },
      { name: "Captain", price: usd(30), description: "Deep Module is entirely funded by players like you.", perks: ["All engine room perks", "Custom in-game plaque", "Design input on the roadmap"] }
    ],
    goals: [{ title: "Deep Module playable demo", amount: usd(2400), daysAgo: 30, deadlineDays: 14 }],
    projects: [
      { name: "Deep Module", description: "A submarine horror game about the miles between you and the surface. Rust, Bevy, 100% open source.", tags: ["Rust", "game", "open-source"], repoUrl: "https://github.com/vex/deep-module", likes: 890 },
      { name: "bevy_sfx", description: "A small procedural sound effects crate for Bevy games.", tags: ["Rust", "open-source"], repoUrl: "https://github.com/vex/bevy_sfx", likes: 140 }
    ],
    posts: [
      {
        title: "Deep Module demo — playtest feedback roundup",
        excerpt: "What playtesters loved, hated, and what changed because of it.",
        content: `## The big three fixes

1. **Sonar ping was too punishing** — now it has a cooldown and a tell.
2. **The airlock sequence confused everyone** — rebuilt with clear signposting.
3. **Oxygen economy was brutal** — rebalanced the mid-game.

## Numbers from 42 playtesters

- Average sessions: 2.4
- "Would play the full game": 91%

The demo goal is at **78%**. Every bit helps me keep the lights on while I finish the vertical slice.

— Vex`,
        daysAgo: 4
      }
    ]
  },
  {
    username: "sol",
    displayName: "Sol Reyes",
    name: "Sol Reyes",
    email: "sol@example.com",
    bio: "Writer of quiet science fiction. Serializing 'The Cartographers' here, chapter by chapter.",
    image: "https://i.pravatar.cc/300?img=15",
    banner: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1600&q=80",
    website: "https://solrey.es",
    github: null,
    twitter: "@solreyes",
    category: "writing",
    tags: ["sci-fi", "serialized", "novels"],
    verified: false,
    monthlyGoal: usd(350),
    accent: "#a3a3a3",
    tiers: [
      { name: "Reader", price: usd(3), description: "You read, I write.", perks: ["Every chapter free", "Discussion threads"] },
      { name: "Patron", price: usd(8), description: "Chapters drop early + a novella at the end of the season.", perks: ["Early chapters", "Season novella", "Monthly letter"] }
    ],
    goals: [{ title: "Season 2 finale", amount: usd(700), daysAgo: 9, deadlineDays: 21 }],
    projects: [
      { name: "The Cartographers", description: "A serialized novel about the people who draw the edges of maps.", tags: ["sci-fi", "serial"], likes: 280 }
    ],
    posts: [
      {
        title: "Chapter 24: The Last Meridian",
        excerpt: "New chapter is live for patrons — public chapter next Tuesday.",
        content: `## Chapter 24

The river had a name, of course. Everything on the map had a name; that was the point of the map. But what the cartographers never wrote down was how the river sounded at night, and Marisol learned that the hard way.

Read the full chapter over at the public archive. Patron chapters drop a week early.

— Sol`,
        daysAgo: 1
      }
    ]
  },
  {
    username: "mirage",
    displayName: "Mirage Design",
    name: "Mira Chen",
    email: "mirage@example.com",
    bio: "Product designer with a soft spot for brutalist interfaces. Templates, icons, and design systems.",
    image: "https://i.pravatar.cc/300?img=25",
    banner: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1600&q=80",
    website: "https://miragedesign.co",
    github: null,
    twitter: "@mirage_design",
    category: "design",
    tags: ["UI", "templates", "icons"],
    verified: false,
    monthlyGoal: null,
    accent: "#e5e5e5",
    tiers: [
      { name: "Fan", price: usd(3), description: "Keeps the free icons coming.", perks: ["New icons first", "Template drops"] },
      { name: "Pro", price: usd(9), description: "Every template, forever.", perks: ["All templates", "Source files", "Request a component"] }
    ],
    goals: [],
    projects: [
      { name: "Mono UI Kit", description: "A grayscale React component kit, 40+ components, zero dependencies.", tags: ["UI", "React"], likes: 520 },
      { name: "Neo Icons", description: "An open-source icon set with 2,000+ glyphs.", tags: ["icons", "open-source"], likes: 700 }
    ],
    posts: []
  },
  {
    username: "junebug",
    displayName: "June Bug Studio",
    name: "June Park",
    email: "june@example.com",
    bio: "Brand new here! Stop motion animator, teaching myself Blender, posting one shot a week.",
    image: "https://i.pravatar.cc/300?img=9",
    banner: null,
    website: null,
    github: null,
    twitter: "@junebugstd",
    category: "video",
    tags: ["animation", "stop-motion", "blender"],
    verified: false,
    monthlyGoal: null,
    accent: "#d4d4d4",
    tiers: [],
    goals: [],
    projects: [
      { name: "one-shot-a-week", description: "52 weeks of animation experiments. Week 12: a paper bird learns to fly.", tags: ["animation"], likes: 88 }
    ],
    posts: [
      {
        title: "Week 12 — the paper bird",
        excerpt: "First time I've felt like I actually made something.",
        content: `## The paper bird

Twelve weeks in and I finally made something I'm proud of. A tiny paper bird that learns to fly in 20 seconds of stop motion.

I'm new at this. The rigging is held together with tape and optimism. But the feedback on the last three weeks has been everything.

The project page tracks all 52 weeks. Come say hi. — June`,
        daysAgo: 2
      }
    ]
  }
];

const supporterPool = [
  { name: "Riley Quinn", email: "riley@example.com", username: "rileyq", image: "https://i.pravatar.cc/300?img=11" },
  { name: "Sam Okafor", email: "sam@example.com", username: "samoka", image: "https://i.pravatar.cc/300?img=13" },
  { name: "Dev Patel", email: "dev@example.com", username: "devpatel", image: "https://i.pravatar.cc/300?img=14" },
  { name: "Lin Zhao", email: "lin@example.com", username: "linz", image: "https://i.pravatar.cc/300?img=5" },
  { name: "Cosmo Finch", email: "cosmo@example.com", username: "cosmo", image: "https://i.pravatar.cc/300?img=3" },
  { name: "Avery Brooks", email: "avery@example.com", username: "averyb", image: "https://i.pravatar.cc/300?img=17" }
];

async function main() {
  console.log("Seeding OpenJar…");

  await prisma.donation.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.follow.deleteMany({});
  await prisma.bookmark.deleteMany({});
  await prisma.pageView.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.like.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.goal.deleteMany({});
  await prisma.tier.deleteMany({});
  await prisma.repo.deleteMany({});
  await prisma.contributorGraph.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.activityEvent.deleteMany({});
  await prisma.featuredCreator.deleteMany({});
  await prisma.verificationRequest.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.apiKey.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});

  const adminUsername = process.env.ADMIN_USERNAME || "openjar";
  await prisma.user.create({
    data: {
      name: "OpenJar Admin",
      email: "admin@openjar.dev",
      username: adminUsername,
      displayName: "OpenJar",
      role: "admin",
      verified: true,
      onboardingDone: true,
      isCreator: true,
      bio: "The OpenJar team. We make support simple for open creators.",
      category: "open-source",
      image: "https://i.pravatar.cc/300?img=68"
    }
  });
  console.log("  admin: @" + adminUsername);

  const userIds: Record<string, string> = {};
  for (const c of creators) {
    const user = await prisma.user.create({
      data: {
        name: c.name,
        email: c.email,
        username: c.username,
        displayName: c.displayName,
        bio: c.bio,
        image: c.image,
        banner: c.banner,
        website: c.website,
        github: c.github,
        twitter: c.twitter,
        category: c.category,
        tags: c.tags,
        verified: c.verified,
        isCreator: true,
        onboardingDone: true,
        monthlyGoal: c.monthlyGoal,
        accent: c.accent,
        currency: "usd",
        themeMode: "dark",
        monoBranding: true,
        lastSeenAt: daysAgo(1)
      }
    });
    userIds[c.username] = user.id;

    for (const tier of c.tiers) {
      await prisma.tier.create({
        data: { creatorId: user.id, name: tier.name, price: tier.price, description: tier.description, perks: tier.perks, currency: "usd" }
      });
    }

    for (const goal of c.goals) {
      await prisma.goal.create({
        data: {
          creatorId: user.id,
          title: goal.title,
          amount: goal.amount,
          createdAt: daysAgo(goal.daysAgo),
          deadline: goal.deadlineDays >= 0 ? daysAgo(-goal.deadlineDays) : daysAgo(goal.deadlineDays),
          completed: goal.deadlineDays < 0,
          completedAt: goal.deadlineDays < 0 ? daysAgo(1) : null
        }
      });
    }

    for (const p of c.projects) {
      await prisma.project.create({
        data: {
          creatorId: user.id,
          name: p.name,
          description: p.description,
          tags: p.tags,
          repoUrl: p.repoUrl ?? null,
          likes: p.likes,
          createdAt: daysAgo(60)
        }
      });
    }

    for (const post of c.posts) {
      await prisma.post.create({
        data: {
          authorId: user.id,
          title: post.title,
          slug: post.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 70),
          excerpt: post.excerpt,
          content: post.content,
          status: "published",
          publishedAt: daysAgo(post.daysAgo),
          createdAt: daysAgo(post.daysAgo)
        }
      });
    }

    console.log("  creator: @" + c.username);
  }

  for (const s of supporterPool) {
    await prisma.user.create({
      data: {
        name: s.name,
        email: s.email,
        username: s.username,
        displayName: s.name,
        image: s.image,
        onboardingDone: true,
        isCreator: false
      }
    });
  }

  const usernames = Object.keys(userIds);
  const followerUsernames = supporterPool.map((s) => s.username);
  for (let i = 0; i < usernames.length; i++) {
    const target = userIds[usernames[i]];
    const some = i < 2 ? followerUsernames : followerUsernames.slice(0, 3 + (i % 3));
    for (const fu of some) {
      const follower = await prisma.user.findUnique({ where: { username: fu } });
      if (follower) {
        await prisma.follow.create({ data: { followerId: follower.id, followingId: target } }).catch(() => {});
      }
    }
  }

  const donationPlans: [string, number, number, boolean][] = [
    ["yummyfiles", 2, 25, false],
    ["yummyfiles", 5, 10, false],
    ["yummyfiles", 8, 50, false],
    ["yummyfiles", 14, 5, true],
    ["yummyfiles", 21, 100, false],
    ["yummyfiles", 35, 25, false],
    ["yummyfiles", 60, 10, false],
    ["nora", 1, 10, false],
    ["nora", 4, 20, false],
    ["nora", 12, 5, true],
    ["nora", 30, 15, false],
    ["piper", 3, 7, false],
    ["piper", 9, 12, false],
    ["piper", 20, 4, true],
    ["vex", 2, 30, false],
    ["vex", 6, 12, false],
    ["vex", 15, 50, false],
    ["vex", 25, 8, true],
    ["sol", 3, 8, false],
    ["sol", 10, 3, false],
    ["mirage", 5, 9, false],
    ["junebug", 1, 5, false]
  ];

  const supporterIds: Record<string, string> = (await prisma.user.findMany({ where: { username: { in: followerUsernames } } })).reduce(
    (acc, u) => (u.username ? { ...acc, [u.username]: u.id } : acc),
    {}
  );

  let supIndex = 0;
  for (const [username, ago, amountUsd, anonymous] of donationPlans) {
    const creator = await prisma.user.findUnique({ where: { username } });
    if (!creator) continue;
    const supporterKey = followerUsernames[supIndex % followerUsernames.length];
    supIndex += 1;
    await prisma.donation.create({
      data: {
        creatorId: creator.id,
        supporterId: anonymous ? null : supporterIds[supporterKey],
        supporterName: anonymous ? null : supporterKey,
        supporterEmail: anonymous ? null : `${supporterKey}@example.com`,
        amount: usd(amountUsd),
        currency: "usd",
        message: anonymous ? null : "keep going, seriously",
        anonymous,
        kind: "one_time",
        status: "completed",
        provider: "manual",
        providerRef: `seed_${username}_${ago}_${Math.random().toString(36).slice(2, 8)}`,
        completedAt: daysAgo(ago),
        createdAt: daysAgo(ago)
      }
    });
  }

  const memberships: [string, number, number][] = [
    ["yummyfiles", 2, 10],
    ["yummyfiles", 3, 25],
    ["nora", 4, 10],
    ["nora", 5, 20],
    ["vex", 1, 30],
    ["vex", 0, 12],
    ["piper", 3, 7],
    ["sol", 5, 8]
  ];
  for (let i = 0; i < memberships.length; i++) {
    const [username, , amountUsd] = memberships[i];
    const creator = await prisma.user.findUnique({ where: { username } });
    const supporterUsername = followerUsernames[i % followerUsernames.length];
    const tier = await prisma.tier.findFirst({ where: { creatorId: creator!.id }, orderBy: { price: "asc" }, skip: i % 2 });
    if (!creator || !tier || !supporterIds[supporterUsername]) continue;
    await prisma.subscription.create({
      data: {
        creatorId: creator.id,
        supporterId: supporterIds[supporterUsername],
        tierId: tier.id,
        status: "active",
        provider: "manual",
        interval: "month",
        currentPeriodEnd: daysAgo(-20)
      }
    });
    await prisma.donation.create({
      data: {
        creatorId: creator.id,
        supporterId: supporterIds[supporterUsername],
        supporterName: supporterUsername,
        amount: usd(amountUsd),
        currency: "usd",
        anonymous: false,
        kind: "membership",
        status: "completed",
        provider: "manual",
        providerRef: `seed_sub_${username}_${i}`,
        interval: "month",
        tierId: tier.id,
        completedAt: daysAgo(-1),
        createdAt: daysAgo(-1)
      }
    });
  }

  for (const username of usernames) {
    const creator = await prisma.user.findUnique({ where: { username } });
    if (!creator) continue;
    const rows: { creatorId: string; viewedAt: Date }[] = [];
    for (let d = 0; d < 30; d++) {
      const count = 2 + Math.floor(Math.random() * 12);
      for (let i = 0; i < count; i++) {
        rows.push({ creatorId: creator.id, viewedAt: daysAgo(d) });
      }
    }
    await prisma.pageView.createMany({ data: rows, skipDuplicates: true });
  }

  const featuredLabels: [string, string][] = [
    ["yummyfiles", "featured"],
    ["nora", "featured"],
    ["vex", "featured"],
    ["yummyfiles", "open-source"],
    ["vex", "open-source"],
    ["mirage", "open-source"],
    ["junebug", "new"],
    ["sol", "new"]
  ];
  for (let i = 0; i < featuredLabels.length; i++) {
    const [username, label] = featuredLabels[i];
    const creator = await prisma.user.findUnique({ where: { username } });
    if (creator) {
      await prisma.featuredCreator.create({ data: { creatorId: creator.id, label, slot: i % 6 } });
    }
  }

  await prisma.announcement.create({
    data: {
      title: "OpenJar is live",
      content: "Open support for open creators. Free forever, MIT licensed, no lock-in."
    }
  });

  console.log("Seed complete ✓");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
