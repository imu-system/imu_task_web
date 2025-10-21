'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Link, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useMemo } from 'react';
import { Loader2, AlertTriangle, CheckCircle, XCircle, MoreHorizontal, Eye, Clock, FileText, Calendar as CalendarIcon, Upload, MessageSquare } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Dispute, DisputeStatus, DisputeStatusValues, DisputeNote, DisputeEvidence, formatAmount } from '@/types/payments';
import { collection, query, where, orderBy, limit, getDocs, startAfter, Timestamp, QueryDocumentSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Analytics {
    totalDisputes: number;
    openDisputes: number;
    underReviewCount: number;
    wonCount: number;
    lostCount: number;
}

export default function AdminDisputesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminPaymentsPage.disputes');
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(true);
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [analytics, setAnalytics] = useState<Analytics>({
        totalDisputes: 0,
        openDisputes: 0,
        underReviewCount: 0,
        wonCount: 0,
        lostCount: 0,
    });
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<DisputeStatus | 'all'>('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    
    // Dialog states
    const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showNoteDialog, setShowNoteDialog] = useState(false);
    const [noteContent, setNoteContent] = useState('');
    const [isInternalNote, setIsInternalNote] = useState(true);

    // Fetch disputes from Firestore
    const fetchDisputes = async (loadMore = false) => {
        try {
            setLoading(true);
            const disputesRef = collection(db, 'disputes');
            let q = query(disputesRef, orderBy('createdAt', 'desc'), limit(25));

            // Apply filters
            if (statusFilter !== 'all') {
                q = query(disputesRef, where('status', '==', statusFilter), orderBy('createdAt', 'desc'), limit(25));
            }
            if (dateRange?.from) {
                const fromTimestamp = Timestamp.fromDate(dateRange.from);
                q = query(q, where('createdAt', '>=', fromTimestamp));
            }
            if (dateRange?.to) {
                const toTimestamp = Timestamp.fromDate(dateRange.to);
                q = query(q, where('createdAt', '<=', toTimestamp));
            }

            // Pagination
            if (loadMore && lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            const querySnapshot = await getDocs(q);
            const disputeList: Dispute[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                disputeList.push({
                    id: doc.id,
                    transactionId: data.transactionId,
                    paymentIntentId: data.paymentIntentId,
                    chargeId: data.chargeId,
                    userId: data.userId,
                    professionalId: data.professionalId,
                    amount: data.amount,
                    currency: data.currency,
                    reason: data.reason,
                    status: data.status,
                    description: data.description,
                    stripeDisputeId: data.stripeDisputeId,
                    evidence: data.evidence || [],
                    customerEvidence: data.customerEvidence,
                    notes: data.notes || [],
                    dueBy: data.dueBy,
                    respondBy: data.respondBy,
                    resolvedAt: data.resolvedAt,
                    resolvedBy: data.resolvedBy,
                    resolution: data.resolution,
                    outcome: data.outcome,
                    metadata: data.metadata,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    closedAt: data.closedAt,
                } as Dispute);
            });

            if (loadMore) {
                setDisputes(prev => [...prev, ...disputeList]);
            } else {
                setDisputes(disputeList);
                calculateAnalytics(disputeList);
            }

            setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
            setHasMore(querySnapshot.docs.length === 25);
        } catch (error) {
            console.error('Error fetching disputes:', error);
            toast({
                title: "Erreur",
                description: "Impossible de charger les litiges.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const calculateAnalytics = (disputeList: Dispute[]) => {
        const totalDisputes = disputeList.length;
        const openDisputes = disputeList.filter(d => 
            d.status === DisputeStatusValues.opened || 
            d.status === DisputeStatusValues.under_review || 
            d.status === DisputeStatusValues.waiting_response
        ).length;
        const underReviewCount = disputeList.filter(d => d.status === DisputeStatusValues.under_review).length;
        const wonCount = disputeList.filter(d => d.status === DisputeStatusValues.won).length;
        const lostCount = disputeList.filter(d => d.status === DisputeStatusValues.lost).length;

        setAnalytics({
            totalDisputes,
            openDisputes,
            underReviewCount,
            wonCount,
            lostCount,
        });
    };

    const filteredDisputes = useMemo(() => {
        return disputes.filter(dispute => {
            const matchesSearch = searchTerm ? 
                dispute.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                dispute.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dispute.stripeDisputeId?.toLowerCase().includes(searchTerm.toLowerCase()) : true;
            return matchesSearch;
        });
    }, [disputes, searchTerm]);

    const clearFilters = () => {
        setStatusFilter('all');
        setDateRange(undefined);
        setSearchTerm('');
    };

    const handleUpdateStatus = async (disputeId: string, newStatus: DisputeStatus) => {
        if (!user) return;
        
        try {
            const disputeRef = doc(db, 'disputes', disputeId);
            const updateData: any = {
                status: newStatus,
                updatedAt: Timestamp.now(),
            };

            // Si fermé ou résolu
            if (newStatus === DisputeStatusValues.closed || 
                newStatus === DisputeStatusValues.won || 
                newStatus === DisputeStatusValues.lost) {
                updateData.closedAt = Timestamp.now();
                updateData.resolvedBy = user.uid;
            }

            await updateDoc(disputeRef, updateData);
            
            toast({
                title: "Statut mis à jour",
                description: `Le litige est maintenant : ${newStatus}`,
            });
            
            // Refresh list
            fetchDisputes();
        } catch (error) {
            console.error('Error updating dispute status:', error);
            toast({
                title: "Erreur",
                description: "Impossible de mettre à jour le statut.",
                variant: "destructive",
            });
        }
    };

    const handleAddNote = async () => {
        if (!user || !selectedDispute || !noteContent.trim()) {
            toast({
                title: "Erreur",
                description: "Veuillez saisir une note.",
                variant: "destructive",
            });
            return;
        }
        
        try {
            const newNote: DisputeNote = {
                id: `note_${Date.now()}`,
                content: noteContent,
                authorId: user.uid,
                authorName: user.displayName || user.email || 'Admin',
                isInternal: isInternalNote,
                createdAt: Timestamp.now(),
            };

            const disputeRef = doc(db, 'disputes', selectedDispute.id);
            await updateDoc(disputeRef, {
                notes: arrayUnion(newNote),
                updatedAt: Timestamp.now(),
            });
            
            toast({
                title: "Note ajoutée",
                description: "La note a été enregistrée.",
            });
            
            setShowNoteDialog(false);
            setNoteContent('');
            setIsInternalNote(true);
            
            // Refresh list
            fetchDisputes();
        } catch (error) {
            console.error('Error adding note:', error);
            toast({
                title: "Erreur",
                description: "Impossible d'ajouter la note.",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user && user.roles?.includes(UserRole.admin)) {
            fetchDisputes();
        }
    }, [statusFilter, dateRange]);

    if (authLoading || loading || !user || !user.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    const getStatusVariant = (status: DisputeStatus): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case DisputeStatusValues.won: 
                return 'default';
            case DisputeStatusValues.opened:
            case DisputeStatusValues.under_review:
            case DisputeStatusValues.waiting_response:
                return 'secondary';
            case DisputeStatusValues.lost:
                return 'destructive';
            case DisputeStatusValues.closed:
                return 'outline';
            default: 
                return 'outline';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <AlertTriangle className="h-8 w-8 text-primary"/>
                    Litiges
                </h1>
                <p className="text-muted-foreground">
                    Gestion des contestations et litiges de paiement
                </p>
            </div>

            {/* Analytics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Litiges</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalDisputes}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ouverts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.openDisputes}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">En examen</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.underReviewCount}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gagnés</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.wonCount}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Perdus</CardTitle>
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.lostCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Liste des litiges</CardTitle>
                    <CardDescription>Gérez les contestations de paiement et ajoutez des notes</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Input
                                placeholder="Rechercher par ID, transaction..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-sm"
                            />
                            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as DisputeStatus | 'all')}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    <SelectItem value={DisputeStatusValues.opened}>Ouvert</SelectItem>
                                    <SelectItem value={DisputeStatusValues.under_review}>En examen</SelectItem>
                                    <SelectItem value={DisputeStatusValues.waiting_response}>En attente réponse</SelectItem>
                                    <SelectItem value={DisputeStatusValues.won}>Gagné</SelectItem>
                                    <SelectItem value={DisputeStatusValues.lost}>Perdu</SelectItem>
                                    <SelectItem value={DisputeStatusValues.closed}>Fermé</SelectItem>
                                </SelectContent>
                            </Select>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(dateRange.from, "dd/MM/yy")} - {format(dateRange.to, "dd/MM/yy")}
                                                </>
                                            ) : (
                                                format(dateRange.from, "dd/MM/yyyy")
                                            )
                                        ) : (
                                            <span>Période</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={setDateRange}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                            {(statusFilter !== 'all' || dateRange || searchTerm) && (
                                <Button variant="ghost" onClick={clearFilters}>
                                    Réinitialiser
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID Litige</TableHead>
                                <TableHead>Transaction</TableHead>
                                <TableHead>Raison</TableHead>
                                <TableHead>Montant</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredDisputes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                        Aucun litige trouvé
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredDisputes.map((dispute) => (
                                    <TableRow key={dispute.id}>
                                        <TableCell>
                                            <div className="font-mono text-xs">{dispute.id.substring(0, 12)}...</div>
                                            {dispute.stripeDisputeId && (
                                                <div className="font-mono text-[10px] text-muted-foreground">
                                                    {dispute.stripeDisputeId.substring(0, 12)}...
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-mono text-xs">{dispute.transactionId.substring(0, 12)}...</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{dispute.reason}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{formatAmount(dispute.amount)}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(dispute.status)}>
                                                {dispute.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {format(dispute.createdAt.toDate(), 'dd/MM/yyyy')}
                                            </div>
                                            {dispute.dueBy && (
                                                <div className="text-[10px] text-destructive">
                                                    Échéance: {format(dispute.dueBy.toDate(), 'dd/MM/yyyy')}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedDispute(dispute);
                                                        setShowDetailsDialog(true);
                                                    }}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Voir détails
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedDispute(dispute);
                                                        setShowNoteDialog(true);
                                                    }}>
                                                        <MessageSquare className="mr-2 h-4 w-4" />
                                                        Ajouter note
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuSeparator />
                                                    
                                                    <DropdownMenuItem 
                                                        onClick={() => handleUpdateStatus(dispute.id, DisputeStatusValues.under_review)}
                                                        disabled={dispute.status === DisputeStatusValues.under_review}
                                                    >
                                                        <Clock className="mr-2 h-4 w-4" />
                                                        Mettre en examen
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuItem 
                                                        onClick={() => handleUpdateStatus(dispute.id, DisputeStatusValues.won)}
                                                        disabled={dispute.status === DisputeStatusValues.won}
                                                    >
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Marquer gagné
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuItem 
                                                        onClick={() => handleUpdateStatus(dispute.id, DisputeStatusValues.lost)}
                                                        disabled={dispute.status === DisputeStatusValues.lost}
                                                    >
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        Marquer perdu
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuSeparator />
                                                    
                                                    <DropdownMenuItem 
                                                        onClick={() => handleUpdateStatus(dispute.id, DisputeStatusValues.closed)}
                                                        disabled={dispute.status === DisputeStatusValues.closed}
                                                    >
                                                        Fermer
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Load More */}
                    {hasMore && (
                        <div className="flex justify-center mt-6">
                            <Button 
                                onClick={() => fetchDisputes(true)} 
                                disabled={loading}
                                variant="outline"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Chargement...
                                    </>
                                ) : (
                                    'Charger plus'
                                )}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Details Dialog */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="max-w-3xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>Détails du litige</DialogTitle>
                        <DialogDescription>
                            {selectedDispute && `Litige #${selectedDispute.id.substring(0, 12)}`}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedDispute && (
                        <ScrollArea className="h-[500px] pr-4">
                            <Tabs defaultValue="info">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="info">Informations</TabsTrigger>
                                    <TabsTrigger value="evidence">Preuves ({selectedDispute.evidence.length})</TabsTrigger>
                                    <TabsTrigger value="notes">Notes ({selectedDispute.notes.length})</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="info" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Transaction ID</Label>
                                            <p className="font-mono text-sm">{selectedDispute.transactionId}</p>
                                        </div>
                                        <div>
                                            <Label>Montant disputé</Label>
                                            <p className="font-semibold">{formatAmount(selectedDispute.amount)}</p>
                                        </div>
                                        <div>
                                            <Label>Raison</Label>
                                            <Badge variant="outline">{selectedDispute.reason}</Badge>
                                        </div>
                                        <div>
                                            <Label>Statut</Label>
                                            <Badge variant={getStatusVariant(selectedDispute.status)}>
                                                {selectedDispute.status}
                                            </Badge>
                                        </div>
                                        {selectedDispute.description && (
                                            <div className="col-span-2">
                                                <Label>Description</Label>
                                                <p className="text-sm text-muted-foreground">{selectedDispute.description}</p>
                                            </div>
                                        )}
                                        {selectedDispute.dueBy && (
                                            <div>
                                                <Label>Date limite réponse</Label>
                                                <p className="text-sm text-destructive">
                                                    {format(selectedDispute.dueBy.toDate(), 'dd/MM/yyyy HH:mm')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                                
                                <TabsContent value="evidence" className="space-y-4">
                                    {selectedDispute.evidence.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-8">
                                            Aucune preuve téléchargée
                                        </p>
                                    ) : (
                                        selectedDispute.evidence.map((ev) => (
                                            <Card key={ev.id}>
                                                <CardContent className="pt-4">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <p className="font-medium">{ev.fileName}</p>
                                                            <p className="text-sm text-muted-foreground">{ev.description}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Téléchargé le {format(ev.uploadedAt.toDate(), 'dd/MM/yyyy HH:mm')}
                                                            </p>
                                                        </div>
                                                        <Button variant="outline" size="sm" asChild>
                                                            <a href={ev.url} target="_blank" rel="noopener noreferrer">
                                                                Voir
                                                            </a>
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </TabsContent>
                                
                                <TabsContent value="notes" className="space-y-4">
                                    {selectedDispute.notes.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-8">
                                            Aucune note
                                        </p>
                                    ) : (
                                        selectedDispute.notes.map((note) => (
                                            <Card key={note.id}>
                                                <CardContent className="pt-4">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <p className="font-medium">{note.authorName}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {format(note.createdAt.toDate(), 'dd/MM/yyyy HH:mm')}
                                                            </p>
                                                        </div>
                                                        {note.isInternal && (
                                                            <Badge variant="secondary" className="text-xs">Interne</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm">{note.content}</p>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </TabsContent>
                            </Tabs>
                        </ScrollArea>
                    )}
                </DialogContent>
            </Dialog>

            {/* Add Note Dialog */}
            <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ajouter une note</DialogTitle>
                        <DialogDescription>
                            Ajoutez une note pour ce litige
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="note-content">Note</Label>
                            <Textarea
                                id="note-content"
                                placeholder="Entrez votre note..."
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                rows={4}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="internal-note"
                                checked={isInternalNote}
                                onChange={(e) => setIsInternalNote(e.target.checked)}
                                className="rounded"
                                aria-label="Note interne"
                            />
                            <Label htmlFor="internal-note" className="cursor-pointer">
                                Note interne (visible seulement par les admins)
                            </Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setShowNoteDialog(false);
                            setNoteContent('');
                        }}>
                            Annuler
                        </Button>
                        <Button onClick={handleAddNote} disabled={!noteContent.trim()}>
                            Ajouter
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
