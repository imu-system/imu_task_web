import { ProfilePageClient } from "@/components/profile-page-client";

export default function ProfilePage() {
    return (
        <div className="w-full max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Manage Your Profile</h1>
            <ProfilePageClient />
        </div>
    );
}
