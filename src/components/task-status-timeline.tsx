
'use client';

import { cn } from "@/lib/utils";
import { TaskStatus } from "@/lib/types";
import { Check, CircleDot, Hourglass, FileText, Users } from "lucide-react";
import { useTranslations } from "next-intl";

interface TaskStatusTimelineProps {
    currentStatus: TaskStatus;
}

export default function TaskStatusTimeline({ currentStatus }: TaskStatusTimelineProps) {
    const t = useTranslations('TaskStatusTimeline');

    const statuses = [
        { status: TaskStatus.published, label: t('published'), icon: <FileText/> },
        { status: TaskStatus.partially_matched, label: t('partially_matched'), icon: <Users/> },
        { status: TaskStatus.matched, label: t('matched'), icon: <Check/> },
        { status: TaskStatus.in_progress, label: t('in_progress'), icon: <Hourglass/> },
        { status: TaskStatus.completed, label: t('completed'), icon: <CircleDot/> },
    ];

    const currentIndex = statuses.findIndex(s => s.status === currentStatus);
    const isCanceled = currentStatus === TaskStatus.canceled;

    return (
        <div className="w-full">
            <div className="flex justify-between items-center">
                {statuses.map((item, index) => {
                    // Don't show partially_matched if it's not the current status and we are past it.
                    if (item.status === TaskStatus.partially_matched && currentStatus !== TaskStatus.partially_matched && currentIndex > index) {
                        return null;
                    }
                    
                    const isActive = isCanceled ? false : index <= currentIndex;
                    const isCurrent = isCanceled ? false : index === currentIndex;

                    return (
                        <div key={item.status} className="flex-1 flex flex-col items-center relative">
                            <div 
                                className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all",
                                    isActive ? "bg-primary border-primary text-primary-foreground" : "bg-muted border-border text-muted-foreground",
                                    isCurrent && "ring-4 ring-primary/20"
                                )}
                            >
                                {item.icon}
                            </div>
                            <p className={cn("mt-2 text-xs text-center font-semibold", isActive ? "text-primary" : "text-muted-foreground")}>
                                {item.label}
                            </p>
                            {index < statuses.length - 1 && (
                                <div className={cn(
                                    "absolute top-5 left-1/2 w-full h-0.5",
                                    index < currentIndex ? "bg-primary" : "bg-border"
                                )} />
                            )}
                        </div>
                    )
                })}
            </div>
             {isCanceled && (
                <div className="text-center mt-4 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                    <p className="font-bold">{t('canceled')}</p>
                </div>
            )}
        </div>
    )
}
