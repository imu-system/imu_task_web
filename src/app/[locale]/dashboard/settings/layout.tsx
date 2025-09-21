
'use client';

// This layout is now handled by the SettingsModal component.
// The content of the settings pages will be rendered inside the modal.
// This file can be removed in a later step.

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
