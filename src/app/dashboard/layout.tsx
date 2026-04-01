import ProtectedShell from "@/components/protected-shell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedShell
      title="Security Center"
      subtitle="Real-time threat detection and contextual security posture."
    >
      {children}
    </ProtectedShell>
  )
}