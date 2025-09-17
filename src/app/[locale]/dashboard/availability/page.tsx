
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Repeat, CalendarPlus, Link as LinkIcon, Bot, Check, X, Clock as ClockIcon, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Link } from '@/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const timeSlots = ["08:00 - 12:00", "12:00 - 18:00", "18:00 - 22:00"];

// Mock availability data
const availabilityData = [
  [true, false, true, true, true, false, false],
  [true, true, false, true, true, true, true],
  [false, true, true, false, false, true, false],
];

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18px" height="18px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.565-3.108-11.127-7.462l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C39.99,34.556,44,29.86,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
)

const AppleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px" {...props} fill="currentColor">
       <path d="M16.142,4.334c0.165-0.155,0.293-0.342,0.378-0.55C16.24,2.77,15.446,2,14.512,2c-0.32,0-0.74,0.118-1.125,0.334 c-0.428,0.244-0.89,0.56-1.383,0.56c-0.473,0-0.908-0.315-1.324-0.56C10.292,2.118,9.873,2,9.553,2C8.618,2,7.824,2.77,7.545,3.784 c0.085,0.208,0.213,0.395,0.378,0.55C6.188,6.046,5,8.857,5,12.012c0,3.22,1.242,5.972,3,7.59c0.43,0.402,0.852,0.84,1.38,1.152 C9.86,20.91,10.291,21,10.662,21c0.46,0,0.848-0.18,1.282-0.528c0.018-0.013,0.033-0.029,0.05-0.045 c0.018-0.018,0.037-0.033,0.055-0.051c0.41-0.411,0.729-0.915,0.92-1.476c-0.598-0.327-1.074-0.789-1.42-1.398 c-0.418-0.713-0.638-1.58-0.638-2.583c0-0.342,0.033-0.684,0.096-1.014c0.559,0.003,1.121-0.16,1.678-0.492 c1.248-0.756,2.11-1.923,2.448-3.3C18.98,6.33,17.915,4.722,16.142,4.334z M13.111,10.518c0.049-1.395,0.745-2.61,1.558-3.256 c-0.006,0.003-0.012,0.007-0.018,0.01c-0.74,0.407-1.283,1.186-1.47,2.118C13.151,9.757,13.111,10.137,13.111,10.518z"/>
    </svg>
)

export default function AvailabilityPage() {
    const t = useTranslations('AvailabilityPage');
    const { user, loading } = useAuth();

    const isProvider = user?.roles?.includes(UserRole.provider);
    const days = [t('days.mon'), t('days.tue'), t('days.wed'), t('days.thu'), t('days.fri'), t('days.sat'), t('days.sun')];
    const recurringDays = [
      { id: 'mon', label: t('days.mon') },
      { id: 'tue', label: t('days.tue') },
      { id: 'wed', label: t('days.wed') },
      { id: 'thu', label: t('days.thu') },
      { id: 'fri', label: t('days.fri') },
      { id: 'sat', label: t('days.sat') },
      { id: 'sun', label: t('days.sun') },
    ];

    if (loading || !user) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-12 w-12"/></div>
    }

    if (!isProvider) {
         return (
            <div className="text-center p-8">
                <h2 className="text-xl font-semibold">{t('notProvider.title')}</h2>
                <p className="text-muted-foreground mt-2">{t('notProvider.description')}</p>
                 <Button asChild className="mt-4"><Link href="/dashboard/profile">{t('notProvider.button')}</Link></Button>
            </div>
        )
    }

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <Calendar className="h-8 w-8 text-primary"/>
                    {t('title')}
                </h1>
                <p className="text-muted-foreground">
                    {t('subtitle')}
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>{t('weekGrid.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                           <TableRow>
                                <TableHead className="w-[100px]">{t('weekGrid.time')}</TableHead>
                                {days.map(day => <TableHead key={day}>{day}</TableHead>)}
                           </TableRow>
                        </TableHeader>
                         <TableBody>
                            {timeSlots.map((slot, rowIndex) => (
                                <TableRow key={slot}>
                                    <TableCell className="font-medium">{slot}</TableCell>
                                    {availabilityData[rowIndex].map((isAvailable, colIndex) => (
                                        <TableCell key={colIndex}>
                                            <div className={cn(
                                                "w-full h-10 rounded-md",
                                                isAvailable ? "bg-green-200" : "bg-red-200/50"
                                            )}></div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('actions.title')}</CardTitle>
                </CardHeader>
                 <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline"><Repeat className="mr-2"/>{t('actions.recurring')}</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl">
                          <DialogHeader>
                              <DialogTitle>{t('recurringModal.title')}</DialogTitle>
                              <DialogDescription>{t('recurringModal.description')}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            {recurringDays.map(day => (
                              <div key={day.id} className="flex flex-col sm:flex-row items-center gap-4 p-3 border rounded-lg">
                                  <div className="flex items-center gap-3 w-full sm:w-40">
                                    <Checkbox id={`check-${day.id}`} defaultChecked/>
                                    <Label htmlFor={`check-${day.id}`} className="font-semibold">{day.label}</Label>
                                  </div>
                                  <div className="flex-1 grid grid-cols-2 gap-2 w-full">
                                    <Input type="time" defaultValue="08:00"/>
                                    <Input type="time" defaultValue="12:00"/>
                                  </div>
                              </div>
                            ))}
                             <div className="flex items-center space-x-2 pt-4">
                                <Checkbox id="auto-accept" />
                                <Label htmlFor="auto-accept">{t('recurringModal.autoAccept')}</Label>
                            </div>
                          </div>
                          <DialogFooter>
                              <DialogTrigger asChild>
                                  <Button variant="ghost">{t('recurringModal.cancel')}</Button>
                              </DialogTrigger>
                              <Button>{t('recurringModal.save')}</Button>
                          </DialogFooter>
                      </DialogContent>
                    </Dialog>
                     <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline"><CalendarPlus className="mr-2"/>{t('actions.exception')}</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t('exceptionModal.title')}</DialogTitle>
                                <DialogDescription>{t('exceptionModal.description')}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="exception-date">{t('exceptionModal.date')}</Label>
                                    <Input id="exception-date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="start-time">{t('exceptionModal.startTime')}</Label>
                                        <Input id="start-time" type="time" defaultValue="14:00" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="end-time">{t('exceptionModal.endTime')}</Label>
                                        <Input id="end-time" type="time" defaultValue="18:00" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="exception-type">{t('exceptionModal.type')}</Label>
                                    <Select defaultValue="blocked">
                                        <SelectTrigger id="exception-type">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="blocked">{t('exceptionModal.types.blocked')}</SelectItem>
                                            <SelectItem value="available">{t('exceptionModal.types.available')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="comment">{t('exceptionModal.comment')}</Label>
                                    <Textarea id="comment" placeholder={t('exceptionModal.commentPlaceholder')} />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogTrigger asChild>
                                    <Button variant="ghost">{t('exceptionModal.cancel')}</Button>
                                </DialogTrigger>
                                <Button>{t('exceptionModal.save')}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline"><LinkIcon className="mr-2"/>{t('actions.sync')}</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t('syncModal.title')}</DialogTitle>
                                <DialogDescription>{t('syncModal.description')}</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Button variant="outline"><GoogleIcon className="mr-2"/>{t('syncModal.google')}</Button>
                                <Button variant="outline"><AppleIcon className="mr-2"/>{t('syncModal.apple')}</Button>
                                <Button variant="secondary"><Share2 className="mr-2"/>{t('syncModal.export')}</Button>
                            </div>
                            <div className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
                                <p><strong>{t('syncModal.status.label')}:</strong> {t('syncModal.status.connected')}</p>
                                <p><strong>{t('syncModal.status.lastSync')}:</strong> {new Date().toLocaleString()}</p>
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="h-6 w-6 text-primary"/>
                        {t('suggestions.title')}
                    </CardTitle>
                    <CardDescription>{t('suggestions.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="p-3 bg-background rounded-lg border">
                        <p className="font-semibold">{t('suggestions.suggestion1.title')}</p>
                        <p className="text-sm text-muted-foreground">{t('suggestions.suggestion1.description')}</p>
                   </div>
                   <div className="p-3 bg-background rounded-lg border">
                        <p className="font-semibold">{t('suggestions.suggestion2.title')}</p>
                        <p className="text-sm text-muted-foreground">{t('suggestions.suggestion2.description')}</p>
                   </div>
                   <div className="flex gap-2 justify-end">
                       <Button variant="ghost"><X className="mr-2"/>{t('suggestions.ignore')}</Button>
                       <Button><Check className="mr-2"/>{t('suggestions.accept')}</Button>
                   </div>
                </CardContent>
            </Card>

        </div>
    )
}
