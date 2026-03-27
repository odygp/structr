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

function linkText(node, key) {
  try {
    // Merge with existing references to avoid overwriting
    var refs = node.componentPropertyReferences || {};
    refs.characters = key;
    node.componentPropertyReferences = refs;
  } catch(e) { console.log('linkText failed for ' + node.name + ': ' + e.message); }
}
function linkVis(node, key) {
  try {
    var refs = node.componentPropertyReferences || {};
    refs.visible = key;
    node.componentPropertyReferences = refs;
  } catch(e) { console.log('linkVis failed for ' + node.name + ': ' + e.message); }
}

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
  btnPrimary.primaryAxisSizingMode = "AUTO"; btnPrimary.counterAxisSizingMode = "AUTO";
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
  btnSecondary.primaryAxisSizingMode = "AUTO"; btnSecondary.counterAxisSizingMode = "AUTO";
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
  btnTertiary.primaryAxisSizingMode = "AUTO"; btnTertiary.counterAxisSizingMode = "AUTO";
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
  avatar.primaryAxisSizingMode = "AUTO"; avatar.counterAxisSizingMode = "AUTO";
  avatar.counterAxisAlignItems = "CENTER";
  avatar.primaryAxisAlignItems = "CENTER";
  
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
  badge.primaryAxisSizingMode = "AUTO"; badge.counterAxisSizingMode = "AUTO";
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
  var tcAvatar = atoms.Avatar.createInstance(); tcAvatar.layoutSizingVertical = "HUG"; tcAvatar.layoutSizingHorizontal = "HUG"; tcAvatar.name = "avatar";
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
  statItem.primaryAxisSizingMode = "AUTO"; statItem.counterAxisSizingMode = "AUTO";

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
  navLink.primaryAxisSizingMode = "AUTO"; navLink.counterAxisSizingMode = "AUTO";
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

// Variant-specific builders for categories that need different layouts per variant
var VARIANT_SPECIFIC = {
  'hero-split': function(comp, content, atoms, molecules) {
    comp.layoutMode = "HORIZONTAL"; comp.resize(W, 100);
    comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
    comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
    comp.itemSpacing = 48; comp.counterAxisAlignItems = "CENTER";
    comp.fills = [{ type: 'SOLID', color: C['surface/default'] }];
    var textCol = frame("textContent", { dir: "VERTICAL", g: 20 });
    textCol.resize(550, 100); textCol.counterAxisSizingMode = "FIXED";
    var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Build something amazing");
    var tn = txt("title", content.title || "Build something amazing", 48, FB, C['text/primary']);
    textCol.appendChild(tn); linkText(tn, tk);
    var sk = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle || "Description.");
    var sn = txt("subtitle", content.subtitle || "Description.", 18, FR, C['text/secondary'], { w: 500 });
    textCol.appendChild(sn); linkText(sn, sk);
    var btns = frame("buttons", { dir: "HORIZONTAL", g: 12 });
    var pb = findVariant(atoms.Button, "Primary").createInstance(); pb.name = "primaryBtn"; btns.appendChild(pb);
    pb.layoutSizingVertical = "HUG"; pb.layoutSizingHorizontal = "HUG";
    var sb = findVariant(atoms.Button, "Secondary").createInstance(); sb.name = "secondaryBtn"; btns.appendChild(sb);
    sb.layoutSizingVertical = "HUG"; sb.layoutSizingHorizontal = "HUG";
    textCol.appendChild(btns);
    comp.appendChild(textCol);
    var img = atoms.ImagePlaceholder.createInstance(); img.name = "image"; img.resize(520, 400);
    comp.appendChild(img);
  },
  'hero-minimal': function(comp, content, atoms) {
    comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
    comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
    comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 120; comp.paddingBottom = 120;
    comp.itemSpacing = 32; comp.counterAxisAlignItems = "CENTER";
    comp.fills = [{ type: 'SOLID', color: C['surface/default'] }];
    var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Build something amazing");
    var tn = txt("title", content.title || "Build something amazing", 56, FB, C['text/primary'], { w: 800, align: "CENTER" });
    comp.appendChild(tn); linkText(tn, tk);
    var pb = findVariant(atoms.Button, "Primary").createInstance(); pb.name = "primaryBtn";
    pb.layoutSizingVertical = "HUG"; pb.layoutSizingHorizontal = "HUG";
    comp.appendChild(pb);
  },
  'hero-with-image': function(comp, content, atoms) {
    comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
    comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
    comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
    comp.itemSpacing = 24; comp.counterAxisAlignItems = "CENTER";
    comp.fills = [{ type: 'SOLID', color: C['surface/subtle'] }];
    var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Build something amazing");
    var tn = txt("title", content.title || "Build something amazing", 48, FB, C['text/primary'], { w: 700, align: "CENTER" });
    comp.appendChild(tn); linkText(tn, tk);
    var sk = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle || "Description.");
    var sn = txt("subtitle", content.subtitle || "Description.", 18, FR, C['text/secondary'], { w: 600, align: "CENTER" });
    comp.appendChild(sn); linkText(sn, sk);
    var btns = frame("buttons", { dir: "HORIZONTAL", g: 12 });
    var hiBtnP = findVariant(atoms.Button, "Primary").createInstance(); hiBtnP.layoutSizingVertical = "HUG"; hiBtnP.layoutSizingHorizontal = "HUG"; btns.appendChild(hiBtnP);
    var hiBtnS = findVariant(atoms.Button, "Secondary").createInstance(); hiBtnS.layoutSizingVertical = "HUG"; hiBtnS.layoutSizingHorizontal = "HUG"; btns.appendChild(hiBtnS);
    comp.appendChild(btns);
    var img = atoms.ImagePlaceholder.createInstance(); img.name = "heroImage"; img.resize(1100, 500);
    comp.appendChild(img);
  },
  'hero-with-form': function(comp, content, atoms) {
    comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
    comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
    comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
    comp.itemSpacing = 24; comp.counterAxisAlignItems = "CENTER";
    comp.fills = [{ type: 'SOLID', color: C['surface/subtle'] }];
    var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Build something amazing");
    var tn = txt("title", content.title || "Build something amazing", 48, FB, C['text/primary'], { w: 700, align: "CENTER" });
    comp.appendChild(tn); linkText(tn, tk);
    var sk = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle || "Description.");
    var sn = txt("subtitle", content.subtitle || "Description.", 18, FR, C['text/secondary'], { w: 600, align: "CENTER" });
    comp.appendChild(sn); linkText(sn, sk);
    var formRow = frame("form", { dir: "HORIZONTAL", g: 8 });
    var input = frame("emailInput", { dir: "HORIZONTAL", bg: C['surface/default'], stroke: C['border/strong'], px: 16, py: 12, r: 8 });
    input.resize(320, 100); input.counterAxisSizingMode = "FIXED";
    input.appendChild(txt("placeholder", "Enter your email", 14, FR, C['text/muted']));
    formRow.appendChild(input);
    var btn = findVariant(atoms.Button, "Primary").createInstance(); btn.name = "submitBtn";
    btn.layoutSizingVertical = "HUG"; btn.layoutSizingHorizontal = "HUG";
    formRow.appendChild(btn);
    comp.appendChild(formRow);
  },
  'features-alternating': function(comp, content, atoms) {
    comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
    comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
    comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
    comp.itemSpacing = 48; comp.counterAxisAlignItems = "CENTER";
    comp.fills = [{ type: 'SOLID', color: C['surface/default'] }];
    var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Features");
    var tn = txt("title", content.title || "Features", 28, FB, C['text/primary'], { align: "CENTER" });
    comp.appendChild(tn); linkText(tn, tk);
    var features = Array.isArray(content.features) ? content.features : [];
    for (var i = 0; i < features.length; i++) {
      var row = frame("feature_" + i, { dir: "HORIZONTAL", g: 48, ca: "CENTER" });
      row.resize(1280, 100); row.counterAxisSizingMode = "FIXED";
      var textBlock = frame("text_" + i, { dir: "VERTICAL", g: 12 });
      textBlock.resize(500, 100); textBlock.counterAxisSizingMode = "FIXED";
      textBlock.appendChild(txt("featTitle_" + i, features[i].title || '', 22, FS, C['text/primary']));
      textBlock.appendChild(txt("featDesc_" + i, features[i].description || '', 15, FR, C['text/secondary'], { w: 480 }));
      var img = atoms.ImagePlaceholder.createInstance(); img.resize(600, 350);
      if (i % 2 === 0) { row.appendChild(textBlock); row.appendChild(img); }
      textBlock.layoutGrow = 1;

      else { row.appendChild(img); row.appendChild(textBlock); }
      comp.appendChild(row);
    }
  },
  'features-with-image': function(comp, content, atoms, molecules) {
    comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
    comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
    comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
    comp.itemSpacing = 40; comp.counterAxisAlignItems = "CENTER";
    comp.fills = [{ type: 'SOLID', color: C['surface/default'] }];
    var header = frame("header", { dir: "HORIZONTAL", g: 48, ca: "CENTER" });
    header.resize(1280, 100); header.counterAxisSizingMode = "FIXED";
    var textCol = frame("text", { dir: "VERTICAL", g: 16 });
    textCol.resize(500, 100); textCol.counterAxisSizingMode = "FIXED";
    var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Features");
    var tn = txt("title", content.title || "Features", 28, FB, C['text/primary']);
    textCol.appendChild(tn); linkText(tn, tk);
    var features = Array.isArray(content.features) ? content.features : [];
    for (var i = 0; i < features.length; i++) {
      var feat = frame("feat_" + i, { dir: "VERTICAL", g: 4 });
      feat.appendChild(txt("featTitle_" + i, features[i].title || '', 16, FS, C['text/primary']));
      feat.appendChild(txt("featDesc_" + i, features[i].description || '', 14, FR, C['text/secondary'], { w: 480 }));
      textCol.appendChild(feat);
    }
    header.appendChild(textCol);
    var img = atoms.ImagePlaceholder.createInstance(); img.resize(600, 400);
    header.appendChild(img);
    comp.appendChild(header);
  },
  'features-bento': function(comp, content, atoms) {
    comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
    comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
    comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
    comp.itemSpacing = 40; comp.counterAxisAlignItems = "CENTER";
    comp.fills = [{ type: 'SOLID', color: C['surface/default'] }];
    var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Features");
    var tn = txt("title", content.title || "Features", 28, FB, C['text/primary'], { align: "CENTER" });
    comp.appendChild(tn); linkText(tn, tk);
    var grid = frame("grid", { dir: "HORIZONTAL", g: 16 });
    grid.layoutWrap = "WRAP"; grid.resize(1280, 100); grid.counterAxisSizingMode = "FIXED";
    var features = Array.isArray(content.features) ? content.features : [];
    for (var i = 0; i < features.length; i++) {
      var w = i === 0 ? 820 : 444;
      var card = frame("bento_" + i, { dir: "VERTICAL", g: 12, px: 32, py: 32, r: 16, bg: C['surface/subtle'] });
      card.resize(w, 100); card.counterAxisSizingMode = "FIXED";
      card.appendChild(rect(40, 40, C['placeholder/default'], 8));
      card.appendChild(txt("bentoTitle_" + i, features[i].title || '', 16, FS, C['text/primary']));
      card.appendChild(txt("bentoDesc_" + i, features[i].description || '', 14, FR, C['text/secondary'], { w: w - 64 }));
      grid.appendChild(card);
      card.layoutGrow = 1;

    }
    comp.appendChild(grid);
  },
};

function buildOrganism(comp, category, variantId, content, atoms, molecules) {
  // Check for variant-specific builder first
  var variantBuilder = VARIANT_SPECIFIC[variantId];
  if (variantBuilder) { variantBuilder(comp, content, atoms, molecules); return; }
  // Then category builder
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

  var ctaBtn = atoms.Button.defaultVariant.createInstance(); ctaBtn.layoutSizingVertical = "HUG"; ctaBtn.layoutSizingHorizontal = "HUG";
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
  primaryBtn.layoutSizingVertical = "HUG"; primaryBtn.layoutSizingHorizontal = "HUG";
  primaryBtn.name = "primaryBtn";
  try { var props = primaryBtn.componentProperties; for (var k in props) { if (k.indexOf("Label") === 0) primaryBtn.setProperties(makeObj(k, content.ctaText || "Get Started")); } } catch(e) {}
  btns.appendChild(primaryBtn);

  var showSk = comp.addComponentProperty("Show Secondary", "BOOLEAN", true);
  var secondaryBtn = findVariant(atoms.Button, "Secondary").createInstance();
  secondaryBtn.layoutSizingVertical = "HUG"; secondaryBtn.layoutSizingHorizontal = "HUG";
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
    card.layoutGrow = 1;

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
    item.layoutGrow = 1;

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
    card.layoutGrow = 1;

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

// ── Logos ──
function buildLogosOrganism(comp, content, atoms) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 40; comp.paddingBottom = 40;
  comp.itemSpacing = 24; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C['surface/default'] }];
  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Trusted by leading companies");
  var tn = txt("title", content.title || "Trusted by leading companies", 13, FR, C['text/muted'], { align: "CENTER" });
  comp.appendChild(tn); linkText(tn, tk);
  var row = frame("logos", { dir: "HORIZONTAL", g: 40, ca: "CENTER" });
  var logos = Array.isArray(content.logos) ? content.logos : [{},{},{},{},{}];
  for (var i = 0; i < logos.length; i++) { var r = rect(80, 32, C['placeholder/default'], 6); r.name = "logo_" + i; row.appendChild(r); }
  r.layoutGrow = 1;

  comp.appendChild(row);
}

// ── Blog ──
function buildBlogOrganism(comp, content, atoms, molecules) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.itemSpacing = 32; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C['surface/default'] }];
  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Blog");
  var tn = txt("title", content.title || "Blog", 28, FB, C['text/primary'], { align: "CENTER" });
  comp.appendChild(tn); linkText(tn, tk);
  var grid = frame("posts", { dir: "HORIZONTAL", g: 24 });
  var posts = Array.isArray(content.posts) ? content.posts : [{ title: 'Post 1', excerpt: 'Excerpt.' }, { title: 'Post 2', excerpt: 'Excerpt.' }, { title: 'Post 3', excerpt: 'Excerpt.' }];
  for (var i = 0; i < posts.length; i++) {
    var card = frame("post_" + i, { dir: "VERTICAL", g: 12 });
    card.resize(280, 100); card.counterAxisSizingMode = "FIXED";
    card.appendChild(rect(280, 160, C['placeholder/default'], 12));
    card.appendChild(txt("postTitle_" + i, posts[i].title || '', 15, FS, C['text/primary']));
    card.appendChild(txt("postExcerpt_" + i, posts[i].excerpt || '', 13, FR, C['text/secondary'], { w: 260 }));
    grid.appendChild(card);
    card.layoutGrow = 1;

  }
  comp.appendChild(grid);
}

// ── Team ──
function buildTeamOrganism(comp, content, atoms) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.itemSpacing = 32; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C['surface/default'] }];
  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Team");
  var tn = txt("title", content.title || "Team", 28, FB, C['text/primary'], { align: "CENTER" });
  comp.appendChild(tn); linkText(tn, tk);
  var grid = frame("members", { dir: "HORIZONTAL", g: 32, ca: "CENTER" });
  var members = Array.isArray(content.members) ? content.members : [{ name: 'Jane', role: 'CEO' }, { name: 'John', role: 'CTO' }];
  for (var i = 0; i < members.length; i++) {
    var member = frame("member_" + i, { dir: "VERTICAL", g: 8, ca: "CENTER" });
    var av = atoms.Avatar.createInstance(); av.layoutSizingVertical = "HUG"; av.layoutSizingHorizontal = "HUG"; av.name = "avatar_" + i;
    av.resize(80, 80); member.appendChild(av);
    member.appendChild(txt("memberName_" + i, members[i].name || '', 14, FM, C['text/primary'], { align: "CENTER" }));
    member.appendChild(txt("memberRole_" + i, members[i].role || '', 12, FR, C['text/secondary'], { align: "CENTER" }));
    grid.appendChild(member);
    member.layoutGrow = 1;

  }
  comp.appendChild(grid);
}

// ── About ──
function buildAboutOrganism(comp, content, atoms) {
  comp.layoutMode = "HORIZONTAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.itemSpacing = 48; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C['surface/default'] }];
  var textCol = frame("text", { dir: "VERTICAL", g: 16 });
  textCol.resize(550, 100); textCol.counterAxisSizingMode = "FIXED";
  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "About");
  var tn = txt("title", content.title || "About", 28, FB, C['text/primary']);
  textCol.appendChild(tn); linkText(tn, tk);
  var dk = comp.addComponentProperty("Description", "TEXT", content.description || "Description.");
  var dn = txt("description", content.description || "Description.", 16, FR, C['text/secondary'], { w: 500 });
  textCol.appendChild(dn); linkText(dn, dk);
  comp.appendChild(textCol);
  var img = atoms.ImagePlaceholder.createInstance(); img.name = "image";
  img.resize(480, 320); comp.appendChild(img);
}

// ── Contact ──
function buildContactOrganism(comp, content) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.itemSpacing = 24; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C['surface/default'] }];
  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Contact");
  var tn = txt("title", content.title || "Contact", 28, FB, C['text/primary'], { align: "CENTER" });
  comp.appendChild(tn); linkText(tn, tk);
  if (content.subtitle) {
    var sk = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle);
    var sn = txt("subtitle", content.subtitle, 16, FR, C['text/secondary'], { w: 500, align: "CENTER" });
    comp.appendChild(sn); linkText(sn, sk);
  }
  var info = frame("info", { dir: "HORIZONTAL", g: 32 });
  if (content.email) info.appendChild(txt("email", content.email, 13, FR, C['text/secondary']));
  if (content.phone) info.appendChild(txt("phone", content.phone, 13, FR, C['text/secondary']));
  comp.appendChild(info);
  // Form placeholder
  var formFrame = frame("form", { dir: "VERTICAL", g: 12, w: 500 });
  formFrame.appendChild(rect(500, 44, C['surface/subtle'], 8));
  formFrame.appendChild(rect(500, 44, C['surface/subtle'], 8));
  formFrame.appendChild(rect(500, 100, C['surface/subtle'], 8));
  var btn = frame("submitBtn", { dir: "HORIZONTAL", bg: C['surface/inverse'], px: 24, py: 12, r: 8, ca: "CENTER", ma: "CENTER" });
  btn.resize(500, 44); btn.counterAxisSizingMode = "FIXED";
  btn.appendChild(txt("submitText", "Send Message", 14, FM, C['text/inverse'], { align: "CENTER" }));
  formFrame.appendChild(btn);
  comp.appendChild(formFrame);
}

// ── Banner ──
function buildBannerOrganism(comp, content) {
  comp.layoutMode = "HORIZONTAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "FIXED"; comp.counterAxisSizingMode = "AUTO";
  comp.paddingLeft = 32; comp.paddingRight = 32; comp.paddingTop = 12; comp.paddingBottom = 12;
  comp.itemSpacing = 16; comp.counterAxisAlignItems = "CENTER"; comp.primaryAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C['surface/inverse'] }];
  var tk = comp.addComponentProperty("Text", "TEXT", content.text || "Announcement");
  var tn = txt("text", content.text || "Announcement", 13, FR, C['text/inverse']);
  comp.appendChild(tn); linkText(tn, tk);
  if (content.ctaText) {
    var ck = comp.addComponentProperty("CTA", "TEXT", content.ctaText);
    var cn = txt("ctaText", content.ctaText, 13, FM, C['text/on-dark']);
    comp.appendChild(cn); linkText(cn, ck);
  }
}

// ── Process / How It Works ──
function buildProcessOrganism(comp, content) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.itemSpacing = 40; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C['surface/default'] }];
  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "How it works");
  var tn = txt("title", content.title || "How it works", 28, FB, C['text/primary'], { align: "CENTER" });
  comp.appendChild(tn); linkText(tn, tk);
  var grid = frame("steps", { dir: "HORIZONTAL", g: 32 });
  var steps = Array.isArray(content.steps) ? content.steps : [{ title: 'Step 1', description: 'Desc' }, { title: 'Step 2', description: 'Desc' }, { title: 'Step 3', description: 'Desc' }];
  for (var i = 0; i < steps.length; i++) {
    var step = frame("step_" + i, { dir: "VERTICAL", g: 12, ca: "CENTER" });
    var circle = frame("number", { dir: "HORIZONTAL", bg: C['surface/inverse'], r: 9999, ca: "CENTER", ma: "CENTER" });
    circle.resize(48, 48); circle.counterAxisSizingMode = "FIXED"; circle.primaryAxisSizingMode = "FIXED";
    circle.appendChild(txt("num", String(i + 1), 18, FB, C['text/inverse'], { align: "CENTER" }));
    step.appendChild(circle);
    step.appendChild(txt("stepTitle_" + i, steps[i].title || '', 16, FS, C['text/primary'], { align: "CENTER" }));
    step.appendChild(txt("stepDesc_" + i, steps[i].description || '', 13, FR, C['text/secondary'], { w: 200, align: "CENTER" }));
    grid.appendChild(step);
    step.layoutGrow = 1;

  }
  comp.appendChild(grid);
}

// ── Error ──
function buildErrorOrganism(comp, content) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 100; comp.paddingBottom = 100;
  comp.itemSpacing = 16; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C['surface/default'] }];
  comp.appendChild(txt("errorCode", "404", 96, FB, C['placeholder/default'], { align: "CENTER" }));
  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Page not found");
  var tn = txt("title", content.title || "Page not found", 28, FB, C['text/primary'], { align: "CENTER" });
  comp.appendChild(tn); linkText(tn, tk);
  if (content.subtitle) {
    var sk = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle);
    var sn = txt("subtitle", content.subtitle, 16, FR, C['text/secondary'], { w: 500, align: "CENTER" });
    comp.appendChild(sn); linkText(sn, sk);
  }
  var btn = frame("ctaBtn", { dir: "HORIZONTAL", bg: C['surface/inverse'], px: 24, py: 12, r: 8, ca: "CENTER" });
  btn.appendChild(txt("ctaText", content.ctaText || "Go Home", 14, FM, C['text/inverse']));
  comp.appendChild(btn);
}

// ── Store ──
function buildStoreOrganism(comp, content, atoms) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.itemSpacing = 32; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C['surface/default'] }];
  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Products");
  var tn = txt("title", content.title || "Products", 28, FB, C['text/primary'], { align: "CENTER" });
  comp.appendChild(tn); linkText(tn, tk);
  var grid = frame("products", { dir: "HORIZONTAL", g: 24 });
  var products = Array.isArray(content.products) ? content.products : [{ title: 'Product 1', price: '$29' }, { title: 'Product 2', price: '$49' }, { title: 'Product 3', price: '$39' }];
  for (var i = 0; i < products.length; i++) {
    var card = frame("product_" + i, { dir: "VERTICAL", g: 12, stroke: C['border/default'], r: 12 });
    card.resize(280, 100); card.counterAxisSizingMode = "FIXED";
    card.appendChild(rect(280, 180, C['placeholder/default'], 0));
    var info = frame("info", { dir: "VERTICAL", g: 8, px: 16, py: 16 });
    info.appendChild(txt("productTitle_" + i, products[i].title || '', 15, FS, C['text/primary']));
    info.appendChild(txt("productPrice_" + i, products[i].price || '', 16, FB, C['text/primary']));
    card.appendChild(info);
    grid.appendChild(card);
    card.layoutGrow = 1;

  }
  comp.appendChild(grid);
}

// ── Pricing ──
function buildPricingOrganism(comp, content, atoms) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.itemSpacing = 40; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C['surface/default'] }];
  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Simple, transparent pricing");
  var tn = txt("title", content.title || "Simple, transparent pricing", 28, FB, C['text/primary'], { align: "CENTER" });
  comp.appendChild(tn); linkText(tn, tk);
  var sk = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle || "Choose the plan that works best for you.");
  var sn = txt("subtitle", content.subtitle || "Choose the plan that works best for you.", 16, FR, C['text/secondary'], { w: 500, align: "CENTER" });
  comp.appendChild(sn); linkText(sn, sk);
  var grid = frame("plans", { dir: "HORIZONTAL", g: 24 });
  var plans = Array.isArray(content.plans) ? content.plans : [{ name: 'Starter', price: '$9', description: 'For individuals', ctaText: 'Get Started' }, { name: 'Pro', price: '$29', description: 'For teams', ctaText: 'Get Started', highlighted: true }, { name: 'Enterprise', price: '$99', description: 'For orgs', ctaText: 'Contact Sales' }];
  for (var i = 0; i < plans.length; i++) {
    var p = plans[i];
    var hl = p.highlighted;
    var card = frame("plan_" + i, { dir: "VERTICAL", g: 16, px: 32, py: 32, r: 16, bg: hl ? C['surface/inverse'] : C['surface/default'], stroke: hl ? null : C['border/default'] });
    card.resize(320, 100); card.counterAxisSizingMode = "FIXED";
    card.appendChild(txt("planName_" + i, p.name || '', 20, FS, hl ? C['text/inverse'] : C['text/primary']));
    var priceRow = frame("priceRow", { dir: "HORIZONTAL", g: 4, ca: "MAX" });
    priceRow.appendChild(txt("planPrice_" + i, p.price || '', 36, FB, hl ? C['text/inverse'] : C['text/primary']));
    priceRow.appendChild(txt("planPeriod_" + i, p.period || '/mo', 14, FR, hl ? C['text/on-dark'] : C['text/muted']));
    card.appendChild(priceRow);
    card.appendChild(txt("planDesc_" + i, p.description || '', 14, FR, hl ? C['text/on-dark'] : C['text/secondary']));
    // Features list
    var feats = String(p.features || '').split(',');
    for (var j = 0; j < feats.length && j < 4; j++) {
      card.appendChild(txt("planFeat_" + i + "_" + j, "✓  " + feats[j].trim(), 13, FR, hl ? C['text/on-dark'] : C['text/secondary']));
    }
    var btn = findVariant(atoms.Button, hl ? "Secondary" : "Primary").createInstance();
    btn.layoutSizingVertical = "HUG"; btn.layoutSizingHorizontal = "HUG";
    btn.name = "planCta_" + i;
    card.appendChild(btn);
    grid.appendChild(card);
    card.layoutGrow = 1;

  }
  comp.appendChild(grid);
}

// ── Gallery ──
function buildGalleryOrganism(comp, content, atoms) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 64; comp.paddingBottom = 64;
  comp.itemSpacing = 32; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C['surface/default'] }];
  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Our Work");
  var tn = txt("title", content.title || "Our Work", 28, FB, C['text/primary'], { align: "CENTER" });
  comp.appendChild(tn); linkText(tn, tk);
  var grid = frame("images", { dir: "HORIZONTAL", g: 16 });
  grid.layoutWrap = "WRAP";
  var images = Array.isArray(content.images) ? content.images : [{ caption: 'Project 1' }, { caption: 'Project 2' }, { caption: 'Project 3' }];
  for (var i = 0; i < images.length; i++) {
    var item = frame("image_" + i, { dir: "VERTICAL", g: 8 });
    item.appendChild(rect(400, 260, C['placeholder/default'], 12));
    item.appendChild(txt("caption_" + i, images[i].caption || '', 13, FR, C['text/muted']));
    grid.appendChild(item);
    item.layoutGrow = 1;

  }
  comp.appendChild(grid);
}

// ── Comparison ──
function buildComparisonOrganism(comp, content, atoms) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.itemSpacing = 32; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C['surface/default'] }];
  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Compare plans");
  var tn = txt("title", content.title || "Compare plans", 28, FB, C['text/primary'], { align: "CENTER" });
  comp.appendChild(tn); linkText(tn, tk);
  // Table header
  var headerRow = frame("tableHeader", { dir: "HORIZONTAL", g: 0 });
  headerRow.resize(1280, 100); headerRow.counterAxisSizingMode = "FIXED";
  headerRow.appendChild(txt("colFeature", "Feature", 14, FS, C['text/primary'], { w: 320 }));
  headerRow.appendChild(txt("colBasic", "Basic", 14, FS, C['text/primary'], { w: 320, align: "CENTER" }));
  headerRow.appendChild(txt("colPro", "Pro", 14, FS, C['text/primary'], { w: 320, align: "CENTER" }));
  headerRow.appendChild(txt("colEnterprise", "Enterprise", 14, FS, C['text/primary'], { w: 320, align: "CENTER" }));
  comp.appendChild(headerRow);
  // Table rows
  var items = Array.isArray(content.items) ? content.items : [{ feature: 'Feature 1' }, { feature: 'Feature 2' }, { feature: 'Feature 3' }];
  for (var i = 0; i < items.length; i++) {
    var row = frame("row_" + i, { dir: "HORIZONTAL", g: 0, stroke: C['border/default'] });
    row.resize(1280, 100); row.counterAxisSizingMode = "FIXED";
    row.paddingTop = 12; row.paddingBottom = 12;
    row.strokesIncludedInLayout = false;
    row.appendChild(txt("feat_" + i, items[i].feature || 'Feature ' + (i+1), 14, FR, C['text/primary'], { w: 320 }));
    row.appendChild(txt("basic_" + i, "✓", 14, FR, C['text/secondary'], { w: 320, align: "CENTER" }));
    row.appendChild(txt("pro_" + i, "✓", 14, FR, C['text/secondary'], { w: 320, align: "CENTER" }));
    row.appendChild(txt("ent_" + i, "✓", 14, FR, C['text/secondary'], { w: 320, align: "CENTER" }));
    comp.appendChild(row);
  }
}

// ── Showcase ──
function buildShowcaseOrganism(comp, content, atoms) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.itemSpacing = 32;
  comp.fills = [{ type: 'SOLID', color: C['surface/default'] }];
  var headerRow = frame("header", { dir: "HORIZONTAL", g: 16 });
  headerRow.resize(1280, 100); headerRow.counterAxisSizingMode = "FIXED"; headerRow.counterAxisAlignItems = "CENTER";
  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Our Collection");
  var tn = txt("title", content.title || "Our Collection", 28, FB, C['text/primary']);
  tn.layoutGrow = 1;
  headerRow.appendChild(tn); linkText(tn, tk);
  var viewBtn = findVariant(atoms.Button, "Secondary").createInstance();
  viewBtn.layoutSizingVertical = "HUG"; viewBtn.layoutSizingHorizontal = "HUG";
  headerRow.appendChild(viewBtn);
  comp.appendChild(headerRow);
  // Categories
  var cats = frame("categories", { dir: "HORIZONTAL", g: 8 });
  var categories = Array.isArray(content.categories) ? content.categories : [{ label: 'All' }, { label: 'Design' }, { label: 'Development' }];
  for (var i = 0; i < categories.length; i++) {
    var pill = frame("cat_" + i, { dir: "HORIZONTAL", px: 16, py: 6, r: 9999, bg: i === 0 ? C['surface/inverse'] : C['surface/muted'] });
    pill.appendChild(txt("catLabel_" + i, categories[i].label || '', 13, FM, i === 0 ? C['text/inverse'] : C['text/secondary']));
    cats.appendChild(pill);
  }
  comp.appendChild(cats);
  // Items grid
  var grid = frame("items", { dir: "HORIZONTAL", g: 24 });
  var items = Array.isArray(content.items) ? content.items : [{ title: 'Item One', description: 'Description' }, { title: 'Item Two', description: 'Description' }, { title: 'Item Three', description: 'Description' }];
  for (var i = 0; i < items.length; i++) {
    var card = frame("item_" + i, { dir: "VERTICAL", g: 0, stroke: C['border/default'], r: 12 });
    card.resize(380, 100); card.counterAxisSizingMode = "FIXED"; card.clipsContent = true;
    card.appendChild(rect(380, 220, C['placeholder/default'], 0));
    var info = frame("info", { dir: "VERTICAL", g: 4, px: 16, py: 16 });
    info.appendChild(txt("itemTitle_" + i, items[i].title || '', 15, FS, C['text/primary']));
    info.appendChild(txt("itemDesc_" + i, items[i].description || '', 13, FR, C['text/secondary']));
    card.appendChild(info);
    grid.appendChild(card);
    card.layoutGrow = 1;

  }
  comp.appendChild(grid);
}

// ── Downloads ──
function buildDownloadsOrganism(comp, content, atoms) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 80; comp.paddingRight = 80; comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.itemSpacing = 32; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: C['surface/default'] }];
  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Download our app");
  var tn = txt("title", content.title || "Download our app", 28, FB, C['text/primary'], { align: "CENTER" });
  comp.appendChild(tn); linkText(tn, tk);
  var sk = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle || "Available on all platforms.");
  var sn = txt("subtitle", content.subtitle || "Available on all platforms.", 16, FR, C['text/secondary'], { w: 500, align: "CENTER" });
  comp.appendChild(sn); linkText(sn, sk);
  var grid = frame("downloads", { dir: "HORIZONTAL", g: 24 });
  var items = Array.isArray(content.items) ? content.items : [{ title: 'Desktop App', description: 'For Mac and Windows' }, { title: 'Mobile App', description: 'iOS and Android' }, { title: 'Browser Extension', description: 'Chrome and Firefox' }];
  for (var i = 0; i < items.length; i++) {
    var card = frame("download_" + i, { dir: "VERTICAL", g: 12, px: 32, py: 32, stroke: C['border/default'], r: 16, ca: "CENTER" });
    card.resize(320, 100); card.counterAxisSizingMode = "FIXED";
    card.appendChild(rect(64, 64, C['placeholder/default'], 16));
    card.appendChild(txt("dlTitle_" + i, items[i].title || '', 16, FS, C['text/primary'], { align: "CENTER" }));
    card.appendChild(txt("dlDesc_" + i, items[i].description || '', 13, FR, C['text/secondary'], { align: "CENTER" }));
    var btn = findVariant(atoms.Button, "Primary").createInstance();
    btn.layoutSizingVertical = "HUG"; btn.layoutSizingHorizontal = "HUG";
    card.appendChild(btn);
    grid.appendChild(card);
    card.layoutGrow = 1;

  }
  comp.appendChild(grid);
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
  logos: buildLogosOrganism,
  blog: buildBlogOrganism,
  team: buildTeamOrganism,
  about: buildAboutOrganism,
  contact: buildContactOrganism,
  banner: buildBannerOrganism,
  process: buildProcessOrganism,
  error: buildErrorOrganism,
  store: buildStoreOrganism,
  pricing: buildPricingOrganism,
  gallery: buildGalleryOrganism,
  comparison: buildComparisonOrganism,
  showcase: buildShowcaseOrganism,
  downloads: buildDownloadsOrganism,
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

// Default content — used for component definitions
function getDefaultContent(cat) {
  var defaults = {
    header: { logo: 'Logo', links: [{ label: 'Features' }, { label: 'Pricing' }, { label: 'About' }], ctaText: 'Get Started' },
    hero: { title: 'Build something amazing today', subtitle: 'A short description of your product or service that explains the value proposition.', ctaText: 'Get Started', ctaSecondaryText: 'Learn More' },
    logos: { title: 'Trusted by leading companies', logos: [{ name: 'Acme' }, { name: 'Globex' }, { name: 'Initech' }, { name: 'Umbrella' }, { name: 'Stark' }] },
    features: { title: 'Everything you need', subtitle: 'Our platform provides all the tools you need to succeed.', features: [{ title: 'Feature One', description: 'A brief description of this feature.' }, { title: 'Feature Two', description: 'A brief description of this feature.' }, { title: 'Feature Three', description: 'A brief description of this feature.' }] },
    stats: { title: 'Trusted by thousands', stats: [{ value: '10K+', label: 'Active Users' }, { value: '99.9%', label: 'Uptime' }, { value: '150+', label: 'Countries' }] },
    pricing: { title: 'Simple, transparent pricing', subtitle: 'Choose the plan that works best for you.', plans: [{ name: 'Starter', price: '$9', period: '/mo', description: 'For individuals', features: 'Feature 1, Feature 2, Feature 3', ctaText: 'Get Started', highlighted: false }, { name: 'Pro', price: '$29', period: '/mo', description: 'For teams', features: 'Everything in Starter, Feature 4, Feature 5', ctaText: 'Get Started', highlighted: true }, { name: 'Enterprise', price: '$99', period: '/mo', description: 'For organizations', features: 'Everything in Pro, Feature 6, Priority support', ctaText: 'Contact Sales', highlighted: false }] },
    testimonials: { title: 'What our customers say', testimonials: [{ quote: 'This product has completely transformed how we work.', author: 'Jane Cooper', role: 'CEO at TechCorp' }, { quote: 'The best investment we made this year.', author: 'John Smith', role: 'CTO at StartupXYZ' }, { quote: 'Simple, effective, and beautifully designed.', author: 'Sarah Johnson', role: 'Designer at CreativeCo' }] },
    faq: { title: 'Frequently asked questions', subtitle: 'Find answers to common questions.', questions: [{ question: 'How do I get started?', answer: 'Simply sign up for a free account and follow the onboarding guide.' }, { question: 'Is there a free trial?', answer: 'Yes, we offer a 14-day free trial with full access to all features.' }, { question: 'Can I cancel anytime?', answer: 'Absolutely. Cancel your subscription at any time with no penalties.' }] },
    cta: { title: 'Ready to get started?', subtitle: 'Join thousands of satisfied customers today.', ctaText: 'Start Free Trial' },
    blog: { title: 'Latest from the blog', subtitle: 'Insights, tips, and news.', posts: [{ title: 'Getting Started Guide', excerpt: 'Learn how to set up your account.' }, { title: '10 Productivity Tips', excerpt: 'Discover best practices.' }, { title: 'What is New in V2', excerpt: 'Explore the latest features.' }] },
    about: { title: 'About our company', description: 'We are a team of passionate individuals dedicated to building the best products.', mission: 'Our mission is to make technology accessible to everyone.' },
    team: { title: 'Meet our team', subtitle: 'The people behind the product.', members: [{ name: 'Jane Cooper', role: 'CEO' }, { name: 'John Smith', role: 'CTO' }, { name: 'Sarah Johnson', role: 'Design Lead' }, { name: 'Michael Brown', role: 'Engineer' }] },
    contact: { title: 'Get in touch', subtitle: 'We would love to hear from you.', email: 'hello@example.com', phone: '+1 (555) 123-4567' },
    footer: { logo: 'Structr', description: 'Building the future of web design.', copyright: '2024 Structr. All rights reserved.', columns: [{ title: 'Product', links: 'Features, Pricing, Changelog' }, { title: 'Company', links: 'About, Blog, Careers' }, { title: 'Resources', links: 'Docs, Help, API' }] },
    banner: { text: 'We just launched v2.0! Check out the new features.', ctaText: 'Learn More' },
    process: { title: 'How it works', subtitle: 'Get started in a few simple steps.', steps: [{ title: 'Sign Up', description: 'Create your free account.' }, { title: 'Configure', description: 'Set up your workspace.' }, { title: 'Build', description: 'Start creating.' }, { title: 'Launch', description: 'Go live.' }] },
    error: { title: 'Page not found', subtitle: 'Sorry, we could not find the page you are looking for.', ctaText: 'Go Home' },
    store: { title: 'Our Products', subtitle: 'Browse our latest collection.', products: [{ title: 'Product Alpha', price: '$49.99' }, { title: 'Product Beta', price: '$29.99' }, { title: 'Product Gamma', price: '$39.99' }] },
    gallery: { title: 'Our Work', subtitle: 'A showcase of what we have built.' },
    showcase: { title: 'Featured', subtitle: 'Our latest highlights.' },
    comparison: { title: 'Compare plans', subtitle: 'See which plan is right for you.' },
    downloads: { title: 'Download our app', subtitle: 'Available on all platforms.' },
  };
  return defaults[cat] || { title: getCategoryLabel(cat), subtitle: 'Section description.' };
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

    // ════════════════════════════════════════
    // PAGE 1: Components (Ions → Atoms → Molecules → Organisms)
    // ════════════════════════════════════════
    var componentsPage = figma.createPage(); componentsPage.name = "Components";

    // ── Section: Ions ──
    figma.ui.postMessage({ type: 'progress', message: '🔬 Creating design tokens...' });
    var ionsSection = figma.createSection(); ionsSection.name = "🔬 Ions — Design Tokens";
    createIons(ionsSection);
    componentsPage.appendChild(ionsSection);
    ionsSection.x = 0; ionsSection.y = 0;

    // ── Section: Atoms ──
    figma.ui.postMessage({ type: 'progress', message: '⚛️ Building atoms...' });
    var atomsSection = figma.createSection(); atomsSection.name = "⚛️ Atoms — Base Components";
    var atoms = createAtoms(atomsSection);
    componentsPage.appendChild(atomsSection);
    atomsSection.x = 0; atomsSection.y = ionsSection.y + ionsSection.height + 100;

    // ── Section: Molecules ──
    figma.ui.postMessage({ type: 'progress', message: '🧬 Building molecules...' });
    var moleculesSection = figma.createSection(); moleculesSection.name = "🧬 Molecules — Compound Components";
    var molecules = createMolecules(moleculesSection, atoms);
    componentsPage.appendChild(moleculesSection);
    moleculesSection.x = 0; moleculesSection.y = atomsSection.y + atomsSection.height + 100;

    // ── Section: Organisms ──
    figma.ui.postMessage({ type: 'progress', message: '🏗️ Building organisms...' });
    var organismsSection = figma.createSection(); organismsSection.name = "🏗️ Organisms — Section Components";
    var compSets = {};
    var cy = 60;

    for (var cat in used) {
      var comps = [];
      var catComps = {};
      var vids = Object.keys(used[cat]);

      for (var v = 0; v < vids.length; v++) {
        var vid = vids[v];
        var comp = figma.createComponent();
        comp.name = "Variant=" + getVariantName(vid);
        buildOrganism(comp, cat, vid, getDefaultContent(cat), atoms, molecules);
        organismsSection.appendChild(comp);
        comp.x = 0; comp.y = cy;
        cy += (comp.height > 100 ? comp.height : 200) + 40;
        comps.push(comp);
        catComps[vid] = comp;
      }

      if (comps.length > 1) {
        var set = figma.combineAsVariants(comps, organismsSection);
        set.name = getCategoryLabel(cat);
        set.x = 0; set.y = cy - comps.length * 200;
        cy = set.y + set.height + 80;
      } else if (comps.length === 1) {
        comps[0].name = getCategoryLabel(cat);
      }
      compSets[cat] = catComps;
      cy += 40;
    }

    componentsPage.appendChild(organismsSection);
    organismsSection.x = 0; organismsSection.y = moleculesSection.y + moleculesSection.height + 100;

    // ════════════════════════════════════════
    // PAGE 2: Pages (template instances with sections per page)
    // ════════════════════════════════════════
    var pagesPage = figma.createPage(); pagesPage.name = "Pages";
    var total = 0;
    var pageSectionY = 0;

    for (var p = 0; p < project.pages.length; p++) {
      var pd = project.pages[p];
      var secs = pd.sections || [];
      figma.ui.postMessage({ type: 'progress', message: '📄 Building "' + pd.name + '" (' + secs.length + ' sections)...' });

      // Create a Figma section for each page
      var pageSection = figma.createSection();
      pageSection.name = "📄 " + (pd.name || "Page " + (p + 1));

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

      pageSection.appendChild(pf);
      pagesPage.appendChild(pageSection);
      pageSection.x = 0; pageSection.y = pageSectionY;
      pageSectionY += pf.height + 200;
    }

    figma.currentPage = pagesPage;
    var firstSection = pagesPage.children[0];
    if (firstSection) figma.viewport.scrollAndZoomIntoView([firstSection]);

    figma.ui.postMessage({ type: 'done', sectionCount: total, pageCount: project.pages.length });
  } catch(e) {
    figma.ui.postMessage({ type: 'error', message: String(e) });
  }
};
