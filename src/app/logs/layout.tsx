import ProtectedShell from "@/components/protected-shell"

export default function LogsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedShell
      title="Security Logs"
      subtitle="Full history of security events evaluated for this account."
    >
      {children}
    </ProtectedShell>
  )
}
