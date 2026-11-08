/* ============================================================
   Burbujas de Lau · WebMCP
   ------------------------------------------------------------
   Capa de herramientas para agentes de IA sobre el catálogo ya
   cargado (window.BDL_CATALOG). No hace peticiones de red, no
   guarda nada y no toca el carrito de la tienda.

   Uso:  <script src="catalog.js"></script>
         <script src="webmcp.js"></script>
         window.BDL_MCP.searchProducts({ query: 'sábila' })

   La definición de las herramientas está en webmcp.json.
   ============================================================ */
(function (root) {
  'use strict';

  var SCHEMA_IN_STOCK = 'https://schema.org/InStock';
  var SCHEMA_OUT_OF_STOCK = 'https://schema.org/OutOfStock';

  function catalog() {
    var c = root.BDL_CATALOG;
    if (!c || !Array.isArray(c.products)) {
      throw new Error('BDL_MCP: no está cargado window.BDL_CATALOG (incluye catalog.js antes que webmcp.js).');
    }
    return c;
  }

  function norm(s) {
    return String(s == null ? '' : s).toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function slug(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function settings() {
    return catalog().settings || {};
  }

  function siteUrl() {
    return String(settings().siteUrl || '').replace(/\/?$/, '/');
  }

  function catName(id) {
    var c = (catalog().categories || []).filter(function (x) { return x.id === id; })[0];
    return c ? c.name : (id || '');
  }

  function absolute(pathname) {
    var u = String(pathname || '');
    if (/^https?:\/\//.test(u)) return u;
    return siteUrl() + u.replace(/^\.?\//, '');
  }

  function toAgent(p) {
    if (!p) return null;
    var available = p.avail !== false;
    return {
      id: p.id,
      slug: slug(p.name),
      sku: String(p.id || '').toUpperCase(),
      name: p.name,
      description: p.desc || '',
      ingredients: p.ingredients || '',
      category: p.category,
      categoryName: catName(p.category),
      weight: p.weight || '',
      price: Number(p.price) || 0,
      currency: settings().currency || 'CUP',
      available: available,
      availability: available ? SCHEMA_IN_STOCK : SCHEMA_OUT_OF_STOCK,
      featured: !!p.featured,
      image: absolute(p.img || ''),
      alt: p.alt || ('Jabón artesanal ' + p.name),
      url: siteUrl() + 'producto/' + slug(p.name) + '.html'
    };
  }

  function all() {
    return (catalog().products || []).map(toAgent);
  }

  function find(idOrSlug) {
    if (idOrSlug == null) return null;
    var key = norm(String(idOrSlug)).trim();
    var list = all();
    var hit = list.filter(function (p) {
      return norm(p.id) === key || norm(p.slug) === key || norm(p.sku) === key || norm(p.name) === key;
    })[0];
    if (hit) return hit;
    // coincidencia parcial: "sabila" -> "Sábila", "lavanda" -> "Lavanda y granos"
    var loose = list.filter(function (p) { return norm(p.name).indexOf(key) !== -1 || norm(p.slug).indexOf(key) !== -1; });
    return loose.length === 1 ? loose[0] : null;
  }

  /* ---------- herramientas ---------- */

  function searchProducts(opts) {
    var o = opts || {};
    var q = norm(o.query || o.q || '').trim();
    var cat = o.category ? norm(o.category).trim() : '';
    var maxPrice = o.maxPrice != null ? Number(o.maxPrice) : null;
    var onlyAvail = o.availableOnly === true || o.available === true;
    var limit = Math.max(1, Math.min(Number(o.limit) || 20, 100));

    var out = all().filter(function (p) {
      if (cat && norm(p.category) !== cat && norm(p.categoryName) !== cat) return false;
      if (maxPrice != null && !isNaN(maxPrice) && p.price > maxPrice) return false;
      if (onlyAvail && !p.available) return false;
      if (!q) return true;
      var hay = norm([p.name, p.description, p.ingredients, p.categoryName, p.weight, p.slug].join(' '));
      return q.split(/\s+/).every(function (term) { return hay.indexOf(term) !== -1; });
    });

    out.sort(function (a, b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0); });
    return out.slice(0, limit);
  }

  function getProduct(idOrSlug) {
    return find(idOrSlug);
  }

  function getPrice(idOrSlug) {
    var p = find(idOrSlug);
    if (!p) return null;
    return { id: p.id, slug: p.slug, name: p.name, price: p.price, currency: p.currency, weight: p.weight, url: p.url };
  }

  function getStock(idOrSlug) {
    if (idOrSlug != null) {
      var p = find(idOrSlug);
      if (!p) return null;
      return { id: p.id, slug: p.slug, name: p.name, available: p.available, availability: p.availability };
    }
    var list = all();
    return {
      total: list.length,
      available: list.filter(function (x) { return x.available; }).length,
      items: list.map(function (x) {
        return { id: x.id, slug: x.slug, name: x.name, available: x.available, availability: x.availability };
      })
    };
  }

  var SKIN = {
    seca: ['p4', 'p2'],
    sensible: ['p2', 'p5'],
    reactiva: ['p2', 'p5'],
    mixta: ['p1', 'p3'],
    grasa: ['p3', 'p1'],
    normal: ['p4', 'p3'],
    madura: ['p2', 'p4'],
    nino: ['p5', 'p2'],
    infantil: ['p5', 'p2']
  };

  function recommendProduct(opts) {
    var o = opts || {};
    var skin = norm(o.skin || o.piel || '').trim();
    var concerns = o.concerns || o.necesidad || '';
    var budget = o.budget != null ? Number(o.budget) : (o.maxPrice != null ? Number(o.maxPrice) : null);
    var preferAvailable = o.preferAvailable !== false;

    var notes = {
      p1: 'Exfolia con granos de avena y deja la piel renovada. Mejor dos o tres veces por semana.',
      p2: 'La más suave del catálogo: avena y miel, sin fragancia. Buena para piel que reacciona.',
      p3: 'Arcilla rosa francesa y aroma floral discreto. Buena si la piel tiende a grasa.',
      p4: 'Sábila de verdad: limpia e hidrata sin dejar la piel tirante. La más versátil.',
      p5: 'Manzanilla sobre manteca de karité: calma y aroma muy bajo, ideal para piel sensible.'
    };

    var order = [];
    var key = skin.replace(/[^a-z]/g, '');
    Object.keys(SKIN).forEach(function (k) {
      if (key && (key.indexOf(k) !== -1 || k.indexOf(key) !== -1)) order = order.concat(SKIN[k]);
    });
    var text = norm([concerns, o.query].join(' '));
    if (/exfoli|granos|asper|callo/.test(text)) order.unshift('p1');
    if (/roja|irrita|comez|picor|alergi|delicad/.test(text)) order.unshift('p2', 'p5');
    if (/seca|tirante|hidrat|resec/.test(text)) order.unshift('p4', 'p2');
    if (/grasa|brillo|acne|acné|espalda/.test(text)) order.unshift('p3');
    if (/regalo|obsequio|detalle|boda/.test(text)) order.unshift('p3', 'p1');

    var seen = {};
    order = order.filter(function (id) { if (seen[id]) return false; seen[id] = true; return true; });
    var list = all();
    list.forEach(function (p) { if (order.indexOf(p.id) === -1) order.push(p.id); });

    var candidates = order.map(function (id) {
      return list.filter(function (p) { return p.id === id; })[0];
    }).filter(Boolean);

    if (budget != null && !isNaN(budget)) {
      var inside = candidates.filter(function (p) { return p.price <= budget; });
      if (inside.length) candidates = inside;
    }

    var first = candidates.filter(function (p) { return preferAvailable ? p.available : true; })[0] || candidates[0] || null;
    if (!first) return null;

    return {
      product: first,
      reason: notes[first.id] || first.description,
      alternatives: candidates.filter(function (p) { return p.id !== first.id; }).slice(0, 2),
      currency: first.currency,
      note: first.available ? 'Disponible ahora. El pedido se confirma por WhatsApp.' : 'Ahora mismo está agotado: conviene preguntar por WhatsApp cuándo vuelve el lote.'
    };
  }

  function money(n, currency) {
    return new Intl.NumberFormat('es-CU', { maximumFractionDigits: 0 }).format(Number(n) || 0) + ' ' + (currency || settings().currency || 'CUP');
  }

  function createWhatsAppOrder(opts) {
    var o = opts || {};
    var items = Array.isArray(o.items) ? o.items : [];
    if (!items.length) throw new Error('createWhatsAppOrder: falta items, por ejemplo [{ id: "p4", qty: 2 }].');

    var lines = [];
    var total = 0;
    var resolved = [];
    items.forEach(function (it) {
      var p = find(it && (it.id || it.slug || it.name));
      if (!p) return;
      var qty = Math.max(1, Math.min(Number(it.qty) || 1, 99));
      var sub = p.price * qty;
      total += sub;
      resolved.push({ id: p.id, name: p.name, qty: qty, unitPrice: p.price, subtotal: sub, currency: p.currency });
      lines.push('• ' + qty + ' × ' + p.name + ' (' + p.weight + ') — ' + money(sub, p.currency));
    });
    if (!resolved.length) throw new Error('createWhatsAppOrder: ninguno de los productos existe en el catálogo.');

    var wa = String(settings().whatsapp || '').replace(/[^0-9]/g, '');
    var msg = 'Hola ' + (settings().brand || 'Burbujas de Lau') + ' 👋 Quiero hacer este pedido:\n\n' +
      lines.join('\n') +
      '\n\nTotal: ' + money(total, resolved[0].currency) +
      '\n\nMi nombre: ' + (o.name || '') +
      '\nDirección de entrega: ' + (o.address || '') +
      (o.note ? '\nNota: ' + o.note : '') +
      '\n¿Me confirmas disponibilidad y forma de pago?';

    return {
      url: 'https://wa.me/' + wa + '?text=' + encodeURIComponent(msg),
      message: msg,
      items: resolved,
      total: total,
      currency: resolved[0].currency || settings().currency || 'CUP'
    };
  }

  function exportCatalog() {
    var s = settings();
    return {
      brand: s.brand || 'Burbujas de Lau',
      tagline: s.tagline || '',
      description: s.seoDescription || '',
      siteUrl: siteUrl(),
      currency: s.currency || 'CUP',
      whatsapp: s.whatsapp || '',
      location: s.location || '',
      hours: s.hours || '',
      email: s.email || '',
      updatedAt: catalog().updatedAt || '',
      categories: (catalog().categories || []).map(function (c) { return { id: c.id, name: c.name }; }),
      products: all()
    };
  }

  var API = {
    version: '1.0.0',
    schemaVersion: '1.0',
    manifest: 'webmcp.json',
    searchProducts: searchProducts,
    getProduct: getProduct,
    getPrice: getPrice,
    getStock: getStock,
    recommendProduct: recommendProduct,
    createWhatsAppOrder: createWhatsAppOrder,
    exportCatalog: exportCatalog
  };

  root.BDL_MCP = API;
  if (typeof module === 'object' && module && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
