import ProtectedShell from "@/components/protected-shell"

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedShell
      title="Profile Settings"
      subtitle="Manage your profile and notification settings."
    >
      {children}
    </ProtectedShell>
  )
}
