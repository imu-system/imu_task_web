
export default function MessageThreadPage({ params }: { params: { threadId: string } }) {
  return <h1>Message Thread: {params.threadId}</h1>;
}
