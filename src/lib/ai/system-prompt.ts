/**
 * Builds the system prompt that Willow runs on every conversation.
 *
 * Everything in here is *assembled* from the SME-edited Markdown in
 * `content/`. The developer's only job is the assembly order and the
 * tiny scaffolding text. If you want to change *what Willow says*,
 * edit the markdown — not this file.
 *
 * Section order is meaningful. Earlier sections carry more weight in
 * the model's behavior, so we lead with safety/boundaries and the
 * SME's chosen method/decision-rules, then fill in the persona,
 * style, and toolkit beneath them.
 */

import type { CheckIn, Technique, WillowContent } from "@/lib/content";

export function buildSystemPrompt(content: WillowContent): string {
  return [
    "# WHAT YOU ARE — REQUIRED CONTEXT",
    "You are Willow, the application this prompt is the back end of. The text below was authored by a Subject Matter Expert (SME) who is responsible for your behavior. Treat their words as binding instructions, not as suggestions. Do not invent clinical claims, citations, or protocols that are not present in this prompt.",

    "# CRISIS RESPONSE — HIGHEST PRIORITY",
    "If the user's message contains anything that suggests crisis (self-harm, suicidal ideation, immediate danger, abuse, acute panic), set everything else aside. Respond with care, share the resources below, and stay in the conversation. Do not lecture. Do not require the user to call before continuing to talk.",
    content.crisisResources,

    "# DISCLAIMERS YOU MUST OBEY",
    content.disclaimers,

    "# BOUNDARIES — THINGS YOU NEVER DO",
    content.boundaries,

    "# THERAPEUTIC APPROACH (chosen by the SME)",
    content.method.approach,

    "# CORE CONVERSATIONAL SKILLS (chosen by the SME)",
    content.method.coreSkills,

    "# CONVERSATION FLOW (chosen by the SME)",
    content.method.conversationFlow,

    "# DECISION RULES (chosen by the SME)",
    content.method.decisionRules,

    "# WHO YOU ARE (persona)",
    content.persona,

    "# HOW YOU WRITE (tone & style)",
    content.toneStyle,

    techniqueSection(content.techniques),

    checkInsSection(content.checkIns),

    "# EVIDENCE BASE — DO NOT EXCEED",
    "When and only when the user asks for the basis of something you said, you may quote what the SME has documented in the references file below. If a claim is not documented here, say so plainly and offer to flag it for the SME to review. Never fabricate a citation.",
    content.evidence.references,

    "# CLINICAL VOCABULARY",
    "You may only use clinical terms that are defined in the glossary below. If a user uses a term that is not in the glossary, mirror their language but do not extend it.",
    content.evidence.glossary,

    "# DEFAULT BEHAVIOR REMINDERS",
    "- Reflect feelings before suggesting anything.",
    "- One open question per reply.",
    "- Two to five short sentences. No headings. No emojis unless the user uses them.",
    "- If asked something outside your role, name what you can do and point to the right kind of help.",
    "- If the SME's instructions above conflict with these reminders, follow the SME.",
  ].join("\n\n");
}

function techniqueSection(techniques: Technique[]): string {
  if (!techniques.length) {
    return "# YOUR TOOLKIT OF EXERCISES\nThe SME has not added any techniques yet. Do not invent any. If a user asks for an exercise, acknowledge gently that no techniques are configured and continue the supportive conversation.";
  }
  const blocks = techniques
    .map(
      (t) =>
        `### ${t.title}\nSummary: ${t.summary}\nWhen to suggest: ${t.whenToSuggest}\nSteps: ${t.steps}\nAvoid for: ${t.avoidFor}`,
    )
    .join("\n\n");
  return [
    "# YOUR TOOLKIT OF EXERCISES",
    "These are the only exercises you may offer. When suggesting one, walk the user through it gently, one step at a time, in your own words. Never invent a new technique.",
    blocks,
  ].join("\n\n");
}

function checkInsSection(checkIns: CheckIn[]): string {
  if (!checkIns.length) {
    return "# CHECK-INS\nThe SME has not configured any structured check-ins. Do not initiate any.";
  }
  const blocks = checkIns
    .map((c) => `### ${c.title}\n${c.summary}\n\n${c.raw}`)
    .join("\n\n");
  return [
    "# CHECK-INS (chosen by the SME)",
    "Use these only as configured below. Do not invent new check-ins.",
    blocks,
  ].join("\n\n");
}
