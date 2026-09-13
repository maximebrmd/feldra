"use client";
// EXAMPLE RESOURCE UI. Remove with lib/notes and api/notes.
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
export function NoteEditor({
  note,
}: {
  note?: { id: string; title: string; body: string };
}) {
  const fieldId = useId();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  async function mutate(
    method: string,
    body?: { title: FormDataEntryValue | null; body: FormDataEntryValue | null }
  ) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/notes${note ? `/${note.id}` : ""}`, {
        body: body ? JSON.stringify(body) : undefined,
        headers: { "Content-Type": "application/json" },
        method,
      });
      if (!response.ok) {
        throw new Error((await response.json()).error);
      }
      setMessage(method === "DELETE" ? "Note deleted." : "Note saved.");
      router.refresh();
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save.");
      return false;
    } finally {
      setBusy(false);
    }
  }
  const submitLabel = note ? "Save changes" : "Add note";
  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        if (
          (await mutate(note ? "PATCH" : "POST", {
            body: data.get("body"),
            title: data.get("title"),
          })) &&
          !note
        ) {
          form.reset();
        }
      }}
    >
      <label className="field" htmlFor={`${fieldId}-title`}>
        Title
        <Input
          defaultValue={note?.title}
          id={`${fieldId}-title`}
          maxLength={120}
          name="title"
          placeholder="An idea worth keeping"
          required
        />
      </label>
      <label className="field">
        Note
        <textarea
          className="textarea"
          defaultValue={note?.body}
          maxLength={5000}
          name="body"
          placeholder="Start anywhere…"
        />
      </label>
      {Boolean(error) && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}
      {Boolean(message) && (
        <p className="text-sm" role="status">
          {message}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button disabled={busy} type="submit">
          {busy ? "Saving…" : <span>{submitLabel}</span>}
        </Button>
        {Boolean(note) && (
          <Button
            disabled={busy}
            onClick={() => setConfirmDelete(!confirmDelete)}
            type="button"
            variant="outline"
          >
            {confirmDelete ? "Keep note" : "Delete"}
          </Button>
        )}
        {Boolean(confirmDelete) && (
          <Button
            disabled={busy}
            onClick={() => mutate("DELETE")}
            type="button"
            variant="destructive"
          >
            Confirm delete
          </Button>
        )}
      </div>
    </form>
  );
}
