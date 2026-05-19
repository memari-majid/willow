import type { WikiReviewStatus } from "@/lib/wiki/types";

export function WikiReviewBadge({
  status,
  reviewedBy,
  reviewedAt,
}: {
  status: WikiReviewStatus;
  reviewedBy?: string;
  reviewedAt?: string;
}) {
  if (status === "reviewed") {
    return (
      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
        Reviewed{reviewedAt ? ` · ${reviewedAt}` : ""}
        {reviewedBy && !/pending/i.test(reviewedBy) ? ` · ${reviewedBy}` : ""}
      </span>
    );
  }
  return (
    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:text-amber-400">
      Draft — pending SME review
    </span>
  );
}
