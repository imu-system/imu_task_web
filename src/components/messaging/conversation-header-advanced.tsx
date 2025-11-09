'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Phone,
  Video,
  Search,
  MoreVertical,
  ArrowLeft,
  Info,
  Star,
  Bell,
  BellOff,
  Archive,
  Trash2,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon,
  X,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useRouter } from '@/navigation';

interface ConversationHeaderAdvancedProps {
  contactName: string;
  contactAvatar?: string;
  contactStatus?: 'online' | 'offline' | 'typing';
  lastSeen?: Date | string;
  isStarred?: boolean;
  isMuted?: boolean;
  onBack?: () => void;
  onCall?: () => void;
  onVideoCall?: () => void;
  onSearch?: () => void;
  onToggleStar?: () => void;
  onToggleMute?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  sharedMedia?: Array<{
    id: string;
    type: 'image' | 'video' | 'document' | 'link';
    url: string;
    name?: string;
    thumbnail?: string;
    createdAt: Date | string;
  }>;
  threadId?: string;
}

export function ConversationHeaderAdvanced({
  contactName,
  contactAvatar,
  contactStatus = 'offline',
  lastSeen,
  isStarred = false,
  isMuted = false,
  onBack,
  onCall,
  onVideoCall,
  onSearch,
  onToggleStar,
  onToggleMute,
  onArchive,
  onDelete,
  sharedMedia = [],
  threadId,
}: ConversationHeaderAdvancedProps) {
  const t = useTranslations('messaging');
  const router = useRouter();
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  const formatLastSeen = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('justNow');
    if (minutes < 60) return t('lastSeenMinutes', { count: minutes });
    if (hours < 24) return t('lastSeenHours', { count: hours });
    if (days === 1) return t('yesterday');
    return d.toLocaleDateString();
  };

  const getStatusText = () => {
    if (contactStatus === 'online') return t('online');
    if (contactStatus === 'typing') return t('typing');
    if (lastSeen) return formatLastSeen(lastSeen);
    return '';
  };

  const mediaByType = {
    images: sharedMedia.filter((m) => m.type === 'image' || m.type === 'video'),
    documents: sharedMedia.filter((m) => m.type === 'document'),
    links: sharedMedia.filter((m) => m.type === 'link'),
  };

  return (
    <>
      {/* Main Header */}
      <div className="sticky top-0 z-10 bg-background border-b shadow-sm">
        <div className="flex items-center gap-3 p-3 max-w-4xl mx-auto">
          {/* Back Button (mobile) */}
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="lg:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}

          {/* Contact Info */}
          <div
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
            onClick={() => setShowInfoPanel(true)}
          >
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={contactAvatar} />
                <AvatarFallback>{contactName[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              {contactStatus === 'online' && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold truncate">{contactName}</h2>
                {isStarred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0" />}
                {isMuted && <BellOff className="w-4 h-4 text-muted-foreground shrink-0" />}
              </div>
              <p
                className={cn(
                  'text-xs truncate',
                  contactStatus === 'online'
                    ? 'text-green-600 font-medium'
                    : contactStatus === 'typing'
                    ? 'text-primary font-medium italic'
                    : 'text-muted-foreground'
                )}
              >
                {getStatusText()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {onVideoCall && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onVideoCall}
                className="hidden sm:flex"
              >
                <Video className="w-5 h-5" />
              </Button>
            )}

            {onCall && (
              <Button variant="ghost" size="icon" onClick={onCall}>
                <Phone className="w-5 h-5" />
              </Button>
            )}

            {onSearch && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onSearch}
                className="hidden sm:flex"
              >
                <Search className="w-5 h-5" />
              </Button>
            )}

            {/* More Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowInfoPanel(true)}>
                  <Info className="w-4 h-4 mr-2" />
                  {t('contactInfo')}
                </DropdownMenuItem>

                <DropdownMenuItem onClick={onSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  {t('searchInConversation')}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={onToggleStar}>
                  <Star
                    className={cn(
                      'w-4 h-4 mr-2',
                      isStarred && 'fill-yellow-500 text-yellow-500'
                    )}
                  />
                  {isStarred ? t('unstarConversation') : t('starConversation')}
                </DropdownMenuItem>

                <DropdownMenuItem onClick={onToggleMute}>
                  {isMuted ? (
                    <Bell className="w-4 h-4 mr-2" />
                  ) : (
                    <BellOff className="w-4 h-4 mr-2" />
                  )}
                  {isMuted ? t('unmute') : t('mute')}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={onArchive}>
                  <Archive className="w-4 h-4 mr-2" />
                  {t('archiveConversation')}
                </DropdownMenuItem>

                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('deleteConversation')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <Sheet open={showInfoPanel} onOpenChange={setShowInfoPanel}>
        <SheetContent className="w-full sm:max-w-md p-0">
          <div className="h-full flex flex-col">
            {/* Header with Avatar */}
            <div className="relative">
              <div className="absolute top-4 right-4 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowInfoPanel(false)}
                  className="rounded-full bg-background/80 backdrop-blur-sm"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="bg-gradient-to-b from-primary/10 to-background pt-16 pb-6 text-center">
                <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-background shadow-lg">
                  <AvatarImage src={contactAvatar} />
                  <AvatarFallback className="text-4xl">
                    {contactName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold mb-1">{contactName}</h2>
                <p className="text-sm text-muted-foreground">{getStatusText()}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex justify-around py-4 border-b">
              {onCall && (
                <Button variant="ghost" className="flex-col h-auto py-2" onClick={onCall}>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span className="text-xs">{t('call')}</span>
                </Button>
              )}

              {onVideoCall && (
                <Button variant="ghost" className="flex-col h-auto py-2" onClick={onVideoCall}>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                    <Video className="w-5 h-5" />
                  </div>
                  <span className="text-xs">{t('video')}</span>
                </Button>
              )}

              <Button variant="ghost" className="flex-col h-auto py-2" onClick={onSearch}>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                  <Search className="w-5 h-5" />
                </div>
                <span className="text-xs">{t('search')}</span>
              </Button>
            </div>

            {/* Shared Content Tabs */}
            <Tabs defaultValue="media" className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="w-full grid grid-cols-3 rounded-none border-b">
                <TabsTrigger value="media" className="gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('media')}</span>
                  <Badge variant="secondary" className="ml-1">
                    {mediaByType.images.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="documents" className="gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('documents')}</span>
                  <Badge variant="secondary" className="ml-1">
                    {mediaByType.documents.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="links" className="gap-2">
                  <LinkIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('links')}</span>
                  <Badge variant="secondary" className="ml-1">
                    {mediaByType.links.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              {/* Media Grid */}
              <TabsContent value="media" className="flex-1 overflow-hidden m-0">
                <ScrollArea className="h-full">
                  {mediaByType.images.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                      <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                      <p className="text-sm">{t('noMediaShared')}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1 p-1">
                      {mediaByType.images.map((media) => (
                        <div
                          key={media.id}
                          className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity"
                        >
                          <img
                            src={media.thumbnail || media.url}
                            alt={media.name || ''}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              {/* Documents List */}
              <TabsContent value="documents" className="flex-1 overflow-hidden m-0">
                <ScrollArea className="h-full">
                  {mediaByType.documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                      <FileText className="w-16 h-16 mb-4 opacity-20" />
                      <p className="text-sm">{t('noDocumentsShared')}</p>
                    </div>
                  ) : (
                    <div className="p-3 space-y-2">
                      {mediaByType.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/70 cursor-pointer transition-colors"
                        >
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button size="icon" variant="ghost">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              {/* Links List */}
              <TabsContent value="links" className="flex-1 overflow-hidden m-0">
                <ScrollArea className="h-full">
                  {mediaByType.links.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                      <LinkIcon className="w-16 h-16 mb-4 opacity-20" />
                      <p className="text-sm">{t('noLinksShared')}</p>
                    </div>
                  ) : (
                    <div className="p-3 space-y-2">
                      {mediaByType.links.map((link) => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 bg-muted rounded-lg hover:bg-muted/70 transition-colors"
                        >
                          <p className="text-sm font-medium text-primary truncate">
                            {link.name || link.url}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {link.url}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(link.createdAt).toLocaleDateString()}
                          </p>
                        </a>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>

            {/* Danger Zone */}
            <div className="border-t p-3 space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={onDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('deleteConversation')}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
