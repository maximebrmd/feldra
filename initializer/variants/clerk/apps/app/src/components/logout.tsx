"use client";
import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@repo/design-system/components/ui/button";
export function Logout() {
  return (
    <SignOutButton redirectUrl="/login">
      <Button variant="ghost">Sign out</Button>
    </SignOutButton>
  );
}
