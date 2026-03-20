import { cookies, headers } from "next/headers"
import { AnalyticsScripts } from "@/components/marketing/consent/analytics-scripts"
import { ConsentProvider } from "@/components/marketing/consent/consent-context"
import {
  CONSENT_COOKIE_NAME,
  parseConsent,
  shouldLoadAnalytics,
} from "@/lib/privacy/consent"
import { detectJurisdiction } from "@/lib/privacy/jurisdiction"

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const headerStore = await headers()

  const consentCookie = cookieStore.get(CONSENT_COOKIE_NAME)?.value
  const consent = parseConsent(consentCookie)

  const { requireConsent } = detectJurisdiction((name) => headerStore.get(name))

  const analyticsAllowed = shouldLoadAnalytics(GA_ID, requireConsent, consent)

  return (
    <>
      {GA_ID && (
        <AnalyticsScripts gaId={GA_ID} shouldLoad={analyticsAllowed} />
      )}
      {GA_ID ? (
        <ConsentProvider
          requireConsent={requireConsent}
          initialConsent={consent}
        >
          {children}
        </ConsentProvider>
      ) : (
        children
      )}
    </>
  )
}
