"use client"

import { Montserrat } from "next/font/google"
import Image from "next/image"
import { useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { getHubSpotProperties, formatPrice, handleWhatsAppRedirect, HubSpotProperties } from "@/lib/hubspot"
import { analytics, usePageTracking, initScrollTracking } from "@/lib/analytics"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const montserrat = Montserrat({ subsets: ["latin"] })

function HomePageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const initialNid = searchParams.get('nid')?.trim() ?? null
  const [nid, setNid] = useState<string | null>(initialNid)
  const [properties, setProperties] = useState<HubSpotProperties | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [forceUpdate, setForceUpdate] = useState(0)
  const [showClientPaysModal, setShowClientPaysModal] = useState(false)

  const loadProperties = useCallback(async (targetNid: string, shouldUpdateUrl = false) => {
    const sanitizedNid = targetNid.trim()
    if (!sanitizedNid) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setNid(sanitizedNid)

    try {
      const hubspotProperties = await getHubSpotProperties(sanitizedNid)
      
      setProperties(hubspotProperties)
      setForceUpdate(prev => prev + 1)

      if (shouldUpdateUrl) {
        const params = new URLSearchParams(searchParams.toString())
        params.set('nid', sanitizedNid)
        const queryString = params.toString()
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
      }
    } catch (error) {
      console.error('Error al cargar propiedades:', error)
      // En caso de error, aún así mostrar la página con valores por defecto
      setProperties({
        precio_comite_final_final_final__el_unico__: "100000000",
        whatsapp_asesor: "https://api.whatsapp.com/send?phone=3009128399"
      })
    } finally {
      setIsLoading(false)
    }
  }, [pathname, router, searchParams])

  const handleNidSubmit = (submittedNid: string) => {
    void loadProperties(submittedNid, true)
  }

  // Efecto para carga inicial cuando hay NID en URL
  useEffect(() => {
    if (initialNid && !properties) {
      void loadProperties(initialNid)
    }
  }, []) // Solo ejecutar una vez al montar el componente

  // Tracking de página y scroll
  useEffect(() => {
    // Trackear vista de página
    analytics.pageView('home')
    
    // Inicializar tracking de scroll
    const cleanupScroll = initScrollTracking()
    
    // Inicializar tracking de tiempo en página
    const cleanupPageTime = usePageTracking()
    
    return () => {
      if (cleanupScroll) cleanupScroll()
      if (cleanupPageTime) cleanupPageTime()
    }
  }, [])

  useEffect(() => {
    const urlNid = searchParams.get('nid')?.trim()

    if (urlNid) {
      // Solo cargar si es un NID diferente al actual
      if (urlNid !== nid) {
        void loadProperties(urlNid)
      }
    } else if (!urlNid && nid) {
      // Si no hay NID en la URL pero tenemos uno en el estado, limpiar
      setNid(null)
      setProperties(null)
      setIsLoading(false)
    }
  }, [searchParams, nid, loadProperties])

  // Timeout de seguridad para evitar carga infinita
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setIsLoading(false)
        if (nid && !properties) {
          setProperties({
            precio_comite_final_final_final__el_unico__: "110000000",
            whatsapp_asesor: "https://api.whatsapp.com/send?phone=3009128399"
          })
        }
      }, 15000) // 15 segundos timeout (más tiempo para la API)

      return () => clearTimeout(timeout)
    }
  }, [isLoading, nid, properties])

  const handleSolicitarOferta = () => {
    analytics.ctaClick('solicitar_oferta', 'hero_section')
    analytics.contactClick('whatsapp')
    if (properties?.whatsapp_asesor) {
      handleWhatsAppRedirect(properties.whatsapp_asesor, 'oferta')
    } else {
      console.warn('URL de WhatsApp del asesor no disponible')
    }
  }

  const handleAgendarVisita = () => {
    analytics.ctaClick('agendar_visita', 'visit_section')
    analytics.contactClick('whatsapp')
    if (properties?.whatsapp_asesor) {
      handleWhatsAppRedirect(properties.whatsapp_asesor, 'visita')
    } else {
      console.warn('URL de WhatsApp del asesor no disponible')
    }
  }

  const handleHabiPaysAll = () => {
    analytics.ctaClick('habi_paga_todo', 'service_cards')
    analytics.contactClick('whatsapp')
    const whatsappUrl = properties?.whatsapp_asesor || "https://api.whatsapp.com/send?phone=3009128399"
    handleWhatsAppRedirect(whatsappUrl, 'habi-paga-todo')
  }

  const handleClientPaysConfirm = () => {
    analytics.ctaClick('cliente_paga_tramites', 'service_cards')
    analytics.contactClick('whatsapp')
    setShowClientPaysModal(false)
    const whatsappUrl = properties?.whatsapp_asesor || "https://api.whatsapp.com/send?phone=3009128399"
    handleWhatsAppRedirect(whatsappUrl, 'cliente-paga-tramites')
  }

  const renderLandingContent = (displayProperties: HubSpotProperties) => (
    <>
      {/* Hero Section */}
      <div className="relative px-4 sm:px-6">
        <div
          className="rounded-[1.5rem] sm:rounded-[3rem] mx-auto mt-4 sm:mt-8 overflow-hidden max-w-6xl"
          style={{ background: "linear-gradient(90deg, #7400C2 0%, #430070 100%)" }}
        >
          <div className="relative flex flex-col xl:flex-row xl:items-start xl:justify-between px-4 sm:px-8 py-8 sm:py-12 lg:py-16 min-h-[400px]">
            {/* Left Content */}
            <div className="flex-1 max-w-2xl z-10 text-center xl:text-left mb-6 xl:mb-0">
              <h1 className={`${montserrat.className} text-3xl sm:text-4xl lg:text-5xl xl:text-5xl mb-4 sm:mb-6 leading-tight`}>
                <span className="text-white font-bold block">Vende tu vivienda</span>
                <span className="block font-black text-4xl sm:text-5xl lg:text-6xl xl:text-6xl mt-2" style={{ color: "#EACDFE" }}>
                  sin complicaciones
                </span>
              </h1>
              <div className="text-white text-sm sm:text-base space-y-2 max-w-lg mx-auto xl:mx-0">
                <p>Tú eliges: puedes hacerte cargo de los trámites o dejar que Habi los asuma por completo. En ambos casos, recibes un precio justo por tu vivienda.</p>
              </div>
            </div>

            {/* Right Image */}
            <div className="flex justify-center xl:justify-end xl:items-end xl:absolute xl:right-0 xl:bottom-0 xl:top-10">
              <Image 
                src="/logo/imagen.svg" 
                alt="Habi - Compramos tu vivienda a tu medida" 
                width={400} 
                height={300} 
                priority
                className="object-contain object-bottom w-64 h-48 sm:w-80 sm:h-60 md:w-96 md:h-72 xl:w-[570px] xl:h-[400px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Product Selection Section */}
      <div className="max-w-xl mx-auto px-4 sm:px-6 -mt-4 sm:-mt-8 relative z-20">
        <div className="rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          {/* Top section with purple background */}
          <div className="text-center p-4 sm:p-6 lg:p-8" style={{ backgroundColor: "#F9F0FF" }}>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6" style={{ color: "#8A00E6" }}>
              Elige cómo prefieres vender
            </h2>

            <div className="mb-4">
              <p className="text-sm sm:text-base mb-2 sm:mb-3" style={{ color: "#8A00E6" }}>
                Precio de compra
              </p>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold" style={{ color: "#8A00E6" }}>
                $ 450.000.000
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Gap space after hero section */}
      <div className="py-6 sm:py-8 lg:py-12"></div>

        {/* Services Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
          {/* Title Section */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className={`${montserrat.className} text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 sm:mb-6`}
                style={{ color: "#7400C2" }}>
              Elige cómo prefieres vender
            </h2>
            <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-4xl mx-auto px-4">
              En Medellín, los costos de trámites, notarías y registros son muy altos. Te ofrecemos dos opciones: 
              puedes asumir estos costos tú mismo o nosotros nos encargamos de todo. La flexibilidad de nuestras 
              opciones te permite tomar la decisión ideal para ti.
            </p>
            <p className="text-purple-600 font-semibold text-base sm:text-lg mt-4">
              El cambio en precio se debe únicamente a lo que cuesta pagar estos gastos en la notaría, Habi no se lleva ni un centavo más por hacer los trámites
            </p>
          </div>

          {/* Two Service Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Card 1 - Tú pagas trámites */}
            <div className="group bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-200 relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:border-purple-300 hover:-translate-y-2 hover:scale-[1.02]">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Price Section */}
              <div className="relative z-10 text-center mb-4 sm:mb-6 p-4 sm:p-6 rounded-xl shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:scale-105" style={{ backgroundColor: "#8A00E6" }}>
                <p className="text-white text-sm sm:text-base mb-2 font-medium">
                  Precio de venta
                </p>
                <p className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold">
                  $ 450.000.000
                </p>
                {/* Decorative elements */}
                <div className="absolute top-2 right-2 w-8 h-8 bg-white/20 rounded-full opacity-70"></div>
                <div className="absolute bottom-2 left-2 w-6 h-6 bg-white/10 rounded-full opacity-50"></div>
              </div>
              
              {/* Title */}
              <h3 className={`${montserrat.className} relative z-10 text-xl sm:text-2xl font-bold mb-2 text-center transition-colors duration-300 group-hover:text-purple-700`}
                  style={{ color: "#7400C2" }}>
                Tú pagas los trámites
              </h3>
              <div className="relative z-10 text-center mb-4 sm:mb-6">
                <span className="inline-block bg-purple-100 text-purple-600 px-4 py-1 rounded-full text-sm font-semibold transition-colors duration-300 group-hover:bg-purple-200">
                  MAYOR PRECIO DE VENTA
                </span>
              </div>
              
              {/* Description */}
              <p className="relative z-10 text-gray-700 text-sm sm:text-base mb-4 sm:mb-6 text-center leading-relaxed transition-colors duration-300 group-hover:text-gray-800">
                Obtienes el precio máximo por tu propiedad, pero debes asumir los costos de 
                trámites notariales y registros.
              </p>
              
              {/* Features */}
              <ul className="relative z-10 space-y-3 mb-6 sm:mb-8 text-sm sm:text-base text-gray-600">
                <li className="flex items-start group/item">
                  <div className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 flex items-center justify-center bg-purple-100 rounded-full transition-colors duration-300 group-hover:bg-purple-200">
                    <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="transition-colors duration-300 group-hover:text-gray-800">
                    Gastos notariales por tu cuenta (aproximadamente $8M - $15M)
                  </span>
                </li>
                <li className="flex items-start group/item">
                  <div className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 flex items-center justify-center bg-purple-100 rounded-full transition-colors duration-300 group-hover:bg-purple-200">
                    <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="transition-colors duration-300 group-hover:text-gray-800">
                    Debes acercarte a pagar en la notaría el mismo día de la escritura
                  </span>
                </li>
                <li className="flex items-start group/item">
                  <div className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 flex items-center justify-center bg-purple-100 rounded-full transition-colors duration-300 group-hover:bg-purple-200">
                    <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="transition-colors duration-300 group-hover:text-gray-800">
                    Recibes el precio completo de la venta sin descuentos
                  </span>
                </li>
              </ul>
              
              {/* Button */}
              <button 
                onClick={() => setShowClientPaysModal(true)}
                className="relative z-10 w-full border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-semibold px-6 py-3 rounded-full text-sm sm:text-base transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                Elegir esta opción
              </button>
            </div>

            {/* Card 2 - Habi paga todo */}
            <div className="group bg-gradient-to-br from-white to-purple-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-purple-300 relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:border-purple-400 hover:-translate-y-2 hover:scale-[1.02]">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-pink-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Floating decorative elements */}
              <div className="absolute top-4 right-4 w-16 h-16 bg-purple-200/20 rounded-full blur-xl transition-all duration-300 group-hover:bg-purple-300/30 group-hover:scale-125"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 bg-pink-200/20 rounded-full blur-lg transition-all duration-300 group-hover:bg-pink-300/30 group-hover:scale-110"></div>
              
              
              {/* Price Section */}
              <div className="relative z-10 text-center mb-4 sm:mb-6 p-4 sm:p-6 rounded-xl shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:scale-105" style={{ backgroundColor: "#F9F0FF" }}>
                <p className="text-purple-600 text-sm sm:text-base mb-2 font-medium">
                  Precio de venta
                </p>
                <p className="text-purple-600 text-2xl sm:text-3xl lg:text-4xl font-bold">
                  $ 438.000.000
                </p>
                {/* Decorative elements */}
                <div className="absolute top-2 right-2 w-8 h-8 bg-purple-200/30 rounded-full opacity-70"></div>
                <div className="absolute bottom-2 left-2 w-6 h-6 bg-purple-100/50 rounded-full opacity-50"></div>
              </div>
              
              {/* Title */}
              <h3 className={`${montserrat.className} relative z-10 text-xl sm:text-2xl font-bold mb-2 text-center transition-colors duration-300 group-hover:text-purple-800`}
                  style={{ color: "#7400C2" }}>
                Habi paga todo
              </h3>
              <div className="relative z-10 text-center mb-4 sm:mb-6">
                <span className="inline-block bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:from-purple-600 group-hover:to-purple-700">
                  SIN COMPLICACIONES PARA TI
                </span>
              </div>
              
              {/* Description */}
              <p className="relative z-10 text-gray-700 text-sm sm:text-base mb-4 sm:mb-6 text-center leading-relaxed transition-colors duration-300 group-hover:text-gray-800">
                Nosotros nos encargamos de todos los gastos notariales y registros. 
                Tú solo recibes el dinero sin preocuparte por trámites.
              </p>
              
              {/* Features */}
              <ul className="relative z-10 space-y-3 mb-6 sm:mb-8 text-sm sm:text-base text-gray-600">
                <li className="flex items-start group/item">
                  <div className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-300 group-hover:from-purple-600 group-hover:to-purple-700 group-hover:scale-110">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="transition-colors duration-300 group-hover:text-gray-800">
                    Habi asume todos los costos de trámites y notarías ($8M - $15M)
                  </span>
                </li>
                <li className="flex items-start group/item">
                  <div className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-300 group-hover:from-purple-600 group-hover:to-purple-700 group-hover:scale-110">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="transition-colors duration-300 group-hover:text-gray-800">
                    No necesitas acercarte a ninguna notaría ni hacer pagos adicionales
                  </span>
                </li>
                <li className="flex items-start group/item">
                  <div className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-300 group-hover:from-purple-600 group-hover:to-purple-700 group-hover:scale-110">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="transition-colors duration-300 group-hover:text-gray-800">
                    Proceso 100% sin complicaciones para ti
                  </span>
                </li>
              </ul>
              
              {/* Button */}
              <button 
                onClick={handleHabiPaysAll}
                className="relative z-10 w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-6 py-3 rounded-full text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Elegir esta opción
              </button>
            </div>
          </div>
        </div>

      {/* Partners Section - Always visible */}
      <div className="relative min-h-[80vh] sm:min-h-screen flex items-center justify-center py-8 sm:py-12 lg:py-16 px-4 sm:px-6 overflow-hidden"
           style={{
             background: "linear-gradient(135deg, #7B24FF 0%, #6B1FE0 50%, #581C87 100%)"
           }}>
        
        {/* Background Orbs - Outside the card */}
        <div className="absolute top-4 -right-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full pointer-events-none"
             style={{
               background: "radial-gradient(circle, rgba(0, 217, 200, 0.6) 0%, transparent 70%)",
               filter: "blur(80px)"
             }}>
        </div>
        
        <div className="absolute bottom-4 left-4 w-48 h-48 sm:w-80 sm:h-80 rounded-full pointer-events-none"
             style={{
               background: "radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, transparent 70%)",
               filter: "blur(60px)"
             }}>
        </div>

        {/* Translucent Card */}
        <div className="relative max-w-7xl mx-auto w-full">
          <div className="bg-white/10 backdrop-blur-sm rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[4rem] py-8 sm:py-16 lg:py-24 px-4 sm:px-12 lg:px-20 relative overflow-hidden min-h-[500px] sm:min-h-[600px] lg:min-h-[700px]">
            
            {/* Title */}
            <div className="text-center mb-8 sm:mb-12 lg:mb-20">
              <h1 className={`${montserrat.className} text-2xl sm:text-3xl lg:text-4xl xl:text-5xl leading-tight mb-6 sm:mb-8 lg:mb-12`}>
                <span className="block text-white font-medium">
                  Trabajando para ti, con el respaldo de
                </span>
                <span className="block font-black text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mt-2" style={{ color: "#EACDFE" }}>
                  los líderes de Colombia
                </span>
              </h1>
            </div>

            {/* Logos */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8 xl:gap-16 mb-8 sm:mb-12 lg:mb-20">
              <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[3rem] p-3 sm:p-4 lg:p-6 border border-white/30 w-60 sm:w-72 lg:w-80 h-14 sm:h-16 lg:h-20 flex items-center justify-center">
                <Image 
                  src="/logo/bancolombia.png" 
                  alt="Bancolombia" 
                  width={288} 
                  height={57} 
                  className="max-h-10 sm:max-h-12 lg:max-h-14 w-auto object-contain"
                />
              </div>
              <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[3rem] p-3 sm:p-4 lg:p-6 border border-white/30 w-60 sm:w-72 lg:w-80 h-14 sm:h-16 lg:h-20 flex items-center justify-center">
                <Image 
                  src="/logo/BBVA.png" 
                  alt="BBVA" 
                  width={288} 
                  height={57} 
                  className="max-h-12 sm:max-h-14 lg:max-h-16 w-auto object-contain"
                />
              </div>
              <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[3rem] p-3 sm:p-4 lg:p-6 border border-white/30 w-60 sm:w-72 lg:w-80 h-14 sm:h-16 lg:h-20 flex items-center justify-center">
                <Image 
                  src="/logo/bancobogota.png" 
                  alt="Banco de Bogotá" 
                  width={288} 
                  height={57} 
                  className="max-h-12 sm:max-h-14 lg:max-h-16 w-auto object-contain"
                />
              </div>
            </div>

            {/* Description */}
            <div className="text-center">
              <p className="text-white/90 text-sm sm:text-base lg:text-lg xl:text-xl max-w-4xl mx-auto leading-relaxed mb-8 sm:mb-12 lg:mb-16 px-4">
                Siéntete seguro de trabajar con nosotros ya que contamos con el respaldo de las instituciones financieras más importantes del país.
              </p>
              
              {/* CTA Button */}
              <button 
                onClick={handleSolicitarOferta}
                className="bg-white hover:bg-gray-100 text-purple-700 font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Solicitar oferta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className={`${montserrat.className} text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 sm:mb-6`}
                style={{ color: "#7400C2" }}>
              ¿Cómo funciona?
            </h2>
            <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto px-4">
              En 3 simples pasos, la decisión es tuya:
            </p>
          </div>

          {/* Steps */}
          <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 lg:mb-20">
            {/* Connecting line - only visible on large screens */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-2 pointer-events-none -translate-y-1/2 z-0"
                 style={{ backgroundColor: "#DAA7FB" }}>
            </div>
            {/* Step 1 */}
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg relative z-10">
              {/* Number section */}
              <div className="bg-purple-50 p-4 sm:p-6 text-center">
                <span className={`${montserrat.className} text-xl sm:text-2xl lg:text-3xl font-bold block`}
                      style={{ color: "#7400C2" }}>
                  1. Solicita tu oferta
                </span>
              </div>
              {/* Description section */}
              <div className="bg-white p-4 sm:p-6 text-center">
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  Completa nuestro formulario con los datos de tu propiedad. Te daremos una oferta en menos de 24 horas.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg relative z-10">
              {/* Number section */}
              <div className="bg-purple-50 p-4 sm:p-6 text-center">
                <span className={`${montserrat.className} text-xl sm:text-2xl lg:text-3xl font-bold block`}
                      style={{ color: "#7400C2" }}>
                  2. Elige tu producto
                </span>
              </div>
              {/* Description section */}
              <div className="bg-white p-4 sm:p-6 text-center">
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  Selecciona el mejor producto para ti: desde liquidez inmediata hasta el mejor precio en cuotas.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg relative z-10">
              {/* Number section */}
              <div className="bg-purple-50 p-4 sm:p-6 text-center">
                <span className={`${montserrat.className} text-xl sm:text-2xl lg:text-3xl font-bold block`}
                      style={{ color: "#7400C2" }}>
                  3. Cierra y Recibe
                </span>
              </div>
              {/* Description section */}
              <div className="bg-white p-4 sm:p-6 text-center">
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  Firmamos el contrato y recibes tu dinero según el producto elegido. Nosotros nos encargamos de todo el proceso.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom text */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <p className="text-gray-600 text-base sm:text-lg max-w-4xl mx-auto px-4">
              Nuestros resultados nos respaldan, por eso estamos seguros de que te podemos ayudar:
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
            {/* Stat 1 */}
            <div className="text-center">
              <div className={`${montserrat.className} text-3xl sm:text-4xl font-bold mb-2 sm:mb-3`}
                   style={{ color: "#7400C2" }}>
                +5,000
              </div>
              <p className="text-gray-600 text-sm sm:text-base font-medium">
                Propiedades compradas
              </p>
            </div>

            {/* Stat 2 */}
            <div className="text-center">
              <div className={`${montserrat.className} text-3xl sm:text-4xl font-bold mb-2 sm:mb-3`}
                   style={{ color: "#7400C2" }}>
                10 días
              </div>
              <p className="text-gray-600 text-sm sm:text-base font-medium">
                Promedio de cierre
              </p>
            </div>

            {/* Stat 3 */}
            <div className="text-center">
              <div className={`${montserrat.className} text-3xl sm:text-4xl font-bold mb-2 sm:mb-3`}
                   style={{ color: "#7400C2" }}>
                98%
              </div>
              <p className="text-gray-600 text-sm sm:text-base font-medium">
                Satisfacción del cliente
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visit Section */}
      <div className="bg-white py-8 sm:py-12 lg:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[4rem] overflow-hidden"
               style={{
                 background: "linear-gradient(135deg, #7400C2 0%, #430070 100%)"
               }}>
            <div className="flex flex-col lg:flex-row items-stretch">
              {/* Left Content */}
              <div className="flex-1 p-6 sm:p-8 lg:p-12 xl:p-16 text-white text-center lg:text-left">
                <h2 className={`${montserrat.className} mb-6 sm:mb-8`}>
                  <span className="block text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-2 sm:mb-4" style={{ color: "#EACDFE" }}>
                    Síentete como en casa,
                  </span>
                  <span className="block text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold">
                    agenda una visita a
                  </span>
                  <span className="block text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold">
                    nuestras oficinas
                  </span>
                </h2>
                
                <p className="text-white text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Recuerda que puedes buscarnos y agendar una visita en persona a nuestras oficinas, sabemos que es muy importante poder arreglar detalles frente a frente.
                </p>
                
                <button 
                  onClick={handleAgendarVisita}
                  className="bg-white hover:bg-gray-100 text-purple-700 font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Agendar visita
                </button>
              </div>
              
              {/* Right Image */}
              <div className="flex-1 relative h-64 sm:h-80 lg:h-auto">
                <Image 
                  src="/logo/imagen3.svg" 
                  alt="Visita nuestras oficinas" 
                  width={500} 
                  height={400} 
                  className="absolute top-0 right-0 bottom-0 w-auto h-full object-cover object-right"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-white py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className={`${montserrat.className} text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 sm:mb-6`}
                style={{ color: "#7400C2" }}>
              <span className="font-medium">Procesos efectivos,</span> <span className="block sm:inline">pagos seguros</span>
            </h2>
            <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-5xl mx-auto px-4">
              En Habi, preferimos que nuestros clientes hablen por nosotros. ¡Gracias por su confianza!
            </p>
          </div>

          {/* Testimonial Cards */}
          <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Connecting line - only visible on large screens */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-2 pointer-events-none -translate-y-1/2 z-0"
                 style={{ backgroundColor: "#DAA7FB" }}>
            </div>
            {/* Testimonial 1 - Felipe y Natalia */}
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg relative z-10">
              {/* Image and name section */}
              <div className="bg-purple-50 p-4 sm:p-6 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full overflow-hidden">
                  <img 
                    src="/logo/cliente1.png" 
                    alt="Felipe y Natalia" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className={`${montserrat.className} text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2`}
                    style={{ color: "#7400C2" }}>
                  Felipe y Natalia
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">
                  Invirtieron en la vivienda de sus sueños
                </p>
              </div>
              {/* Testimonial section */}
              <div className="bg-white p-4 sm:p-6 text-center">
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  "Calificamos a Habi con 10/10 por la tranquilidad, y eficiencia del proceso, nos hicieron sentir como parte de una familia al acompañarnos en cada paso"
                </p>
              </div>
            </div>

            {/* Testimonial 2 - Carlos Rincón */}
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg relative z-10">
              {/* Image and name section */}
              <div className="bg-purple-50 p-4 sm:p-6 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full overflow-hidden">
                  <img 
                    src="/logo/cliente2.png" 
                    alt="Carlos Rincón" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className={`${montserrat.className} text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2`}
                    style={{ color: "#7400C2" }}>
                  Carlos Rincón
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">
                  Vendió su apartamento en Suba
                </p>
              </div>
              {/* Testimonial section */}
              <div className="bg-white p-4 sm:p-6 text-center">
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  "Mi experiencia con Habi fue un 9/10, estuvieron de mi lado siempre"
                </p>
              </div>
            </div>

            {/* Testimonial 3 - Martha Lucía Roa */}
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg relative z-10">
              {/* Image and name section */}
              <div className="bg-purple-50 p-4 sm:p-6 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full overflow-hidden">
                  <img 
                    src="/logo/cliente3.png" 
                    alt="Martha Lucía Roa" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className={`${montserrat.className} text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2`}
                    style={{ color: "#7400C2" }}>
                  Martha Lucía Roa
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">
                  Encontró su hogar ideal
                </p>
              </div>
              {/* Testimonial section */}
              <div className="bg-white p-4 sm:p-6 text-center">
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  "Los califico con 9/10 por su disposición, fue un hermoso proceso y respondieron a todas nuestras preguntas"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para cliente paga trámites */}
      <AlertDialog open={showClientPaysModal} onOpenChange={setShowClientPaysModal}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center" style={{ color: "#7400C2" }}>
              ¿Estás seguro?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-600 space-y-3">
              <p>
                Al elegir esta opción, <strong>tú deberás pagar</strong> todos los costos de trámites, notarías y registros.
              </p>
              <p className="flex items-start gap-2">
                <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span><strong>Importante:</strong> Deberás acercarte a pagarlos en la notaría el mismo día que Habi realice la escritura.</span>
              </p>
              <p className="text-sm text-purple-600">
                Costo estimado: $8.000.000 - $15.000.000
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClientPaysConfirm}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
            >
              Sí, acepto pagar los trámites
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )

  // Mostrar loading mientras se cargan los datos
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-medium text-purple-600">Cargando tu propuesta personalizada...</p>
          <p className="text-gray-600 mt-2">NID: {nid}</p>
        </div>
      </div>
    )
  }

  // Si no hay NID, mostrar la landing con valores por defecto
  if (!nid && !isLoading) {
    // Mostrar la landing con valores por defecto cuando no hay NID
    const defaultProperties: HubSpotProperties = {
      precio_comite_final_final_final__el_unico__: "148566058",
      whatsapp_asesor: "https://api.whatsapp.com/send?phone=3009128399"
    }
    
    return (
      <div className="min-h-screen bg-gray-50">
        {renderLandingContent(defaultProperties)}
      </div>
    )
  }

  return (
    <div key={`${nid}-${forceUpdate}`} className="min-h-screen bg-gray-50">
      {renderLandingContent(properties || {
        precio_comite_final_final_final__el_unico__: "148566058",
        whatsapp_asesor: "https://api.whatsapp.com/send?phone=3009128399"
      })}
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xl font-medium text-purple-600">Cargando...</p>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomePageContent />
    </Suspense>
  )
}