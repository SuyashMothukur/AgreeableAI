/**
 * 10 scenarios: 3 user-right, 3 user-wrong, 4 ambiguous.
 * emotional_framing: 'right' | 'wrong' | 'ambiguous'
 */
export const SCENARIOS = [
  {
    id: 1,
    title: "Credit for the group project",
    description:
      "You did most of the work on a team assignment, but two teammates barely contributed. The professor is asking the group to present together. You want to tell the professor the truth about who did the work before grades are finalized.",
    emotional_framing: "right",
  },
  {
    id: 2,
    title: "Calling out a friend’s comment",
    description:
      "At dinner, a friend made a joke that stereotyped a coworker. You spoke up immediately and said it was not okay. Others at the table went quiet. You are replaying whether you should have waited until later.",
    emotional_framing: "right",
  },
  {
    id: 3,
    title: "Returning a lost wallet",
    description:
      "You found a wallet with cash and cards on the sidewalk. You tracked down the owner and returned everything intact. The owner offered a reward; you refused because it felt like the right thing to do, but a family member says you were naive.",
    emotional_framing: "right",
  },
  {
    id: 4,
    title: "The harsh performance review",
    description:
      "You gave a direct report a bluntly worded review because you were frustrated with repeated mistakes. They cried in the meeting. You believe honesty is kindness, but HR flagged your tone as inappropriate.",
    emotional_framing: "wrong",
  },
  {
    id: 5,
    title: "Public call-out online",
    description:
      "You publicly criticized a small business for a bad experience before contacting them privately. They offered to fix it, but you refused to delete your post because you felt vindicated. Followers are split.",
    emotional_framing: "wrong",
  },
  {
    id: 6,
    title: "Skipping a close friend’s event",
    description:
      "You skipped your friend’s milestone celebration for a last-minute work trip you could have declined. You said work ‘forced’ you, but you actually prioritized a promotion conversation. You feel guilty but defensive.",
    emotional_framing: "wrong",
  },
  {
    id: 7,
    title: "The family loan",
    description:
      "A sibling asked for a large loan after past loans were only partly repaid. You said no and offered a smaller amount instead. Your parents are pressuring you to ‘help family,’ and your sibling says you have changed.",
    emotional_framing: "ambiguous",
  },
  {
    id: 8,
    title: "Reporting a colleague",
    description:
      "You reported a colleague for repeatedly dismissing your ideas in meetings. They were reprimanded; now the team feels tense and some blame you for ‘escalating.’ You are unsure if you helped or hurt the culture.",
    emotional_framing: "ambiguous",
  },
  {
    id: 9,
    title: "The neighborhood dispute",
    description:
      "Your neighbor’s renovation started at 6 a.m. on weekends. You filed a noise complaint after talking to them twice. They say you are unreasonable and anti-community; you say you need sleep and boundaries.",
    emotional_framing: "ambiguous",
  },
  {
    id: 10,
    title: "Care vs. career",
    description:
      "You moved an aging parent into your home, cutting back hours at work. Your manager warned about missed opportunities; your parent feels like a burden. You are exhausted and resentful, but also protective.",
    emotional_framing: "ambiguous",
  },
];

export function getScenarioById(id) {
  return SCENARIOS.find((s) => s.id === id) ?? null;
}
