// Structr Figma Plugin — Wireframe Import with Component Properties
// Creates proper Figma components with TEXT, BOOLEAN, and VARIANT properties
// Then builds pages using component instances

figma.showUI(__html__, { width: 380, height: 480 });

// ── Colors ──
const C = {
  white: { r: 1, g: 1, b: 1 },
  gray50: { r: 0.98, g: 0.98, b: 0.98 },
  gray200: { r: 0.9, g: 0.9, b: 0.9 },
  gray300: { r: 0.83, g: 0.83, b: 0.83 },
  gray400: { r: 0.65, g: 0.65, b: 0.65 },
  gray500: { r: 0.5, g: 0.5, b: 0.5 },
  gray600: { r: 0.4, g: 0.4, b: 0.4 },
  gray700: { r: 0.3, g: 0.3, b: 0.3 },
  gray900: { r: 0.11, g: 0.11, b: 0.11 },
};

const FR = { family: "Inter", style: "Regular" };
const FM = { family: "Inter", style: "Medium" };
const FS = { family: "Inter", style: "Semi Bold" };
const FB = { family: "Inter", style: "Bold" };
const W = 1440;

async function loadFonts() {
  await figma.loadFontAsync(FR);
  await figma.loadFontAsync(FM);
  await figma.loadFontAsync(FS);
  await figma.loadFontAsync(FB);
}

// ── Primitives ──

function txt(name, text, size, font, color, opts = {}) {
  const t = figma.createText();
  t.name = name;
  t.characters = String(text || ' ');
  t.fontSize = size;
  t.fontName = font;
  t.fills = [{ type: 'SOLID', color }];
  if (opts.w) { t.resize(opts.w, t.height); t.textAutoResize = "HEIGHT"; }
  if (opts.align) t.textAlignHorizontal = opts.align;
  return t;
}

function box(w, h, color, r) {
  const rc = figma.createRectangle();
  rc.resize(w, h);
  rc.fills = [{ type: 'SOLID', color }];
  if (r) rc.cornerRadius = r;
  return rc;
}

function af(name, opts = {}) {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = opts.dir || "VERTICAL";
  if (opts.w) {
    f.resize(opts.w, opts.h || 100);
    f.counterAxisSizingMode = "FIXED";
    f.primaryAxisSizingMode = opts.fh ? "FIXED" : "AUTO";
  } else {
    f.primaryAxisSizingMode = opts.fh ? "FIXED" : "AUTO";
    f.counterAxisSizingMode = opts.fw ? "FIXED" : "AUTO";
  }
  f.fills = opts.bg ? [{ type: 'SOLID', color: opts.bg }] : [];
  if (opts.px) { f.paddingLeft = opts.px; f.paddingRight = opts.px; }
  if (opts.py) { f.paddingTop = opts.py; f.paddingBottom = opts.py; }
  if (opts.p) { f.paddingTop = opts.p; f.paddingBottom = opts.p; f.paddingLeft = opts.p; f.paddingRight = opts.p; }
  if (opts.g !== undefined) f.itemSpacing = opts.g;
  if (opts.ca) f.counterAxisAlignItems = opts.ca;
  if (opts.ma) f.primaryAxisAlignItems = opts.ma;
  if (opts.r) f.cornerRadius = opts.r;
  if (opts.stroke) { f.strokes = [{ type: 'SOLID', color: opts.stroke }]; f.strokeWeight = 1; f.strokeAlign = "INSIDE"; }
  return f;
}

// ── Button helper with TEXT + BOOLEAN properties ──

function addButton(parent, comp, name, label, defaultText, style) {
  const propKey = comp.addComponentProperty(label, "TEXT", defaultText);
  const showKey = comp.addComponentProperty("Show " + label, "BOOLEAN", true);

  const isOutline = style === 'secondary';
  const isLink = style === 'tertiary';

  let btn;
  if (isLink) {
    btn = txt(name, defaultText, 14, FM, C.gray500);
  } else {
    btn = af(name, {
      dir: "HORIZONTAL",
      bg: isOutline ? undefined : C.gray900,
      stroke: isOutline ? C.gray300 : undefined,
      px: 24, py: 12, r: 8, ca: "CENTER"
    });
    const btnText = txt(name + "Text", defaultText, 14, FM, isOutline ? C.gray700 : C.white);
    btnText.componentPropertyReferences = { characters: propKey };
    btn.appendChild(btnText);
  }

  if (isLink) {
    btn.componentPropertyReferences = { characters: propKey, visible: showKey };
  } else {
    btn.componentPropertyReferences = { visible: showKey };
  }

  parent.appendChild(btn);
  return { propKey, showKey };
}

// ── Section Builders ──
// Each builds into a component root and adds component properties

function buildHeroCentered(comp, content) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.itemSpacing = 24; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C.gray50 }];

  // Title with TEXT property
  const titleKey = comp.addComponentProperty("Title", "TEXT", content.title || "Build something amazing");
  const titleNode = txt("title", content.title || "Build something amazing", 48, FB, C.gray900, { w: 700, align: "CENTER" });
  titleNode.componentPropertyReferences = { characters: titleKey };
  comp.appendChild(titleNode);

  // Subtitle with TEXT property
  const subKey = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle || "A short description of your product.");
  const subNode = txt("subtitle", content.subtitle || "A short description.", 18, FR, C.gray500, { w: 600, align: "CENTER" });
  subNode.componentPropertyReferences = { characters: subKey };
  comp.appendChild(subNode);

  // Buttons with TEXT + BOOLEAN properties
  const btns = af("buttons", { dir: "HORIZONTAL", g: 12 });
  addButton(btns, comp, "primaryBtn", "Primary Button", content.ctaText || "Get Started", "primary");
  addButton(btns, comp, "secondaryBtn", "Secondary Button", content.ctaSecondaryText || "Learn More", "secondary");
  addButton(btns, comp, "tertiaryBtn", "Tertiary Link", content.ctaTertiaryText || "", "tertiary");
  comp.appendChild(btns);
}

function buildHeroSplit(comp, content) {
  comp.layoutMode = "HORIZONTAL"; comp.resize(W, 100);
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.itemSpacing = 48; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C.white }];

  const textCol = af("textContent", { dir: "VERTICAL", g: 20 });
  textCol.resize(550, 100); textCol.counterAxisSizingMode = "FIXED";

  const titleKey = comp.addComponentProperty("Title", "TEXT", content.title || "Build something amazing");
  const titleNode = txt("title", content.title || "Build something amazing", 48, FB, C.gray900);
  titleNode.componentPropertyReferences = { characters: titleKey };
  textCol.appendChild(titleNode);

  const subKey = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle || "Description");
  const subNode = txt("subtitle", content.subtitle || "Description", 18, FR, C.gray500, { w: 500 });
  subNode.componentPropertyReferences = { characters: subKey };
  textCol.appendChild(subNode);

  const btns = af("buttons", { dir: "HORIZONTAL", g: 12 });
  addButton(btns, comp, "primaryBtn", "Primary Button", content.ctaText || "Get Started", "primary");
  addButton(btns, comp, "secondaryBtn", "Secondary Button", content.ctaSecondaryText || "Learn More", "secondary");
  textCol.appendChild(btns);
  comp.appendChild(textCol);

  const img = box(520, 400, C.gray200, 16); img.name = "image";
  comp.appendChild(img);
}

function buildHeroMinimal(comp, content) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 120; comp.paddingBottom = 120;
  comp.itemSpacing = 32; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C.white }];

  const titleKey = comp.addComponentProperty("Title", "TEXT", content.title || "Build something amazing");
  const titleNode = txt("title", content.title || "Build something amazing", 56, FB, C.gray900, { w: 800, align: "CENTER" });
  titleNode.componentPropertyReferences = { characters: titleKey };
  comp.appendChild(titleNode);

  const btns = af("buttons", { dir: "HORIZONTAL", g: 12 });
  addButton(btns, comp, "primaryBtn", "Primary Button", content.ctaText || "Get Started", "primary");
  comp.appendChild(btns);
}

function buildHeader(comp, content) {
  comp.layoutMode = "HORIZONTAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "FIXED"; comp.counterAxisSizingMode = "AUTO";
  comp.paddingLeft = 32; comp.paddingRight = 32; comp.paddingTop = 16; comp.paddingBottom = 16;
  comp.itemSpacing = 32; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C.white }];

  const logoKey = comp.addComponentProperty("Logo", "TEXT", content.logo || "Logo");
  const logoNode = txt("logo", content.logo || "Logo", 16, FS, C.gray900);
  logoNode.componentPropertyReferences = { characters: logoKey };
  comp.appendChild(logoNode);

  const nav = af("nav", { dir: "HORIZONTAL", g: 24, ca: "CENTER" });
  const links = Array.isArray(content.links) ? content.links : [];
  links.forEach((l, i) => nav.appendChild(txt(`link_${i}`, l.label || '', 13, FR, C.gray600)));
  nav.layoutGrow = 1;
  comp.appendChild(nav);

  const ctaKey = comp.addComponentProperty("CTA Text", "TEXT", content.ctaText || "Get Started");
  const btn = af("ctaButton", { dir: "HORIZONTAL", bg: C.gray900, px: 16, py: 8, r: 8, ca: "CENTER" });
  const btnText = txt("ctaText", content.ctaText || "Get Started", 13, FM, C.white);
  btnText.componentPropertyReferences = { characters: ctaKey };
  btn.appendChild(btnText);
  comp.appendChild(btn);
}

function buildFeatures(comp, content) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.itemSpacing = 40; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C.white }];

  const header = af("header", { dir: "VERTICAL", g: 12, ca: "CENTER" });
  const titleKey = comp.addComponentProperty("Title", "TEXT", content.title || "Features");
  const titleNode = txt("title", content.title || "Features", 28, FB, C.gray900, { align: "CENTER" });
  titleNode.componentPropertyReferences = { characters: titleKey };
  header.appendChild(titleNode);

  const subKey = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle || "Everything you need.");
  const subNode = txt("subtitle", content.subtitle || "Everything you need.", 16, FR, C.gray500, { w: 500, align: "CENTER" });
  subNode.componentPropertyReferences = { characters: subKey };
  header.appendChild(subNode);
  comp.appendChild(header);

  const grid = af("grid", { dir: "HORIZONTAL", g: 24 });
  const features = Array.isArray(content.features) ? content.features : [];
  features.forEach((f, i) => {
    const card = af(`feature_${i}`, { dir: "VERTICAL", bg: C.gray50, px: 24, py: 24, g: 12, r: 12 });
    card.resize(260, 100); card.counterAxisSizingMode = "FIXED";
    card.appendChild(box(32, 32, C.gray200, 8));
    card.appendChild(txt(`featureTitle_${i}`, f.title || '', 15, FS, C.gray900));
    card.appendChild(txt(`featureDesc_${i}`, f.description || '', 13, FR, C.gray500, { w: 212 }));
    grid.appendChild(card);
  });
  comp.appendChild(grid);
}

function buildPricing(comp, content) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.itemSpacing = 40; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C.white }];

  const header = af("header", { dir: "VERTICAL", g: 12, ca: "CENTER" });
  const titleKey = comp.addComponentProperty("Title", "TEXT", content.title || "Pricing");
  const titleNode = txt("title", content.title || "Pricing", 28, FB, C.gray900, { align: "CENTER" });
  titleNode.componentPropertyReferences = { characters: titleKey };
  header.appendChild(titleNode);
  comp.appendChild(header);

  const cards = af("plans", { dir: "HORIZONTAL", g: 24 });
  const plans = Array.isArray(content.plans) ? content.plans : [];
  plans.forEach((p, i) => {
    const hl = p.highlighted === true || p.highlighted === 'true';
    const card = af(`plan_${i}`, {
      dir: "VERTICAL", bg: hl ? C.gray900 : C.white,
      px: 28, py: 28, g: 16, r: 16,
      stroke: hl ? undefined : C.gray200
    });
    card.resize(240, 100); card.counterAxisSizingMode = "FIXED";
    card.appendChild(txt(`planName_${i}`, p.name || '', 16, FS, hl ? C.white : C.gray900));
    const priceRow = af("price", { dir: "HORIZONTAL", g: 2, ca: "MAX" });
    priceRow.appendChild(txt(`planPrice_${i}`, p.price || '', 36, FB, hl ? C.white : C.gray900));
    priceRow.appendChild(txt(`planPeriod_${i}`, p.period || '', 13, FR, hl ? C.gray300 : C.gray500));
    card.appendChild(priceRow);
    const feats = String(p.features || '').split(',').map(f => f.trim()).filter(Boolean);
    if (feats.length) {
      const list = af("features", { dir: "VERTICAL", g: 8 });
      feats.forEach((f, j) => list.appendChild(txt(`planFeature_${i}_${j}`, "✓ " + f, 12, FR, hl ? C.gray300 : C.gray500)));
      card.appendChild(list);
    }
    if (p.ctaText) {
      const btn = af("cta", { dir: "HORIZONTAL", bg: hl ? C.white : C.gray900, px: 20, py: 10, r: 8, ca: "CENTER", ma: "CENTER" });
      btn.resize(184, 40); btn.counterAxisSizingMode = "FIXED";
      btn.appendChild(txt(`planCta_${i}`, p.ctaText, 13, FM, hl ? C.gray900 : C.white, { align: "CENTER" }));
      card.appendChild(btn);
    }
    cards.appendChild(card);
  });
  comp.appendChild(cards);
}

function buildTestimonials(comp, content) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.itemSpacing = 32; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C.gray50 }];

  const titleKey = comp.addComponentProperty("Title", "TEXT", content.title || "Testimonials");
  const titleNode = txt("title", content.title || "Testimonials", 28, FB, C.gray900, { align: "CENTER" });
  titleNode.componentPropertyReferences = { characters: titleKey };
  comp.appendChild(titleNode);

  const cards = af("testimonials", { dir: "HORIZONTAL", g: 24 });
  const items = Array.isArray(content.testimonials) ? content.testimonials : [];
  items.forEach((t, i) => {
    const card = af(`testimonial_${i}`, { dir: "VERTICAL", bg: C.white, px: 24, py: 24, g: 16, r: 12 });
    card.resize(280, 100); card.counterAxisSizingMode = "FIXED";
    card.appendChild(txt(`quote_${i}`, '"' + (t.quote || '') + '"', 13, FR, C.gray600, { w: 232 }));
    const auth = af("author", { dir: "HORIZONTAL", g: 10, ca: "CENTER" });
    const av = figma.createEllipse(); av.resize(36, 36); av.fills = [{ type: 'SOLID', color: C.gray300 }]; av.name = `avatar_${i}`;
    auth.appendChild(av);
    const info = af("info", { dir: "VERTICAL", g: 2 });
    info.appendChild(txt(`author_${i}`, t.author || '', 13, FM, C.gray900));
    info.appendChild(txt(`role_${i}`, t.role || '', 11, FR, C.gray500));
    auth.appendChild(info); card.appendChild(auth); cards.appendChild(card);
  });
  comp.appendChild(cards);
}

function buildCta(comp, content) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.itemSpacing = 24; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C.gray900 }];

  const titleKey = comp.addComponentProperty("Title", "TEXT", content.title || "Ready to start?");
  const titleNode = txt("title", content.title || "Ready to start?", 28, FB, C.white, { align: "CENTER" });
  titleNode.componentPropertyReferences = { characters: titleKey };
  comp.appendChild(titleNode);

  const subKey = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle || "Join thousands of users.");
  const subNode = txt("subtitle", content.subtitle || "Join thousands.", 16, FR, C.gray300, { w: 500, align: "CENTER" });
  subNode.componentPropertyReferences = { characters: subKey };
  comp.appendChild(subNode);

  const ctaKey = comp.addComponentProperty("Button Text", "TEXT", content.ctaText || "Get Started");
  const btn = af("ctaButton", { dir: "HORIZONTAL", bg: C.white, px: 24, py: 12, r: 8, ca: "CENTER" });
  const btnText = txt("ctaText", content.ctaText || "Get Started", 14, FM, C.gray900);
  btnText.componentPropertyReferences = { characters: ctaKey };
  btn.appendChild(btnText);

  const showKey = comp.addComponentProperty("Show Button", "BOOLEAN", true);
  btn.componentPropertyReferences = { visible: showKey };
  comp.appendChild(btn);
}

function buildFooter(comp, content) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 48; comp.paddingBottom = 48;
  comp.itemSpacing = 32;
  comp.fills = [{ type: 'SOLID', color: C.gray900 }];

  const top = af("top", { dir: "HORIZONTAL", g: 48 });
  top.resize(W - 160, 100); top.counterAxisSizingMode = "FIXED";

  const logoCol = af("logoCol", { dir: "VERTICAL", g: 8 });
  const logoKey = comp.addComponentProperty("Logo", "TEXT", content.logo || "Logo");
  const logoNode = txt("logo", content.logo || "Logo", 16, FS, C.white);
  logoNode.componentPropertyReferences = { characters: logoKey };
  logoCol.appendChild(logoNode);

  const descKey = comp.addComponentProperty("Description", "TEXT", content.description || "Description");
  const descNode = txt("description", content.description || "Description", 12, FR, C.gray400, { w: 200 });
  descNode.componentPropertyReferences = { characters: descKey };
  logoCol.appendChild(descNode);
  top.appendChild(logoCol);

  const columns = Array.isArray(content.columns) ? content.columns : [];
  columns.forEach((col, i) => {
    const colFrame = af(`column_${i}`, { dir: "VERTICAL", g: 8 });
    colFrame.appendChild(txt(`columnTitle_${i}`, col.title || '', 13, FS, C.white));
    const links = String(col.links || '').split(',').map(l => l.trim()).filter(Boolean);
    links.forEach((l, j) => colFrame.appendChild(txt(`columnLink_${i}_${j}`, l, 12, FR, C.gray400)));
    top.appendChild(colFrame);
  });
  comp.appendChild(top);
  comp.appendChild(box(W - 160, 1, C.gray700));

  const copyKey = comp.addComponentProperty("Copyright", "TEXT", content.copyright || "© 2024");
  const copyNode = txt("copyright", content.copyright || "© 2024", 12, FR, C.gray500);
  copyNode.componentPropertyReferences = { characters: copyKey };
  comp.appendChild(copyNode);
}

function buildGeneric(comp, content, category) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 64; comp.paddingBottom = 64;
  comp.itemSpacing = 16; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C.white }];

  const titleKey = comp.addComponentProperty("Title", "TEXT", content.title || category);
  const titleNode = txt("title", content.title || category, 28, FB, C.gray900, { align: "CENTER" });
  titleNode.componentPropertyReferences = { characters: titleKey };
  comp.appendChild(titleNode);

  if (content.subtitle) {
    const subKey = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle);
    const subNode = txt("subtitle", content.subtitle, 16, FR, C.gray500, { w: 600, align: "CENTER" });
    subNode.componentPropertyReferences = { characters: subKey };
    comp.appendChild(subNode);
  }
}

// ── Builder dispatch by variantId ──

const VARIANT_BUILDERS = {
  'hero-centered': buildHeroCentered,
  'hero-split': buildHeroSplit,
  'hero-with-image': buildHeroCentered, // similar to centered + image
  'hero-minimal': buildHeroMinimal,
  'hero-with-form': buildHeroCentered, // form variant
};

const CATEGORY_BUILDERS = {
  header: buildHeader, features: buildFeatures, pricing: buildPricing,
  testimonials: buildTestimonials, cta: buildCta, footer: buildFooter,
};

function getBuilder(category, variantId) {
  return VARIANT_BUILDERS[variantId] || CATEGORY_BUILDERS[category] || buildGeneric;
}

// ── Variant name from ID ──
function getVariantName(variantId) {
  const parts = variantId.split('-').slice(1);
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || 'Default';
}

function getCategoryLabel(category) {
  const labels = {
    header: 'Header', hero: 'Hero', logos: 'Logo Cloud', features: 'Features',
    stats: 'Stats', pricing: 'Pricing', testimonials: 'Testimonials', faq: 'FAQ',
    cta: 'CTA', footer: 'Footer', blog: 'Blog', about: 'About', team: 'Team',
    gallery: 'Gallery', contact: 'Contact', banner: 'Banner', showcase: 'Showcase',
    error: 'Error Page', process: 'How It Works', downloads: 'Downloads',
    comparison: 'Comparison', store: 'Store',
  };
  return labels[category] || category;
}

function getDefaultContent(category) {
  const defaults = {
    header: { logo: 'Logo', links: [{ label: 'Features' }, { label: 'Pricing' }, { label: 'About' }], ctaText: 'Get Started' },
    hero: { title: 'Build something amazing', subtitle: 'A short description of your product.', ctaText: 'Get Started', ctaSecondaryText: 'Learn More' },
    features: { title: 'Features', subtitle: 'Everything you need.', features: [{ title: 'Feature 1', description: 'Description' }, { title: 'Feature 2', description: 'Description' }, { title: 'Feature 3', description: 'Description' }] },
    pricing: { title: 'Pricing', subtitle: 'Simple pricing.', plans: [{ name: 'Free', price: '$0', period: '/mo', features: 'Feature 1, Feature 2', ctaText: 'Start', highlighted: false }, { name: 'Pro', price: '$29', period: '/mo', features: 'All Free, Feature 3', ctaText: 'Start', highlighted: true }] },
    testimonials: { title: 'Testimonials', testimonials: [{ quote: 'Great product!', author: 'Jane', role: 'CEO' }, { quote: 'Love it!', author: 'John', role: 'CTO' }, { quote: 'Amazing!', author: 'Sarah', role: 'Designer' }] },
    cta: { title: 'Ready to start?', subtitle: 'Join thousands of users.', ctaText: 'Get Started' },
    footer: { logo: 'Logo', description: 'Description.', copyright: '© 2024', columns: [{ title: 'Product', links: 'Features, Pricing' }, { title: 'Company', links: 'About, Blog' }] },
  };
  return defaults[category] || { title: getCategoryLabel(category), subtitle: 'Section description.' };
}

// ── Override instance text ──
async function overrideText(instance, name, value) {
  const node = instance.findOne(n => n.name === name && n.type === "TEXT");
  if (node && value != null) {
    try {
      await figma.loadFontAsync(node.fontName);
      node.characters = String(value);
    } catch (e) { /* skip */ }
  }
}

async function overrideInstanceContent(instance, content, category) {
  const simpleFields = ['title', 'subtitle', 'logo', 'description', 'mission', 'copyright', 'email', 'phone', 'address', 'text', 'ctaText', 'ctaSecondaryText', 'ctaTertiaryText'];
  for (const field of simpleFields) {
    if (content[field] !== undefined) await overrideText(instance, field, content[field]);
  }
  // Also try to set component properties directly on the instance
  try {
    const props = instance.componentProperties;
    for (const [key, prop] of Object.entries(props)) {
      if (prop.type === 'TEXT') {
        const cleanKey = key.split('#')[0]; // "Title#1:0" -> "Title"
        if (cleanKey === 'Title' && content.title) instance.setProperties({ [key]: content.title });
        else if (cleanKey === 'Subtitle' && content.subtitle) instance.setProperties({ [key]: content.subtitle });
        else if (cleanKey === 'Logo' && content.logo) instance.setProperties({ [key]: content.logo });
        else if (cleanKey === 'Description' && content.description) instance.setProperties({ [key]: content.description });
        else if (cleanKey === 'Copyright' && content.copyright) instance.setProperties({ [key]: content.copyright });
        else if (cleanKey === 'Primary Button' && content.ctaText) instance.setProperties({ [key]: content.ctaText });
        else if (cleanKey === 'Secondary Button' && content.ctaSecondaryText) instance.setProperties({ [key]: content.ctaSecondaryText });
        else if (cleanKey === 'CTA Text' && content.ctaText) instance.setProperties({ [key]: content.ctaText });
        else if (cleanKey === 'Button Text' && content.ctaText) instance.setProperties({ [key]: content.ctaText });
      }
    }
  } catch (e) { /* skip if setProperties fails */ }

  // Override array items by name
  if (category === 'features' && Array.isArray(content.features)) {
    for (let i = 0; i < content.features.length; i++) {
      await overrideText(instance, `featureTitle_${i}`, content.features[i].title);
      await overrideText(instance, `featureDesc_${i}`, content.features[i].description);
    }
  }
  if (category === 'testimonials' && Array.isArray(content.testimonials)) {
    for (let i = 0; i < content.testimonials.length; i++) {
      await overrideText(instance, `quote_${i}`, '"' + content.testimonials[i].quote + '"');
      await overrideText(instance, `author_${i}`, content.testimonials[i].author);
      await overrideText(instance, `role_${i}`, content.testimonials[i].role);
    }
  }
  if (category === 'pricing' && Array.isArray(content.plans)) {
    for (let i = 0; i < content.plans.length; i++) {
      await overrideText(instance, `planName_${i}`, content.plans[i].name);
      await overrideText(instance, `planPrice_${i}`, content.plans[i].price);
      await overrideText(instance, `planCta_${i}`, content.plans[i].ctaText);
    }
  }
  if (category === 'header' && Array.isArray(content.links)) {
    for (let i = 0; i < content.links.length; i++) {
      await overrideText(instance, `link_${i}`, content.links[i].label);
    }
  }
  if (category === 'footer' && Array.isArray(content.columns)) {
    for (let i = 0; i < content.columns.length; i++) {
      await overrideText(instance, `columnTitle_${i}`, content.columns[i].title);
    }
  }
}

// ── Main Import ──

figma.ui.onmessage = async (msg) => {
  if (msg.type !== 'import') return;

  try {
    await loadFonts();
    const project = msg.data;

    if (!project || !project.pages || project.pages.length === 0) {
      figma.ui.postMessage({ type: 'error', message: 'No pages found in project data' });
      return;
    }

    // Phase 0: Collect used variants
    figma.ui.postMessage({ type: 'progress', message: 'Analyzing sections...' });
    const usedVariants = new Map();
    for (const page of project.pages) {
      for (const section of (page.sections || [])) {
        if (!usedVariants.has(section.category)) usedVariants.set(section.category, new Set());
        usedVariants.get(section.category).add(section.variantId);
      }
    }

    // Phase 1: Create Components page
    figma.ui.postMessage({ type: 'progress', message: 'Building components with properties...' });
    const componentsPage = figma.createPage();
    componentsPage.name = "⬡ Components";

    const componentSets = {};
    let compX = 0;

    for (const [category, variantIds] of usedVariants) {
      const components = [];
      const categoryComps = {};

      for (const variantId of variantIds) {
        const variantName = getVariantName(variantId);
        const comp = figma.createComponent();
        comp.name = `Variant=${variantName}`;

        const builder = getBuilder(category, variantId);
        const defaultContent = getDefaultContent(category);
        builder(comp, defaultContent, category);

        componentsPage.appendChild(comp);
        comp.x = compX;
        comp.y = 0;
        components.push(comp);
        categoryComps[variantId] = comp;
      }

      if (components.length > 1) {
        const set = figma.combineAsVariants(components, componentsPage);
        set.name = getCategoryLabel(category);
        set.x = compX;
        set.y = 0;
      } else if (components.length === 1) {
        components[0].name = getCategoryLabel(category);
      }

      componentSets[category] = categoryComps;
      compX += W + 200;
    }

    // Phase 2: Create pages with instances
    let totalSections = 0;

    for (let i = 0; i < project.pages.length; i++) {
      const pageData = project.pages[i];
      const sections = pageData.sections || [];

      figma.ui.postMessage({ type: 'progress', message: `Building "${pageData.name}" (${sections.length} sections)...` });

      const figmaPage = figma.createPage();
      figmaPage.name = pageData.name || `Page ${i + 1}`;

      const pageFrame = figma.createFrame();
      pageFrame.name = pageData.name || 'Page';
      pageFrame.resize(W, 100);
      pageFrame.layoutMode = "VERTICAL";
      pageFrame.primaryAxisSizingMode = "AUTO";
      pageFrame.counterAxisSizingMode = "FIXED";
      pageFrame.itemSpacing = 0;
      pageFrame.fills = [{ type: 'SOLID', color: C.white }];

      for (const section of sections) {
        try {
          const categoryComps = componentSets[section.category];
          if (!categoryComps || !categoryComps[section.variantId]) continue;

          const comp = categoryComps[section.variantId];
          const instance = comp.createInstance();

          await overrideInstanceContent(instance, section.content, section.category);

          pageFrame.appendChild(instance);
          instance.layoutSizingHorizontal = "FILL";
          totalSections++;
        } catch (err) {
          console.error(`Error for ${section.category}/${section.variantId}:`, err);
        }
      }

      figmaPage.appendChild(pageFrame);
      if (i === project.pages.length - 1) {
        figma.currentPage = figmaPage;
        figma.viewport.scrollAndZoomIntoView([pageFrame]);
      }
    }

    figma.ui.postMessage({
      type: 'done',
      sectionCount: totalSections,
      pageCount: project.pages.length,
    });

  } catch (err) {
    figma.ui.postMessage({ type: 'error', message: String(err) });
  }
};
