# Burbujas de Lau · Tienda online

Web de jabonería artesanal (La Habana) con catálogo, carrito y pedidos por WhatsApp, más un panel privado para actualizar precios, productos e imágenes.

**WhatsApp de pedidos:** +53 59964943
**Dirección pública actual:** https://drjh2777-glitch.github.io/burbujas-de-lau/
**Dominio propio (pendiente de registrar):** burbujasdelau.com

---

## 1. Qué hay en esta carpeta

| Archivo | Para qué sirve |
|---|---|
| `index.html` | La tienda: diseño, carrito, SEO y datos estructurados. |
| `catalog.js` | **La base de datos**: productos, precios, textos y ajustes. Es el único archivo que cambia cuando actualizas la tienda. |
| `admin.html` | Panel de administración (privado, `noindex`). No está enlazado desde la web. |
| `privacidad.html` | Política de privacidad (sin cookies, sin analítica). |
| `404.html` | Página de error personalizada. |
| `sw.js` | Service worker: guarda la web en el teléfono para que cargue al instante y funcione con internet intermitente. |
| `site.webmanifest` | Iconos y datos para "añadir a pantalla de inicio" en Android. |
| `fonts/` | Tipografías autoalojadas (ya no se usan Google Fonts). |
| `img/` | Fotos en WebP con varios tamaños (`-480`, `-760`) y JPG de respaldo, `og.jpg` (vista previa al compartir) e iconos. |
| `robots.txt` / `sitemap.xml` | Indexación en Google. |
| `_headers` / `.htaccess` | Compresión, caché y cabeceras de seguridad (Netlify/Cloudflare y Apache/cPanel). |
| `README.md` | Este archivo. |

---

## 2. Publicar

### Publicación actual: GitHub Pages
La web está publicada en **https://drjh2777-glitch.github.io/burbujas-de-lau/** desde el repositorio `drjh2777-glitch/burbujas-de-lau`.
Para actualizarla: sube los archivos modificados al repositorio (rama `main`) y GitHub la reconstruye sola en ~1 minuto.
El archivo `.nojekyll` evita que GitHub procese el sitio con Jekyll.

### Opción A · Netlify Drop (gratis, sin cuenta técnica)
1. Entra en `app.netlify.com/drop`.
2. Arrastra **la carpeta completa** (la que contiene `index.html`).
3. Te da una dirección tipo `burbujas-de-lau.netlify.app`.
4. Para tu dominio: *Domain settings → Add custom domain*.

### Opción B · Hosting con cPanel (Apache)
1. Sube todo el contenido a `public_html` (FTP o administrador de archivos).
2. El archivo `.htaccess` ya activa compresión, caché y la página 404.
3. Activa el certificado SSL gratuito (Let's Encrypt) y descomenta el bloque HTTPS al final de `.htaccess`.

### Opción C · GitHub Pages / Cloudflare Pages / Vercel
Sube la carpeta al repositorio y publica. En Cloudflare Pages, `_headers` se aplica automáticamente.

> **Importante:** la web abre con doble clic, pero el carrito, las fuentes y el modo offline necesitan estar publicada con **HTTPS**.

---

## 3. Cambiar de dominio (solo si no usas `burbujasdelau.com`)

Busca y reemplaza `https://drjh2777-glitch.github.io/burbujas-de-lau/` en estos 5 sitios:

1. `index.html` → `rel="canonical"`, `og:url`, `og:image`, `twitter:image` y el JSON-LD (`@id`, `url`, `image`, `itemListElement`).
2. `catalog.js` → `settings.siteUrl`.
3. `robots.txt` → línea `Sitemap:`.
4. `sitemap.xml` → todos los `<loc>` y `<image:loc>`.
5. `privacidad.html` → `rel="canonical"`.

---

## 4. Panel de administración

**Dirección:** `tudominio.com/admin.html`
**Contraseña inicial:** `lau2025` → cámbiala en **Ajustes → Seguridad** al entrar.

- **Precios y productos:** Productos → lápiz → editar → **Guardar** → pestaña **Publicar** → **Descargar catalog.js** → subirlo al hosting.
- **Imágenes:** arrastra la foto al recuadro. El panel la recorta 4:3, la reduce a 1400 px y la comprime en WebP.
- **Agotados:** desactiva «Disponible para pedir». El producto sigue visible con la etiqueta *Agotado*.
- **WhatsApp:** Ajustes → WhatsApp (ej.: `5354015519`) → Guardar → Publicar.

> Los cambios del panel se guardan **como borrador en tu navegador**. Para que los vean los clientes hay que descargar `catalog.js` y reemplazarlo en el hosting.

---

## 5. Optimizaciones pensadas para Cuba

El sitio está afinado para conexiones lentas, datos caros y teléfonos modestos:

- **Tipografías autoalojadas y recortadas**: se pasó de 5 familias de Google Fonts (~315 KB, 3 conexiones externas que a veces fallan) a 5 archivos locales de **71 KB** con solo los caracteres que usa la web.
- **Cero dependencias externas**: no hay Google Fonts, ni analítica, ni CDNs de terceros. Todo se sirve desde tu dominio.
- **Imágenes adaptativas**: el móvil descarga versiones de 480 px (~22 KB) en vez de 1000 px (~130 KB). Las tarjetas usan `loading="lazy"`.
- **Service worker**: tras la primera visita, la tienda se abre desde el propio teléfono, incluso sin datos. El catálogo se pide primero a la red (5 s de espera máxima) para no mostrar precios viejos.
- **Compresión y caché**: `_headers` y `.htaccess` activan gzip/brotli y caché de un año para fuentes e imágenes. El HTML pasa de 98 KB a ~25 KB comprimido.
- **Primera carga ≈ 139 KB** (con gzip) en vez de ~500 KB del diseño con Google Fonts y fotos a tamaño completo.
- **Sin JS sigue siendo útil**: hay mensaje alternativo y el WhatsApp siempre visible.

---

## 6. SEO: lo que ya está hecho

- `<title>`, meta descripción y Open Graph con imagen 1200×630 (`img/og.jpg`) para que WhatsApp y Facebook muestren una tarjeta limpia.
- JSON-LD: **Store** (negocio local, horario, teléfono, zona), **ItemList + Product/Offer** generado desde `catalog.js` (una sola fuente, sin duplicados) y **FAQPage** sincronizado con las preguntas visibles.
- HTML semántico, un solo `H1`, `alt` descriptivo, foco visible, navegación por teclado, diálogos con trampa de foco y `prefers-reduced-motion`.
- `robots.txt`, `sitemap.xml` (sin URLs con `#`, que Google ignora) y `admin.html` fuera del índice.
- Búsqueda interna insensible a acentos («sabila» encuentra «Sábila»).

### Checklist (una vez)
1. Date de alta en **Google Search Console** y envía `sitemap.xml`.
2. Crea la ficha de **Google Business Profile** (La Habana) con el mismo nombre, teléfono y fotos: es lo que más mueve clientes locales.
3. Enlaza la web en la bio de **Instagram/Facebook/WhatsApp Business** (y añade esos enlaces reales en `catalog.js` si quieres mostrarlos).
4. Publica en Revolico y grupos de compra-venta con el enlace a la web.
5. Pide reseñas reales y añádelas en `catalog.js` (`testimonials`).

---

## 7. Cómo se hacen los pedidos

El cliente añade barras y pulsa **«Pedir por WhatsApp»**. Se abre un mensaje ya escrito:

```
Hola Burbujas de Lau 👋 Quiero hacer este pedido:

• 2 × Sábila (30 g) — 800 CUP

Total: 800 CUP

Mi nombre:
Dirección de entrega:
¿Me confirmas disponibilidad y forma de pago?
```

No hay pasarela de pago ni registro: se coordina todo en el chat.

---

## 8. Mantenimiento rápido

- **Precio o producto nuevo:** desde el panel y publicar `catalog.js`.
- **Foto nueva:** panel (arrastrar) o subir a `img/` en WebP + JPG.
- **Texto de secciones:** `index.html`.
- **Aviso de la barra superior:** `catalog.js` → `settings.announcement`.
- **Cambiar la versión del service worker** si cambias imágenes con el mismo nombre: abre `sw.js` y sube `VERSION = 'bdl-v2'`.

---

© Burbujas de Lau · Jabones artesanales, La Habana.
