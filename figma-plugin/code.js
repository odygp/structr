// Structr Figma Plugin — Wireframe Import with Component Properties
figma.showUI(__html__, { width: 380, height: 480 });

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
  await figma.loadFontAsync(FR); await figma.loadFontAsync(FM);
  await figma.loadFontAsync(FS); await figma.loadFontAsync(FB);
}

function txt(name, text, size, font, color, opts = {}) {
  const t = figma.createText(); t.name = name;
  t.characters = String(text || ' '); t.fontSize = size; t.fontName = font;
  t.fills = [{ type: 'SOLID', color }];
  if (opts.w) { t.resize(opts.w, t.height); t.textAutoResize = "HEIGHT"; }
  if (opts.align) t.textAlignHorizontal = opts.align;
  return t;
}

function box(w, h, color, r) {
  const rc = figma.createRectangle(); rc.resize(w, h);
  rc.fills = [{ type: 'SOLID', color }]; if (r) rc.cornerRadius = r; return rc;
}

function af(name, opts = {}) {
  const f = figma.createFrame(); f.name = name;
  f.layoutMode = opts.dir || "VERTICAL";
  if (opts.w) { f.resize(opts.w, opts.h || 100); f.counterAxisSizingMode = "FIXED"; f.primaryAxisSizingMode = opts.fh ? "FIXED" : "AUTO"; }
  else { f.primaryAxisSizingMode = opts.fh ? "FIXED" : "AUTO"; f.counterAxisSizingMode = opts.fw ? "FIXED" : "AUTO"; }
  f.fills = opts.bg ? [{ type: 'SOLID', color: opts.bg }] : [];
  if (opts.px) { f.paddingLeft = opts.px; f.paddingRight = opts.px; }
  if (opts.py) { f.paddingTop = opts.py; f.paddingBottom = opts.py; }
  if (opts.g !== undefined) f.itemSpacing = opts.g;
  if (opts.ca) f.counterAxisAlignItems = opts.ca;
  if (opts.ma) f.primaryAxisAlignItems = opts.ma;
  if (opts.r) f.cornerRadius = opts.r;
  if (opts.stroke) { f.strokes = [{ type: 'SOLID', color: opts.stroke }]; f.strokeWeight = 1; f.strokeAlign = "INSIDE"; }
  return f;
}

// Helper: link a node to a component property AFTER it's in the tree
function linkText(node, propKey) {
  try { node.componentPropertyReferences = { characters: propKey }; } catch(e) {}
}
function linkVisible(node, propKey) {
  try { node.componentPropertyReferences = { visible: propKey }; } catch(e) {}
}

// Helper: add buttons with properties
function addButtons(container, comp, content) {
  const btns = af("buttons", { dir: "HORIZONTAL", g: 12 });

  // Primary
  const pk = comp.addComponentProperty("Primary Button", "TEXT", content.ctaText || "Get Started");
  const psk = comp.addComponentProperty("Show Primary Button", "BOOLEAN", true);
  const pb = af("primaryBtn", { dir: "HORIZONTAL", bg: C.gray900, px: 24, py: 12, r: 8, ca: "CENTER" });
  const pbt = txt("ctaText", content.ctaText || "Get Started", 14, FM, C.white);
  pb.appendChild(pbt);
  btns.appendChild(pb);

  // Secondary
  const sk = comp.addComponentProperty("Secondary Button", "TEXT", content.ctaSecondaryText || "Learn More");
  const ssk = comp.addComponentProperty("Show Secondary Button", "BOOLEAN", true);
  const sb = af("secondaryBtn", { dir: "HORIZONTAL", stroke: C.gray300, px: 24, py: 12, r: 8, ca: "CENTER" });
  const sbt = txt("ctaSecondaryText", content.ctaSecondaryText || "Learn More", 14, FM, C.gray700);
  sb.appendChild(sbt);
  btns.appendChild(sb);

  // Tertiary
  const tk = comp.addComponentProperty("Tertiary Link", "TEXT", content.ctaTertiaryText || "");
  const tsk = comp.addComponentProperty("Show Tertiary Link", "BOOLEAN", false);
  const tb = txt("ctaTertiaryText", content.ctaTertiaryText || " ", 14, FM, C.gray500);
  btns.appendChild(tb);

  container.appendChild(btns);

  // NOW set refs — all nodes are in the component tree
  linkText(pbt, pk); linkVisible(pb, psk);
  linkText(sbt, sk); linkVisible(sb, ssk);
  linkText(tb, tk); linkVisible(tb, tsk);
}

// ── Builders ──

function buildHeroCentered(comp, content) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100); comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.itemSpacing = 24; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C.gray50 }];

  const tk = comp.addComponentProperty("Title", "TEXT", content.title || "Build something amazing");
  const tn = txt("title", content.title || "Build something amazing", 48, FB, C.gray900, { w: 700, align: "CENTER" });
  comp.appendChild(tn); linkText(tn, tk);

  const sk = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle || "A short description.");
  const sn = txt("subtitle", content.subtitle || "A short description.", 18, FR, C.gray500, { w: 600, align: "CENTER" });
  comp.appendChild(sn); linkText(sn, sk);

  addButtons(comp, comp, content);
}

function buildHeroSplit(comp, content) {
  comp.layoutMode = "HORIZONTAL"; comp.resize(W, 100); comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.itemSpacing = 48; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C.white }];

  const textCol = af("textContent", { dir: "VERTICAL", g: 20 });
  textCol.resize(550, 100); textCol.counterAxisSizingMode = "FIXED";

  const tk = comp.addComponentProperty("Title", "TEXT", content.title || "Build something amazing");
  const tn = txt("title", content.title || "Build something amazing", 48, FB, C.gray900);
  textCol.appendChild(tn);

  const sk = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle || "Description.");
  const sn = txt("subtitle", content.subtitle || "Description.", 18, FR, C.gray500, { w: 500 });
  textCol.appendChild(sn);

  const btns = af("buttons", { dir: "HORIZONTAL", g: 12 });
  const pk = comp.addComponentProperty("Primary Button", "TEXT", content.ctaText || "Get Started");
  const pb = af("primaryBtn", { dir: "HORIZONTAL", bg: C.gray900, px: 24, py: 12, r: 8, ca: "CENTER" });
  const pbt = txt("ctaText", content.ctaText || "Get Started", 14, FM, C.white);
  pb.appendChild(pbt); btns.appendChild(pb);

  const sbk = comp.addComponentProperty("Secondary Button", "TEXT", content.ctaSecondaryText || "Learn More");
  const sb = af("secondaryBtn", { dir: "HORIZONTAL", stroke: C.gray300, px: 24, py: 12, r: 8, ca: "CENTER" });
  const sbt = txt("ctaSecondaryText", content.ctaSecondaryText || "Learn More", 14, FM, C.gray700);
  sb.appendChild(sbt); btns.appendChild(sb);

  textCol.appendChild(btns);
  comp.appendChild(textCol);

  // Now link — all in tree
  linkText(tn, tk); linkText(sn, sk);
  linkText(pbt, pk); linkText(sbt, sbk);

  const img = box(520, 400, C.gray200, 16); img.name = "image";
  comp.appendChild(img);
}

function buildHeroMinimal(comp, content) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100); comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 120; comp.paddingBottom = 120;
  comp.itemSpacing = 32; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C.white }];

  const tk = comp.addComponentProperty("Title", "TEXT", content.title || "Build something amazing");
  const tn = txt("title", content.title || "Build something amazing", 56, FB, C.gray900, { w: 800, align: "CENTER" });
  comp.appendChild(tn); linkText(tn, tk);

  const pk = comp.addComponentProperty("Button Text", "TEXT", content.ctaText || "Get Started");
  const pb = af("primaryBtn", { dir: "HORIZONTAL", bg: C.gray900, px: 32, py: 14, r: 8, ca: "CENTER" });
  const pbt = txt("ctaText", content.ctaText || "Get Started", 16, FM, C.white);
  pb.appendChild(pbt); comp.appendChild(pb); linkText(pbt, pk);
}

function buildHeader(comp, content) {
  comp.layoutMode = "HORIZONTAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "FIXED"; comp.counterAxisSizingMode = "AUTO";
  comp.paddingLeft = 32; comp.paddingRight = 32; comp.paddingTop = 16; comp.paddingBottom = 16;
  comp.itemSpacing = 32; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C.white }];

  const lk = comp.addComponentProperty("Logo", "TEXT", content.logo || "Logo");
  const ln = txt("logo", content.logo || "Logo", 16, FS, C.gray900);
  comp.appendChild(ln); linkText(ln, lk);

  const nav = af("nav", { dir: "HORIZONTAL", g: 24, ca: "CENTER" });
  (Array.isArray(content.links) ? content.links : []).forEach((l, i) =>
    nav.appendChild(txt(`link_${i}`, l.label || '', 13, FR, C.gray600))
  );
  nav.layoutGrow = 1; comp.appendChild(nav);

  const ck = comp.addComponentProperty("CTA Text", "TEXT", content.ctaText || "Get Started");
  const btn = af("ctaButton", { dir: "HORIZONTAL", bg: C.gray900, px: 16, py: 8, r: 8, ca: "CENTER" });
  const bt = txt("ctaText", content.ctaText || "Get Started", 13, FM, C.white);
  btn.appendChild(bt); comp.appendChild(btn); linkText(bt, ck);
}

function buildFeatures(comp, content) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100); comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.itemSpacing = 40; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C.white }];

  const header = af("header", { dir: "VERTICAL", g: 12, ca: "CENTER" });
  const tk = comp.addComponentProperty("Title", "TEXT", content.title || "Features");
  const tn = txt("title", content.title || "Features", 28, FB, C.gray900, { align: "CENTER" });
  header.appendChild(tn);
  const sk = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle || "Everything you need.");
  const sn = txt("subtitle", content.subtitle || "Everything you need.", 16, FR, C.gray500, { w: 500, align: "CENTER" });
  header.appendChild(sn);
  comp.appendChild(header);
  linkText(tn, tk); linkText(sn, sk);

  const grid = af("grid", { dir: "HORIZONTAL", g: 24 });
  (Array.isArray(content.features) ? content.features : []).forEach((f, i) => {
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
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100); comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.itemSpacing = 40; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C.white }];

  const header = af("header", { dir: "VERTICAL", g: 12, ca: "CENTER" });
  const tk = comp.addComponentProperty("Title", "TEXT", content.title || "Pricing");
  const tn = txt("title", content.title || "Pricing", 28, FB, C.gray900, { align: "CENTER" });
  header.appendChild(tn); comp.appendChild(header); linkText(tn, tk);

  const cards = af("plans", { dir: "HORIZONTAL", g: 24 });
  (Array.isArray(content.plans) ? content.plans : []).forEach((p, i) => {
    const hl = p.highlighted === true || p.highlighted === 'true';
    const card = af(`plan_${i}`, { dir: "VERTICAL", bg: hl ? C.gray900 : C.white, px: 28, py: 28, g: 16, r: 16, stroke: hl ? undefined : C.gray200 });
    card.resize(240, 100); card.counterAxisSizingMode = "FIXED";
    card.appendChild(txt(`planName_${i}`, p.name || '', 16, FS, hl ? C.white : C.gray900));
    const pr = af("price", { dir: "HORIZONTAL", g: 2, ca: "MAX" });
    pr.appendChild(txt(`planPrice_${i}`, p.price || '', 36, FB, hl ? C.white : C.gray900));
    pr.appendChild(txt(`planPeriod_${i}`, p.period || '', 13, FR, hl ? C.gray300 : C.gray500));
    card.appendChild(pr);
    const feats = String(p.features || '').split(',').map(f => f.trim()).filter(Boolean);
    if (feats.length) { const list = af("features", { dir: "VERTICAL", g: 8 }); feats.forEach((f, j) => list.appendChild(txt(`planFeature_${i}_${j}`, "✓ " + f, 12, FR, hl ? C.gray300 : C.gray500))); card.appendChild(list); }
    if (p.ctaText) { const btn = af("cta", { dir: "HORIZONTAL", bg: hl ? C.white : C.gray900, px: 20, py: 10, r: 8, ca: "CENTER", ma: "CENTER" }); btn.resize(184, 40); btn.counterAxisSizingMode = "FIXED"; btn.appendChild(txt(`planCta_${i}`, p.ctaText, 13, FM, hl ? C.gray900 : C.white, { align: "CENTER" })); card.appendChild(btn); }
    cards.appendChild(card);
  });
  comp.appendChild(cards);
}

function buildTestimonials(comp, content) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100); comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.itemSpacing = 32; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C.gray50 }];

  const tk = comp.addComponentProperty("Title", "TEXT", content.title || "Testimonials");
  const tn = txt("title", content.title || "Testimonials", 28, FB, C.gray900, { align: "CENTER" });
  comp.appendChild(tn); linkText(tn, tk);

  const cards = af("testimonials", { dir: "HORIZONTAL", g: 24 });
  (Array.isArray(content.testimonials) ? content.testimonials : []).forEach((t, i) => {
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
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100); comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.itemSpacing = 24; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C.gray900 }];

  const tk = comp.addComponentProperty("Title", "TEXT", content.title || "Ready to start?");
  const tn = txt("title", content.title || "Ready to start?", 28, FB, C.white, { align: "CENTER" });
  comp.appendChild(tn); linkText(tn, tk);

  const sk = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle || "Join thousands.");
  const sn = txt("subtitle", content.subtitle || "Join thousands.", 16, FR, C.gray300, { w: 500, align: "CENTER" });
  comp.appendChild(sn); linkText(sn, sk);

  const ck = comp.addComponentProperty("Button Text", "TEXT", content.ctaText || "Get Started");
  const bsk = comp.addComponentProperty("Show Button", "BOOLEAN", true);
  const btn = af("ctaButton", { dir: "HORIZONTAL", bg: C.white, px: 24, py: 12, r: 8, ca: "CENTER" });
  const bt = txt("ctaText", content.ctaText || "Get Started", 14, FM, C.gray900);
  btn.appendChild(bt); comp.appendChild(btn);
  linkText(bt, ck); linkVisible(btn, bsk);
}

function buildFooter(comp, content) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100); comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 48; comp.paddingBottom = 48;
  comp.itemSpacing = 32; comp.fills = [{ type: 'SOLID', color: C.gray900 }];

  const top = af("top", { dir: "HORIZONTAL", g: 48 });
  top.resize(W - 160, 100); top.counterAxisSizingMode = "FIXED";
  const logoCol = af("logoCol", { dir: "VERTICAL", g: 8 });
  const lk = comp.addComponentProperty("Logo", "TEXT", content.logo || "Logo");
  const ln = txt("logo", content.logo || "Logo", 16, FS, C.white);
  logoCol.appendChild(ln);
  const dk = comp.addComponentProperty("Description", "TEXT", content.description || "Description.");
  const dn = txt("description", content.description || "Description.", 12, FR, C.gray400, { w: 200 });
  logoCol.appendChild(dn);
  top.appendChild(logoCol);

  (Array.isArray(content.columns) ? content.columns : []).forEach((col, i) => {
    const colFrame = af(`column_${i}`, { dir: "VERTICAL", g: 8 });
    colFrame.appendChild(txt(`columnTitle_${i}`, col.title || '', 13, FS, C.white));
    String(col.links || '').split(',').map(l => l.trim()).filter(Boolean).forEach((l, j) =>
      colFrame.appendChild(txt(`columnLink_${i}_${j}`, l, 12, FR, C.gray400))
    );
    top.appendChild(colFrame);
  });
  comp.appendChild(top);
  linkText(ln, lk); linkText(dn, dk);

  comp.appendChild(box(W - 160, 1, C.gray700));
  const ck = comp.addComponentProperty("Copyright", "TEXT", content.copyright || "© 2024");
  const cn = txt("copyright", content.copyright || "© 2024", 12, FR, C.gray500);
  comp.appendChild(cn); linkText(cn, ck);
}

function buildGeneric(comp, content, category) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100); comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 64; comp.paddingBottom = 64;
  comp.itemSpacing = 16; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C.white }];
  const tk = comp.addComponentProperty("Title", "TEXT", content.title || category);
  const tn = txt("title", content.title || category, 28, FB, C.gray900, { align: "CENTER" });
  comp.appendChild(tn); linkText(tn, tk);
  if (content.subtitle) {
    const sk = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle);
    const sn = txt("subtitle", content.subtitle, 16, FR, C.gray500, { w: 600, align: "CENTER" });
    comp.appendChild(sn); linkText(sn, sk);
  }
}

const VARIANT_BUILDERS = {
  'hero-centered': buildHeroCentered, 'hero-split': buildHeroSplit,
  'hero-with-image': buildHeroCentered, 'hero-minimal': buildHeroMinimal,
  'hero-with-form': buildHeroCentered,
};
const CATEGORY_BUILDERS = {
  header: buildHeader, features: buildFeatures, pricing: buildPricing,
  testimonials: buildTestimonials, cta: buildCta, footer: buildFooter,
};
function getBuilder(cat, vid) { return VARIANT_BUILDERS[vid] || CATEGORY_BUILDERS[cat] || buildGeneric; }

function getVariantName(vid) {
  return vid.split('-').slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || 'Default';
}
function getCategoryLabel(cat) {
  return ({ header:'Header', hero:'Hero', logos:'Logo Cloud', features:'Features', stats:'Stats', pricing:'Pricing', testimonials:'Testimonials', faq:'FAQ', cta:'CTA', footer:'Footer', blog:'Blog', about:'About', team:'Team', gallery:'Gallery', contact:'Contact', banner:'Banner', showcase:'Showcase', error:'Error Page', process:'How It Works', downloads:'Downloads', comparison:'Comparison', store:'Store' })[cat] || cat;
}
function getDefaultContent(cat) {
  return ({ header:{logo:'Logo',links:[{label:'Features'},{label:'Pricing'},{label:'About'}],ctaText:'Get Started'}, hero:{title:'Build something amazing',subtitle:'A short description.',ctaText:'Get Started',ctaSecondaryText:'Learn More'}, features:{title:'Features',subtitle:'Everything you need.',features:[{title:'Feature 1',description:'Description'},{title:'Feature 2',description:'Description'},{title:'Feature 3',description:'Description'}]}, pricing:{title:'Pricing',subtitle:'Simple pricing.',plans:[{name:'Free',price:'$0',period:'/mo',features:'Feature 1, Feature 2',ctaText:'Start',highlighted:false},{name:'Pro',price:'$29',period:'/mo',features:'All Free, Feature 3',ctaText:'Start',highlighted:true}]}, testimonials:{title:'Testimonials',testimonials:[{quote:'Great product!',author:'Jane',role:'CEO'},{quote:'Love it!',author:'John',role:'CTO'},{quote:'Amazing!',author:'Sarah',role:'Designer'}]}, cta:{title:'Ready to start?',subtitle:'Join thousands.',ctaText:'Get Started'}, footer:{logo:'Logo',description:'Description.',copyright:'© 2024',columns:[{title:'Product',links:'Features, Pricing'},{title:'Company',links:'About, Blog'}]} })[cat] || { title: getCategoryLabel(cat), subtitle: 'Section description.' };
}

// Override instance content
async function overrideText(inst, name, val) {
  const n = inst.findOne(n => n.name === name && n.type === "TEXT");
  if (n && val != null) { try { await figma.loadFontAsync(n.fontName); n.characters = String(val); } catch(e) {} }
}
async function overrideInstance(inst, content, cat) {
  for (const f of ['title','subtitle','logo','description','mission','copyright','email','phone','address','text','ctaText','ctaSecondaryText','ctaTertiaryText'])
    if (content[f] !== undefined) await overrideText(inst, f, content[f]);
  // Set component properties
  try {
    const props = inst.componentProperties;
    for (const [key, prop] of Object.entries(props)) {
      if (prop.type !== 'TEXT') continue;
      const name = key.split('#')[0];
      const map = { 'Title': content.title, 'Subtitle': content.subtitle, 'Logo': content.logo, 'Description': content.description, 'Copyright': content.copyright, 'Primary Button': content.ctaText, 'Secondary Button': content.ctaSecondaryText, 'Tertiary Link': content.ctaTertiaryText, 'CTA Text': content.ctaText, 'Button Text': content.ctaText };
      if (map[name]) inst.setProperties({ [key]: map[name] });
    }
  } catch(e) {}
  // Array items
  if (cat === 'features' && Array.isArray(content.features)) for (let i = 0; i < content.features.length; i++) { await overrideText(inst, `featureTitle_${i}`, content.features[i].title); await overrideText(inst, `featureDesc_${i}`, content.features[i].description); }
  if (cat === 'testimonials' && Array.isArray(content.testimonials)) for (let i = 0; i < content.testimonials.length; i++) { await overrideText(inst, `quote_${i}`, '"'+content.testimonials[i].quote+'"'); await overrideText(inst, `author_${i}`, content.testimonials[i].author); await overrideText(inst, `role_${i}`, content.testimonials[i].role); }
  if (cat === 'pricing' && Array.isArray(content.plans)) for (let i = 0; i < content.plans.length; i++) { await overrideText(inst, `planName_${i}`, content.plans[i].name); await overrideText(inst, `planPrice_${i}`, content.plans[i].price); await overrideText(inst, `planCta_${i}`, content.plans[i].ctaText); }
  if (cat === 'header' && Array.isArray(content.links)) for (let i = 0; i < content.links.length; i++) await overrideText(inst, `link_${i}`, content.links[i].label);
  if (cat === 'footer' && Array.isArray(content.columns)) for (let i = 0; i < content.columns.length; i++) await overrideText(inst, `columnTitle_${i}`, content.columns[i].title);
}

// ── Main ──
figma.ui.onmessage = async (msg) => {
  if (msg.type !== 'import') return;
  try {
    await loadFonts();
    const project = msg.data;
    if (!project?.pages?.length) { figma.ui.postMessage({ type: 'error', message: 'No pages found' }); return; }

    figma.ui.postMessage({ type: 'progress', message: 'Analyzing...' });
    const used = new Map();
    for (const pg of project.pages) for (const s of (pg.sections||[])) { if (!used.has(s.category)) used.set(s.category, new Set()); used.get(s.category).add(s.variantId); }

    figma.ui.postMessage({ type: 'progress', message: 'Building components...' });
    const compPage = figma.createPage(); compPage.name = "⬡ Components";
    const compSets = {}; let cy = 0;

    for (const [cat, vids] of used) {
      const comps = []; const catComps = {};

      // Add category label
      const label = txt("_label_" + cat, getCategoryLabel(cat), 24, FB, C.gray900);
      compPage.appendChild(label); label.x = 0; label.y = cy; cy += 40;

      for (const vid of vids) {
        const comp = figma.createComponent();
        comp.name = `Variant=${getVariantName(vid)}`;
        getBuilder(cat, vid)(comp, getDefaultContent(cat), cat);
        compPage.appendChild(comp); comp.x = 0; comp.y = cy;
        cy += (comp.height || 200) + 40;
        comps.push(comp); catComps[vid] = comp;
      }
      if (comps.length > 1) {
        const set = figma.combineAsVariants(comps, compPage);
        set.name = getCategoryLabel(cat); set.x = 0; set.y = cy - (comps.length * 240);
        cy = set.y + set.height + 80;
      } else if (comps.length === 1) {
        comps[0].name = getCategoryLabel(cat);
      }
      compSets[cat] = catComps; cy += 60;
    }

    let total = 0;
    for (let i = 0; i < project.pages.length; i++) {
      const pd = project.pages[i]; const secs = pd.sections || [];
      figma.ui.postMessage({ type: 'progress', message: `Building "${pd.name}" (${secs.length} sections)...` });
      const fp = figma.createPage(); fp.name = pd.name || `Page ${i+1}`;
      const pf = figma.createFrame(); pf.name = pd.name || 'Page';
      pf.resize(W, 100); pf.layoutMode = "VERTICAL"; pf.primaryAxisSizingMode = "AUTO"; pf.counterAxisSizingMode = "FIXED"; pf.itemSpacing = 0; pf.fills = [{ type: 'SOLID', color: C.white }];

      for (const s of secs) {
        try {
          const cc = compSets[s.category]; if (!cc?.[s.variantId]) continue;
          const inst = cc[s.variantId].createInstance();
          await overrideInstance(inst, s.content, s.category);
          pf.appendChild(inst); inst.layoutSizingHorizontal = "FILL"; total++;
        } catch(e) { console.error(`Error: ${s.category}/${s.variantId}`, e); }
      }
      fp.appendChild(pf);
      if (i === project.pages.length - 1) { figma.currentPage = fp; figma.viewport.scrollAndZoomIntoView([pf]); }
    }
    figma.ui.postMessage({ type: 'done', sectionCount: total, pageCount: project.pages.length });
  } catch(e) { figma.ui.postMessage({ type: 'error', message: String(e) }); }
};
