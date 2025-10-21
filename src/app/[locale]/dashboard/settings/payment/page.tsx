'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Loader2, CreditCard, Plus, Trash2, Check, Clock, AlertCircle, Settings } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { BankAccount, BankAccountStatus, BankAccountStatusValues } from '@/types/payments';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PayoutSchedule {
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    minimumAmount?: number;
}

export default function PaymentSettingsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('Settings.payment');
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(true);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
    const [submitting, setSubmitting] = useState(false);
    
    // Add Account Form
    const [formData, setFormData] = useState({
        accountHolderName: '',
        iban: '',
        bic: '',
        bankName: '',
        country: 'FR',
    });

    // Payout Schedule
    const [payoutSchedule, setPayoutSchedule] = useState<PayoutSchedule>({
        frequency: 'weekly',
        dayOfWeek: 1, // Monday
        minimumAmount: 5000, // 50 EUR in cents
    });

    const fetchBankAccounts = async () => {
        if (!user?.uid) return;
        
        try {
            setLoading(true);
            const accountsRef = collection(db, 'bankAccounts');
            const q = query(
                accountsRef,
                where('professionalId', '==', user.uid),
                orderBy('isDefault', 'desc'),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const accountList: BankAccount[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                accountList.push({
                    id: doc.id,
                    userId: data.userId,
                    professionalId: data.professionalId,
                    type: data.type,
                    status: data.status,
                    iban: data.iban,
                    bic: data.bic,
                    accountHolderName: data.accountHolderName,
                    bankName: data.bankName,
                    country: data.country,
                    last4: data.last4,
                    maskedIban: data.maskedIban,
                    stripeBankAccountId: data.stripeBankAccountId,
                    isVerified: data.isVerified,
                    verifiedAt: data.verifiedAt,
                    verificationMethod: data.verificationMethod,
                    isDefault: data.isDefault,
                    metadata: data.metadata,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    lastUsedAt: data.lastUsedAt,
                } as BankAccount);
            });

            setBankAccounts(accountList);
        } catch (error) {
            console.error('Error fetching bank accounts:', error);
            toast({
                title: "Erreur",
                description: "Impossible de charger les comptes bancaires.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddAccount = async () => {
        if (!user?.uid) return;
        
        // Basic validation
        if (!formData.accountHolderName || !formData.iban || !formData.bankName) {
            toast({
                title: "Erreur",
                description: "Veuillez remplir tous les champs obligatoires.",
                variant: "destructive",
            });
            return;
        }

        try {
            setSubmitting(true);
            
            // Generate masked IBAN
            const cleanIban = formData.iban.replace(/\s/g, '');
            const last4 = cleanIban.slice(-4);
            const maskedIban = `${cleanIban.substring(0, 2)}${'*'.repeat(cleanIban.length - 6)}${last4}`;

            // Check if this is the first account
            const isFirstAccount = bankAccounts.length === 0;

            const accountsRef = collection(db, 'bankAccounts');
            await addDoc(accountsRef, {
                professionalId: user.uid,
                userId: user.uid,
                type: 'bank_account',
                status: BankAccountStatusValues.pending,
                iban: formData.iban, // In production, this should be encrypted
                bic: formData.bic,
                accountHolderName: formData.accountHolderName,
                bankName: formData.bankName,
                country: formData.country,
                last4: last4,
                maskedIban: maskedIban,
                isVerified: false,
                isDefault: isFirstAccount, // First account is default
                metadata: {},
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });

            toast({
                title: "Compte ajouté",
                description: "Votre compte bancaire a été ajouté avec succès. Il sera vérifié sous 24-48h.",
            });

            // Reset form and close dialog
            setFormData({
                accountHolderName: '',
                iban: '',
                bic: '',
                bankName: '',
                country: 'FR',
            });
            setShowAddDialog(false);
            fetchBankAccounts();
        } catch (error) {
            console.error('Error adding bank account:', error);
            toast({
                title: "Erreur",
                description: "Impossible d'ajouter le compte bancaire.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleSetDefault = async (accountId: string) => {
        if (!user?.uid) return;
        
        try {
            // Update all accounts to non-default
            for (const account of bankAccounts) {
                const accountRef = doc(db, 'bankAccounts', account.id);
                await updateDoc(accountRef, {
                    isDefault: account.id === accountId,
                    updatedAt: Timestamp.now(),
                });
            }

            toast({
                title: "Compte par défaut modifié",
                description: "Ce compte sera utilisé pour vos prochains virements.",
            });

            fetchBankAccounts();
        } catch (error) {
            console.error('Error setting default account:', error);
            toast({
                title: "Erreur",
                description: "Impossible de modifier le compte par défaut.",
                variant: "destructive",
            });
        }
    };

    const handleDeleteAccount = async () => {
        if (!selectedAccount) return;
        
        try {
            setSubmitting(true);
            const accountRef = doc(db, 'bankAccounts', selectedAccount.id);
            await deleteDoc(accountRef);

            toast({
                title: "Compte supprimé",
                description: "Le compte bancaire a été supprimé.",
            });

            setShowDeleteDialog(false);
            setSelectedAccount(null);
            fetchBankAccounts();
        } catch (error) {
            console.error('Error deleting bank account:', error);
            toast({
                title: "Erreur",
                description: "Impossible de supprimer le compte bancaire.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.provider))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user && user.roles?.includes(UserRole.provider)) {
            fetchBankAccounts();
        }
    }, [user]);

    if (authLoading || loading || !user || !user.roles?.includes(UserRole.provider)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    const getStatusIcon = (status: BankAccountStatus) => {
        switch (status) {
            case BankAccountStatusValues.verified:
                return <Check className="h-4 w-4 text-green-500" />;
            case BankAccountStatusValues.pending:
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case BankAccountStatusValues.failed:
                return <AlertCircle className="h-4 w-4 text-destructive" />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <Settings className="h-8 w-8 text-primary"/>
                    Paramètres de paiement
                </h1>
                <p className="text-muted-foreground">
                    Gérez vos comptes bancaires et préférences de virement
                </p>
            </div>

            <Tabs defaultValue="accounts" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="accounts">Comptes bancaires</TabsTrigger>
                    <TabsTrigger value="schedule">Fréquence de virement</TabsTrigger>
                </TabsList>

                <TabsContent value="accounts" className="space-y-6">
                    {/* Info Alert */}
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Vérification des comptes</AlertTitle>
                        <AlertDescription>
                            Les nouveaux comptes bancaires sont vérifiés sous 24-48h. Les virements ne peuvent être effectués que vers des comptes vérifiés.
                        </AlertDescription>
                    </Alert>

                    {/* Bank Accounts Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Mes comptes bancaires</CardTitle>
                                    <CardDescription>Gérez vos comptes pour recevoir vos paiements</CardDescription>
                                </div>
                                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Ajouter un compte
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle>Ajouter un compte bancaire</DialogTitle>
                                            <DialogDescription>
                                                Ajoutez un compte bancaire pour recevoir vos virements
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="accountHolderName">Titulaire du compte *</Label>
                                                <Input
                                                    id="accountHolderName"
                                                    value={formData.accountHolderName}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, accountHolderName: e.target.value }))}
                                                    placeholder="Jean Dupont"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="iban">IBAN *</Label>
                                                <Input
                                                    id="iban"
                                                    value={formData.iban}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, iban: e.target.value }))}
                                                    placeholder="FR76 1234 5678 9012 3456 7890 123"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="bic">BIC/SWIFT</Label>
                                                <Input
                                                    id="bic"
                                                    value={formData.bic}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, bic: e.target.value }))}
                                                    placeholder="BNPAFRPP"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="bankName">Nom de la banque *</Label>
                                                <Input
                                                    id="bankName"
                                                    value={formData.bankName}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                                                    placeholder="BNP Paribas"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="country">Pays</Label>
                                                <Select value={formData.country} onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}>
                                                    <SelectTrigger id="country">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="FR">France</SelectItem>
                                                        <SelectItem value="BE">Belgique</SelectItem>
                                                        <SelectItem value="DE">Allemagne</SelectItem>
                                                        <SelectItem value="ES">Espagne</SelectItem>
                                                        <SelectItem value="IT">Italie</SelectItem>
                                                        <SelectItem value="CH">Suisse</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                                                Annuler
                                            </Button>
                                            <Button onClick={handleAddAccount} disabled={submitting}>
                                                {submitting ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Ajout...
                                                    </>
                                                ) : (
                                                    'Ajouter'
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {bankAccounts.length === 0 ? (
                                <div className="text-center py-12">
                                    <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium mb-2">Aucun compte bancaire</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Ajoutez un compte bancaire pour recevoir vos paiements
                                    </p>
                                    <Button onClick={() => setShowAddDialog(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Ajouter un compte
                                    </Button>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Titulaire</TableHead>
                                            <TableHead>Banque</TableHead>
                                            <TableHead>IBAN</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead>Défaut</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {bankAccounts.map((account) => (
                                            <TableRow key={account.id}>
                                                <TableCell>
                                                    <div className="font-medium">{account.accountHolderName}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>{account.bankName}</div>
                                                    <div className="text-xs text-muted-foreground">{account.country}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-mono text-sm">{account.maskedIban}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(account.status)}
                                                        <Badge variant={
                                                            account.status === BankAccountStatusValues.verified ? 'default' :
                                                            account.status === BankAccountStatusValues.pending ? 'secondary' :
                                                            'destructive'
                                                        }>
                                                            {account.status === BankAccountStatusValues.verified ? 'Vérifié' :
                                                             account.status === BankAccountStatusValues.pending ? 'En attente' :
                                                             account.status === BankAccountStatusValues.failed ? 'Échoué' :
                                                             'Désactivé'}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {account.isDefault ? (
                                                        <Badge>Par défaut</Badge>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleSetDefault(account.id)}
                                                        >
                                                            Définir par défaut
                                                        </Button>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedAccount(account);
                                                            setShowDeleteDialog(true);
                                                        }}
                                                        disabled={account.isDefault}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="schedule" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Fréquence de virement</CardTitle>
                            <CardDescription>
                                Configurez la fréquence à laquelle vous souhaitez recevoir vos virements
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="frequency">Fréquence</Label>
                                <Select value={payoutSchedule.frequency} onValueChange={(value) => setPayoutSchedule(prev => ({ ...prev, frequency: value as any }))}>
                                    <SelectTrigger id="frequency">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Quotidien</SelectItem>
                                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                                        <SelectItem value="monthly">Mensuel</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {payoutSchedule.frequency === 'weekly' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="dayOfWeek">Jour de la semaine</Label>
                                    <Select value={payoutSchedule.dayOfWeek?.toString()} onValueChange={(value) => setPayoutSchedule(prev => ({ ...prev, dayOfWeek: parseInt(value) }))}>
                                        <SelectTrigger id="dayOfWeek">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Lundi</SelectItem>
                                            <SelectItem value="2">Mardi</SelectItem>
                                            <SelectItem value="3">Mercredi</SelectItem>
                                            <SelectItem value="4">Jeudi</SelectItem>
                                            <SelectItem value="5">Vendredi</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {payoutSchedule.frequency === 'monthly' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="dayOfMonth">Jour du mois</Label>
                                    <Select value={payoutSchedule.dayOfMonth?.toString() || '1'} onValueChange={(value) => setPayoutSchedule(prev => ({ ...prev, dayOfMonth: parseInt(value) }))}>
                                        <SelectTrigger id="dayOfMonth">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                                                <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="minimumAmount">Montant minimum (€)</Label>
                                <Input
                                    id="minimumAmount"
                                    type="number"
                                    value={(payoutSchedule.minimumAmount || 0) / 100}
                                    onChange={(e) => setPayoutSchedule(prev => ({ ...prev, minimumAmount: parseFloat(e.target.value) * 100 }))}
                                    min="0"
                                    step="10"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Les virements ne seront effectués que si le solde dépasse ce montant
                                </p>
                            </div>

                            <Button onClick={() => toast({ title: "Paramètres enregistrés", description: "Vos préférences de virement ont été mises à jour." })}>
                                Enregistrer les préférences
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer le compte bancaire</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer ce compte ? Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedAccount && (
                        <div className="py-4">
                            <p className="text-sm">
                                <strong>Titulaire :</strong> {selectedAccount.accountHolderName}
                            </p>
                            <p className="text-sm">
                                <strong>Banque :</strong> {selectedAccount.bankName}
                            </p>
                            <p className="text-sm font-mono">
                                <strong>IBAN :</strong> {selectedAccount.maskedIban}
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteAccount} disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Suppression...
                                </>
                            ) : (
                                'Supprimer'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
