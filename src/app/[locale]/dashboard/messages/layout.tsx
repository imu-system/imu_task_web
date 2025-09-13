
import { ThreadList } from './_components/thread-list';

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] border rounded-lg overflow-hidden">
      <ThreadList />
      <div className="flex-1">{children}</div>
    </div>
  );
}
