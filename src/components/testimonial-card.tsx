'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  name: string;
  role: string;
  avatarUrl: string;
  avatarFallback: string;
  testimonial: string;
}

export default function TestimonialCard({
  name,
  role,
  avatarUrl,
  avatarFallback,
  testimonial,
}: TestimonialCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-0.5 mb-4">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ))}
        </div>
        <blockquote className="italic text-foreground/80">
            "{testimonial}"
        </blockquote>
      </CardContent>
      <CardHeader className="pt-0 flex flex-row items-center gap-4">
        <Avatar>
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </CardHeader>
    </Card>
  );
}
