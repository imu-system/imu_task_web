
'use client';

import { ThreadRightPanel } from "@/components/thread-right-panel";
import { useParams } from "next/navigation";

export default function ThreadDetailLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { threadId } = useParams<{ threadId: string }>();

    return (
        <div className="flex h-full">
            <div className="flex-1">{children}</div>
            <ThreadRightPanel threadId={threadId} />
        </div>
    );
}
