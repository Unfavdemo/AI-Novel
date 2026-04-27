/**
 * Inserts a demo author and 3 public multi-chapter series for local catalog testing.
 * Run: pnpm db:seed (requires DATABASE_URL in .env or env)
 * Re-run safe: removes the demo user first (CASCADE removes their stories/chapters/unlocks).
 */

import { chapters, stories, users } from "../db/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { Pool } from "pg";

const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";

const SERIES = [
  {
    id: "00000000-0000-4000-8000-000000000011",
    title: "The Last Lighthouse Keep",
    genre: "Literary fiction",
    mood: "Melancholy",
    chapters: [
      {
        id: "00000000-0000-4000-8000-000000000021",
        sortIndex: 0,
        title: "Storm season",
        isFreePreview: true,
        priceCents: null as number | null,
        body: `Mara counted the waves by sound long after the lantern went dark. The lighthouse had not failed in eighty years, her grandmother liked to say, except the one night nobody wrote down.

She tightened the brass fitting on the gallery door. Salt had eaten the paint down to honest wood. Somewhere below, the diesel generator coughed once, then settled—enough charge for the beam until morning, if the wind did not lie.

When the phone rang, she knew it would be the harbor office before she looked at the screen. "We are sending a boat," the voice said. "Stand by."

Mara laughed once, quietly. Standing by was the only job she had ever been good at.`,
      },
      {
        id: "00000000-0000-4000-8000-000000000022",
        sortIndex: 1,
        title: "The guest book",
        isFreePreview: false,
        priceCents: 99,
        body: `The leather guest book in the foyer smelled of mildew and old ink. Visitors signed their names in the 1960s in careful script; in the 1990s in ballpoint loops; in the last decade, almost nobody came at all.

Mara turned to a fresh page and wrote her own name as if she were a stranger. Then she added a line she had found in the margins, copied in pencil: Do not trust the tide on a moon you cannot see.

She closed the book and slid it into a plastic bag. If the boat came, she would take one small proof that the place had been real.`,
      },
      {
        id: "00000000-0000-4000-8000-000000000023",
        sortIndex: 2,
        title: "Signal",
        isFreePreview: false,
        priceCents: 99,
        body: `At 3:12 a.m. the light stuttered—three short, three long, three short. Not the automated pattern. Mara climbed the stairs two at a time, thighs burning, the old iron cold through her gloves.

The lamp room glass fogged with her breath. Outside, the black water held no reflection, only absence. She rested her palm on the brass housing until it warmed.

"SOS," she whispered, because saying it aloud made it ordinary. Then she threw the manual switch back to auto and watched the correct rhythm resume, steady as a metronome.

Whatever had borrowed their light for six seconds did not answer again.`,
      },
    ],
  },
  {
    id: "00000000-0000-4000-8000-000000000012",
    title: "Orbital Etiquette",
    genre: "Science fiction",
    mood: "Dry humor",
    chapters: [
      {
        id: "00000000-0000-4000-8000-000000000031",
        sortIndex: 0,
        title: "Article 9: crumbs",
        isFreePreview: true,
        priceCents: null,
        body: `Jin presented his tray to the station steward with the care of a diplomat surrendering a ceremonial sword. "No crumbs," he recited. "No loose sauce packets. No nostalgia."

The steward scanned the barcode on his sleeve. "You still wrote a poem on your napkin."

"It is not a poem. It is a shopping list in verse."

The steward sighed the sigh of someone who had read the entire Orbital Etiquette Manual twice and still lived with humans. "Article 9," they said. "Dispose of the napkin in the designated incinerator chute."

Jin saluted with two fingers, which was not in the manual but was tolerated in the outer rings.`,
      },
      {
        id: "00000000-0000-4000-8000-000000000032",
        sortIndex: 1,
        title: "The apology tour",
        isFreePreview: false,
        priceCents: 149,
        body: `The apology tour began at Ring C because the acoustics made raised voices sound thoughtful. Jin's manager had prepared cards: I apologize for the misunderstanding. I apologize for the enthusiasm. I apologize for the apology.

In the first booth, a woman wearing three layers of corporate pins asked why the station could not simply be "more intuitive."

"If we made it intuitive," Jin said, "you would assume it was reading your mind, and then we would owe you privacy refunds."

She considered this. "Fine," she said. "But the coffee machine still hates me."

"The coffee machine hates everyone equally," Jin promised. "That is Article 12."`,
      },
    ],
  },
  {
    id: "00000000-0000-4000-8000-000000000013",
    title: "Cold Brew Alibis",
    genre: "Cozy mystery",
    mood: "Light",
    chapters: [
      {
        id: "00000000-0000-4000-8000-000000000041",
        sortIndex: 0,
        title: "Opening shift",
        isFreePreview: true,
        priceCents: null,
        body: `The espresso machine at Bean There, Done Latte had two moods: opera and tantrum. Theo preferred opera, which meant the pressure gauge sang a steady aria and the drip tray stayed polite.

At 6:58, a man in a trench coat ordered a cold brew and a confession.

"We do not open until seven," Theo said, because rules were the only religion that paid rent.

The man slid a photograph across the counter: the mayor, a cupcake, and a very guilty-looking spaniel. "I need an alibi," he whispered.

Theo slid the photograph back. "I can give you oat milk," they said. "Alibis are extra."`,
      },
      {
        id: "00000000-0000-4000-8000-000000000042",
        sortIndex: 1,
        title: "The regulars weigh in",
        isFreePreview: false,
        priceCents: 99,
        body: `By 7:20, the regulars had formed a jury without being asked. Mrs. Kapoor claimed the spaniel had been framed. Devon insisted the cupcake frosting matched a rival bakery's signature swirl. Lin, who never spoke before caffeine, wrote three words on a napkin: Check the freezer.

Theo lifted an eyebrow. "We do not have a freezer mystery."

"We do now," Mrs. Kapoor said happily.

The man in the trench coat drank his cold brew in two long swallows and left a business card that simply read: Ask Theo. Theo flipped it over. On the back, in pencil: Thank you for the oat milk.`,
      },
      {
        id: "00000000-0000-4000-8000-000000000043",
        sortIndex: 2,
        title: "Closing evidence",
        isFreePreview: false,
        priceCents: 99,
        body: `The freezer held nothing dramatic—just backup pastries and a forgotten tub of lemon sorbet. What it did not hold was the mayor's missing award ribbon, which turned up later inside the donation jar labeled Tips for Drama.

Theo called the non-emergency line anyway. While they waited, they reorganized the syrups by honesty: vanilla first, then caramel, then whatever "moonbeam mist" was pretending to be.

When the officer arrived, Theo handed over the ribbon and a complimentary cold brew. "Article one of running a shop," Theo said. "Always keep receipts—and regulars who think in napkin fonts."

Outside, rain began, gentle as a plot twist everyone saw coming and still enjoyed.`,
      },
    ],
  },
] as const;

async function main() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error("DATABASE_URL is required (set in .env or export before running).");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: url });
  try {
    const db = drizzle(pool);

    await db.delete(users).where(eq(users.id, DEMO_USER_ID));

    await db.insert(users).values({
      id: DEMO_USER_ID,
      name: "Demo Author",
      email: "demo-author@example.invalid",
    });

    const now = new Date();

    for (const s of SERIES) {
      const ch0 = s.chapters[0];
      await db.insert(stories).values({
        id: s.id,
        userId: DEMO_USER_ID,
        title: s.title,
        body: ch0.body,
        visibility: "public",
        genre: s.genre,
        mood: s.mood,
        complexity: "medium",
        literarySophistication: 5,
        narrativeTension: 6,
        targetCharacterCount: 4000,
        createdAt: now,
        updatedAt: now,
      });

      for (const ch of s.chapters) {
        await db.insert(chapters).values({
          id: ch.id,
          storyId: s.id,
          sortIndex: ch.sortIndex,
          title: ch.title,
          body: ch.body,
          isFreePreview: ch.isFreePreview,
          priceCents: ch.priceCents,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    console.log(
      `Seeded demo user ${DEMO_USER_ID} and ${SERIES.length} public series (${SERIES.reduce((n, s) => n + s.chapters.length, 0)} chapters).`,
    );
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
