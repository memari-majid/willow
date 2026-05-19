/**
 * Custom message metadata Willow attaches to every assistant message.
 *
 * The server (`/api/chat`) populates this; the client reads it from
 * `message.metadata` to drive UI affordances like the crisis banner
 * and the model-name footer.
 *
 * Keeping the type in one shared file gives us end-to-end type safety
 * — both the route handler and `useChat<MyUIMessage>()` import from
 * here.
 */

import type { UIMessage } from "ai";

export type WillowMessageMetadata = {
  /** True if the user's latest message tripped a safety escalation path. */
  crisisDetected?: boolean;
  /** Keywords or classifier indicators. */
  crisisKeywords?: string[];
  /** Slug of the model that produced this assistant message. */
  model?: string;
  /** Wall-clock time the message started streaming. */
  createdAt?: number;
  /** Two-stage safety classifier outcome for this turn. */
  safetyLevel?: "green" | "yellow" | "red";
};

export type WillowUIMessage = UIMessage<WillowMessageMetadata>;
