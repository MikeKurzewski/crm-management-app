import { Button } from "@/components/ui/button";

export default function SmokeTestPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-background">
      <div className="bg-primary text-primary-foreground rounded-md px-4 py-2 font-semibold">
        Tailwind v4: This should look like a pill button (primary color, white text)
      </div>
      <Button variant="default" size="lg">
        shadcn/ui Button: This should look styled (not unstyled)
      </Button>
    </div>
  );
}
