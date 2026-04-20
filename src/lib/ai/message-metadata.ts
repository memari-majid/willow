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
  /** True if the user's latest message tripped a safety keyword. */
  crisisDetected?: boolean;
  /** The matched keywords, if any (lowercased). */
  crisisKeywords?: string[];
  /** Slug of the model that produced this assistant message. */
  model?: string;
  /** Wall-clock time the message started streaming. */
  createdAt?: number;
};

export type WillowUIMessage = UIMessage<WillowMessageMetadata>;
