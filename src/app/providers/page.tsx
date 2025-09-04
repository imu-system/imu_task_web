import Link from "next/link"
import { Star, MessageSquare } from "lucide-react"
import { users } from "@/lib/placeholder-data"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function ProvidersPage() {
  const providers = users.filter(user => user.isProvider);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Find Service Providers</h1>
        <p className="text-muted-foreground">Browse our community of skilled professionals.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {providers.map(provider => (
          <Card key={provider.id} className="flex flex-col">
            <CardHeader className="items-center text-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={provider.avatarUrl} alt={provider.name} data-ai-hint="person portrait"/>
                <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle>{provider.name}</CardTitle>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span>4.9 (82 reviews)</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground text-center mb-4 min-h-[40px]">
                {provider.profileDescription?.substring(0, 100)}...
              </p>
              <div className="text-center">
                <h4 className="font-semibold mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2 justify-center">
                  {provider.skills?.slice(0, 4).map(skill => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col sm:flex-row gap-2">
              <Button asChild className="w-full">
                <Link href="/profile">View Profile</Link>
              </Button>
              <Button asChild variant="secondary" className="w-full">
                <Link href="/messages">
                  <MessageSquare className="mr-2 h-4 w-4" /> Message
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
