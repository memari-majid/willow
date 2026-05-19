import { markSafetyReviewedAction } from "@/app/admin/safety/actions";
import { Button } from "@/components/ui/button";

export function MarkReviewedForm({ eventId }: { eventId: string }) {
  return (
    <form action={markSafetyReviewedAction}>
      <input type="hidden" name="id" value={eventId} />
      <Button type="submit" size="sm" variant="secondary">
        Mark reviewed
      </Button>
    </form>
  );
}
