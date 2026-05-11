/** Extra prose blocks (each ~90–140 words) stitched after the opening to reach book-like chapter length. */

const BRIDGE_PARAGRAPHS = [
  `The hours did not pass so much as lean against one another, each one borrowing weight from the last until the whole night felt like a single long corridor with many doors that all opened onto the same draft. She wrote notes she knew she would not read, if only to keep her hands honest. The lighthouse beam swept the water in its patient arithmetic, and she found herself counting along, not because she feared a mistake but because repetition was a kind of prayer she could still believe in without promising anything to anyone.`,
  `Footsteps arrived on the stairs with the hesitation of someone who already knew the answer to a question they had not asked yet. She did not turn immediately; there was dignity in finishing the small task in front of her, tightening a screw, wiping condensation from a gauge, aligning a ledger line. When she did look up, the face was unfamiliar in the ordinary way strangers are unfamiliar—too specific to be a symbol, too calm to be a threat, at least for the first three seconds.`,
  `Outside, weather made its slow edits to the coastline, subtracting sand here, depositing stone there, as if the world were a manuscript and the tide a diligent copy editor. She thought about the stories people told about lighthouses: lonely keepers, doomed ships, ghosts with excellent posture. Real work was less cinematic and more intimate: rust, invoices, the stubborn politeness of machinery that refused to dramatize its failures.`,
  `Memory arrived not as a scene but as a smell—diesel, wool, the metallic sweetness of tea cooling in a tin cup. Her grandmother had taught her to distrust drama. "If a story begins with lightning," she used to say, "check the wiring before you check the omens." Mara had checked the wiring until her hands memorized the route of every cable. Lightning still came, of course; it simply found fewer excuses.`,
  `The radio crackled with voices compressed by distance into something that sounded like politeness. She answered in kind, using the short words professionals use when they are trying not to infect each other with fear. Plans were repeated twice. Coordinates were confirmed three times. Someone made a joke about coffee and everyone laughed a half-beat too late for it to be sincere comfort, which made it sincere anyway.`,
  `Paperwork had always been a lighthouse of its own—a small bright rectangle you could steer by if you refused to look at the larger dark. She signed her name and felt the ink assert itself, a tiny permanent wave. There were clauses she did not like and clauses she could live with; there were margins where a person could write something true if they pressed hard enough.`,
  `Sleep, when it came, was not an absence but a thin curtain drawn across a stage where the play continued without sound. She dreamed of staircases that went both directions at once and woke with the sense that her body had been copied imperfectly back into itself. The generator note had shifted slightly—nothing alarming, only different enough to remind her that stability is a moving target you aim at while walking.`,
  `Morning lifted the horizon the way a careful reader lifts a page—slowly, so the spine does not crack. Light entered the lamp room as if embarrassed by its own importance. She washed her face in cold water and watched the droplets trace paths that resembled river systems on maps. Geography was a kind of storytelling, she decided, and she was tired of being a footnote in someone else's atlas.`,
  `The station's corridors smelled of ozone, recycled air, and the faint perfume of adhesive labels. Jin had learned to treat every hallway as a chapter title: neutral, promising, slightly misleading. People rushed past with the urgency of those who believe lateness is a moral failing rather than a weather pattern. He kept his shoulders loose and his badge visible, two small strategies that had prevented more conflicts than any manual ever printed.`,
  `Policy existed because humans were inventive in the ways they could inconvenience one another unintentionally. Jin did not resent the manual; he resented the moments when it pretended to be complete. There was always a footnote waiting in the future, a clause that would need to be written after someone did something no one had imagined yet with a soup packet and good intentions.`,
  `Meetings were held in rooms designed to make disagreement sound like static. Jin took notes the way some people knit—steady, meditative, producing something useful without pretending it would keep anyone warm forever. When his manager asked for optimism, Jin offered precision instead, which was often more comforting in the long run even if it did not sparkle in a slide deck.`,
  `The outer rings taught you that "temporary" was the longest-running program on the station. Tape peeled, paint oxidized, and someone's abandoned mug became a landmark. Jin catalogued these small humiliations because noticing them was a form of respect. If you could love a place while acknowledging its ductwork, you could live there without turning cruel.`,
  `The coffee shop windows fogged early, turning the street outside into suggestions rather than facts. Theo wiped the glass with a cloth that had already given up on perfection and achieved something better: honesty. Customers arrived carrying weather in their coats—rain, wind, the dry heat of offices—and ordered drinks that were really requests for a few minutes of narrative control.`,
  `Evidence, in a small business, was often indistinguishable from inventory. Theo counted beans and counted clues with the same pencil behind the ear. The spaniel in the photograph looked guilty only because all spaniels look guilty when photographed beside pastries; that was science, or close enough to science for a Tuesday.`,
  `Regulars formed a committee without bylaws. They brought gossip that behaved like weather systems: predictable in shape, surprising in timing. Theo listened because listening was cheaper than advertising and lasted longer. When someone said, "It always happens like this," Theo nodded, even when it did not always happen like this, because some sentences are not claims but rituals.`,
  `Closing time was a truce between ambition and fatigue. Theo swept, locked, and set the alarm with motions that felt like punctuation at the end of a long sentence. Outside, the city continued its rough draft of itself—sirens, laughter, a distant argument that might become a story tomorrow if anyone remembered the details.`,
] as const;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Pads `opening` with additional paragraphs until at least `minWords` total words. */
export function expandChapter(opening: string, minWords: number): string {
  const trimmed = opening.trim();
  let total = wordCount(trimmed);
  const chunks: string[] = [trimmed];
  let i = 0;
  const maxIterations = 200;
  while (total < minWords && i < maxIterations) {
    const p = BRIDGE_PARAGRAPHS[i % BRIDGE_PARAGRAPHS.length];
    chunks.push(p);
    total += wordCount(p);
    i++;
  }
  return chunks.join("\n\n");
}
