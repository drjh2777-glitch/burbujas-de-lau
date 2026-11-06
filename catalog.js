/* ============================================================
   Burbujas de Lau · Catálogo editable
   ------------------------------------------------------------
   Este archivo es la "base de datos" de la tienda.
   Puedes editarlo a mano o, mejor, usar el Panel de administración
   (admin.html) y pulsar "Descargar catalog.js" para reemplazarlo.
   Cada cambio publicado aquí lo verán todos los visitantes.
   ============================================================ */
window.BDL_CATALOG = {
  version: 3,
  updatedAt: "2026-11-05T00:00:00.000Z",
  settings: {
    brand: "Burbujas de Lau",
    tagline: "Jabones artesanales hechos a mano en La Habana",
    whatsapp: "5354015519",
    currency: "CUP",
    location: "La Habana, Cuba",
    hours: "Lun a Sáb · 9:00 a 18:00",
    email: "hola@burbujasdelau.com",
    announcement: "🎁 Envíos a toda La Habana y por encomienda a provincias · Pide por WhatsApp",
    deliveryNotice: "Envíos en toda La Habana y envíos por encomienda a provincias. Pedidos para familiares en Cuba desde cualquier país.",
    heroTitle: "Jabones artesanales que cuidan tu piel",
    heroSubtitle: "Barras hechas a mano en pequeños lotes con aceites naturales, arcillas y plantas. Sin químicos agresivos, con el aroma de lo hecho con calma.",
    seoTitle: "Burbujas de Lau · Jabones artesanales en La Habana, Cuba",
    seoDescription: "Jabones artesanales naturales hechos a mano en La Habana: lavanda, avena, rosa, sábila y manzanilla. Pide por WhatsApp con envío a toda Cuba.",
    siteUrl: "https://burbujasdelau.com/",
    freeShippingFrom: 0
  },
  categories: [
    { id: "exfoliante", name: "Exfoliante" },
    { id: "suave", name: "Suave" },
    { id: "aromatico", name: "Aromático" },
    { id: "hidratante", name: "Hidratante" }
  ],
  products: [
    {
      id: "p1",
      name: "Lavanda y granos",
      category: "exfoliante",
      price: 400,
      weight: "115 g",
      avail: false,
      featured: true,
      img: "img/p1.jpg",
      alt: "Jabón artesanal de lavanda y granos con flores de lavanda silvestre",
      desc: "Barra lila infusionada con flores de lavanda silvestre y un suave efecto exfoliante natural que calma y renueva la piel.",
      ingredients: "Aceite de oliva, manteca de karité, flores de lavanda, granos de avena, aceite esencial de lavanda."
    },
    {
      id: "p2",
      name: "Avena y semillas",
      category: "suave",
      price: 400,
      weight: "120 g",
      avail: false,
      featured: true,
      img: "img/p2.jpg",
      alt: "Jabón artesanal de avena orgánica y semillas con miel silvestre",
      desc: "Barra cremosa con avena orgánica molida y miel silvestre que nutre en profundidad, aliviando irritaciones con espuma sedosa.",
      ingredients: "Aceite de coco, avena orgánica molida, miel silvestre, semillas de lino, manteca de cacao."
    },
    {
      id: "p3",
      name: "Rosa suave",
      category: "aromatico",
      price: 400,
      weight: "110 g",
      avail: false,
      featured: false,
      img: "img/p3.jpg",
      alt: "Jabón artesanal de rosa con arcilla rosa francesa y pétalos de rosa",
      desc: "Barra rosada enriquecida con arcilla rosa francesa y destilado de pétalos de rosa para una limpieza sedosa y reconfortante.",
      ingredients: "Aceite de oliva, arcilla rosa francesa, destilado de pétalos de rosa, aceite esencial de rosa."
    },
    {
      id: "p4",
      name: "Sábila",
      category: "hidratante",
      price: 400,
      weight: "30 g",
      avail: true,
      featured: true,
      img: "img/p4.jpg",
      alt: "Jabón artesanal de sábila (aloe vera) hidratante para todo tipo de piel",
      desc: "Barra verde con el poder natural de la sábila (aloe vera): limpia con suavidad, hidrata en profundidad y deja la piel fresca, suave y saludable. Hecha a mano, ideal para todo tipo de piel.",
      ingredients: "Pulpa de sábila (aloe vera), aceite de coco, glicerina vegetal, aceite de almendras."
    },
    {
      id: "p5",
      name: "Manzanilla",
      category: "suave",
      price: 400,
      weight: "30 g",
      avail: true,
      featured: false,
      img: "img/p5.jpg",
      alt: "Jabón artesanal de manzanilla que calma y protege la piel",
      desc: "Barra artesanal de manzanilla que calma, cuida y protege tu piel de forma natural. Ayuda a aliviar irritaciones, hidrata en profundidad y deja una sensación limpia y suave. Ideal para todo tipo de piel.",
      ingredients: "Infusión de manzanilla, aceite de oliva, manteca de karité, aceite esencial de manzanilla."
    }
  ],
  testimonials: [
    { name: "Mariela R.", text: "Los jabones de sábila son mi favorito. La piel queda suave todo el día y el aroma es delicioso. ¡Ya voy por el tercero!", role: "La Habana" },
    { name: "Yusimí P.", text: "Pedí para mi mamá en Cuba desde Miami. Llegó rapidísimo por WhatsApp y ella quedó encantada con el de manzanilla.", role: "Miami, EE. UU." },
    { name: "Carlos M.", text: "Se nota que están hechos a mano. El de avena me ayudó con la piel irritada; no lo cambio por nada.", role: "Vedado" }
  ]
};
