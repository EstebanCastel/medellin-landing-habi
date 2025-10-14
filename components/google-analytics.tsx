'use client'

import Script from 'next/script'

// ID correcto de la propiedad "Habi COL - Nuevo GA4"
const GA_MEASUREMENT_ID = 'G-WXCCTKWS5T'

export default function GoogleAnalytics() {
  // Solo cargar Google Analytics en producción
  if (process.env.NODE_ENV !== 'production') {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_title: document.title,
            page_location: window.location.href,
            debug_mode: true,
            send_page_view: false
          });
          
          // Debug: Log cuando GA se inicializa
          console.log('🟢 Google Analytics inicializado:', '${GA_MEASUREMENT_ID}');
          
          // Debug: Interceptar todos los eventos
          const originalGtag = window.gtag;
          window.gtag = function() {
            console.log('📊 GA Event:', arguments);
            return originalGtag.apply(this, arguments);
          };
        `}
      </Script>
    </>
  )
}

// Función para tracking de eventos personalizados
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  // Solo trackear en producción
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔍 [DEV] GA Event:', { action, category, label, value })
    return
  }
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Función para tracking de páginas
export const trackPageView = (url: string, title?: string) => {
  // Solo trackear en producción
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔍 [DEV] GA Page View:', { url, title })
    return
  }
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title,
    })
  }
}

// Declaración de tipos para TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}
