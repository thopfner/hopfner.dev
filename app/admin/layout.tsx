import { AppThemeProvider } from "@/components/app-theme-provider"

export default function AdminSegmentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppThemeProvider>{children}</AppThemeProvider>
}
