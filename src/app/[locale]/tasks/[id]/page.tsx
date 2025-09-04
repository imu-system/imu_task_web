
export default function TaskDetailPage({ params }: { params: { id: string } }) {
  return <h1>Task Detail: {params.id}</h1>;
}
