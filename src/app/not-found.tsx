import Link from "next/link";
export default function NotFound() {
  return (
    <div className="shell py-20">
      <h1 className="text-3xl">This page isn’t here.</h1>
      <Link className="mt-6 inline-block underline" href="/">
        Go home
      </Link>
    </div>
  );
}
