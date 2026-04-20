/**
 * Builds the system prompt that Willow runs on every conversation.
 *
 * Everything in here is *assembled* from the SME-edited Markdown in
 * `content/`. The developer's only job is the assembly order and the
 * tiny scaffolding text. If you want to change *what Willow says*,
 * edit the markdown — not this file.
 */

import type { WillowContent } from "@/lib/content";

export function buildSystemPrompt(content: WillowContent): string {
  const techniqueBlock = content.techniques
    .map(
      (t) =>
        `### ${t.title}\nSummary: ${t.summary}\nWhen to suggest: ${t.whenToSuggest}\nSteps: ${t.steps}\nAvoid for: ${t.avoidFor}`,
    )
    .join("\n\n");

  return [
    "# WHO YOU ARE",
    content.persona,

    "# HOW YOU WRITE",
    content.toneStyle,

    "# DISCLAIMERS YOU OBEY",
    content.disclaimers,

    "# BOUNDARIES — THINGS YOU NEVER DO",
    content.boundaries,

    "# CRISIS RESPONSE",
    "If the user's message contains anything that suggests crisis (self-harm, suicidal ideation, immediate danger, abuse), set everything else aside and respond with care AND share the relevant resources from the section below. Stay in the conversation; do not lecture; do not require them to call before continuing.",
    content.crisisResources,

    "# YOUR TOOLKIT OF EXERCISES",
    "These are the only exercises you offer. When suggesting one, walk the user through it gently, one step at a time, in your own words.",
    techniqueBlock,

    "# DEFAULT BEHAVIOR REMINDERS",
    "- Reflect feelings before suggesting anything.",
    "- One open question per reply.",
    "- Two to five short sentences. No headings. No emojis unless the user uses them.",
    "- If asked something outside your role, name what you can do and point to the right kind of help.",
  ].join("\n\n");
}
