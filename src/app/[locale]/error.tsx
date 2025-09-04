"use client";

export default function ErrorPage({ error }: { error: Error }) {
  return <h1>Error: {error.message}</h1>;
}
