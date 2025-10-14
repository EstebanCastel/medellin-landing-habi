import { NextRequest, NextResponse } from 'next/server'

// Marcar esta ruta como dinámica
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const nid = searchParams.get('nid')
    
    if (!nid) {
      return NextResponse.json(
        { error: 'NID is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.HUBSPOT_ACCESS_TOKEN
    
    if (!apiKey) {
      // En lugar de devolver error, devolver valores por defecto
      const fallbackValues = {
        precio_comite_final_final_final__el_unico__: "110000000",
        whatsapp_asesor: "https://api.whatsapp.com/send?phone=3009128399"
      }
      
      return NextResponse.json(fallbackValues)
    }
    
    // URL de la API de HubSpot para obtener un deal por ID
    const url = `https://api.hubapi.com/crm/v3/objects/deals/${nid}?properties=precio_comite_final_final_final__el_unico__,whatsapp_asesor`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      // En caso de error, devolver valores por defecto
      const fallbackValues = {
        precio_comite_final_final_final__el_unico__: "110000000",
        whatsapp_asesor: "https://api.whatsapp.com/send?phone=3009128399"
      }
      
      return NextResponse.json(fallbackValues)
    }

    const data = await response.json()
    
    // Extraer las propiedades del response
    const properties = data.properties || {}
    
    const result = {
      precio_comite_final_final_final__el_unico__: properties.precio_comite_final_final_final__el_unico__ || "100000000",
      whatsapp_asesor: properties.whatsapp_asesor || ""
    }
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error en endpoint de HubSpot:', error)
    
    // En caso de error, devolver valores por defecto
    const fallbackValues = {
      precio_comite_final_final_final__el_unico__: "110000000",
      whatsapp_asesor: "https://api.whatsapp.com/send?phone=3009128399"
    }
    
    return NextResponse.json(fallbackValues)
  }
}
