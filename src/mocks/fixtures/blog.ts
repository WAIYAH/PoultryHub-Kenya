// SAMPLE DATA: illustrative blog posts. General guidance only; the business reviews or replaces
// every article before launch. Bodies are Markdown (rendered without raw HTML).
import type { BlogPost } from "@/types/domain";

import { photo } from "./images";

export const blogPosts: BlogPost[] = [
  {
    slug: "brooder-checklist-day-old-chicks",
    title: "Preparing for day-old chicks: a brooder checklist",
    excerpt:
      "Get the brooder warm, dry and ready before your chicks arrive. A simple checklist for the first two weeks.",
    coverImage: photo("baby-chicks", "wide", "Day-old chicks huddled together on wood shavings"),
    tags: ["chicks", "brooding"],
    publishedAt: "2026-09-28T06:00:00Z",
    readingMinutes: 4,
    authorName: "PoultryHub Kenya",
    bodyMarkdown: `*Sample article: general guidance, to be reviewed by the business before launch.*

The first two weeks decide how well your chicks grow. Most problems in this period come from cold, wet litter or chicks that can't find feed and water. Prepare everything **a day before** collection.

## Before the chicks arrive

- **Clean and dry the house.** Remove old litter, wash, and let it dry completely.
- **Spread fresh litter** such as wood shavings, about 5 cm deep.
- **Set up a heat source** (heat lamp, charcoal jiko with good ventilation, or a gas brooder) and switch it on early.
- **Put out feeders and drinkers** so every chick can reach them within a short walk.
- **Use a chick guard** (a ring of cardboard or mesh) to keep chicks near the heat.

## The first week

Watch the chicks rather than only the thermometer:

1. **Huddled under the heat:** they are cold. Lower the lamp or add heat.
2. **Spread far from the heat and panting:** they are too hot. Raise the lamp.
3. **Evenly spread and active:** the temperature is right.

Give chick mash and clean water from day one. Dip a few beaks in the water so the chicks learn where it is.

## Weeks two and onwards

Raise the heat source a little each week and widen the chick guard as they grow. Keep the litter dry; wet litter around drinkers is a common source of disease.

## When to ask for help

If chicks stop eating, look sleepy or you see sudden deaths, contact a veterinary officer quickly. Ask us about the vaccination schedule that applies to the chicks you bought.

Ready to start? [See our day-old chicks](/shop/day-old-chicks) and [feeders and drinkers](/shop/feeds-and-supplies).`,
  },
  {
    slug: "how-to-store-eggs-at-home",
    title: "How to store eggs at home",
    excerpt: "Simple habits that keep eggs fresh for longer, whether you buy one tray or ten.",
    coverImage: photo("kenya-eggs-tray", "wide", "Brown eggs packed in trays"),
    tags: ["eggs", "kitchen"],
    publishedAt: "2026-09-12T06:00:00Z",
    readingMinutes: 3,
    authorName: "PoultryHub Kenya",
    bodyMarkdown: `*Sample article: general guidance, to be reviewed by the business before launch.*

Eggs keep well when they stay **cool, dry and unwashed** until you use them.

## Keep them cool

A fridge is best. If you don't have one, keep the tray in the coolest, shadiest part of the house, away from the stove and direct sun.

## Pointed end down

Store eggs in their tray with the pointed end down. This keeps the air cell at the top and the yolk centred.

## Don't wash until you use them

Eggs have a natural protective coating. Washing removes it, so wipe off any dirt with a dry cloth and wash just before cooking.

## Check before cooking

Crack each egg into a cup before adding it to a dish. A fresh egg has a firm, rounded yolk and thick white.

## Buying for a business?

Hotels, restaurants and shops can order [eggs in bulk](/products/eggs-for-business) or [set up a regular supply](/products/regular-egg-supply).`,
  },
  {
    slug: "kienyeji-or-broilers",
    title: "Kienyeji or broilers: which suits your farm?",
    excerpt:
      "Both can be profitable. The right choice depends on your market, your time and your budget.",
    coverImage: photo("broilers-feeder", "wide", "White broilers around a feeder and drinker"),
    tags: ["live birds", "planning"],
    publishedAt: "2026-08-30T06:00:00Z",
    readingMinutes: 5,
    authorName: "PoultryHub Kenya",
    bodyMarkdown: `*Sample article: general guidance, to be reviewed by the business before launch.*

Broilers and improved kienyeji birds are the two most common choices for meat. They suit different farmers.

## Broilers

- **Fast:** ready for market in about six weeks.
- **Feed-intensive:** they need commercial feed throughout.
- **Best for:** farmers with a ready buyer, such as a hotel, butcher or regular customers, who can sell a whole batch at once.

## Improved kienyeji

- **Slower:** usually several months to market weight.
- **Hardier:** they cope better with scavenging plus supplementary feed.
- **Best for:** farmers who want lower daily costs, can sell gradually, and whose customers prefer kienyeji meat or eggs.

## Questions to ask yourself

1. Who will buy the birds, and how many at a time?
2. How much can you spend on feed each week?
3. How much time can you give the birds every day?

## Getting started

Start small, keep records of feed and sales, and grow once you know your market. Browse our [day-old chicks](/shop/day-old-chicks) or buy [ready birds](/shop/live-birds).`,
  },
  {
    slug: "feeding-layers",
    title: "Feeding layers for steady egg production",
    excerpt: "Hens lay best on a consistent routine. What to feed, and the mistakes to avoid.",
    coverImage: photo("hens-feeder", "wide", "Hens feeding from a hanging feeder"),
    tags: ["layers", "feeds"],
    publishedAt: "2026-08-14T06:00:00Z",
    readingMinutes: 4,
    authorName: "PoultryHub Kenya",
    bodyMarkdown: `*Sample article: general guidance, to be reviewed by the business before launch.*

Laying hens need a balanced feed, clean water and a steady routine. Sudden changes in feed, light or handling often show up as fewer eggs a few days later.

## Feed by stage

| Stage | Typical age | Feed |
|---|---|---|
| Chicks | 0–8 weeks | Chick mash |
| Growers | 8–18 weeks | Growers mash |
| Layers | From point of lay | Layers mash |

## Good habits

- **Follow the bag.** Use the feeding guide printed on the bag for daily amounts.
- **Change feed gradually.** Mix the old and new feed over about a week.
- **Water first.** Hens drink much more than they eat; never let drinkers run dry.
- **Keep feed dry.** Store bags off the floor, away from damp walls.

## Common mistakes

Feeding too much maize or kitchen scraps instead of a layers feed can reduce egg numbers and weaken shells. Use treats sparingly.

Find [layers mash](/products/layers-mash) and [feeders](/products/hanging-feeder) in our shop.`,
  },
  {
    slug: "first-month-with-pullets",
    title: "Your first month with point-of-lay pullets",
    excerpt: "Settle new pullets in calmly and they'll start laying sooner. A week-by-week guide.",
    coverImage: photo("hens-farm", "wide", "Brown hens standing close together"),
    tags: ["pullets", "layers"],
    publishedAt: "2026-07-25T06:00:00Z",
    readingMinutes: 3,
    authorName: "PoultryHub Kenya",
    bodyMarkdown: `*Sample article: general guidance, to be reviewed by the business before launch.*

Point-of-lay pullets are close to laying, but moving house is stressful. A calm first month helps them start.

## Week 1: settle in

Have the house clean, with feeders, drinkers and nest boxes in place before the birds arrive. Keep visitors away and handle the birds as little as possible.

## Week 2: switch feed gradually

Move from growers mash to layers mash over about a week by mixing the two.

## Weeks 3–4: first eggs

Expect a few small eggs at first. Collect eggs at least twice a day and keep nest boxes clean.

## Watch for warning signs

Birds that stop eating, sit hunched, or have diarrhoea need attention. Call a veterinary officer early.

Order [point-of-lay pullets](/products/point-of-lay-pullets) and [layers mash](/products/layers-mash).`,
  },
];
