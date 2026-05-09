import { Bookmark } from "lucide-react";

export default function SavedPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
        Saved
      </h1>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 py-16 text-center sm:py-20">
        <Bookmark
          className="mb-3 size-10 text-muted-foreground/60"
          strokeWidth={1.25}
        />
        <p className="max-w-xs text-sm text-muted-foreground">
          No saved posts yet.
        </p>
      </div>
    </div>
  );
}
