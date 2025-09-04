import { tasks, users, proposals } from "@/lib/placeholder-data";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Clock, DollarSign, MapPin, MessageSquare, User } from "lucide-react";
import Link from "next/link";

export default function TaskDetailPage({ params }: { params: { id: string, locale: string } }) {
  const task = tasks.find((t) => t.id === `task-${params.id}`);
  const client = users.find((u) => u.id === task?.clientId);
  const matchedProviders = users.filter(u => u.isProvider).slice(0,3);

  if (!task || !client) {
    notFound();
  }

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <Badge variant="secondary" className="mb-2">{task.category}</Badge>
                <CardTitle className="text-3xl font-bold">{task.title}</CardTitle>
              </div>
              <Badge variant={task.status === "Open" ? "default" : "outline"} className="text-base">
                {task.status}
              </Badge>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2">
                <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{task.location}</span>
                </div>
                <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{task.budget}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Posted on {task.createdAt.toLocaleDateString()}</span>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed">{task.description}</p>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Matched Providers</CardTitle>
                <CardDescription>Providers who might be a good fit for this task.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {matchedProviders.map(provider => (
                    <div key={provider.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={provider.avatarUrl} data-ai-hint="person" />
                                <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{provider.name}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {provider.skills?.slice(0, 3).map(skill => (
                                        <Badge key={skill} variant="outline">{skill}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <Button variant="secondary" asChild>
                            <Link href={`/${params.locale}/messages`}>
                                <MessageSquare className="mr-2 h-4 w-4"/>
                                Message
                            </Link>
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={client.avatarUrl} data-ai-hint="person" />
                    <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle>{client.name}</CardTitle>
                    <CardDescription>Client</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <Button className="w-full">
                    <User className="mr-2 h-4 w-4" />
                    View Profile
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
