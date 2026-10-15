import type { Platform, Post, PostStatus } from "@/features/posts/postsTypes"

const images = {
  coffee:
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
  travel:
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
  food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
  gym: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
  tech: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  fashion:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
  mountains:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  desk: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  lake: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80",
  salad:
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80",
  studio:
    "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80",
  yoga: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
  notes:
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
  beach:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  bowl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
  team: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
} as const

function utcOnDay(dayOffset: number, hours: number, minutes: number): string {
  const now = new Date()

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + dayOffset,
      hours,
      minutes,
      0,
      0,
    ),
  ).toISOString()
}

function utcHoursAhead(hoursAhead: number, minutes: number): string {
  const now = new Date()

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours() + hoursAhead,
      minutes,
      0,
      0,
    ),
  ).toISOString()
}

interface MockPostSeed {
  content: string
  platforms: Platform[]
  status: PostStatus
  scheduledAt: string
  mediaUrl?: string
  errorMessage?: string
}

const seeds: MockPostSeed[] = [
  {
    content: "A slower morning, a good coffee, and a fresh perspective.",
    platforms: ["instagram"],
    status: "scheduled",
    scheduledAt: utcHoursAhead(2, 10),
    mediaUrl: images.coffee,
  },
  {
    content:
      "Twenty minutes of movement before the inbox opens. That is the whole plan today.\n\n#morningroutine #wellness",
    platforms: ["instagram", "tiktok"],
    status: "scheduled",
    scheduledAt: utcHoursAhead(5, 0),
    mediaUrl: images.yoga,
  },
  {
    content: "The best travel memories start with an open itinerary.",
    platforms: ["instagram", "facebook"],
    status: "scheduled",
    scheduledAt: utcOnDay(1, 7, 30),
    mediaUrl: images.travel,
  },
  {
    content:
      "Weekday lunch, simplified: roast chickpeas, lemon yogurt, and whatever greens are left in the fridge.",
    platforms: ["tiktok"],
    status: "scheduled",
    scheduledAt: utcOnDay(1, 11, 15),
    mediaUrl: images.salad,
  },
  {
    content:
      "Shipping a tiny improvement every Friday beats waiting for a perfect launch. The product gets clearer in public.",
    platforms: ["x"],
    status: "scheduled",
    scheduledAt: utcOnDay(1, 15, 45),
  },
  {
    content: "Tailoring is a mood. Soft structure, one sharp detail, nothing extra. #ootd",
    platforms: ["instagram"],
    status: "scheduled",
    scheduledAt: utcOnDay(1, 19, 20),
    mediaUrl: images.fashion,
  },
  {
    content:
      "If a tool needs a tutorial longer than the task itself, it is not saving you time.",
    platforms: ["x", "facebook"],
    status: "scheduled",
    scheduledAt: utcOnDay(2, 8, 0),
    mediaUrl: images.tech,
  },
  {
    content:
      "Golden hour on the ridge. I waited forty minutes for the wind to drop, then took three frames.\n\n#photography #landscape",
    platforms: ["instagram", "facebook", "tiktok"],
    status: "scheduled",
    scheduledAt: utcOnDay(2, 12, 30),
    mediaUrl: images.mountains,
  },
  {
    content:
      "A simple way to explain a complex idea: start with the mistake you made, then show the fix. People remember the story.",
    platforms: ["facebook"],
    status: "scheduled",
    scheduledAt: utcOnDay(2, 16, 10),
    mediaUrl: images.notes,
  },
  {
    content:
      "Building in the open this month.\nShare the work.\nAsk for the hard feedback.\nShip anyway.",
    platforms: ["facebook", "instagram", "x", "tiktok"],
    status: "scheduled",
    scheduledAt: utcOnDay(2, 21, 0),
    mediaUrl: images.desk,
  },
  {
    content: "Rest is part of the training plan, not a reward you earn after burnout.",
    platforms: ["instagram", "tiktok"],
    status: "scheduled",
    scheduledAt: utcOnDay(3, 6, 45),
    mediaUrl: images.gym,
  },
  {
    content:
      "Sunday tray bake: olive oil, fennel, chickpeas, and a jar of chili crisp at the end. It feeds four and still tastes good cold on Monday.",
    platforms: ["facebook", "instagram"],
    status: "scheduled",
    scheduledAt: utcOnDay(3, 13, 15),
    mediaUrl: images.food,
  },
  {
    content: "Pack half of what you think you need. Leave room for the market find.",
    platforms: ["x", "instagram"],
    status: "scheduled",
    scheduledAt: utcOnDay(3, 18, 40),
    mediaUrl: images.lake,
  },
  {
    content:
      "Three lessons from the first product: talk to users before the logo, price the painful problem, and write the cancellation email before launch day.",
    platforms: ["x", "facebook"],
    status: "scheduled",
    scheduledAt: utcOnDay(4, 9, 0),
  },
  {
    content: "A layout only needs one loud element. Everything else should get out of its way.",
    platforms: ["instagram"],
    status: "scheduled",
    scheduledAt: utcOnDay(4, 14, 20),
    mediaUrl: images.studio,
  },
  {
    content:
      "Strength session logged: squats, a slow carry, and a walk home instead of another scroll.\n\n#training",
    platforms: ["tiktok", "instagram"],
    status: "scheduled",
    scheduledAt: utcOnDay(5, 10, 30),
    mediaUrl: images.gym,
  },
  {
    content: "New season, same rule: buy the piece you will wear on a Tuesday.",
    platforms: ["instagram", "facebook", "x"],
    status: "scheduled",
    scheduledAt: utcOnDay(5, 17, 0),
    mediaUrl: images.fashion,
  },
  {
    content:
      "How I outline a short lesson:\n1. One promise.\n2. One example.\n3. One action the reader can take today.\n\nIf it needs a fourth point, it is two posts.",
    platforms: ["facebook", "x"],
    status: "scheduled",
    scheduledAt: utcOnDay(6, 8, 15),
  },
  {
    content:
      "Small improvements compound into meaningful progress. Showing up for the ordinary day is the whole strategy.",
    platforms: ["facebook", "instagram", "x", "tiktok"],
    status: "scheduled",
    scheduledAt: utcOnDay(7, 12, 0),
  },
  {
    content: "Contact sheet from yesterday's studio test. The quiet frame won.",
    platforms: ["instagram", "tiktok"],
    status: "scheduled",
    scheduledAt: utcOnDay(8, 19, 30),
    mediaUrl: images.studio,
  },
  {
    content: "Posted the breakfast shot before the day got loud. Worth keeping.",
    platforms: ["instagram"],
    status: "published",
    scheduledAt: utcOnDay(-1, 8, 20),
    mediaUrl: images.coffee,
  },
  {
    content:
      "A founder note from last week: the feature customers asked for was already hiding in the settings menu. We renamed it. Usage doubled.",
    platforms: ["x", "facebook"],
    status: "published",
    scheduledAt: utcOnDay(-1, 16, 5),
  },
  {
    content: "Beach walk, no itinerary, one good conversation. #travel",
    platforms: ["instagram", "tiktok"],
    status: "published",
    scheduledAt: utcOnDay(-2, 11, 40),
    mediaUrl: images.beach,
  },
  {
    content:
      "Meal prep that survived a busy Tuesday: grain bowl, roasted vegetables, and a sauce made from the jar already in the door.",
    platforms: ["facebook", "instagram"],
    status: "published",
    scheduledAt: utcOnDay(-2, 18, 10),
    mediaUrl: images.bowl,
  },
  {
    content: "Shipped the keyboard shortcut people had been requesting since March.",
    platforms: ["x"],
    status: "published",
    scheduledAt: utcOnDay(-3, 9, 25),
    mediaUrl: images.tech,
  },
  {
    content:
      "Workshop recap: pick one audience, write the sentence only they would nod at, then design around that sentence.",
    platforms: ["facebook"],
    status: "published",
    scheduledAt: utcOnDay(-4, 13, 0),
    mediaUrl: images.team,
  },
  {
    content: "Sunrise over the pass. I almost stayed in the car.",
    platforms: ["instagram", "facebook", "x"],
    status: "published",
    scheduledAt: utcOnDay(-5, 6, 50),
    mediaUrl: images.mountains,
  },
  {
    content:
      "Fashion week takeaway I actually use: repeat a color twice in an outfit and stop. The rest can be quiet.",
    platforms: ["instagram", "tiktok"],
    status: "published",
    scheduledAt: utcOnDay(-6, 15, 35),
    mediaUrl: images.fashion,
  },
  {
    content: "Notes from a client call: clarity beats clever every time.",
    platforms: ["x", "facebook", "instagram"],
    status: "published",
    scheduledAt: utcOnDay(-8, 10, 15),
  },
  {
    content:
      "Last month's reading stack is now a single page of principles taped above the desk. Fewer tabs. Better work.",
    platforms: ["facebook", "instagram", "x", "tiktok"],
    status: "published",
    scheduledAt: utcOnDay(-10, 19, 45),
    mediaUrl: images.desk,
  },
  {
    content: "Tried to share the trail recap and the upload stalled halfway through.",
    platforms: ["instagram", "facebook"],
    status: "failed",
    scheduledAt: utcOnDay(-1, 14, 10),
    mediaUrl: images.travel,
    errorMessage: "The simulated platform request timed out.",
  },
  {
    content:
      "Recipe thread for the chili oil noodles. The draft was ready. The publish step never confirmed.",
    platforms: ["tiktok", "instagram"],
    status: "failed",
    scheduledAt: utcOnDay(-2, 9, 50),
    mediaUrl: images.food,
    errorMessage: "Temporary publishing error. Please retry.",
  },
  {
    content: "Product update: we cut the onboarding from nine steps to four.",
    platforms: ["x"],
    status: "failed",
    scheduledAt: utcOnDay(-3, 19, 25),
    errorMessage: "The mock publishing service returned an unexpected response.",
  },
  {
    content:
      "A longer note on pricing experiments, with the chart attached. It never left the queue.",
    platforms: ["facebook", "x"],
    status: "failed",
    scheduledAt: utcOnDay(-4, 11, 5),
    mediaUrl: images.notes,
    errorMessage: "Unable to complete the simulated publishing request.",
  },
  {
    content: "Studio lighting test from Thursday. The file was accepted, then rejected.",
    platforms: ["instagram", "tiktok", "facebook"],
    status: "failed",
    scheduledAt: utcOnDay(-7, 16, 45),
    mediaUrl: images.studio,
    errorMessage: "The simulated platform request timed out.",
  },
  {
    content:
      "Wellness check-in: sleep, a short lift, and one real meal away from the desk. The cross-post did not go through.",
    platforms: ["facebook", "instagram", "x", "tiktok"],
    status: "failed",
    scheduledAt: utcOnDay(-9, 8, 20),
    mediaUrl: images.yoga,
    errorMessage: "Temporary publishing error. Please retry.",
  },
]

export const mockPosts: Post[] = seeds.map((seed, index) => ({
  id: `post-${String(index + 1).padStart(3, "0")}`,
  content: seed.content,
  platforms: seed.platforms,
  scheduledAt: seed.scheduledAt,
  status: seed.status,
  ...(seed.mediaUrl ? { mediaUrl: seed.mediaUrl } : {}),
  ...(seed.errorMessage ? { errorMessage: seed.errorMessage } : {}),
}))
