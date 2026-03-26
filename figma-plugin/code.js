// Structr Figma Plugin — Atomic Design System Import
// Ions → Atoms → Molecules → Organisms → Templates
figma.showUI(__html__, { width: 380, height: 480 });

// ── Design Tokens ──
const TOKENS = {
  colors: {
    'surface/default': { r: 1, g: 1, b: 1 },
    'surface/subtle': { r: 0.98, g: 0.98, b: 0.98 },
    'surface/muted': { r: 0.96, g: 0.96, b: 0.96 },
    'surface/inverse': { r: 0.11, g: 0.11, b: 0.11 },
    'border/default': { r: 0.9, g: 0.9, b: 0.9 },
    'border/strong': { r: 0.83, g: 0.83, b: 0.83 },
    'text/primary': { r: 0.11, g: 0.11, b: 0.11 },
    'text/secondary': { r: 0.4, g: 0.4, b: 0.4 },
    'text/muted': { r: 0.5, g: 0.5, b: 0.5 },
    'text/inverse': { r: 1, g: 1, b: 1 },
    'text/on-dark': { r: 0.83, g: 0.83, b: 0.83 },
    'placeholder/default': { r: 0.9, g: 0.9, b: 0.9 },
    'placeholder/avatar': { r: 0.83, g: 0.83, b: 0.83 },
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32, '3xl': 48, '4xl': 64, '5xl': 80 },
  radius: { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
  fontSize: { xs: 11, sm: 13, md: 14, lg: 16, xl: 18, '2xl': 24, '3xl': 28, '4xl': 36, '5xl': 48 },
};

const C = TOKENS.colors;
const FR = { family: "Inter", style: "Regular" };
const FM = { family: "Inter", style: "Medium" };
const FS = { family: "Inter", style: "Semi Bold" };
const FB = { family: "Inter", style: "Bold" };
const W = 1440;

async function loadFonts() {
  await figma.loadFontAsync(FR); await figma.loadFontAsync(FM);
  await figma.loadFontAsync(FS); await figma.loadFontAsync(FB);
}

// ── Primitives ──
function txt(name, text, size, font, color, opts) {
  opts = opts || {};
  const t = figma.createText(); t.name = name;
  t.characters = String(text || ' '); t.fontSize = size; t.fontName = font;
  t.fills = [{ type: 'SOLID', color: color }];
  if (opts.w) { t.resize(opts.w, t.height); t.textAutoResize = "HEIGHT"; }
  if (opts.align) t.textAlignHorizontal = opts.align;
  return t;
}
function rect(w, h, color, r) {
  var rc = figma.createRectangle(); rc.resize(w, h);
  rc.fills = [{ type: 'SOLID', color: color }]; if (r) rc.cornerRadius = r; return rc;
}
function frame(name, opts) {
  opts = opts || {};
  var f = figma.createFrame(); f.name = name;
  f.layoutMode = opts.dir || "VERTICAL";
  if (opts.w) { f.resize(opts.w, opts.h || 100); f.counterAxisSizingMode = "FIXED"; }
  f.primaryAxisSizingMode = opts.fh ? "FIXED" : "AUTO";
  if (!opts.w) f.counterAxisSizingMode = opts.fw ? "FIXED" : "AUTO";
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

function linkText(node, key) { try { node.componentPropertyReferences = { characters: key }; } catch(e) {} }
function linkVis(node, key) { try { node.componentPropertyReferences = { visible: key }; } catch(e) {} }

// ══════════════════════════════════════
// IONS — Design Token Variables
// ══════════════════════════════════════

function createIons(page) {
  var y = 0;
  page.appendChild(txt("_label", "🔬 Ions — Design Tokens", 32, FB, C['text/primary']));

  // Create variable collections
  try {
    var colorCollection = figma.variables.createVariableCollection("Colors");
    for (var name in TOKENS.colors) {
      var v = figma.variables.createVariable(name, colorCollection, "COLOR");
      v.setValueForMode(colorCollection.modes[0].modeId, TOKENS.colors[name]);
    }

    var spacingCollection = figma.variables.createVariableCollection("Spacing");
    for (var name in TOKENS.spacing) {
      var v = figma.variables.createVariable(name, spacingCollection, "FLOAT");
      v.setValueForMode(spacingCollection.modes[0].modeId, TOKENS.spacing[name]);
    }

    var radiusCollection = figma.variables.createVariableCollection("Radius");
    for (var name in TOKENS.radius) {
      var v = figma.variables.createVariable(name, radiusCollection, "FLOAT");
      v.setValueForMode(radiusCollection.modes[0].modeId, TOKENS.radius[name]);
    }
  } catch(e) {
    // Variables might already exist
    console.log("Variables:", e.message);
  }

  // Visual token reference
  var tokenFrame = frame("Token Reference", { dir: "VERTICAL", w: 800, g: 24, py: 40, px: 40, bg: C['surface/default'] });

  // Color swatches
  var colorRow = frame("Colors", { dir: "HORIZONTAL", g: 12 });
  for (var name in TOKENS.colors) {
    var swatch = frame(name, { dir: "VERTICAL", g: 4, ca: "CENTER" });
    swatch.appendChild(rect(48, 48, TOKENS.colors[name], 8));
    swatch.appendChild(txt("name", name.split('/')[1] || name, 9, FR, C['text/muted']));
    colorRow.appendChild(swatch);
  }
  tokenFrame.appendChild(colorRow);
  page.appendChild(tokenFrame);
  tokenFrame.x = 0; tokenFrame.y = 60;
}

// ══════════════════════════════════════
// ATOMS — Base Components
// ══════════════════════════════════════

function createAtoms(page) {
  var atoms = {};
  var x = 0;

  page.appendChild(txt("_label", "⚛️ Atoms — Base Components", 32, FB, C['text/primary']));

  // ── Button Primary ──
  var btnPrimary = figma.createComponent();
  btnPrimary.name = "Style=Primary";
  btnPrimary.layoutMode = "HORIZONTAL";
  btnPrimary.paddingLeft = 24; btnPrimary.paddingRight = 24;
  btnPrimary.paddingTop = 12; btnPrimary.paddingBottom = 12;
  btnPrimary.cornerRadius = 8;
  btnPrimary.counterAxisAlignItems = "CENTER";
  btnPrimary.primaryAxisAlignItems = "CENTER";
  btnPrimary.fills = [{ type: 'SOLID', color: C['surface/inverse'] }];
  var pk = btnPrimary.addComponentProperty("Label", "TEXT", "Get Started");
  var pLabel = txt("label", "Get Started", 14, FM, C['text/inverse']);
  btnPrimary.appendChild(pLabel);
  linkText(pLabel, pk);

  // ── Button Secondary ──
  var btnSecondary = figma.createComponent();
  btnSecondary.name = "Style=Secondary";
  btnSecondary.layoutMode = "HORIZONTAL";
  btnSecondary.paddingLeft = 24; btnSecondary.paddingRight = 24;
  btnSecondary.paddingTop = 12; btnSecondary.paddingBottom = 12;
  btnSecondary.cornerRadius = 8;
  btnSecondary.counterAxisAlignItems = "CENTER";
  btnSecondary.primaryAxisAlignItems = "CENTER";
  btnSecondary.fills = [];
  btnSecondary.strokes = [{ type: 'SOLID', color: C['border/strong'] }];
  btnSecondary.strokeWeight = 1; btnSecondary.strokeAlign = "INSIDE";
  var sk = btnSecondary.addComponentProperty("Label", "TEXT", "Learn More");
  var sLabel = txt("label", "Learn More", 14, FM, C['text/primary']);
  btnSecondary.appendChild(sLabel);
  linkText(sLabel, sk);

  // ── Button Tertiary (link) ──
  var btnTertiary = figma.createComponent();
  btnTertiary.name = "Style=Tertiary";
  btnTertiary.layoutMode = "HORIZONTAL";
  btnTertiary.paddingLeft = 4; btnTertiary.paddingRight = 4;
  btnTertiary.paddingTop = 12; btnTertiary.paddingBottom = 12;
  btnTertiary.counterAxisAlignItems = "CENTER";
  btnTertiary.fills = [];
  var tk = btnTertiary.addComponentProperty("Label", "TEXT", "Learn more");
  var tLabel = txt("label", "Learn more", 14, FM, C['text/secondary']);
  btnTertiary.appendChild(tLabel);
  linkText(tLabel, tk);

  // Combine buttons into set
  page.appendChild(btnPrimary); page.appendChild(btnSecondary); page.appendChild(btnTertiary);
  var btnSet = figma.combineAsVariants([btnPrimary, btnSecondary, btnTertiary], page);
  btnSet.name = "Button"; btnSet.x = 0; btnSet.y = 60;
  atoms.Button = btnSet;

  // ── Avatar ──
  var avatar = figma.createComponent();
  avatar.name = "Avatar";
  avatar.layoutMode = "HORIZONTAL";
  avatar.counterAxisAlignItems = "CENTER";
  avatar.primaryAxisAlignItems = "CENTER";
  var avKey = avatar.addComponentProperty("Size", "VARIANT", "Medium");
  var avCircle = figma.createEllipse();
  avCircle.resize(40, 40); avCircle.fills = [{ type: 'SOLID', color: C['placeholder/avatar'] }];
  avCircle.name = "circle";
  avatar.appendChild(avCircle);
  page.appendChild(avatar); avatar.x = 300; avatar.y = 60;
  atoms.Avatar = avatar;

  // ── Image Placeholder ──
  var imgPlaceholder = figma.createComponent();
  imgPlaceholder.name = "Image Placeholder";
  imgPlaceholder.resize(400, 240);
  imgPlaceholder.cornerRadius = 12;
  imgPlaceholder.fills = [{ type: 'SOLID', color: C['placeholder/default'] }];
  page.appendChild(imgPlaceholder); imgPlaceholder.x = 400; imgPlaceholder.y = 60;
  atoms.ImagePlaceholder = imgPlaceholder;

  // ── Icon Placeholder ──
  var iconPlaceholder = figma.createComponent();
  iconPlaceholder.name = "Icon Placeholder";
  iconPlaceholder.resize(32, 32);
  iconPlaceholder.cornerRadius = 8;
  iconPlaceholder.fills = [{ type: 'SOLID', color: C['placeholder/default'] }];
  page.appendChild(iconPlaceholder); iconPlaceholder.x = 850; iconPlaceholder.y = 60;
  atoms.IconPlaceholder = iconPlaceholder;

  // ── Badge ──
  var badge = figma.createComponent();
  badge.name = "Badge";
  badge.layoutMode = "HORIZONTAL";
  badge.paddingLeft = 8; badge.paddingRight = 8;
  badge.paddingTop = 4; badge.paddingBottom = 4;
  badge.cornerRadius = 4;
  badge.fills = [{ type: 'SOLID', color: C['surface/muted'] }];
  var bk = badge.addComponentProperty("Label", "TEXT", "Badge");
  var bLabel = txt("label", "Badge", 11, FM, C['text/secondary']);
  badge.appendChild(bLabel); linkText(bLabel, bk);
  page.appendChild(badge); badge.x = 930; badge.y = 60;
  atoms.Badge = badge;

  return atoms;
}

// ══════════════════════════════════════
// MOLECULES — Compound Components
// ══════════════════════════════════════

function createMolecules(page, atoms) {
  var molecules = {};

  page.appendChild(txt("_label", "🧬 Molecules — Compound Components", 32, FB, C['text/primary']));

  // ── Feature Card ──
  var featureCard = figma.createComponent();
  featureCard.name = "Feature Card";
  featureCard.layoutMode = "VERTICAL";
  featureCard.resize(280, 100); featureCard.counterAxisSizingMode = "FIXED";
  featureCard.primaryAxisSizingMode = "AUTO";
  featureCard.paddingLeft = 24; featureCard.paddingRight = 24;
  featureCard.paddingTop = 24; featureCard.paddingBottom = 24;
  featureCard.itemSpacing = 12; featureCard.cornerRadius = 12;
  featureCard.fills = [{ type: 'SOLID', color: C['surface/subtle'] }];

  var fcIcon = atoms.IconPlaceholder.createInstance(); fcIcon.name = "icon";
  featureCard.appendChild(fcIcon);
  var fcTk = featureCard.addComponentProperty("Title", "TEXT", "Feature Title");
  var fcTitle = txt("title", "Feature Title", 15, FS, C['text/primary']);
  featureCard.appendChild(fcTitle); linkText(fcTitle, fcTk);
  var fcDk = featureCard.addComponentProperty("Description", "TEXT", "A brief description of this feature.");
  var fcDesc = txt("description", "A brief description of this feature.", 13, FR, C['text/secondary'], { w: 232 });
  featureCard.appendChild(fcDesc); linkText(fcDesc, fcDk);
  page.appendChild(featureCard); featureCard.x = 0; featureCard.y = 60;
  molecules.FeatureCard = featureCard;

  // ── Testimonial Card ──
  var testCard = figma.createComponent();
  testCard.name = "Testimonial Card";
  testCard.layoutMode = "VERTICAL";
  testCard.resize(280, 100); testCard.counterAxisSizingMode = "FIXED";
  testCard.primaryAxisSizingMode = "AUTO";
  testCard.paddingLeft = 24; testCard.paddingRight = 24;
  testCard.paddingTop = 24; testCard.paddingBottom = 24;
  testCard.itemSpacing = 16; testCard.cornerRadius = 12;
  testCard.fills = [{ type: 'SOLID', color: C['surface/default'] }];

  var tcQk = testCard.addComponentProperty("Quote", "TEXT", '"Great product!"');
  var tcQuote = txt("quote", '"Great product!"', 13, FR, C['text/secondary'], { w: 232 });
  testCard.appendChild(tcQuote); linkText(tcQuote, tcQk);

  var tcAuth = frame("author", { dir: "HORIZONTAL", g: 10, ca: "CENTER" });
  var tcAvatar = atoms.Avatar.createInstance(); tcAvatar.name = "avatar";
  tcAuth.appendChild(tcAvatar);
  var tcInfo = frame("info", { dir: "VERTICAL", g: 2 });
  var tcNk = testCard.addComponentProperty("Author", "TEXT", "Jane Doe");
  var tcName = txt("author", "Jane Doe", 13, FM, C['text/primary']);
  tcInfo.appendChild(tcName);
  var tcRk = testCard.addComponentProperty("Role", "TEXT", "CEO");
  var tcRole = txt("role", "CEO", 11, FR, C['text/muted']);
  tcInfo.appendChild(tcRole);
  tcAuth.appendChild(tcInfo);
  testCard.appendChild(tcAuth);
  linkText(tcName, tcNk); linkText(tcRole, tcRk);
  page.appendChild(testCard); testCard.x = 320; testCard.y = 60;
  molecules.TestimonialCard = testCard;

  // ── Stat Item ──
  var statItem = figma.createComponent();
  statItem.name = "Stat Item";
  statItem.layoutMode = "VERTICAL";
  statItem.itemSpacing = 4; statItem.counterAxisAlignItems = "CENTER";
  statItem.primaryAxisSizingMode = "AUTO";

  var siVk = statItem.addComponentProperty("Value", "TEXT", "10K+");
  var siValue = txt("value", "10K+", 36, FB, C['text/primary'], { align: "CENTER" });
  statItem.appendChild(siValue); linkText(siValue, siVk);
  var siLk = statItem.addComponentProperty("Label", "TEXT", "Users");
  var siLabel = txt("label", "Users", 13, FR, C['text/secondary'], { align: "CENTER" });
  statItem.appendChild(siLabel); linkText(siLabel, siLk);
  page.appendChild(statItem); statItem.x = 640; statItem.y = 60;
  molecules.StatItem = statItem;

  // ── Nav Link ──
  var navLink = figma.createComponent();
  navLink.name = "Nav Link";
  navLink.layoutMode = "HORIZONTAL";
  navLink.counterAxisAlignItems = "CENTER";
  var nlk = navLink.addComponentProperty("Label", "TEXT", "Link");
  var nlLabel = txt("label", "Link", 13, FR, C['text/secondary']);
  navLink.appendChild(nlLabel); linkText(nlLabel, nlk);
  page.appendChild(navLink); navLink.x = 760; navLink.y = 60;
  molecules.NavLink = navLink;

  // ── FAQ Item ──
  var faqItem = figma.createComponent();
  faqItem.name = "FAQ Item";
  faqItem.layoutMode = "VERTICAL";
  faqItem.primaryAxisSizingMode = "AUTO";
  faqItem.paddingTop = 20; faqItem.paddingBottom = 20;
  faqItem.itemSpacing = 8;

  var fqQk = faqItem.addComponentProperty("Question", "TEXT", "How does it work?");
  var fqQ = txt("question", "How does it work?", 15, FM, C['text/primary']);
  faqItem.appendChild(fqQ); linkText(fqQ, fqQk);
  var fqAk = faqItem.addComponentProperty("Answer", "TEXT", "It works like magic.");
  var fqA = txt("answer", "It works like magic.", 13, FR, C['text/secondary'], { w: 600 });
  faqItem.appendChild(fqA); linkText(fqA, fqAk);
  page.appendChild(faqItem); faqItem.x = 880; faqItem.y = 60;
  molecules.FaqItem = faqItem;

  return molecules;
}

// ══════════════════════════════════════
// ORGANISMS — Section Components (using atoms + molecules)
// ══════════════════════════════════════

function buildOrganism(comp, category, variantId, content, atoms, molecules) {
  var builder = BUILDERS[category];
  if (builder) builder(comp, content, atoms, molecules);
  else buildGenericOrganism(comp, content, category);
}

function buildGenericOrganism(comp, content, category) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 64; comp.paddingBottom = 64;
  comp.itemSpacing = 16; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C['surface/default'] }];
  var tk = comp.addComponentProperty("Title", "TEXT", content.title || category);
  var tn = txt("title", content.title || category, 28, FB, C['text/primary'], { align: "CENTER" });
  comp.appendChild(tn); linkText(tn, tk);
  if (content.subtitle) {
    var sk = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle);
    var sn = txt("subtitle", content.subtitle, 16, FR, C['text/secondary'], { w: 600, align: "CENTER" });
    comp.appendChild(sn); linkText(sn, sk);
  }
}

// ── Header ──
function buildHeaderOrganism(comp, content, atoms, molecules) {
  comp.layoutMode = "HORIZONTAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "FIXED"; comp.counterAxisSizingMode = "AUTO";
  comp.paddingLeft = 32; comp.paddingRight = 32; comp.paddingTop = 16; comp.paddingBottom = 16;
  comp.itemSpacing = 32; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C['surface/default'] }];

  var lk = comp.addComponentProperty("Logo", "TEXT", content.logo || "Logo");
  var ln = txt("logo", content.logo || "Logo", 16, FS, C['text/primary']);
  comp.appendChild(ln); linkText(ln, lk);

  var nav = frame("nav", { dir: "HORIZONTAL", g: 24, ca: "CENTER" });
  var links = Array.isArray(content.links) ? content.links : [];
  for (var i = 0; i < links.length; i++) {
    var link = molecules.NavLink.createInstance(); link.name = "link_" + i;
    try { var props = link.componentProperties; for (var k in props) { if (k.indexOf("Label") === 0) link.setProperties(makeObj(k, links[i].label || '')); } } catch(e) {}
    nav.appendChild(link);
  }
  nav.layoutGrow = 1; comp.appendChild(nav);

  var ctaBtn = atoms.Button.defaultVariant.createInstance();
  ctaBtn.name = "cta";
  try { var props = ctaBtn.componentProperties; for (var k in props) { if (k.indexOf("Label") === 0) ctaBtn.setProperties(makeObj(k, content.ctaText || "Get Started")); } } catch(e) {}
  comp.appendChild(ctaBtn);
}

// ── Hero ──
function buildHeroOrganism(comp, content, atoms, molecules) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.itemSpacing = 24; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C['surface/subtle'] }];

  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Build something amazing");
  var tn = txt("title", content.title || "Build something amazing", 48, FB, C['text/primary'], { w: 700, align: "CENTER" });
  comp.appendChild(tn); linkText(tn, tk);

  var sk = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle || "A short description.");
  var sn = txt("subtitle", content.subtitle || "A short description.", 18, FR, C['text/secondary'], { w: 600, align: "CENTER" });
  comp.appendChild(sn); linkText(sn, sk);

  // Buttons using atom instances
  var btns = frame("buttons", { dir: "HORIZONTAL", g: 12 });
  var showPk = comp.addComponentProperty("Show Primary", "BOOLEAN", true);
  var primaryBtn = findVariant(atoms.Button, "Primary").createInstance();
  primaryBtn.name = "primaryBtn";
  try { var props = primaryBtn.componentProperties; for (var k in props) { if (k.indexOf("Label") === 0) primaryBtn.setProperties(makeObj(k, content.ctaText || "Get Started")); } } catch(e) {}
  btns.appendChild(primaryBtn);

  var showSk = comp.addComponentProperty("Show Secondary", "BOOLEAN", true);
  var secondaryBtn = findVariant(atoms.Button, "Secondary").createInstance();
  secondaryBtn.name = "secondaryBtn";
  try { var props = secondaryBtn.componentProperties; for (var k in props) { if (k.indexOf("Label") === 0) secondaryBtn.setProperties(makeObj(k, content.ctaSecondaryText || "Learn More")); } } catch(e) {}
  btns.appendChild(secondaryBtn);

  comp.appendChild(btns);
  linkVis(primaryBtn, showPk);
  linkVis(secondaryBtn, showSk);
}

// ── Features ──
function buildFeaturesOrganism(comp, content, atoms, molecules) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.itemSpacing = 40; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C['surface/default'] }];

  var header = frame("header", { dir: "VERTICAL", g: 12, ca: "CENTER" });
  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Features");
  var tn = txt("title", content.title || "Features", 28, FB, C['text/primary'], { align: "CENTER" });
  header.appendChild(tn);
  var sk = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle || "Everything you need.");
  var sn = txt("subtitle", content.subtitle || "Everything you need.", 16, FR, C['text/secondary'], { w: 500, align: "CENTER" });
  header.appendChild(sn);
  comp.appendChild(header);
  linkText(tn, tk); linkText(sn, sk);

  var grid = frame("grid", { dir: "HORIZONTAL", g: 24 });
  var features = Array.isArray(content.features) ? content.features : [];
  for (var i = 0; i < features.length; i++) {
    var card = molecules.FeatureCard.createInstance();
    card.name = "feature_" + i;
    try {
      var props = card.componentProperties;
      for (var k in props) {
        if (k.indexOf("Title") === 0) card.setProperties(makeObj(k, features[i].title || ''));
        if (k.indexOf("Description") === 0) card.setProperties(makeObj(k, features[i].description || ''));
      }
    } catch(e) {}
    grid.appendChild(card);
  }
  comp.appendChild(grid);
}

// ── Stats ──
function buildStatsOrganism(comp, content, atoms, molecules) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 64; comp.paddingBottom = 64;
  comp.itemSpacing = 32; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C['surface/default'] }];

  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Stats");
  var tn = txt("title", content.title || "Stats", 28, FB, C['text/primary'], { align: "CENTER" });
  comp.appendChild(tn); linkText(tn, tk);

  var row = frame("stats", { dir: "HORIZONTAL", g: 48 });
  var stats = Array.isArray(content.stats) ? content.stats : [];
  for (var i = 0; i < stats.length; i++) {
    var item = molecules.StatItem.createInstance();
    item.name = "stat_" + i;
    try {
      var props = item.componentProperties;
      for (var k in props) {
        if (k.indexOf("Value") === 0) item.setProperties(makeObj(k, stats[i].value || ''));
        if (k.indexOf("Label") === 0) item.setProperties(makeObj(k, stats[i].label || ''));
      }
    } catch(e) {}
    row.appendChild(item);
  }
  comp.appendChild(row);
}

// ── Testimonials ──
function buildTestimonialsOrganism(comp, content, atoms, molecules) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.itemSpacing = 32; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C['surface/subtle'] }];

  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Testimonials");
  var tn = txt("title", content.title || "Testimonials", 28, FB, C['text/primary'], { align: "CENTER" });
  comp.appendChild(tn); linkText(tn, tk);

  var cards = frame("testimonials", { dir: "HORIZONTAL", g: 24 });
  var items = Array.isArray(content.testimonials) ? content.testimonials : [];
  for (var i = 0; i < items.length; i++) {
    var card = molecules.TestimonialCard.createInstance();
    card.name = "testimonial_" + i;
    try {
      var props = card.componentProperties;
      for (var k in props) {
        if (k.indexOf("Quote") === 0) card.setProperties(makeObj(k, '"' + (items[i].quote || '') + '"'));
        if (k.indexOf("Author") === 0) card.setProperties(makeObj(k, items[i].author || ''));
        if (k.indexOf("Role") === 0) card.setProperties(makeObj(k, items[i].role || ''));
      }
    } catch(e) {}
    cards.appendChild(card);
  }
  comp.appendChild(cards);
}

// ── CTA ──
function buildCtaOrganism(comp, content, atoms, molecules) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.itemSpacing = 24; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C['surface/inverse'] }];

  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Ready to start?");
  var tn = txt("title", content.title || "Ready to start?", 28, FB, C['text/inverse'], { align: "CENTER" });
  comp.appendChild(tn); linkText(tn, tk);

  var sk = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle || "Join thousands.");
  var sn = txt("subtitle", content.subtitle || "Join thousands.", 16, FR, C['text/on-dark'], { w: 500, align: "CENTER" });
  comp.appendChild(sn); linkText(sn, sk);

  // White button on dark bg
  var btn = frame("ctaButton", { dir: "HORIZONTAL", bg: C['surface/default'], px: 24, py: 12, r: 8, ca: "CENTER" });
  var ck = comp.addComponentProperty("Button Text", "TEXT", content.ctaText || "Get Started");
  var ct = txt("ctaText", content.ctaText || "Get Started", 14, FM, C['text/primary']);
  btn.appendChild(ct); comp.appendChild(btn); linkText(ct, ck);
}

// ── Footer ──
function buildFooterOrganism(comp, content, atoms, molecules) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 48; comp.paddingBottom = 48;
  comp.itemSpacing = 32;
  comp.fills = [{ type: 'SOLID', color: C['surface/inverse'] }];

  var top = frame("top", { dir: "HORIZONTAL", g: 48 });
  top.resize(W - 160, 100); top.counterAxisSizingMode = "FIXED";
  var logoCol = frame("logoCol", { dir: "VERTICAL", g: 8 });
  var lk = comp.addComponentProperty("Logo", "TEXT", content.logo || "Logo");
  var ln = txt("logo", content.logo || "Logo", 16, FS, C['text/inverse']);
  logoCol.appendChild(ln);
  var dk = comp.addComponentProperty("Description", "TEXT", content.description || "Description.");
  var dn = txt("description", content.description || "Description.", 12, FR, C['text/on-dark'], { w: 200 });
  logoCol.appendChild(dn);
  top.appendChild(logoCol);

  var columns = Array.isArray(content.columns) ? content.columns : [];
  for (var i = 0; i < columns.length; i++) {
    var colFrame = frame("column_" + i, { dir: "VERTICAL", g: 8 });
    colFrame.appendChild(txt("columnTitle_" + i, columns[i].title || '', 13, FS, C['text/inverse']));
    var links = String(columns[i].links || '').split(',');
    for (var j = 0; j < links.length; j++) {
      var l = links[j].trim();
      if (l) colFrame.appendChild(txt("link_" + i + "_" + j, l, 12, FR, C['text/on-dark']));
    }
    top.appendChild(colFrame);
  }
  comp.appendChild(top);
  linkText(ln, lk); linkText(dn, dk);

  comp.appendChild(rect(W - 160, 1, C['border/default']));
  var ck = comp.addComponentProperty("Copyright", "TEXT", content.copyright || "© 2024");
  var cn = txt("copyright", content.copyright || "© 2024", 12, FR, C['text/muted']);
  comp.appendChild(cn); linkText(cn, ck);
}

// ── FAQ ──
function buildFaqOrganism(comp, content, atoms, molecules) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.itemSpacing = 32; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C['surface/default'] }];

  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "FAQ");
  var tn = txt("title", content.title || "FAQ", 28, FB, C['text/primary'], { align: "CENTER" });
  comp.appendChild(tn); linkText(tn, tk);

  var list = frame("questions", { dir: "VERTICAL", g: 0, w: 700 });
  var questions = Array.isArray(content.questions) ? content.questions : [];
  for (var i = 0; i < questions.length; i++) {
    var item = molecules.FaqItem.createInstance();
    item.name = "qa_" + i;
    try {
      var props = item.componentProperties;
      for (var k in props) {
        if (k.indexOf("Question") === 0) item.setProperties(makeObj(k, questions[i].question || ''));
        if (k.indexOf("Answer") === 0) item.setProperties(makeObj(k, questions[i].answer || ''));
      }
    } catch(e) {}
    list.appendChild(item);
    item.layoutSizingHorizontal = "FILL";
  }
  comp.appendChild(list);
}

// Builder map
var BUILDERS = {
  header: buildHeaderOrganism,
  hero: buildHeroOrganism,
  features: buildFeaturesOrganism,
  stats: buildStatsOrganism,
  testimonials: buildTestimonialsOrganism,
  cta: buildCtaOrganism,
  footer: buildFooterOrganism,
  faq: buildFaqOrganism,
};

// Helper to make a single-key object
function makeObj(k, v) { var o = {}; o[k] = v; return o; }

// Find a variant component inside a component set
function findVariant(set, styleName) {
  if (set.type === "COMPONENT") return set;
  var children = set.children || [];
  for (var i = 0; i < children.length; i++) {
    if (children[i].name && children[i].name.indexOf(styleName) >= 0) return children[i];
  }
  return children[0] || set;
}

// Default content
function getDefaultContent(cat) {
  var defaults = {
    header: { logo: 'Logo', links: [{ label: 'Features' }, { label: 'Pricing' }, { label: 'About' }], ctaText: 'Get Started' },
    hero: { title: 'Build something amazing', subtitle: 'A short description.', ctaText: 'Get Started', ctaSecondaryText: 'Learn More' },
    features: { title: 'Features', subtitle: 'Everything you need.', features: [{ title: 'Feature 1', description: 'Description' }, { title: 'Feature 2', description: 'Description' }, { title: 'Feature 3', description: 'Description' }] },
    stats: { title: 'Stats', stats: [{ value: '10K+', label: 'Users' }, { value: '99%', label: 'Uptime' }, { value: '150+', label: 'Countries' }] },
    testimonials: { title: 'Testimonials', testimonials: [{ quote: 'Great!', author: 'Jane', role: 'CEO' }, { quote: 'Amazing!', author: 'John', role: 'CTO' }, { quote: 'Love it!', author: 'Sarah', role: 'Designer' }] },
    cta: { title: 'Ready to start?', subtitle: 'Join thousands.', ctaText: 'Get Started' },
    footer: { logo: 'Logo', description: 'Description.', copyright: '© 2024', columns: [{ title: 'Product', links: 'Features, Pricing' }, { title: 'Company', links: 'About, Blog' }] },
    faq: { title: 'FAQ', subtitle: 'Common questions.', questions: [{ question: 'How?', answer: 'Easy.' }, { question: 'Why?', answer: 'Because.' }] },
    pricing: { title: 'Pricing', subtitle: 'Simple pricing.' },
  };
  return defaults[cat] || { title: cat, subtitle: 'Section description.' };
}

function getCategoryLabel(cat) {
  var labels = { header:'Header', hero:'Hero', logos:'Logo Cloud', features:'Features', stats:'Stats', pricing:'Pricing', testimonials:'Testimonials', faq:'FAQ', cta:'CTA', footer:'Footer', blog:'Blog', about:'About', team:'Team', gallery:'Gallery', contact:'Contact', banner:'Banner', showcase:'Showcase', error:'Error Page', process:'How It Works', downloads:'Downloads', comparison:'Comparison', store:'Store' };
  return labels[cat] || cat;
}

function getVariantName(vid) {
  var parts = vid.split('-').slice(1);
  return parts.map(function(p) { return p.charAt(0).toUpperCase() + p.slice(1); }).join(' ') || 'Default';
}

// ── Override instance ──
async function overrideInstance(inst, content, cat) {
  // Set text properties
  try {
    var props = inst.componentProperties;
    for (var k in props) {
      if (props[k].type !== 'TEXT') continue;
      var name = k.split('#')[0];
      var map = { 'Title': content.title, 'Subtitle': content.subtitle, 'Logo': content.logo, 'Description': content.description, 'Copyright': content.copyright, 'Primary Button': content.ctaText, 'Secondary Button': content.ctaSecondaryText, 'Button Text': content.ctaText, 'CTA Text': content.ctaText };
      if (map[name]) inst.setProperties(makeObj(k, map[name]));
    }
  } catch(e) {}

  // Override nested text nodes by name
  var fields = ['title', 'subtitle', 'logo', 'description', 'copyright', 'ctaText'];
  for (var i = 0; i < fields.length; i++) {
    if (content[fields[i]]) {
      var n = inst.findOne(function(n) { return n.name === fields[i] && n.type === "TEXT"; });
      if (n) { try { await figma.loadFontAsync(n.fontName); n.characters = String(content[fields[i]]); } catch(e) {} }
    }
  }
}

// ══════════════════════════════════════
// MAIN — Import Pipeline
// ══════════════════════════════════════

figma.ui.onmessage = async function(msg) {
  if (msg.type !== 'import') return;
  try {
    await loadFonts();
    var project = msg.data;
    if (!project || !project.pages || !project.pages.length) {
      figma.ui.postMessage({ type: 'error', message: 'No pages found' }); return;
    }

    // Phase 0: Analyze
    figma.ui.postMessage({ type: 'progress', message: 'Analyzing sections...' });
    var used = {};
    for (var p = 0; p < project.pages.length; p++) {
      var secs = project.pages[p].sections || [];
      for (var s = 0; s < secs.length; s++) {
        if (!used[secs[s].category]) used[secs[s].category] = {};
        used[secs[s].category][secs[s].variantId] = true;
      }
    }

    // Phase 1: Ions
    figma.ui.postMessage({ type: 'progress', message: '🔬 Creating design tokens...' });
    var ionsPage = figma.createPage(); ionsPage.name = "🔬 Ions";
    createIons(ionsPage);

    // Phase 2: Atoms
    figma.ui.postMessage({ type: 'progress', message: '⚛️ Building atoms...' });
    var atomsPage = figma.createPage(); atomsPage.name = "⚛️ Atoms";
    var atoms = createAtoms(atomsPage);

    // Phase 3: Molecules
    figma.ui.postMessage({ type: 'progress', message: '🧬 Building molecules...' });
    var moleculesPage = figma.createPage(); moleculesPage.name = "🧬 Molecules";
    var molecules = createMolecules(moleculesPage, atoms);

    // Phase 4: Organisms
    figma.ui.postMessage({ type: 'progress', message: '🏗️ Building organisms...' });
    var organismsPage = figma.createPage(); organismsPage.name = "🏗️ Organisms";
    var compSets = {};
    var cy = 60;

    organismsPage.appendChild(txt("_label", "🏗️ Organisms — Section Components", 32, FB, C['text/primary']));

    for (var cat in used) {
      var label = txt("_cat_" + cat, getCategoryLabel(cat), 20, FS, C['text/primary']);
      organismsPage.appendChild(label); label.x = 0; label.y = cy; cy += 36;

      var comps = [];
      var catComps = {};
      var vids = Object.keys(used[cat]);

      for (var v = 0; v < vids.length; v++) {
        var vid = vids[v];
        var comp = figma.createComponent();
        comp.name = "Variant=" + getVariantName(vid);
        buildOrganism(comp, cat, vid, getDefaultContent(cat), atoms, molecules);
        organismsPage.appendChild(comp);
        comp.x = 0; comp.y = cy;
        cy += (comp.height > 100 ? comp.height : 200) + 40;
        comps.push(comp);
        catComps[vid] = comp;
      }

      if (comps.length > 1) {
        var set = figma.combineAsVariants(comps, organismsPage);
        set.name = getCategoryLabel(cat);
        set.x = 0; set.y = cy - comps.length * 200;
        cy = set.y + set.height + 80;
      } else if (comps.length === 1) {
        comps[0].name = getCategoryLabel(cat);
      }
      compSets[cat] = catComps;
      cy += 40;
    }

    // Phase 5: Templates (Pages with instances)
    var total = 0;
    for (var p = 0; p < project.pages.length; p++) {
      var pd = project.pages[p];
      var secs = pd.sections || [];
      figma.ui.postMessage({ type: 'progress', message: '📄 Building "' + pd.name + '" (' + secs.length + ' sections)...' });

      var fp = figma.createPage(); fp.name = "📄 " + (pd.name || "Page " + (p + 1));
      var pf = figma.createFrame(); pf.name = pd.name || 'Page';
      pf.resize(W, 100); pf.layoutMode = "VERTICAL";
      pf.primaryAxisSizingMode = "AUTO"; pf.counterAxisSizingMode = "FIXED";
      pf.itemSpacing = 0; pf.fills = [{ type: 'SOLID', color: C['surface/default'] }];

      for (var s = 0; s < secs.length; s++) {
        try {
          var cc = compSets[secs[s].category];
          if (!cc || !cc[secs[s].variantId]) continue;
          var inst = cc[secs[s].variantId].createInstance();
          await overrideInstance(inst, secs[s].content, secs[s].category);
          pf.appendChild(inst);
          inst.layoutSizingHorizontal = "FILL";
          total++;
        } catch(e) { console.error("Error:", secs[s].category, e); }
      }

      fp.appendChild(pf);
      if (p === project.pages.length - 1) {
        figma.currentPage = fp;
        figma.viewport.scrollAndZoomIntoView([pf]);
      }
    }

    figma.ui.postMessage({ type: 'done', sectionCount: total, pageCount: project.pages.length });
  } catch(e) {
    figma.ui.postMessage({ type: 'error', message: String(e) });
  }
};
