import { NextRequest, NextResponse } from 'next/server'

// Marcar esta ruta como dinámica
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const dealUuid = searchParams.get('deal_uuid')
    
    if (!dealUuid) {
      return NextResponse.json(
        { error: 'deal_uuid is required' },
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
    
    // URL de la API de HubSpot para buscar deals por deal_uuid
    const url = `https://api.hubapi.com/crm/v3/objects/deals/search`
    
    const searchBody = {
      filterGroups: [
        {
          filters: [
            {
              propertyName: 'deal_uuid',
              operator: 'EQ',
              value: dealUuid
            }
          ]
        }
      ],
      properties: ['precio_comite_final_final_final__el_unico__', 'whatsapp_asesor', 'deal_uuid'],
      limit: 1
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchBody)
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
    
    // La API de búsqueda devuelve un array de resultados
    if (!data.results || data.results.length === 0) {
      // Si no se encuentra el deal, devolver valores por defecto
      const fallbackValues = {
        precio_comite_final_final_final__el_unico__: "110000000",
        whatsapp_asesor: "https://api.whatsapp.com/send?phone=3009128399"
      }
      return NextResponse.json(fallbackValues)
    }
    
    // Extraer las propiedades del primer resultado
    const properties = data.results[0].properties || {}
    
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
