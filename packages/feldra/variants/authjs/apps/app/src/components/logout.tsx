import { signOut } from "@repo/auth/auth";
import { Button } from "@repo/design-system/components/ui/button";
export function Logout() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <Button type="submit" variant="ghost">
        Sign out
      </Button>
    </form>
  );
}
