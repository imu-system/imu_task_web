'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Loader2, CreditCard, Plus, Trash2, Check, Clock, Settings } from 'lucide-react';
import { PaymentMethodDetails, PaymentMethodStatus, PaymentMethodStatusValues, PaymentMethodValues } from '@/types/payments';
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

export default function BillingSettingsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('Settings.billing');
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(true);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDetails[]>([]);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethodDetails | null>(null);
    const [submitting, setSubmitting] = useState(false);
    
    // Add Payment Method Form (simplified - in production would use Stripe Elements)
    const [formData, setFormData] = useState({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvc: '',
        cardholderName: '',
    });

    // Helper: Check if card is expired
    const isCardExpired = (method: PaymentMethodDetails): boolean => {
        if (!method.expiryMonth || !method.expiryYear) return false;
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // 0-indexed
        
        return method.expiryYear < currentYear || 
               (method.expiryYear === currentYear && method.expiryMonth < currentMonth);
    };

    const fetchPaymentMethods = async () => {
        if (!user?.uid) return;
        
        try {
            setLoading(true);
            const methodsRef = collection(db, 'paymentMethods');
            const q = query(
                methodsRef,
                where('userId', '==', user.uid),
                orderBy('isDefault', 'desc'),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const methodsList: PaymentMethodDetails[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                methodsList.push({
                    id: doc.id,
                    userId: data.userId,
                    type: data.type,
                    status: data.status,
                    stripePaymentMethodId: data.stripePaymentMethodId,
                    stripeCustomerId: data.stripeCustomerId,
                    last4: data.last4,
                    brand: data.brand,
                    expiryMonth: data.expiryMonth,
                    expiryYear: data.expiryYear,
                    cardholderName: data.cardholderName,
                    isDefault: data.isDefault,
                    metadata: data.metadata,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    lastUsedAt: data.lastUsedAt,
                } as PaymentMethodDetails);
            });

            setPaymentMethods(methodsList);
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            toast({
                title: "Erreur",
                description: "Impossible de charger les méthodes de paiement.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddPaymentMethod = async () => {
        if (!user?.uid) return;
        
        // Basic validation
        if (!formData.cardNumber || !formData.expiryMonth || !formData.expiryYear || !formData.cvc || !formData.cardholderName) {
            toast({
                title: "Erreur",
                description: "Veuillez remplir tous les champs.",
                variant: "destructive",
            });
            return;
        }

        try {
            setSubmitting(true);
            
            // In production, this would call Stripe API to tokenize card
            // For now, we'll just store basic info
            const cleanCardNumber = formData.cardNumber.replace(/\s/g, '');
            const last4 = cleanCardNumber.slice(-4);
            
            // Determine card brand (simplified)
            let brand = 'unknown';
            if (cleanCardNumber.startsWith('4')) brand = 'visa';
            else if (cleanCardNumber.startsWith('5')) brand = 'mastercard';
            else if (cleanCardNumber.startsWith('3')) brand = 'amex';

            // Check if this is the first payment method
            const isFirstMethod = paymentMethods.length === 0;

            const methodsRef = collection(db, 'paymentMethods');
            await addDoc(methodsRef, {
                userId: user.uid,
                type: 'card',
                status: 'active',
                last4: last4,
                brand: brand,
                expiryMonth: parseInt(formData.expiryMonth),
                expiryYear: parseInt(formData.expiryYear),
                cardholderName: formData.cardholderName,
                isDefault: isFirstMethod,
                isExpired: false,
                metadata: {},
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });

            toast({
                title: "Carte ajoutée",
                description: "Votre carte a été ajoutée avec succès.",
            });

            // Reset form and close dialog
            setFormData({
                cardNumber: '',
                expiryMonth: '',
                expiryYear: '',
                cvc: '',
                cardholderName: '',
            });
            setShowAddDialog(false);
            fetchPaymentMethods();
        } catch (error) {
            console.error('Error adding payment method:', error);
            toast({
                title: "Erreur",
                description: "Impossible d'ajouter la méthode de paiement.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleSetDefault = async (methodId: string) => {
        if (!user?.uid) return;
        
        try {
            // Update all methods to non-default
            for (const method of paymentMethods) {
                const methodRef = doc(db, 'paymentMethods', method.id);
                await updateDoc(methodRef, {
                    isDefault: method.id === methodId,
                    updatedAt: Timestamp.now(),
                });
            }

            toast({
                title: "Méthode par défaut modifiée",
                description: "Cette carte sera utilisée pour vos prochains paiements.",
            });

            fetchPaymentMethods();
        } catch (error) {
            console.error('Error setting default method:', error);
            toast({
                title: "Erreur",
                description: "Impossible de modifier la méthode par défaut.",
                variant: "destructive",
            });
        }
    };

    const handleDeleteMethod = async () => {
        if (!selectedMethod) return;
        
        try {
            setSubmitting(true);
            const methodRef = doc(db, 'paymentMethods', selectedMethod.id);
            await deleteDoc(methodRef);

            toast({
                title: "Carte supprimée",
                description: "La carte a été supprimée.",
            });

            setShowDeleteDialog(false);
            setSelectedMethod(null);
            fetchPaymentMethods();
        } catch (error) {
            console.error('Error deleting payment method:', error);
            toast({
                title: "Erreur",
                description: "Impossible de supprimer la carte.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchPaymentMethods();
        }
    }, [user]);

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        router.push('/sign-in');
        return null;
    }

    const getCardBrandLogo = (brand: string) => {
        // In production, return actual card brand logos
        return brand.toUpperCase();
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <Settings className="h-8 w-8 text-primary"/>
                    Facturation
                </h1>
                <p className="text-muted-foreground">
                    Gérez vos méthodes de paiement et consultez votre historique
                </p>
            </div>

            <Tabs defaultValue="methods" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="methods">Méthodes de paiement</TabsTrigger>
                    <TabsTrigger value="history">Historique</TabsTrigger>
                </TabsList>

                <TabsContent value="methods" className="space-y-6">
                    {/* Info Alert */}
                    <Alert>
                        <CreditCard className="h-4 w-4" />
                        <AlertTitle>Paiements sécurisés</AlertTitle>
                        <AlertDescription>
                            Vos informations de paiement sont sécurisées et chiffrées. Nous utilisons Stripe pour traiter vos paiements.
                        </AlertDescription>
                    </Alert>

                    {/* Payment Methods Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Mes cartes bancaires</CardTitle>
                                    <CardDescription>Gérez vos méthodes de paiement</CardDescription>
                                </div>
                                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Ajouter une carte
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle>Ajouter une carte bancaire</DialogTitle>
                                            <DialogDescription>
                                                Vos informations sont sécurisées et chiffrées
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="cardholderName">Nom du titulaire *</Label>
                                                <Input
                                                    id="cardholderName"
                                                    value={formData.cardholderName}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, cardholderName: e.target.value }))}
                                                    placeholder="JEAN DUPONT"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="cardNumber">Numéro de carte *</Label>
                                                <Input
                                                    id="cardNumber"
                                                    value={formData.cardNumber}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: e.target.value }))}
                                                    placeholder="1234 5678 9012 3456"
                                                    maxLength={19}
                                                />
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="expiryMonth">Mois *</Label>
                                                    <Select value={formData.expiryMonth} onValueChange={(value) => setFormData(prev => ({ ...prev, expiryMonth: value }))}>
                                                        <SelectTrigger id="expiryMonth">
                                                            <SelectValue placeholder="MM" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                                                <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                                                                    {month.toString().padStart(2, '0')}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="expiryYear">Année *</Label>
                                                    <Select value={formData.expiryYear} onValueChange={(value) => setFormData(prev => ({ ...prev, expiryYear: value }))}>
                                                        <SelectTrigger id="expiryYear">
                                                            <SelectValue placeholder="AA" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                                                                <SelectItem key={year} value={year.toString()}>
                                                                    {year}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="cvc">CVC *</Label>
                                                    <Input
                                                        id="cvc"
                                                        value={formData.cvc}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, cvc: e.target.value }))}
                                                        placeholder="123"
                                                        maxLength={4}
                                                        type="password"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                                                Annuler
                                            </Button>
                                            <Button onClick={handleAddPaymentMethod} disabled={submitting}>
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
                            {paymentMethods.length === 0 ? (
                                <div className="text-center py-12">
                                    <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium mb-2">Aucune carte enregistrée</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Ajoutez une carte pour effectuer vos paiements plus rapidement
                                    </p>
                                    <Button onClick={() => setShowAddDialog(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Ajouter une carte
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {paymentMethods.map((method) => (
                                        <Card key={method.id} className={method.isDefault ? 'border-primary' : ''}>
                                            <CardContent className="pt-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex h-12 w-16 items-center justify-center rounded border bg-muted">
                                                            <span className="text-xs font-bold">{getCardBrandLogo(method.brand || 'card')}</span>
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium">•••• {method.last4}</span>
                                                                {method.isDefault && (
                                                                    <Badge>Par défaut</Badge>
                                                                )}
                                                                {isCardExpired(method) && (
                                                                    <Badge variant="destructive">Expirée</Badge>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {method.cardholderName}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                Expire {method.expiryMonth?.toString().padStart(2, '0')}/{method.expiryYear}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {!method.isDefault && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleSetDefault(method.id)}
                                                            >
                                                                Définir par défaut
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedMethod(method);
                                                                setShowDeleteDialog(true);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historique de facturation</CardTitle>
                            <CardDescription>
                                Consultez vos factures et reçus
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">
                                    Aucune facture disponible pour le moment
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer la carte</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer cette carte ? Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedMethod && (
                        <div className="py-4">
                            <p className="text-sm">
                                <strong>Carte :</strong> {getCardBrandLogo(selectedMethod.brand || 'card')} •••• {selectedMethod.last4}
                            </p>
                            <p className="text-sm">
                                <strong>Titulaire :</strong> {selectedMethod.cardholderName}
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteMethod} disabled={submitting}>
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
