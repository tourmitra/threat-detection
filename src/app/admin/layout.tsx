import ProtectedShell from "@/components/protected-shell"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedShell
      title="Admin Console"
      subtitle="Review, triage, and resolve high-priority security events."
    >
      {children}
    </ProtectedShell>
  )
}
