import Link from "next/link"
import { Search } from "lucide-react"
import { conversations, messages as allMessages, users } from "@/lib/placeholder-data"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export default function MessagesPage() {
    const currentUser = users.find(u => u.id === 'user-2'); // Assuming current user is Bob
    if (!currentUser) return null;

  return (
    <div className="grid w-full min-h-[calc(100vh-8rem)] md:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <h2 className="font-semibold text-lg">Conversations</h2>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <div className="px-4 mb-4 relative">
                <Search className="absolute left-7 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search contacts..." className="pl-8" />
            </div>
            <nav className="grid items-start px-2 text-sm font-medium">
              {conversations.map(conv => {
                const otherParticipantId = conv.participant1Id === currentUser.id ? conv.participant2Id : conv.participant1Id;
                const otherParticipant = users.find(u => u.id === otherParticipantId);
                if (!otherParticipant) return null;

                return (
                  <Link
                    key={conv.id}
                    href="#"
                    className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
                  >
                     <Avatar className="h-8 w-8">
                        <AvatarImage src={otherParticipant.avatarUrl} alt={otherParticipant.name} data-ai-hint="person" />
                        <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-semibold">{otherParticipant.name}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-40">{conv.lastMessage.content}</span>
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                    <AvatarImage src="https://picsum.photos/100/100?random=1" alt="Alice Johnson" data-ai-hint="person"/>
                    <AvatarFallback>AJ</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-semibold">Alice Johnson</h3>
                    <p className="text-xs text-muted-foreground">Online</p>
                </div>
            </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <div className="flex-1 overflow-y-auto space-y-4 pr-4">
                {allMessages.filter(m => m.conversationId === 'conv-1').map(message => {
                    const isCurrentUser = message.senderId === currentUser.id;
                    const sender = users.find(u => u.id === message.senderId);
                    return (
                        <div key={message.id} className={cn("flex items-end gap-2", isCurrentUser ? "justify-end" : "justify-start")}>
                             {!isCurrentUser && (
                                 <Avatar className="h-8 w-8">
                                     <AvatarImage src={sender?.avatarUrl} alt={sender?.name} data-ai-hint="person portrait"/>
                                     <AvatarFallback>{sender?.name.charAt(0)}</AvatarFallback>
                                 </Avatar>
                             )}
                            <div className={cn("max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 text-sm", isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                <p>{message.content}</p>
                                <p className={cn("text-xs mt-1", isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground/70")}>
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            {isCurrentUser && (
                                 <Avatar className="h-8 w-8">
                                     <AvatarImage src={sender?.avatarUrl} alt={sender?.name} data-ai-hint="person"/>
                                     <AvatarFallback>{sender?.name.charAt(0)}</AvatarFallback>
                                 </Avatar>
                             )}
                        </div>
                    )
                })}
            </div>
          <div className="mt-auto border-t bg-background p-4">
            <div className="relative">
              <Textarea
                placeholder="Type your message..."
                className="min-h-12 resize-none border-0 p-3 pr-16 shadow-none focus-visible:ring-0"
              />
              <Button type="submit" size="sm" className="absolute right-3 top-3">
                Send
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
