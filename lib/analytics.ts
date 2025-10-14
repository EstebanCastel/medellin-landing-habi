import { trackEvent } from '@/components/google-analytics'

// Eventos específicos para el sitio de Medellín
export const analytics = {
  // Eventos de navegación
  pageView: (pageName: string) => {
    trackEvent('page_view_medellin', 'navigation', pageName)
  },

  // Eventos de formularios
  formStart: (formName: string) => {
    trackEvent('form_start_medellin', 'engagement', formName)
  },

  formComplete: (formName: string) => {
    trackEvent('form_complete_medellin', 'conversion', formName)
  },

  formError: (formName: string, errorType: string) => {
    trackEvent('form_error_medellin', 'error', `${formName}_${errorType}`)
  },

  // Eventos de contacto
  contactClick: (method: 'phone' | 'email' | 'whatsapp') => {
    trackEvent('contact_click_medellin', 'engagement', method)
  },

  // Eventos de propiedades
  propertyView: (propertyId?: string) => {
    trackEvent('property_view_medellin', 'engagement', propertyId)
  },

  propertyInquiry: (propertyId?: string) => {
    trackEvent('property_inquiry_medellin', 'conversion', propertyId)
  },

  // Eventos de calculadora/herramientas
  calculatorUse: (calculatorType: string) => {
    trackEvent('calculator_use_medellin', 'engagement', calculatorType)
  },

  // Eventos de descarga
  downloadBrochure: (propertyId?: string) => {
    trackEvent('download_brochure_medellin', 'engagement', propertyId)
  },

  // Eventos de CTA (Call to Action)
  ctaClick: (ctaName: string, location: string) => {
    trackEvent('cta_click_medellin', 'engagement', `${ctaName}_${location}`)
  },

  // Eventos de scroll y tiempo en página
  scrollDepth: (percentage: number) => {
    trackEvent(`scroll_${percentage}_medellin`, 'engagement', `${percentage}%`, percentage)
  },

  timeOnPage: (seconds: number) => {
    trackEvent('time_on_page_medellin', 'engagement', undefined, seconds)
  },

  // Eventos de búsqueda
  searchPerformed: (searchTerm: string) => {
    trackEvent('search_medellin', 'engagement', searchTerm)
  },

  // Eventos de redes sociales
  socialShare: (platform: string, content: string) => {
    trackEvent('social_share_medellin', 'engagement', `${platform}_${content}`)
  },

  // Eventos de error
  errorOccurred: (errorType: string, errorMessage: string) => {
    trackEvent('error_medellin', 'error', `${errorType}_${errorMessage}`)
  }
}

// Hook para tracking automático de tiempo en página
export const usePageTracking = () => {
  if (typeof window !== 'undefined') {
    const startTime = Date.now()
    
    const trackTimeOnPage = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000)
      if (timeSpent > 10) { // Solo trackear si el usuario estuvo más de 10 segundos
        analytics.timeOnPage(timeSpent)
      }
    }

    // Trackear cuando el usuario sale de la página
    window.addEventListener('beforeunload', trackTimeOnPage)
    
    return () => {
      window.removeEventListener('beforeunload', trackTimeOnPage)
    }
  }
}

// Función para trackear scroll depth automáticamente
export const initScrollTracking = () => {
  if (typeof window !== 'undefined') {
    let maxScroll = 0
    const milestones = [25, 50, 75, 90, 100]
    const trackedMilestones = new Set<number>()

    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      )
      
      maxScroll = Math.max(maxScroll, scrollPercent)
      
      milestones.forEach(milestone => {
        if (maxScroll >= milestone && !trackedMilestones.has(milestone)) {
          analytics.scrollDepth(milestone)
          trackedMilestones.add(milestone)
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }
}
