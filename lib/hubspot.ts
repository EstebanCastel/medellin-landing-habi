// Tipos para las propiedades de HubSpot
export interface HubSpotProperties {
  precio_comite_final_final_final__el_unico__: string
  whatsapp_asesor: string
}

// Función para obtener las propiedades de HubSpot por deal_uuid
export async function getHubSpotProperties(dealUuid: string): Promise<HubSpotProperties> {
  try {
    // Llamar a nuestro endpoint local que maneja CORS
    const url = `/api/hubspot?deal_uuid=${dealUuid}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error response desde frontend:', errorText)
      throw new Error(`Error en endpoint local: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Verificar que recibimos datos válidos
    if (!data || typeof data !== 'object') {
      throw new Error('Datos inválidos recibidos del endpoint')
    }
    
    return data as HubSpotProperties
    
  } catch (error) {
    console.error('Error al obtener propiedades desde endpoint local:', error)
    throw error // Re-lanzar el error para que lo maneje loadProperties
  }
}

// Función para formatear números como precio colombiano
export function formatPrice(price: string | number): string {
  const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d]/g, '')) : price
  
  if (isNaN(numPrice)) return '$0'
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numPrice)
}

// Función para manejar la redirección a WhatsApp
export function handleWhatsAppRedirect(whatsappUrl: string, action: 'oferta' | 'visita' | 'habi-paga-todo' | 'cliente-paga-tramites') {
  if (!whatsappUrl) {
    console.warn('URL de WhatsApp no disponible')
    return
  }
  
  // Verificar si la URL ya es una URL de WhatsApp válida
  let finalUrl = whatsappUrl
  
  // Si no es una URL completa, asumimos que es solo el número y construimos la URL
  if (!whatsappUrl.startsWith('http')) {
    // Remover caracteres no numéricos excepto el +
    const cleanNumber = whatsappUrl.replace(/[^\d+]/g, '')
    finalUrl = `https://wa.me/${cleanNumber.replace('+', '')}`
  }
  
  // Agregar mensaje predefinido según la acción
  const messages = {
    oferta: '¡Hola! Me interesa solicitar una oferta para mi propiedad.',
    visita: '¡Hola! Me gustaría agendar una visita a sus oficinas.',
    'habi-paga-todo': 'Hola deseo solicitar mi oferta y que habi se encargue de los costos de tramites y notarias',
    'cliente-paga-tramites': 'Hola deseo solicitar mi oferta pero me hare cargo de los costos de tramites y notarias'
  }
  
  const message = encodeURIComponent(messages[action])
  const separator = finalUrl.includes('?') ? '&' : '?'
  const urlWithMessage = `${finalUrl}${separator}text=${message}`
  
  // Abrir en nueva ventana
  window.open(urlWithMessage, '_blank')
}
