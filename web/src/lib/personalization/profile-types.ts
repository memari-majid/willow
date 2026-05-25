export type UserMemoryRow = {
  id: string;
  userId: string;
  kind: string;
  content: string;
  source: string;
  conversationId: string | null;
  pinned: boolean;
  createdAt: Date;
};
