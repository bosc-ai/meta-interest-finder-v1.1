// pages/_app.tsx
import type { AppProps } from 'next/app'
import '@/styles/globals.css'
import Script from 'next/script'

const GTM_ID = 'GTM-NPC4HCJG'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script id="gtm" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');
        `}
      </Script>
      <Component {...pageProps} />
    </>
  )
}
