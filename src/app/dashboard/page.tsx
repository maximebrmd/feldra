import { NoteEditor } from "@/components/note-editor";
import { listNotes } from "@/lib/notes";
import { pageUser } from "@/lib/page-user";
export default async function Dashboard() {
  const user = await pageUser();
  const notes = await listNotes(user.id);
  return (
    <>
      <p className="eyebrow">Your workspace</p>
      <h1 className="mt-3 text-4xl tracking-tight">
        A place for your thoughts.
      </h1>
      <p className="mt-3 text-muted-foreground">
        Welcome, {user.name}. These notes are only visible to you.
      </p>
      <div className="mt-10 grid items-start gap-8 md:grid-cols-[1fr_1.3fr]">
        <section className="panel">
          <h2 className="mb-6 font-semibold text-lg">Something new</h2>
          <NoteEditor />
        </section>
        <section aria-label="Your notes" className="grid gap-5">
          {notes.length === 0 && (
            <div className="rounded-2xl border border-dashed p-10 text-center">
              <p className="font-serif text-2xl">
                Every chapter starts somewhere.
              </p>
              <p className="mt-3 text-muted-foreground text-sm">
                Add your first note. You can edit or remove it any time.
              </p>
            </div>
          )}
          {notes.map((note) => (
            <article className="panel" key={note.id}>
              <NoteEditor
                note={{ body: note.body, id: note.id, title: note.title }}
              />
            </article>
          ))}
        </section>
      </div>
      <p className="mt-8 text-muted-foreground text-xs">
        Example resource · Notes are included to help you build your own
        product. Showing up to 100 recent notes.
      </p>
    </>
  );
}
