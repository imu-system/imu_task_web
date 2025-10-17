/**
 * Panel Admin - Gestion des rôles utilisateurs
 * Utilise les Cloud Functions pour assigner/retirer des rôles
 */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/types';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, UserCog, AlertCircle, CheckCircle2 } from 'lucide-react';

interface UserWithRoles {
    uid: string;
    email: string;
    roles: UserRole[];
    profile: {
        displayName?: string;
    };
    createdAt: string;
}

export function AdminUserRolesPanel() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [users, setUsers] = useState<UserWithRoles[]>([]);
    
    // Formulaire d'attribution de rôle
    const [targetUid, setTargetUid] = useState('');
    const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
    const [action, setAction] = useState<'assign' | 'remove'>('assign');

    const isAdmin = user?.roles?.includes(UserRole.admin) ?? false;

    // Charger la liste des utilisateurs
    useEffect(() => {
        if (isAdmin) {
            loadUsers();
        }
    }, [isAdmin]);

    const loadUsers = async () => {
        setLoadingUsers(true);
        setError(null);

        try {
            const listUsersWithRoles = httpsCallable(functions, 'listUsersWithRoles');
            const result = await listUsersWithRoles({ limit: 50 });
            const data = result.data as any;

            if (data.success) {
                setUsers(data.users);
            }
        } catch (err: any) {
            console.error('Error loading users:', err);
            setError(err.message || 'Failed to load users');
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!targetUid || !selectedRole) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const functionName = action === 'assign' ? 'assignUserRole' : 'removeUserRole';
            const cloudFunction = httpsCallable(functions, functionName);
            
            const result = await cloudFunction({
                targetUid,
                role: selectedRole,
            });

            const data = result.data as any;

            if (data.success) {
                setSuccess(data.message);
                setTargetUid('');
                setSelectedRole('');
                
                // Recharger la liste des utilisateurs
                await loadUsers();
            }
        } catch (err: any) {
            console.error('Error managing role:', err);
            setError(err.message || 'Failed to manage role');
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-destructive" />
                        Accès refusé
                    </CardTitle>
                    <CardDescription>
                        Vous devez être administrateur pour accéder à ce panel.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCog className="h-5 w-5" />
                        Gestion des rôles utilisateurs
                    </CardTitle>
                    <CardDescription>
                        Assigner ou retirer des rôles aux utilisateurs (admin uniquement)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="mb-4 border-green-500">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Action</Label>
                                <Select
                                    value={action}
                                    onValueChange={(value) => setAction(value as 'assign' | 'remove')}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="assign">Assigner un rôle</SelectItem>
                                        <SelectItem value="remove">Retirer un rôle</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Rôle</Label>
                                <Select
                                    value={selectedRole}
                                    onValueChange={(value) => setSelectedRole(value as UserRole)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un rôle" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={UserRole.client}>Client</SelectItem>
                                        <SelectItem value={UserRole.provider}>Provider</SelectItem>
                                        <SelectItem value={UserRole.admin}>Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="targetUid">User ID (UID)</Label>
                            <Input
                                id="targetUid"
                                value={targetUid}
                                onChange={(e) => setTargetUid(e.target.value)}
                                placeholder="Ex: abc123def456..."
                                required
                            />
                        </div>

                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Traitement...
                                </>
                            ) : (
                                action === 'assign' ? 'Assigner le rôle' : 'Retirer le rôle'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des utilisateurs</CardTitle>
                    <CardDescription>
                        Tous les utilisateurs avec leurs rôles
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingUsers ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {users.map((u) => (
                                <div
                                    key={u.uid}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium">
                                            {u.profile.displayName || 'Sans nom'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">{u.email}</p>
                                        <p className="text-xs text-muted-foreground font-mono">
                                            {u.uid}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        {u.roles.map((role) => (
                                            <Badge key={role} variant="secondary">
                                                {role}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={loadUsers}
                        disabled={loadingUsers}
                    >
                        Actualiser
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
