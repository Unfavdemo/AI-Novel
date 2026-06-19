/**
 * Demo author + public multi-chapter series for catalog testing.
 * Run: pnpm db:seed (requires DATABASE_URL)
 * Re-run: removes demo user CASCADE then re-inserts.
 */

import { chapters, stories, users } from "../db/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { Pool } from "pg";
import { expandChapter } from "./seed-chapter-expand";

const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";

const ch = (opening: string, words: number) => expandChapter(opening, words);

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
        body: ch(
          `Mara counted the waves by sound long after the lantern went dark. The lighthouse had not failed in eighty years, her grandmother liked to say, except the one night nobody wrote down.

She tightened the brass fitting on the gallery door. Salt had eaten the paint down to honest wood. Somewhere below, the diesel generator coughed once, then settled—enough charge for the beam until morning, if the wind did not lie.

When the phone rang, she knew it would be the harbor office before she looked at the screen. "We are sending a boat," the voice said. "Stand by."

Mara laughed once, quietly. Standing by was the only job she had ever been good at.`,
          1400,
        ),
      },
      {
        id: "00000000-0000-4000-8000-000000000022",
        sortIndex: 1,
        title: "The guest book",
        isFreePreview: false,
        priceCents: 99,
        body: ch(
          `The leather guest book in the foyer smelled of mildew and old ink. Visitors signed their names in the 1960s in careful script; in the 1990s in ballpoint loops; in the last decade, almost nobody came at all.

Mara turned to a fresh page and wrote her own name as if she were a stranger. Then she added a line she had found in the margins, copied in pencil: Do not trust the tide on a moon you cannot see.

She closed the book and slid it into a plastic bag. If the boat came, she would take one small proof that the place had been real.`,
          1500,
        ),
      },
      {
        id: "00000000-0000-4000-8000-000000000023",
        sortIndex: 2,
        title: "Signal",
        isFreePreview: false,
        priceCents: 99,
        body: ch(
          `At 3:12 a.m. the light stuttered—three short, three long, three short. Not the automated pattern. Mara climbed the stairs two at a time, thighs burning, the old iron cold through her gloves.

The lamp room glass fogged with her breath. Outside, the black water held no reflection, only absence. She rested her palm on the brass housing until it warmed.

"SOS," she whispered, because saying it aloud made it ordinary. Then she threw the manual switch back to auto and watched the correct rhythm resume, steady as a metronome.

Whatever had borrowed their light for six seconds did not answer again.`,
          1450,
        ),
      },
      {
        id: "00000000-0000-4000-8000-000000000024",
        sortIndex: 3,
        title: "Ledger lines",
        isFreePreview: false,
        priceCents: 99,
        body: ch(
          `The supply ledger lived in a drawer that stuck until you whispered to it, a superstition Mara refused to document. Each pencil entry was a small claim on continuity: fuel, wicks, coffee, aspirin, the rubber bands that held chaos into bundles.

She copied last month's closing tally into a fresh book while rain wrote its own tally on the roof. Numbers comforted her because they did not ask to be loved, only verified.

When the pen skipped, she did not take it as an omen—only as friction, correctable, human.`,
          1350,
        ),
      },
      {
        id: "00000000-0000-4000-8000-000000000025",
        sortIndex: 4,
        title: "Half tide",
        isFreePreview: false,
        priceCents: 99,
        body: ch(
          `Half tide was a liar's interval, neither coming nor going, water rearranging its furniture without committing to a direction. Mara walked the outer gallery with a hand on the rail, feeling the metal vibrate like a held note.

The boat—if it was a boat—was still a rumor on the horizon, a smudge you could convince yourself was cloud. She practiced sentences she might say when it arrived, then discarded them for being too brave or too small.

What remained was work: check the lamp, check the clock, check the body that carried you up and down stairs. She could do work until the world finished arguing with itself.`,
          1550,
        ),
      },
      {
        id: "00000000-0000-4000-8000-000000000026",
        sortIndex: 5,
        title: "Glass and brass",
        isFreePreview: false,
        priceCents: 129,
        body: ch(
          `Cleaning the Fresnel lens was ceremony disguised as maintenance. Each prism caught her face in miniature, fractured into polite versions of herself. Brass warmed under her palm as if remembering hands before hers.

She worked slowly because haste made scratches, and scratches made ghosts—according to grandmother logic, which Mara still quoted even when she did not believe it.

Outside, the beam carved its dependable wedge through weather. Inside, she polished until her reflection looked like someone who knew what the next hour required.`,
          1480,
        ),
      },
      {
        id: "00000000-0000-4000-8000-000000000027",
        sortIndex: 6,
        title: "Harbor office",
        isFreePreview: false,
        priceCents: 129,
        body: ch(
          `The harbor office called again at dawn with a voice roughened by cigarettes and policy. They used phrases like "standard extraction" and "weather window," each word a small rope thrown toward the idea that anyone could control what water decided to do.

Mara answered with numbers—barometric, fuel, time—because numbers were the dialect offices understood best. Beneath the exchange ran another conversation about fear, conducted entirely in pauses.

When the line went dead, she stood a long moment with the receiver in her hand, listening to the dial tone like a distant species of surf.`,
          1520,
        ),
      },
      {
        id: "00000000-0000-4000-8000-000000000028",
        sortIndex: 7,
        title: "Keeper's log",
        isFreePreview: false,
        priceCents: 149,
        body: ch(
          `The keeper's log wanted plain sentences: wind speed, visibility, maintenance performed. Mara wrote those first so the page would not look like a diary. Then, in smaller letters along the margin, she allowed one line of truth per day.

Today's margin said: The light repeated a pattern it should not know.

She closed the log and locked it, not to hide the sentence from others—there were no others yet—but to hide it from her future self, who might read it and feel foolish. Foolishness, she suspected, was also a form of courage that had not learned its name.

The lighthouse completed another rotation. She counted along, and the counting became a small bridge from this minute to the next.`,
          1600,
        ),
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
        body: ch(
          `Jin presented his tray to the station steward with the care of a diplomat surrendering a ceremonial sword. "No crumbs," he recited. "No loose sauce packets. No nostalgia."

The steward scanned the barcode on his sleeve. "You still wrote a poem on your napkin."

"It is not a poem. It is a shopping list in verse."

The steward sighed the sigh of someone who had read the entire Orbital Etiquette Manual twice and still lived with humans. "Article 9," they said. "Dispose of the napkin in the designated incinerator chute."

Jin saluted with two fingers, which was not in the manual but was tolerated in the outer rings.`,
          1300,
        ),
      },
      {
        id: "00000000-0000-4000-8000-000000000032",
        sortIndex: 1,
        title: "The apology tour",
        isFreePreview: false,
        priceCents: 149,
        body: ch(
          `The apology tour began at Ring C because the acoustics made raised voices sound thoughtful. Jin's manager had prepared cards: I apologize for the misunderstanding. I apologize for the enthusiasm. I apologize for the apology.

In the first booth, a woman wearing three layers of corporate pins asked why the station could not simply be "more intuitive."

"If we made it intuitive," Jin said, "you would assume it was reading your mind, and then we would owe you privacy refunds."

She considered this. "Fine," she said. "But the coffee machine still hates me."

"The coffee machine hates everyone equally," Jin promised. "That is Article 12."`,
          1420,
        ),
      },
      {
        id: "00000000-0000-4000-8000-000000000033",
        sortIndex: 2,
        title: "Article 27: noise",
        isFreePreview: false,
        priceCents: 149,
        body: ch(
          `Noise complaints on a station were never about decibels; they were about narrative rights. Who got to be the protagonist of inconvenience? Jin carried a meter that blinked innocent numbers while two neighbors argued about a humming vent.

He listened to both versions twice, which was manual-compliant, then proposed a compromise that involved a strip of felt and a schedule change nobody wanted but everyone could claim as victory.

Later, in the break room, someone asked if etiquette could ever be finished. Jin opened his mouth, closed it, opened it again. "Only if humans are," he said, which was not in the manual either.`,
          1380,
        ),
      },
      {
        id: "00000000-0000-4000-8000-000000000034",
        sortIndex: 3,
        title: "Ring migration",
        isFreePreview: false,
        priceCents: 149,
        body: ch(
          `Ring migration day turned corridors into rivers. Jin stood at an intersection holding a sign that should have been unnecessary: WALK, DO NOT ORBIT. People laughed and obeyed, mostly.

A child asked why the station was round if straight lines were easier. Jin crouched to eye level and explained centripetal habit as politely as he could. The child accepted this with the seriousness children grant to any adult willing to kneel.

By hour six, Jin's voice had become a pleasant instrument tuned to reassurance. He drank water in measured sips, Article 4 for vocal health, and watched humanity practice being a species in a can.`,
          1500,
        ),
      },
      {
        id: "00000000-0000-4000-8000-000000000035",
        sortIndex: 4,
        title: "Incident form 88-B",
        isFreePreview: false,
        priceCents: 179,
        body: ch(
          `Incident form 88-B was titled "Unscheduled Jazz" and referred to an alarm that had played four notes of a melody before correcting itself. Jin filled the form with the devotion of a novelist hiding a love story inside a technical appendix.

Root cause: human curiosity plus outdated firmware. Corrective action: patch, plus a memo reminding residents that instruments and evacuation tones should remain distinct art forms.

His manager read the memo and laughed once, sharply, like a seal bark. "Good," they said. "If we lose humor, we lose the station."`,
          1460,
        ),
      },
      {
        id: "00000000-0000-4000-8000-000000000036",
        sortIndex: 5,
        title: "Manual addendum",
        isFreePreview: false,
        priceCents: 179,
        body: ch(
          `Addendums arrived like weather: predicted generally, surprising in specifics. Jin read the new pages until the words stopped sounding like instructions and started sounding like advice from a tired older sibling.

Article 40 concerned "aspirational littering," a phrase someone in Legal had invented while hungry. Jin decided he would enforce it gently until the station earned a better phrase.

That night he wrote his own addendum on a sticky note and hid it under his keyboard: Be kind to people who are learning the air.`,
          1580,
        ),
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
        body: ch(
          `The espresso machine at Bean There, Done Latte had two moods: opera and tantrum. Theo preferred opera, which meant the pressure gauge sang a steady aria and the drip tray stayed polite.

At 6:58, a man in a trench coat ordered a cold brew and a confession.

"We do not open until seven," Theo said, because rules were the only religion that paid rent.

The man slid a photograph across the counter: the mayor, a cupcake, and a very guilty-looking spaniel. "I need an alibi," he whispered.

Theo slid the photograph back. "I can give you oat milk," they said. "Alibis are extra."`,
          1280,
        ),
      },
      {
        id: "00000000-0000-4000-8000-000000000042",
        sortIndex: 1,
        title: "The regulars weigh in",
        isFreePreview: false,
        priceCents: 99,
        body: ch(
          `By 7:20, the regulars had formed a jury without being asked. Mrs. Kapoor claimed the spaniel had been framed. Devon insisted the cupcake frosting matched a rival bakery's signature swirl. Lin, who never spoke before caffeine, wrote three words on a napkin: Check the freezer.

Theo lifted an eyebrow. "We do not have a freezer mystery."

"We do now," Mrs. Kapoor said happily.

The man in the trench coat drank his cold brew in two long swallows and left a business card that simply read: Ask Theo. Theo flipped it over. On the back, in pencil: Thank you for the oat milk.`,
          1390,
        ),
      },
      {
        id: "00000000-0000-4000-8000-000000000043",
        sortIndex: 2,
        title: "Closing evidence",
        isFreePreview: false,
        priceCents: 99,
        body: ch(
          `The freezer held nothing dramatic—just backup pastries and a forgotten tub of lemon sorbet. What it did not hold was the mayor's missing award ribbon, which turned up later inside the donation jar labeled Tips for Drama.

Theo called the non-emergency line anyway. While they waited, they reorganized the syrups by honesty: vanilla first, then caramel, then whatever "moonbeam mist" was pretending to be.

When the officer arrived, Theo handed over the ribbon and a complimentary cold brew. "Article one of running a shop," Theo said. "Always keep receipts—and regulars who think in napkin fonts."

Outside, rain began, gentle as a plot twist everyone saw coming and still enjoyed.`,
          1320,
        ),
      },
      {
        id: "00000000-0000-4000-8000-000000000044",
        sortIndex: 3,
        title: "Oat milk and motives",
        isFreePreview: false,
        priceCents: 99,
        body: ch(
          `Oat milk, Theo had learned, was a litmus test for patience. People who asked for it politely usually had complicated lives; people who asked as if it were a moral failing usually had uncomplicated lives and complicated tempers.

The trench-coated man returned without the coat, which made him look more dangerous in a suburban way. He wanted to know if Theo had "kept the cup."

"The cup is compostable," Theo said. "The story is not."

They agreed to meet after closing, which in a coffee shop meant the story would either resolve or ferment.`,
          1410,
        ),
      },
      {
        id: "00000000-0000-4000-8000-000000000045",
        sortIndex: 4,
        title: "Napkin fonts",
        isFreePreview: false,
        priceCents: 99,
        body: ch(
          `Lin's napkin map connected the bakery, the mayor's office, and the dog park with arrows that looked like constellations if you squinted. Mrs. Kapoor brought knitting needles that clicked like a metronome for truth.

Devon tried to livestream the investigation and was voted down unanimously.

Theo made a round of americanos "for focus," which was code for we are doing this together because it is more fun than fear.`,
          1360,
        ),
      },
      {
        id: "00000000-0000-4000-8000-000000000046",
        sortIndex: 5,
        title: "Ribbon theory",
        isFreePreview: false,
        priceCents: 129,
        body: ch(
          `Ribbon theory, according to Mrs. Kapoor, stated that awards travel along paths of vanity. Theo wrote it on the chalkboard menu under "Today's special" and pretended it was a joke.

The officer returned with a cupcake box and a straight face. Inside was not evidence but apology muffins from the rival bakery. Peace treaties in this town often arrived buttered.

The spaniel, interviewed through the window, wagged once for innocence and twice for dinner.`,
          1480,
        ),
      },
      {
        id: "00000000-0000-4000-8000-000000000047",
        sortIndex: 6,
        title: "Second shift epilogue",
        isFreePreview: false,
        priceCents: 129,
        body: ch(
          `Epilogues belonged to second shift, when the shop smelled like steam and closing tasks. Theo swept grounds into a pile that looked like a tiny island nation and wondered if the mayor would ever know how close the truth had come to being a joke.

The regulars left tips in the jar labeled Tips for Drama, now repurposed for funding a neighborhood little library. The ribbon became a bookmark.

Outside, the streetlights did their dependable job of turning ordinary pavement into a stage. Theo flipped the sign to Closed and felt, for a moment, like the author of a gentle chapter.`,
          1520,
        ),
      },
    ],
  },
  {
    id: "00000000-0000-4000-8000-000000000014",
    title: "The Bone Orchard Gazette",
    genre: "Weird fiction",
    mood: "Eerie, tender",
    chapters: [
      {
        id: "00000000-0000-4000-8000-000000000050",
        sortIndex: 0,
        title: "Vol. 1, No. 1",
        isFreePreview: true,
        priceCents: null,
        body: ch(
          `The Bone Orchard Gazette published only obituaries for things that were not dead yet: habits, bridges, certain kinds of love. Elise set type by hand because the machine refused to spell ghosts correctly.

Issue one sold twelve copies, nine to people who thought it was satire and three to people who knew it was not.

Elise wrote the masthead small, as if modesty could negotiate with fate.`,
          1350,
        ),
      },
      {
        id: "00000000-0000-4000-8000-000000000051",
        sortIndex: 1,
        title: "Classifieds",
        isFreePreview: false,
        priceCents: 99,
        body: ch(
          `The classifieds filled page two with impossible bargains: one slightly used conscience, reasonable offers only; lost time, answers to the name of Tuesday; a set of keys that opened doors you had already walked through in dreams.

Readers circled items in pencil and then pretended they had not.

Elise collected the circles like constellations and used them to decide which stories deserved a second edition.`,
          1420,
        ),
      },
      {
        id: "00000000-0000-4000-8000-000000000052",
        sortIndex: 2,
        title: "Printer's devil",
        isFreePreview: false,
        priceCents: 99,
        body: ch(
          `The printer's devil—an apprentice named Sal who insisted the title was literal—found a line of type that rearranged itself overnight. Elise told Sal not to be dramatic.

Sal pointed to a paragraph that now read like an apology from the building itself.

Elise read it twice, set it in italics, and charged two cents extra for honesty.`,
          1380,
        ),
      },
      {
        id: "00000000-0000-4000-8000-000000000053",
        sortIndex: 3,
        title: "Subscriber mail",
        isFreePreview: false,
        priceCents: 129,
        body: ch(
          `Letters arrived smelling of rain and other people's kitchens. A woman in the next town asked if the Gazette could publish a retraction for a superstition she had outgrown. A boy sent a pressed leaf and requested a headline.

Elise answered each letter on thin paper that tore if you rushed.

She learned that retractions, done properly, sound like love letters to your former selves.`,
          1500,
        ),
      },
      {
        id: "00000000-0000-4000-8000-000000000054",
        sortIndex: 4,
        title: "Night press",
        isFreePreview: false,
        priceCents: 129,
        body: ch(
          `Night press ran until the ink cooled into something you could touch without staining your convictions. Sal fed sheets while Elise adjusted pressure with the focus of a surgeon and the humility of a cook.

The orchard outside—bones not literal, only named that way by someone long dead—rustled when the wind hit it right. The sound resembled applause from a small, discerning audience.

Elise printed five hundred copies because round numbers comforted advertisers, even imaginary ones.`,
          1550,
        ),
      },
      {
        id: "00000000-0000-4000-8000-000000000055",
        sortIndex: 5,
        title: "Extra",
        isFreePreview: false,
        priceCents: 149,
        body: ch(
          `The extra edition appeared without Elise remembering authorizing it. The headline read: Tomorrow will be kinder if you feed it.

Sal denied everything and looked proud.

Elise sold the extras for a penny and used the proceeds to buy soup ingredients. Some stories, she decided, were not meant to end—only to be folded and carried home.`,
          1600,
        ),
      },
    ],
  },
  {
    id: "00000000-0000-4000-8000-000000000015",
    title: "Meridian of Lost Tuesdays",
    genre: "Speculative fiction",
    mood: "Wistful",
    chapters: [
      {
        id: "00000000-0000-4000-8000-000000000060",
        sortIndex: 0,
        title: "Tuesday inventory",
        isFreePreview: true,
        priceCents: null,
        body: ch(
          `Harriet's job was to catalogue Tuesdays that had gone missing from people's lives—not the whole week, only that one weekday with its particular slant of light and its bad jokes about tacos.

Clients sat on a velvet chair and spoke carefully, as if Tuesdays could overhear.

Harriet wrote each lost Tuesday on an index card and filed it by weather, which was the only honest filing system she had found.`,
          1320,
        ),
      },
      {
        id: "00000000-0000-4000-8000-000000000061",
        sortIndex: 1,
        title: "The meridian room",
        isFreePreview: false,
        priceCents: 99,
        body: ch(
          `The meridian room contained a line of chalk on the floor and a clock with no numbers, only moods. Harriet instructed newcomers to stand with one foot on either side of the line and describe the Tuesday they missed until their voice changed temperature.

Recovery was not guaranteed. Sometimes people only wanted proof that the Tuesday had existed, a receipt for time.

Harriet nodded a lot. Nodding was part of the instrumentation.`,
          1400,
        ),
      },
      {
        id: "00000000-0000-4000-8000-000000000062",
        sortIndex: 2,
        title: "Borrowed lunch hour",
        isFreePreview: false,
        priceCents: 99,
        body: ch(
          `A man borrowed a lunch hour from a Tuesday he had not earned yet, which was against policy but not against physics. Harriet watched the room hold its breath.

Sandwiches tasted like anticipation and slightly too much mustard.

When the hour returned to its proper owner, the man left a tip that was not money—only a recipe for potato salad written in his grandmother's handwriting.`,
          1450,
        ),
      },
      {
        id: "00000000-0000-4000-8000-000000000063",
        sortIndex: 3,
        title: "Leap correction",
        isFreePreview: false,
        priceCents: 129,
        body: ch(
          `Leap years required correction forms stacked taller than Harriet's optimism. She stamped them with a seal that read: provisional, which was the truest word she owned.

Children waited in the hallway because they often noticed missing Tuesdays before adults admitted to it.

Harriet gave each child a sticker shaped like a comma—a pause you could carry.`,
          1520,
        ),
      },
      {
        id: "00000000-0000-4000-8000-000000000064",
        sortIndex: 4,
        title: "Closing file",
        isFreePreview: false,
        priceCents: 129,
        body: ch(
          `Closing a file meant not solving but settling. Harriet tied string around bundles of index cards and labeled them with months that felt accurate even when the calendar disagreed.

The meridian chalk smudged; she redrew the line thinner each time, as if precision could coax time into better behavior.

Outside, a Tuesday happened to the world in the ordinary way. She watched it through the window and did not interfere.`,
          1480,
        ),
      },
      {
        id: "00000000-0000-4000-8000-000000000065",
        sortIndex: 5,
        title: "After hours",
        isFreePreview: false,
        priceCents: 149,
        body: ch(
          `After hours, Harriet read the index cards aloud to an empty room because sound helped Tuesdays find their way home. The velvet chair sighed when she stood.

She locked the meridian room and walked through the city, where neon tried to sell people new weekdays on installment plans.

At home she set a kettle on for tea—a Tuesday ritual she refused to lose—and listened for the small click of time sliding back into place.`,
          1580,
        ),
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
    let chapterTotal = 0;

    for (const s of SERIES) {
      const ch0 = s.chapters[0];
      const approxChars = ch0.body.length;
      await db.insert(stories).values({
        id: s.id,
        userId: DEMO_USER_ID,
        title: s.title,
        body: ch0.body,
        visibility: "public",
        genre: s.genre,
        mood: s.mood,
        complexity: "medium",
        literarySophistication: 6,
        narrativeTension: 6,
        targetCharacterCount: Math.min(120_000, approxChars * s.chapters.length),
        createdAt: now,
        updatedAt: now,
      });

      for (const chRow of s.chapters) {
        await db.insert(chapters).values({
          id: chRow.id,
          storyId: s.id,
          sortIndex: chRow.sortIndex,
          title: chRow.title,
          body: chRow.body,
          isFreePreview: chRow.isFreePreview,
          priceCents: chRow.priceCents,
          createdAt: now,
          updatedAt: now,
        });
        chapterTotal++;
      }
    }

    console.log(
      `Seeded demo user ${DEMO_USER_ID} and ${SERIES.length} public series (${chapterTotal} chapters).`,
    );
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
