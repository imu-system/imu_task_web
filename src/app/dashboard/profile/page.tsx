import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function ProfilePage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Profil & Paramètres
        </h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles et vos préférences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>Mettez à jour vos informations publiques.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="https://picsum.photos/id/1005/100/100" />
              <AvatarFallback>LB</AvatarFallback>
            </Avatar>
            <Button variant="outline">Changer la photo</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input id="name" defaultValue="Lucas Bernard" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input id="email" type="email" defaultValue="lucas.bernard@email.com" disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" placeholder="Parlez un peu de vous..." defaultValue="Étudiant en informatique passionné par le service à la communauté. Fiable, ponctuel et toujours prêt à aider !" />
          </div>

          <div className="flex justify-end">
            <Button>Enregistrer les modifications</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Vérification d'identité (KYC)</CardTitle>
            <CardDescription>Pour la sécurité de tous, la vérification est requise pour effectuer des missions.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4 bg-green-50 dark:bg-green-900/20">
                <p className="font-medium text-green-800 dark:text-green-300">Votre identité a été vérifiée avec succès.</p>
                <Button variant="outline" disabled>Vérifié</Button>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choisissez comment vous souhaitez être notifié.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="new-offer-email">Nouvelle offre par e-mail</Label>
                    <p className="text-xs text-muted-foreground">Recevez un e-mail à chaque nouvelle offre sur vos missions.</p>
                </div>
                <Switch id="new-offer-email" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="message-email">Nouveau message par e-mail</Label>
                    <p className="text-xs text-muted-foreground">Soyez prévenu par e-mail lorsque vous recevez un nouveau message.</p>
                </div>
                <Switch id="message-email" />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
