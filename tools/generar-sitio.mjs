/* ============================================================
   Burbujas de Lau · Generador del sitio
   ------------------------------------------------------------
   Lee catalog.js (la única fuente de verdad) y escribe:
     - products.json          catálogo para buscadores y agentes IA
     - llms.txt               resumen para modelos de lenguaje
     - ai.html                página legible por humanos y máquinas
     - producto/<slug>.html   una ficha por jabón
     - sitemap.xml            mapa del sitio completo
     - estilo.css             copia de la hoja de estilos de index.html

   Las páginas generadas reutilizan la MISMA hoja de estilos,
   cabecera, pie y componentes que la portada: nada de estilos
   paralelos. Si cambias el diseño en index.html, vuelve a ejecutar
   este archivo y las fichas se actualizan solas.

   Uso:  node tools/generar-sitio.mjs      (desde la raíz del repo)
   No usa dependencias: solo Node.
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const HOY = new Date().toISOString().slice(0, 10);
const ANIO = new Date().getFullYear();

/* ---------- 1. Cargar el catálogo publicado ---------- */
const catalogCode = fs.readFileSync(path.join(ROOT, 'catalog.js'), 'utf8');
const sandbox = { window: {} };
new Function('window', catalogCode)(sandbox.window);
const C = sandbox.window.BDL_CATALOG;
if (!C || !Array.isArray(C.products)) {
  console.error('No pude leer window.BDL_CATALOG desde catalog.js');
  process.exit(1);
}

const S = C.settings || {};
const SITE = String(S.siteUrl || 'https://drjh2777-glitch.github.io/burbujas-de-lau/').replace(/\/?$/, '/');
const BRAND = S.brand || 'Burbujas de Lau';
const CURRENCY = S.currency || 'CUP';
const WA = String(S.whatsapp || '').replace(/[^0-9]/g, '');
const EMAIL = S.email || '';
const CATS = Object.fromEntries((C.categories || []).map((c) => [c.id, c.name]));

const slug = (s) =>
  String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const esc = (s) =>
  String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const money = (n) => new Intl.NumberFormat('es-CU', { maximumFractionDigits: 0 }).format(Number(n) || 0) + ' ' + CURRENCY;
const tel = '+' + WA.slice(0, 2) + ' ' + WA.slice(2, 6) + ' ' + WA.slice(6);
const wa = (text) => 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text);

/* ---------- 2. Hoja de estilos compartida ----------
   Se copia tal cual desde index.html para que las fichas y la
   página de IA tengan exactamente el mismo aspecto. Vive en la
   raíz, así que las rutas de las tipografías (fonts/…) siguen
   funcionando desde cualquier subcarpeta. */
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const styleMatch = indexHtml.match(/<style>([\s\S]*?)<\/style>/);
if (!styleMatch) {
  console.error('No encontré el bloque <style> en index.html');
  process.exit(1);
}
const CSS_FILE = 'estilo.css';
fs.writeFileSync(
  path.join(ROOT, CSS_FILE),
  '/* Burbujas de Lau · hoja de estilos compartida\n   Copia exacta de la que usa index.html (generada por tools/generar-sitio.mjs).\n   No la edites a mano: edita index.html y vuelve a ejecutar el generador. */\n' +
  styleMatch[1].trim() + '\n'
);

/* ---------- 3. Piezas de la web que se repiten ---------- */
const BRAND_MARK = '<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true"><circle cx="16" cy="22" r="9" fill="none" stroke="#d85f3a" stroke-width="2.4"/><circle cx="26" cy="14" r="5.5" fill="none" stroke="#7a8450" stroke-width="2.4"/><circle cx="24" cy="29" r="3" fill="#d85f3a"/></svg>';

const WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.06 24l1.7-6.2A11.9 11.9 0 0 1 .14 11.9C.14 5.3 5.5 0 12.06 0a11.8 11.8 0 0 1 8.42 3.5 11.8 11.8 0 0 1 3.49 8.41c0 6.6-5.36 11.9-11.91 11.9a11.9 11.9 0 0 1-5.7-1.45L.06 24zM6.6 20.2l.36.2a9.9 9.9 0 0 0 5.1 1.4c5.44 0 9.87-4.4 9.87-9.83a9.8 9.8 0 0 0-2.9-6.98A9.8 9.8 0 0 0 12.06 2C6.6 2 2.2 6.4 2.2 11.84c0 1.85.5 3.6 1.4 5.13l.24.38-1 3.66 3.76-.8z"/><path d="M9.1 6.9c-.2-.45-.4-.46-.58-.47l-.5-.01c-.17 0-.45.07-.68.33-.24.26-.9.88-.9 2.14s.92 2.48 1.05 2.65c.13.17 1.8 2.84 4.4 3.86 2.15.85 2.6.68 3.06.64.47-.04 1.5-.61 1.72-1.2.2-.6.2-1.1.14-1.2-.06-.12-.22-.18-.46-.3-.24-.13-1.5-.74-1.73-.82-.23-.09-.4-.13-.57.12-.17.26-.65.84-.8 1-.14.18-.29.2-.53.07-.24-.12-1.03-.38-1.96-1.21-.72-.65-1.2-1.44-1.34-1.69-.14-.25-.02-.38.1-.5.12-.12.29-.31.42-.47.14-.16.18-.27.27-.45.09-.18.04-.33-.02-.46-.06-.13-.56-1.4-.77-1.9z"/></svg>';

function topbar() {
  return `<div class="topbar" id="announceBar">
  <strong>Envíos</strong> a toda La Habana<span class="tb-long"> y por encomienda a provincias · Pedidos por WhatsApp <a href="https://wa.me/${WA}" style="color:#ff8856;text-decoration:none" rel="noopener">${tel}</a></span>
</div>`;
}

function header(base) {
  return `<header class="site-header" id="header">
  <div class="wrap header-in">
    <a class="brand" href="${base}index.html" aria-label="${esc(BRAND)}, inicio">
      ${BRAND_MARK}
      <span>
        <span class="brand-name">${esc(BRAND)}</span>
        <span class="brand-sub">Jabones artesanales · La Habana</span>
      </span>
    </a>
    <nav class="nav" aria-label="Navegación principal">
      <a href="${base}index.html#catalogo">Catálogo</a>
      <a href="${base}index.html#porque">Por qué</a>
      <a href="${base}index.html#proceso">Cómo se hace</a>
      <a href="${base}index.html#preguntas">Preguntas</a>
    </nav>
    <div class="header-actions">
      <a class="btn sm hdr-wa" href="${wa('Hola ' + BRAND + ' 👋 quiero pedir jabones')}" target="_blank" rel="noopener">
        ${WA_ICON}
        Pedir
      </a>
    </div>
  </div>
</header>`;
}

function footer(base) {
  return `<footer class="site">
  <div class="wrap">
    <div class="f-grid">
      <div>
        <p class="brand-name">${esc(BRAND)}</p>
        <p class="brand-sub">Jabones artesanales · La Habana</p>
        <p class="f-about">Jabones hechos a mano en lotes pequeños, con aceites naturales, arcillas y plantas. Sin plástico y sin prisa.</p>
      </div>
      <div>
        <h4>Tienda</h4>
        <ul>
          <li><a href="${base}index.html#catalogo">Catálogo</a></li>
          <li><a href="${base}index.html#comprar">Cómo comprar</a></li>
          <li><a href="${base}index.html#preguntas">Preguntas frecuentes</a></li>
          <li><a href="${base}index.html#historia">Quién está detrás</a></li>
        </ul>
      </div>
      <div>
        <h4>Contacto</h4>
        <ul>
          <li><a class="wa-link" href="https://wa.me/${WA}" target="_blank" rel="noopener">WhatsApp ${tel}</a></li>
          <li>La Habana, Cuba</li>
          <li>${esc(S.hours || 'Lun a Sáb · 9:00 a 18:00')}</li>
        </ul>
      </div>
      <div>
        <h4>Envíos y pagos</h4>
        <p style="line-height:1.6;color:rgba(255,255,255,.5)">Entregas en La Habana en 24–48 h. Encomiendas a todas las provincias. Pago contra entrega o transferencia.</p>
        <p style="margin-top:.9rem"><a class="btn sm" href="https://wa.me/${WA}" target="_blank" rel="noopener" style="box-shadow:none">Pedir por WhatsApp</a></p>
      </div>
    </div>
    <div class="f-bottom">
      <p>© <span>${ANIO}</span> ${esc(BRAND)} · Hecho a mano en La Habana</p>
      <p><a href="${base}privacidad.html">Privacidad</a> · <a href="${base}sitemap.xml">Mapa del sitio</a> · <a href="${base}ai.html">Para asistentes de IA</a> · <a href="${base}products.json">Catálogo JSON</a></p>
    </div>
  </div>
</footer>`;
}

function finalCta(base) {
  return `<section class="final">
  <div class="wrap">
    <p class="eyebrow" style="justify-content:center">Hoy eliges el tuyo</p>
    <h2 class="display">Tu piel se merece<br>algo hecho con calma</h2>
    <p class="lead">Elige tus barras y te las llevo. Si no sabes cuál, escríbeme y te ayudo a encontrar la tuya.</p>
    <div class="hero-cta">
      <a class="btn" href="${base}index.html#catalogo">Ver el catálogo
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </a>
      <a class="btn ghost" href="${wa('Hola ' + BRAND + ' 👋 quiero hacer un pedido')}" target="_blank" rel="noopener">
        ${WA_ICON}
        Escribir por WhatsApp
      </a>
    </div>
    <p class="hero-note">Respondemos en el día · Lunes a sábado, 9:00 a 18:00</p>
    <p class="hand">nos vemos en el próximo lote ✦</p>
  </div>
</section>`;
}

/* ---------- 4. Texto propio de cada jabón ---------- */
const EXTRA = {
  p1: {
    seoTitle: 'Jabón exfoliante de lavanda y granos · 80 g · Burbujas de Lau',
    seoDesc: 'Jabón artesanal de lavanda con flores silvestres y granos de avena que exfolian sin raspar. 80 g, 450 CUP. Hecho a mano en La Habana, pedido por WhatsApp.',
    h1: 'Jabón de lavanda y granos',
    titular: 'Exfolia, huele a lavanda<br>y se nota en la piel',
    lead: 'La barra más aromática del taller. El grano es avena molida, así que renueva la piel sin dejarla enrojecida.',
    benefits: [
      { t: 'Exfolia sin raspar', d: 'El grano es avena molida, no cáscara dura: se deshace con el agua y arrastra las células muertas sin lijar la piel.' },
      { t: 'Aroma de flor, no de perfume', d: 'La lavanda va dentro de la barra, en flores y aceite esencial. Huele a lo que es y se va con el agua.' },
      { t: 'Prepara la piel para la crema', d: 'Sobre una piel lisa la crema se absorbe mejor. Dos o tres veces por semana bastan para notarlo.' }
    ],
    paraQuien: 'Para piel normal o mixta del cuerpo, y para quien disfruta el momento de exfoliarse en la ducha. Si tu piel es muy reactiva, empieza por Avena y semillas o Manzanilla: esta barra tiene textura.',
    uso: 'Dos o tres veces por semana, con la piel mojada y movimientos circulares suaves. No la uses en la cara ni sobre piel irritada o recién afeitada. Después, seca la barra de pie para que dure.',
    extra: [
      'El grano de esta barra es avena molida, no polvo de cáscara: se deshace con el agua y no deja microarañazos. Es la diferencia entre exfoliar y lijar.',
      'Es también la que más sale como regalo. Huele fuerte en la mano y suave en la piel, y el color lila viene de la arcilla y las flores, sin colorante artificial.'
    ],
    keywords: ['jabón exfoliante', 'jabón de lavanda', 'jabón artesanal La Habana', 'exfoliante natural', 'jabón con avena']
  },
  p2: {
    seoTitle: 'Jabón suave de avena y semillas · 80 g · Burbujas de Lau',
    seoDesc: 'Jabón artesanal de avena orgánica, miel silvestre y semillas de lino para pieles sensibles. 80 g, 450 CUP. Hecho a mano en La Habana, pedido por WhatsApp.',
    h1: 'Jabón de avena y semillas',
    titular: 'La barra más suave<br>del catálogo',
    lead: 'Avena orgánica, miel silvestre y ninguna fragancia. La que recomendamos cuando la piel reacciona a todo.',
    benefits: [
      { t: 'Calma la tirantez', d: 'La avena molida y la miel hacen una espuma corta y cremosa que no deja la piel reseca después de la ducha.' },
      { t: 'Sin fragancia, a propósito', d: 'Cuando la piel está reactiva, lo último que necesita es perfume. Esta barra no lleva, y se nota en el aroma.' },
      { t: 'La puerta de entrada', d: 'Es la que recomendamos a quien dice «todo me deja la piel roja». Casi todas vuelven después por otra variedad.' }
    ],
    paraQuien: 'Para piel seca, sensible o que reacciona a los geles de tienda. También funciona bien en pieles maduras y en quien busca un jabón sin ningún perfume.',
    uso: 'Uso diario, en cuerpo y manos. Haz espuma entre las palmas y pasa la espuma, no la barra, por la piel. Si la usas en la cara, evita el contorno de ojos.',
    extra: [
      'Esta es la barra menos aromática del catálogo, y es a propósito: cuando la piel está reactiva, lo último que necesita es perfume. La avena hace el trabajo y la miel se encarga de que no quede seca.',
      'Suele ser la puerta de entrada a los jabones artesanales: quien empieza por aquí normalmente vuelve por Sábila y se queda.'
    ],
    keywords: ['jabón de avena', 'jabón para piel sensible', 'jabón sin perfume', 'jabón con miel', 'jabón artesanal Cuba']
  },
  p3: {
    seoTitle: 'Jabón de rosa y arcilla rosa francesa · 80 g · Burbujas de Lau',
    seoDesc: 'Jabón artesanal de rosa con arcilla rosa francesa y destilado de pétalos. Limpieza sedosa y aroma floral suave. 80 g, 450 CUP. Pedidos por WhatsApp.',
    h1: 'Jabón de rosa suave',
    titular: 'Rosa, arcilla<br>y nada más',
    lead: 'Arcilla rosa francesa y destilado de pétalos. El color sale de los ingredientes, no de un colorante.',
    benefits: [
      { t: 'Arcilla que no reseca', d: 'La arcilla rosa francesa absorbe el exceso de grasa sin arrastrar la hidratación natural de la piel.' },
      { t: 'Color de verdad', d: 'El rosa sale de la arcilla y del destilado de pétalos. Con el tiempo se aclara un poco, y eso es normal en un jabón sin tintes.' },
      { t: 'El regalo que no falla', d: 'Es la que más sale para cumpleaños y detalles: aroma floral discreto, bonita de usar y de regalar.' }
    ],
    paraQuien: 'Para piel normal y para quien quiere un jabón bonito de usar y de regalar. Si tu piel es grasa en espalda o brazos, la arcilla ayuda; si es muy seca, mejor Sábila o Avena.',
    uso: 'Uso diario en el cuerpo. Al tener arcilla, conviene dejarla escurrir en una jabonera con agujeros: si se queda en el agua, se ablanda antes de tiempo.',
    extra: [
      'El color de esta barra no lleva colorante: sale de la arcilla rosa y del destilado de pétalos. Con el tiempo se aclara un poco, y eso es normal en un jabón sin tintes.',
      'Es la favorita para regalar por el aroma. Si buscas un detalle para una amiga, una madre o una maestra, esta es la barra que no falla.'
    ],
    keywords: ['jabón de rosa', 'jabón con arcilla rosa', 'jabón floral artesanal', 'jabón para regalar', 'jabón artesanal La Habana']
  },
  p4: {
    seoTitle: 'Jabón de sábila (aloe vera) hidratante · 80 g · Burbujas de Lau',
    seoDesc: 'Jabón artesanal de sábila con pulpa de aloe vera, aceite de coco y almendras. Limpia e hidrata sin dejar la piel tirante. 80 g, 450 CUP. Pedidos por WhatsApp.',
    h1: 'Jabón de sábila',
    titular: 'Sábila de verdad,<br>no aroma de sábila',
    lead: 'Lleva pulpa de aloe vera, y por eso la barra es verde translúcida y la textura, gelatinosa.',
    benefits: [
      { t: 'Sábila de verdad', d: 'Lleva pulpa de aloe, no aroma de aloe. Es la primera barra que Lau hizo, y todavía se hace igual.' },
      { t: 'Limpia sin dejar tirante', d: 'La glicerina vegetal se queda en la barra: sales de la ducha con la piel cómoda, no con esa sequedad de los geles.' },
      { t: 'La más «para todos»', d: 'Funciona en piel normal, seca o mixta, y aguanta bien el calor de Cuba sin dejar película.' }
    ],
    paraQuien: 'Para casi cualquier piel, y en especial para quien sale de la ducha con la piel tirante o vive en un clima caluroso. Es la más pedida para uso diario en toda la familia.',
    uso: 'Uso diario en cuerpo, cara y manos. En la cara, haz espuma en las manos primero. Después del sol, deja que la piel se enfríe antes de usarla y aplica una crema suave.',
    extra: [
      'La sábila es lo primero que mucha gente asocia con esta tienda, y con razón: es la barra que Lau empezó haciendo para su propia piel. La textura es distinta a las demás, más gelatinosa, porque el aloe va dentro y no como fragancia.',
      'Se lleva muy bien con el clima de Cuba: hidrata sin dejar película y no pesa en la piel cuando hace calor.'
    ],
    keywords: ['jabón de sábila', 'jabón de aloe vera', 'jabón hidratante artesanal', 'jabón para piel seca', 'jabón natural La Habana']
  },
  p5: {
    seoTitle: 'Jabón de manzanilla para piel sensible · 80 g · Burbujas de Lau',
    seoDesc: 'Jabón artesanal de manzanilla con infusión de flores y manteca de karité: calma y protege la piel. 80 g, 450 CUP. Hecho a mano en La Habana, pedidos por WhatsApp.',
    h1: 'Jabón de manzanilla',
    titular: 'Calma, aroma bajo<br>y karité',
    lead: 'La manzanilla es la base de la barra, no un aroma añadido al final. Se nota en el color y en la suavidad.',
    benefits: [
      { t: 'Infusión, no esencia', d: 'La manzanilla es la base de la barra. Eso se nota en el color pálido y en lo suave que resulta en la piel.' },
      { t: 'Karité que protege', d: 'La manteca de karité deja una película fina que protege después del lavado, sin sensación grasa.' },
      { t: 'Aroma bajo, de noche', d: 'Huele a flores, pero suave. Es la que mejor va para el baño de la noche y para pieles que rechazan perfumes.' }
    ],
    paraQuien: 'Para piel sensible, piel con rojeces y para bañar a niños grandes con tranquilidad. Es la alternativa suave a Avena cuando alguien quiere un aroma floral muy leve en vez de ninguno.',
    uso: 'Uso diario en cuerpo y manos. Es la que mejor va para un baño relajado por la noche: el aroma es bajo y no queda pegado a la piel.',
    extra: [
      'Si dudas entre esta y Avena, la diferencia es el aroma: las dos son suaves, pero la manzanilla huele a flores y la avena huele a miel y cereal. Las dos son buena elección para piel reactiva.',
      'Es también la barra que más piden las abuelas para los nietos. Nos lo dicen así, tal cual, por WhatsApp.'
    ],
    keywords: ['jabón de manzanilla', 'jabón para piel sensible', 'jabón para niños', 'jabón calmante artesanal', 'jabón artesanal Cuba']
  }
};

/* ---------- 5. Datos normalizados ---------- */
const products = (C.products || []).map((p) => {
  const imgs = p.img || '';
  return {
    id: p.id,
    slug: slug(p.name),
    sku: String(p.id || '').toUpperCase(),
    name: p.name,
    description: p.desc || '',
    ingredients: p.ingredients || '',
    category: p.category,
    categoryName: CATS[p.category] || p.category,
    weight: p.weight || '',
    price: Number(p.price) || 0,
    currency: CURRENCY,
    available: p.avail !== false,
    availability: p.avail === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
    featured: !!p.featured,
    image: SITE + imgs,
    imagePath: imgs,
    alt: p.alt || ('Jabón artesanal ' + p.name),
    url: SITE + 'producto/' + slug(p.name) + '.html'
  };
});

/* ---------- 6. products.json ---------- */
const productsJson = {
  $schema: 'https://schema.org/ItemList',
  brand: BRAND,
  description: S.tagline || '',
  siteUrl: SITE,
  currency: CURRENCY,
  whatsapp: '+' + WA,
  updatedAt: C.updatedAt || new Date().toISOString(),
  generatedFrom: 'catalog.js',
  generatedAt: HOY,
  count: products.length,
  categories: (C.categories || []).map((c) => ({ id: c.id, name: c.name })),
  products: products.map((p) => ({
    id: p.id, slug: p.slug, sku: p.sku, name: p.name, description: p.description,
    ingredients: p.ingredients, category: p.category, categoryName: p.categoryName,
    weight: p.weight, price: p.price, currency: p.currency, available: p.available,
    featured: p.featured, image: p.image, alt: p.alt, url: p.url
  }))
};
fs.writeFileSync(path.join(ROOT, 'products.json'), JSON.stringify(productsJson, null, 2) + '\n');

/* ---------- 7. Imagen de producto con los mismos formatos que la portada ---------- */
function picture(p, base, eager, sizes) {
  const src = p.imagePath || 'img/p1.jpg';
  const m = /^img\/(p[0-9]+)\.(jpe?g|png|webp)$/i.exec(src);
  const alt = esc(p.alt);
  if (!m) {
    return `<picture><img src="${base}${esc(src)}" alt="${alt}" loading="${eager ? 'eager' : 'lazy'}" decoding="async"></picture>`;
  }
  const id = m[1];
  return `<picture>` +
    `<source type="image/webp" sizes="${sizes || '(max-width:640px) 92vw, (max-width:1100px) 46vw, 420px'}" srcset="${base}img/${id}-480.webp 480w, ${base}img/${id}-760.webp 760w, ${base}img/${id}.webp 1000w">` +
    `<img src="${base}${esc(src)}" alt="${alt}" width="1000" height="750" loading="${eager ? 'eager' : 'lazy'}" decoding="async">` +
    `</picture>`;
}

/* ---------- 8. Enlaces de descubrimiento (los mismos en todas las páginas) ---------- */
function discoveryLinks() {
  return `<link rel="alternate" type="application/json" href="${SITE}products.json" title="Catálogo completo en JSON">
<link rel="alternate" type="application/json" href="${SITE}webmcp.json" title="Herramientas para agentes IA">
<link rel="alternate" type="text/plain" href="${SITE}llms.txt" title="Resumen para modelos de lenguaje">
<link rel="help" href="${SITE}ai.html" title="Información para asistentes de IA">`;
}

/* ---------- 9. Ficha de producto ---------- */
function productPage(p) {
  const e = EXTRA[p.id] || {};
  const otros = products.filter((o) => o.id !== p.id);
  const shopLink = p.available
    ? wa('Hola ' + BRAND + ' 👋 quiero pedir el jabón ' + p.name + ' (' + p.weight + '). ¿Cómo coordinamos la entrega?')
    : wa('Hola ' + BRAND + ' 👋 me interesa el jabón ' + p.name + ' (' + p.weight + '). ¿Cuándo vuelve a estar disponible?');

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': p.url + '#product',
        name: p.name,
        sku: p.sku,
        category: p.categoryName,
        description: p.description,
        image: [p.image],
        url: p.url,
        brand: { '@type': 'Brand', name: BRAND },
        material: p.ingredients,
        weight: { '@type': 'QuantitativeValue', value: parseFloat(p.weight) || undefined, unitCode: 'GRM' },
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Peso', value: p.weight },
          { '@type': 'PropertyValue', name: 'Hecho a mano', value: 'Sí, en lotes pequeños' },
          { '@type': 'PropertyValue', name: 'Origen', value: 'La Habana, Cuba' }
        ],
        keywords: (e.keywords || []).join(', '),
        audience: { '@type': 'PeopleAudience', audienceType: 'Personas que buscan un jabón natural para el cuerpo, la cara o las manos' },
        offers: {
          '@type': 'Offer',
          '@id': p.url + '#offer',
          url: p.url,
          price: p.price,
          priceCurrency: p.currency,
          availability: p.availability,
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@type': 'Organization', name: BRAND, url: SITE },
          areaServed: [{ '@type': 'City', name: 'La Habana' }, { '@type': 'Country', name: 'Cuba' }],
          priceValidUntil: '2027-12-31'
        }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE },
          { '@type': 'ListItem', position: 2, name: 'Catálogo', item: SITE + '#catalogo' },
          { '@type': 'ListItem', position: 3, name: p.name, item: p.url }
        ]
      }
    ]
  };

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(e.seoTitle || p.name + ' · ' + BRAND)}</title>

<!-- ===== SEO ===== -->
<meta name="description" content="${esc(e.seoDesc || p.description)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta name="theme-color" content="#EFEAE0">
<meta name="geo.region" content="CU-03">
<meta name="geo.placename" content="La Habana">
<link rel="canonical" href="${p.url}">
<link rel="icon" href="../favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="../img/apple-touch-icon.png">
<link rel="manifest" href="../site.webmanifest">
<link rel="preload" as="font" type="font/woff2" href="../fonts/inter-var.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="../fonts/fugaz-one-400.woff2" crossorigin>

<meta property="og:type" content="product">
<meta property="og:site_name" content="${esc(BRAND)}">
<meta property="og:locale" content="es_CU">
<meta property="og:title" content="${esc(e.seoTitle || p.name)}">
<meta property="og:description" content="${esc(e.seoDesc || p.description)}">
<meta property="og:url" content="${p.url}">
<meta property="og:image" content="${p.image}">
<meta property="og:image:alt" content="${esc(p.alt)}">
<meta property="product:price:amount" content="${p.price}">
<meta property="product:price:currency" content="${p.currency}">
<meta property="product:availability" content="${p.available ? 'in stock' : 'out of stock'}">
<meta property="product:condition" content="new">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(e.seoTitle || p.name)}">
<meta name="twitter:description" content="${esc(e.seoDesc || p.description)}">
<meta name="twitter:image" content="${p.image}">

${discoveryLinks()}

<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>
<link rel="stylesheet" href="../${CSS_FILE}">
</head>
<body>
<a class="skip" href="#ficha">Saltar al contenido</a>

${topbar()}
${header('../')}

<main id="ficha">

<!-- ============ la barra ============ -->
<section class="sec" style="padding-top:1.6rem;padding-bottom:0">
  <div class="wrap">
    <nav class="card-meta" aria-label="Ruta" style="margin-bottom:1.1rem">
      <a href="../index.html" style="text-decoration:none;color:inherit">Inicio</a>
      <span aria-hidden="true">·</span>
      <a href="../index.html#catalogo" style="text-decoration:none;color:inherit">Catálogo</a>
      <span aria-hidden="true">·</span>
      <span style="color:var(--ink)">${esc(p.name)}</span>
    </nav>

    <div class="modal-box" style="max-width:none;max-height:none;overflow:visible">
      <div class="modal-grid">
        <div class="modal-media">
          ${picture(p, '../', true, '(max-width:800px) 92vw, 520px')}
          ${p.available ? (p.featured ? '<span class="badge">Favorito</span>' : '') : '<span class="badge out">Agotado</span>'}
        </div>
        <div class="modal-info">
          <p class="card-meta"><span>${esc(p.categoryName)}</span><span aria-hidden="true">·</span><span>${esc(p.weight)}</span></p>
          <h1 class="display" style="font-size:clamp(1.9rem,4.4vw,2.7rem);margin-top:.7rem">${esc(e.h1 || p.name)}</h1>
          <p class="desc">${esc(p.description)}</p>
          <p class="price">${money(p.price)}<small>por barra de ${esc(p.weight)}</small></p>
          <p class="mono" style="margin-top:.75rem;color:${p.available ? 'var(--olive)' : 'var(--terra-deep)'}">${p.available ? '● Disponible ahora' : '● Agotado por ahora · pregúntanos por WhatsApp'}</p>
          <div class="ing"><strong>Ingredientes</strong>${esc(p.ingredients)}</div>
          <div class="modal-actions">
            <a class="btn w" href="${shopLink}" target="_blank" rel="noopener">${p.available ? 'Pedir por WhatsApp' : 'Preguntar cuándo vuelve'}</a>
            <a class="btn ghost w" href="../index.html#catalogo">Ver el catálogo</a>
          </div>
          <p class="mono" style="margin-top:1rem;font-size:10.5px;letter-spacing:.08em;color:var(--ink-soft)">Ref. ${esc(p.sku)} · Hecho a mano en La Habana · Envíos en 24–48 h</p>
        </div>
      </div>
    </div>
  </div>
</section>

<hr class="hr">

<!-- ============ por qué ============ -->
<section class="sec">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow">Por qué esta barra</p>
      <h2 class="display">${e.titular || esc(p.name)}</h2>
      <p class="lead">${esc(e.lead || '')}</p>
    </div>
    <div class="features">
      ${(e.benefits || []).map((b, i) => `<article class="feature">
        <p class="num">0${i + 1}</p>
        <div>
          <h3>${esc(b.t)}</h3>
          <p>${esc(b.d)}</p>
        </div>
      </article>`).join('\n      ')}
    </div>
  </div>
</section>

<!-- ============ para quién / cómo usarla ============ -->
<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="two-col">
      <div class="col">
        <h3><i></i>Para quién es</h3>
        <p class="lead" style="font-size:15px">${esc(e.paraQuien || '')}</p>
      </div>
      <div class="col">
        <h3><i></i>Cómo usarla</h3>
        <p class="lead" style="font-size:15px">${esc(e.uso || '')}</p>
      </div>
    </div>
  </div>
</section>

<!-- ============ lo que no se ve ============ -->
<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow">Lo que no se ve en la foto</p>
      <h2 class="display">Dos cosas que conviene saber</h2>
    </div>
    <div style="margin-top:1.5rem;display:grid;gap:1rem;max-width:62ch">
      ${(e.extra || []).map((t) => `<p style="font-size:15px;line-height:1.7;color:var(--ink-mute)">${esc(t)}</p>`).join('\n      ')}
    </div>
  </div>
</section>

<!-- ============ otros jabones ============ -->
<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow">Sigue mirando</p>
      <h2 class="display">Otros jabones</h2>
    </div>
    <div class="grid" style="margin-top:2rem">
      ${otros.map((o) => `<a class="card" href="${o.slug}.html" style="text-decoration:none">
        <div class="card-media">
          ${picture(o, '../', false, '(max-width:640px) 92vw, 300px')}
          ${o.available ? '' : '<span class="badge out">Agotado</span>'}
        </div>
        <div class="card-body">
          <p class="card-meta"><span>${esc(o.categoryName)}</span><span aria-hidden="true">·</span><span>${esc(o.weight)}</span></p>
          <h3 class="card-title">${esc(o.name)}</h3>
          <div class="card-foot">
            <p class="card-price">${money(o.price)}<small>por barra</small></p>
            <span class="link-arrow" style="font-size:10px">Ver ficha</span>
          </div>
        </div>
      </a>`).join('\n      ')}
    </div>
  </div>
</section>

${finalCta('../')}

</main>

${footer('../')}
</body>
</html>
`;
}

/* ---------- 10. llms.txt ---------- */
function buildLlms() {
  const lines = [];
  lines.push('# ' + BRAND);
  lines.push('');
  lines.push('> ' + (S.tagline || 'Jabones artesanales hechos a mano en La Habana, Cuba') + '. Tienda sin pasarela de pago: los pedidos se cierran por WhatsApp. Precios en ' + CURRENCY + '.');
  lines.push('');
  lines.push('## Negocio');
  lines.push('');
  lines.push('- Nombre: ' + BRAND);
  lines.push('- Qué es: jabonería artesanal. Barras de ' + (products[0] ? products[0].weight : '80 g') + ' hechas a mano en lotes pequeños, con aceites vegetales, mantecas, arcillas y plantas.');
  lines.push('- Dónde: ' + (S.location || 'La Habana, Cuba'));
  lines.push('- Horario: ' + (S.hours || 'Lun a Sáb · 9:00 a 18:00'));
  lines.push('- WhatsApp de pedidos: +' + WA + ' (enlace directo: https://wa.me/' + WA + ')');
  if (EMAIL) lines.push('- Correo: ' + EMAIL);
  lines.push('- Web: ' + SITE);
  lines.push('- Moneda: ' + CURRENCY + ' (peso cubano). No se aceptan pagos con tarjeta internacional.');
  lines.push('- Entrega: ' + (S.deliveryNotice || 'La Habana en 24–48 h; encomienda a las demás provincias de Cuba.'));
  lines.push('- Pago: efectivo contra entrega o transferencia (Transfermóvil / Enzona). Pedidos desde el exterior se coordinan por WhatsApp.');
  lines.push('');
  lines.push('## Catálogo (' + products.length + ' jabones)');
  lines.push('');
  for (const p of products) {
    lines.push('- [' + p.name + '](' + p.url + ') — ' + p.categoryName + ' · ' + p.weight + ' · ' + money(p.price) + ' · ' + (p.available ? 'disponible' : 'agotado') + '. ' + p.description + ' Ingredientes: ' + p.ingredients);
  }
  lines.push('');
  lines.push('## Cómo se pide');
  lines.push('');
  lines.push('1. Se elige el jabón en el catálogo o se pide una recomendación por WhatsApp.');
  lines.push('2. Se envía el pedido por WhatsApp (+' + WA + ') con nombre, dirección de entrega y forma de pago.');
  lines.push('3. Se confirma disponibilidad, total y fecha de entrega en la conversación.');
  lines.push('');
  lines.push('## Recursos para agentes de IA');
  lines.push('');
  lines.push('- ' + SITE + 'products.json — catálogo completo en JSON (precio, disponibilidad, ingredientes, imagen y URL de cada producto).');
  lines.push('- ' + SITE + 'webmcp.json — definición de las herramientas WebMCP disponibles.');
  lines.push('- ' + SITE + 'webmcp.js — implementación en JavaScript: window.BDL_MCP.');
  lines.push('- ' + SITE + 'ai.html — la misma información en una página legible.');
  lines.push('- ' + SITE + 'catalog.js — archivo fuente editable del catálogo (window.BDL_CATALOG).');
  lines.push('');
  lines.push('## Herramientas disponibles');
  lines.push('');
  lines.push('- searchProducts(query, category, maxPrice, availableOnly) — busca jabones por texto, tipo o precio.');
  lines.push('- getProduct(idOrSlug) — devuelve un jabón completo.');
  lines.push('- getPrice(idOrSlug) — precio y moneda.');
  lines.push('- getStock(idOrSlug) — disponibilidad actual, o de todo el catálogo.');
  lines.push('- recommendProduct(skin, concerns, budget) — recomienda una barra según el tipo de piel.');
  lines.push('- createWhatsAppOrder(items, name, address) — arma el enlace de WhatsApp con el pedido y el total.');
  lines.push('- exportCatalog() — catálogo completo en un objeto.');
  lines.push('');
  lines.push('## Reglas de uso del contenido');
  lines.push('');
  lines.push('- Precios y disponibilidad cambian: la fuente de verdad es ' + SITE + 'products.json o ' + SITE + 'catalog.js. No los inventes ni los redondees.');
  lines.push('- Los productos son cosméticos, no medicamentos: no sirven para tratar enfermedades de la piel.');
  lines.push('- No hay pasarela de pago, ni stock reservado, ni envíos internacionales desde Cuba. Todo pedido se confirma por WhatsApp.');
  lines.push('- Las imágenes son de ' + BRAND + '; se pueden citar enlazando a la página del producto.');
  lines.push('');
  lines.push('## Páginas');
  lines.push('');
  lines.push('- [' + BRAND + ' — inicio](' + SITE + ')');
  for (const p of products) lines.push('- [' + p.name + '](' + p.url + ')');
  lines.push('- [Información para asistentes de IA](' + SITE + 'ai.html)');
  lines.push('- [Política de privacidad](' + SITE + 'privacidad.html)');
  lines.push('');
  lines.push('Última actualización: ' + HOY + '.');
  return lines.join('\n') + '\n';
}

/* ---------- 11. ai.html ---------- */
function buildAiPage() {
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Catálogo ' + BRAND,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: p.url, name: p.name }))
  };

  const lineas = [
    { t: 'Quién hace los jabones', d: BRAND + ' es una jabonería artesanal de ' + (S.location || 'La Habana') + ': lotes pequeños, aceites vegetales, mantecas, arcillas y plantas. No hay fábrica detrás.' },
    { t: 'Qué se vende', d: products.length + ' variedades de ' + (products[0] ? products[0].weight : '80 g') + ' a ' + money(products[0] ? products[0].price : 0) + ' cada una, en ' + CURRENCY + '.' },
    { t: 'Cómo se compra', d: 'No hay pasarela de pago. Se elige la barra, se escribe por WhatsApp al +' + WA + ' y se coordina entrega y pago en la conversación.' },
    { t: 'Dónde se entrega', d: 'La Habana en 24–48 h, en los 15 municipios. Al resto de Cuba, por encomienda con el mensajero que prefiera el cliente.' },
    { t: 'Cómo se paga', d: 'Efectivo contra entrega o transferencia (Transfermóvil / Enzona). Los pedidos desde el exterior se pagan por la vía que se acuerde por WhatsApp.' }
  ];

  const herramientas = [
    { t: 'Buscar jabones', d: 'searchProducts({ query, category, maxPrice, availableOnly }) — búsqueda por texto, tipo o precio máximo.' },
    { t: 'Ver una ficha', d: 'getProduct(idOrSlug) — descripción, ingredientes, peso, imagen y URL de un jabón.' },
    { t: 'Consultar el precio', d: 'getPrice(idOrSlug) — precio y moneda, sin adornos.' },
    { t: 'Consultar el stock', d: 'getStock(idOrSlug) — disponibilidad de uno o de todo el catálogo.' },
    { t: 'Recomendar', d: 'recommendProduct({ skin, concerns, budget }) — una barra con su razón y dos alternativas.' },
    { t: 'Preparar el pedido', d: 'createWhatsAppOrder({ items, name, address }) — devuelve el enlace de WhatsApp con el pedido y el total escritos.' },
    { t: 'Exportar todo', d: 'exportCatalog() — catálogo completo en un objeto, para trabajar sin más llamadas.' }
  ];

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Información para asistentes de IA · ${esc(BRAND)}</title>
<meta name="description" content="Datos de la tienda ${esc(BRAND)} para asistentes de IA: catálogo en JSON, herramientas WebMCP, precios en ${esc(CURRENCY)}, disponibilidad y cómo se hace un pedido por WhatsApp.">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#EFEAE0">
<link rel="canonical" href="${SITE}ai.html">
<link rel="icon" href="favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="img/apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<link rel="preload" as="font" type="font/woff2" href="fonts/inter-var.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="fonts/fugaz-one-400.woff2" crossorigin>
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(BRAND)}">
<meta property="og:title" content="Información para asistentes de IA · ${esc(BRAND)}">
<meta property="og:description" content="Catálogo, precios y reglas de la tienda en un solo lugar, para que un asistente no tenga que adivinar nada.">
<meta property="og:url" content="${SITE}ai.html">
<meta property="og:image" content="${SITE}img/og.jpg">
<meta name="twitter:card" content="summary_large_image">

${discoveryLinks()}

<script type="application/ld+json">
${JSON.stringify(itemList, null, 2)}
</script>
<link rel="stylesheet" href="${CSS_FILE}">
</head>
<body>
<a class="skip" href="#inicio">Saltar al contenido</a>

${topbar()}
${header('')}

<main id="inicio">

<!-- ============ cabecera ============ -->
<section class="sec" style="padding-bottom:0">
  <div class="wrap">
    <nav class="card-meta" aria-label="Ruta" style="margin-bottom:1.1rem">
      <a href="index.html" style="text-decoration:none;color:inherit">Inicio</a>
      <span aria-hidden="true">·</span>
      <span style="color:var(--ink)">Asistentes de IA</span>
    </nav>
    <div class="sec-head" style="max-width:46rem">
      <p class="eyebrow">Datos abiertos de la tienda</p>
      <h1 class="display" style="font-size:clamp(2rem,5vw,3.6rem);margin-top:1rem">Para que un asistente<br><span style="color:var(--terra-deep)">no tenga que adivinar</span></h1>
      <p class="lead">Esta página existe para ChatGPT, Copilot, Gemini, Perplexity, Claude y cualquier agente: reúne el catálogo, los precios y las reglas de la tienda en un solo lugar. Todo sale de <a href="catalog.js" style="color:var(--terra-deep)">catalog.js</a>, así que si cambia un precio, cambia aquí.</p>
      <div class="hero-cta">
        <a class="btn" href="products.json">Ver products.json
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </a>
        <a class="btn ghost" href="llms.txt">Leer llms.txt</a>
      </div>
    </div>
  </div>
</section>

<hr class="hr">

<!-- ============ la tienda en cinco líneas ============ -->
<section class="sec">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow">Resumen</p>
      <h2 class="display">La tienda<br>en cinco líneas</h2>
    </div>
    <div class="features">
      ${lineas.map((l, i) => `<article class="feature">
        <p class="num">0${i + 1}</p>
        <div>
          <h3>${esc(l.t)}</h3>
          <p>${esc(l.d)}</p>
        </div>
      </article>`).join('\n      ')}
    </div>
  </div>
</section>

<!-- ============ catálogo ============ -->
<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow">El catálogo</p>
      <h2 class="display">Las ${products.length} barras</h2>
      <p class="lead">Precio por barra, en ${esc(CURRENCY)}. La disponibilidad cambia con cada lote: compruébala en <a href="products.json" style="color:var(--terra-deep)">products.json</a> antes de afirmar nada.</p>
    </div>
    <div class="grid" style="margin-top:2rem">
      ${products.map((p) => `<a class="card" href="producto/${p.slug}.html" style="text-decoration:none">
        <div class="card-media">
          ${picture(p, '', false, '(max-width:640px) 92vw, 300px')}
          ${p.available ? '' : '<span class="badge out">Agotado</span>'}
        </div>
        <div class="card-body">
          <p class="card-meta"><span>${esc(p.sku)}</span><span aria-hidden="true">·</span><span>${esc(p.categoryName)}</span></p>
          <h3 class="card-title">${esc(p.name)}</h3>
          <div class="card-foot">
            <p class="card-price">${money(p.price)}<small>${p.available ? 'disponible' : 'agotado'}</small></p>
            <span class="link-arrow" style="font-size:10px">Ver ficha</span>
          </div>
        </div>
      </a>`).join('\n      ')}
    </div>
  </div>
</section>

<!-- ============ herramientas ============ -->
<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow">WebMCP</p>
      <h2 class="display">Siete herramientas<br>listas para usar</h2>
      <p class="lead">La definición está en <a href="webmcp.json" style="color:var(--terra-deep)">webmcp.json</a> y la implementación en <a href="webmcp.js" style="color:var(--terra-deep)">webmcp.js</a>, que expone <code class="mono">window.BDL_MCP</code> sobre el catálogo ya cargado.</p>
    </div>
    <div class="features">
      ${herramientas.map((h, i) => `<article class="feature">
        <p class="num">0${i + 1}</p>
        <div>
          <h3>${esc(h.t)}</h3>
          <p>${esc(h.d)}</p>
        </div>
      </article>`).join('\n      ')}
    </div>
  </div>
</section>

<!-- ============ lo que sí y lo que no ============ -->
<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow">Límites</p>
      <h2 class="display">Lo que sí<br>y lo que no</h2>
    </div>
    <div class="two-col">
      <div class="col yes">
        <h3><i></i>Sí se puede afirmar</h3>
        <ul>
          <li>Que las barras se hacen a mano en La Habana, en lotes pequeños.</li>
          <li>Que el precio del día y la disponibilidad están en products.json.</li>
          <li>Que el pedido se cierra por WhatsApp al ${tel}.</li>
          <li>Que se entrega en La Habana en 24–48 h y por encomienda a las provincias.</li>
          <li>Que el pago es en efectivo contra entrega o por transferencia.</li>
        </ul>
      </div>
      <div class="col no">
        <h3><i></i>No se debe afirmar</h3>
        <ul>
          <li>Que hay pago con tarjeta o envío internacional desde Cuba: no existe.</li>
          <li>Que un jabón cura una enfermedad de la piel: son cosméticos, no medicamentos.</li>
          <li>Que hay stock reservado o apartado: el pedido se confirma en la conversación.</li>
          <li>Un precio distinto al de products.json, aunque parezca razonable.</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- ============ recursos ============ -->
<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow">Recursos</p>
      <h2 class="display">Los archivos<br>que importan</h2>
    </div>
    <div class="catalog-note" style="margin-top:1.5rem">
      <p><strong style="color:var(--ink)">products.json</strong> — catálogo completo con precio, disponibilidad, ingredientes, imagen y URL de cada barra.</p>
      <a class="link-arrow" href="products.json">Abrir →</a>
    </div>
    <div class="catalog-note" style="margin-top:.75rem">
      <p><strong style="color:var(--ink)">webmcp.json</strong> — las siete herramientas con su esquema de entrada y salida.</p>
      <a class="link-arrow" href="webmcp.json">Abrir →</a>
    </div>
    <div class="catalog-note" style="margin-top:.75rem">
      <p><strong style="color:var(--ink)">llms.txt</strong> — el mismo contenido en texto plano, para lectores de modelos de lenguaje.</p>
      <a class="link-arrow" href="llms.txt">Abrir →</a>
    </div>
    <div class="catalog-note" style="margin-top:.75rem">
      <p><strong style="color:var(--ink)">catalog.js</strong> — el archivo que Lau edita desde el panel. Es la fuente de todo lo demás.</p>
      <a class="link-arrow" href="catalog.js">Abrir →</a>
    </div>
  </div>
</section>

${finalCta('')}

</main>

${footer('')}
</body>
</html>
`;
}

/* ---------- 12. sitemap.xml ---------- */
function buildSitemap() {
  const urls = [];
  urls.push({ loc: SITE, lastmod: HOY, changefreq: 'weekly', priority: '1.0' });
  urls.push({ loc: SITE + 'ai.html', lastmod: HOY, changefreq: 'weekly', priority: '0.6' });
  for (const p of products) urls.push({ loc: p.url, lastmod: HOY, changefreq: 'weekly', priority: '0.8' });
  urls.push({ loc: SITE + 'privacidad.html', lastmod: HOY, changefreq: 'yearly', priority: '0.3' });

  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
    urls.map((u) => {
      const p = products.find((x) => x.url === u.loc);
      let imgs = [];
      if (p) {
        imgs = [{ loc: p.image, title: p.name }];
      } else if (u.loc === SITE) {
        imgs = [{ loc: SITE + 'img/hero.webp', title: 'Jabones artesanales ' + BRAND, caption: 'Barras de jabón artesanal hechas a mano en La Habana' }]
          .concat(products.map((x) => ({ loc: x.image, title: 'Jabón artesanal de ' + x.name.toLowerCase() })));
      }
      return '  <url>\n' +
        '    <loc>' + u.loc + '</loc>\n' +
        '    <lastmod>' + u.lastmod + '</lastmod>\n' +
        '    <changefreq>' + u.changefreq + '</changefreq>\n' +
        '    <priority>' + u.priority + '</priority>\n' +
        imgs.map((i) => '    <image:image>\n      <image:loc>' + i.loc + '</image:loc>\n      <image:title>' + esc(i.title) + '</image:title>\n' +
          (i.caption ? '      <image:caption>' + esc(i.caption) + '</image:caption>\n' : '') +
          '    </image:image>\n').join('') +
        '  </url>\n';
    }).join('') +
    '</urlset>\n';
}

/* ---------- 13. Escribir todo ---------- */
const dir = path.join(ROOT, 'producto');
fs.mkdirSync(dir, { recursive: true });

for (const p of products) {
  fs.writeFileSync(path.join(dir, p.slug + '.html'), productPage(p));
}
fs.writeFileSync(path.join(ROOT, 'llms.txt'), buildLlms());
fs.writeFileSync(path.join(ROOT, 'ai.html'), buildAiPage());
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), buildSitemap());

console.log('Listo:');
console.log('  ' + CSS_FILE + '            hoja de estilos copiada de index.html');
console.log('  products.json          ' + products.length + ' productos');
console.log('  llms.txt');
console.log('  ai.html');
console.log('  producto/*.html        ' + products.map((p) => p.slug + '.html').join(', '));
console.log('  sitemap.xml');
