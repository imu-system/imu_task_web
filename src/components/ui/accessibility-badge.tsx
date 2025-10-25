'use client';

import { Badge } from '@/components/ui/badge';
import { Accessibility } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccessibilityBadgeProps {
  className?: string;
  showIcon?: boolean;
  variant?: 'default' | 'outline' | 'secondary';
}

/**
 * Badge indicating PMR (Personnes à Mobilité Réduite) certified service
 * Display when ServiceCategory.isAccessible is true
 */
export function AccessibilityBadge({ 
  className, 
  showIcon = true,
  variant = 'secondary' 
}: AccessibilityBadgeProps) {
  return (
    <Badge 
      variant={variant}
      className={cn(
        "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
        "hover:bg-orange-500/20 transition-colors",
        className
      )}
    >
      {showIcon && <Accessibility className="h-3 w-3 mr-1" />}
      <span className="font-medium">Certifié PMR</span>
    </Badge>
  );
}

/**
 * Compact version with just the wheelchair icon
 */
export function AccessibilityIcon({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "inline-flex items-center justify-center",
        "text-orange-600 dark:text-orange-400",
        className
      )}
      title="Service accessible aux Personnes à Mobilité Réduite"
    >
      <Accessibility className="h-5 w-5" />
    </div>
  );
}
