// Structr Figma Plugin — Pixel-Perfect Atomic Design System Import
// Ions → Atoms → Molecules → Organisms → Templates
// All colors bound to Figma Variables with Light/Dark modes
figma.showUI(__html__, { width: 380, height: 480 });

// ══════════════════════════════════════════════════════════════
// DESIGN TOKENS — Exact Tailwind CSS values
// ══════════════════════════════════════════════════════════════

// Primitive colors — exact Tailwind gray palette (0-1 RGB)
var PRIMITIVES = {
  'white':    { r: 1, g: 1, b: 1 },
  'gray-50':  { r: 0.976, g: 0.980, b: 0.984 },
  'gray-100': { r: 0.953, g: 0.957, b: 0.965 },
  'gray-200': { r: 0.898, g: 0.906, b: 0.922 },
  'gray-300': { r: 0.820, g: 0.835, b: 0.859 },
  'gray-400': { r: 0.612, g: 0.639, b: 0.686 },
  'gray-500': { r: 0.420, g: 0.447, b: 0.502 },
  'gray-600': { r: 0.294, g: 0.333, b: 0.388 },
  'gray-700': { r: 0.216, g: 0.255, b: 0.318 },
  'gray-800': { r: 0.122, g: 0.161, b: 0.216 },
  'gray-900': { r: 0.067, g: 0.094, b: 0.153 },
};

// Semantic tokens — mirrors src/lib/colors.ts getColors() exactly
var SEMANTIC = {
  'bg':            { light: 'white',    dark: 'gray-900' },
  'bgAlt':         { light: 'gray-50',  dark: 'gray-800' },
  'bgMuted':       { light: 'gray-100', dark: 'gray-700' },
  'bgCard':        { light: 'white',    dark: 'gray-800' },
  'bgCardAlt':     { light: 'gray-50',  dark: 'gray-700' },
  'bgPlaceholder': { light: 'gray-200', dark: 'gray-700' },
  'bgAvatar':      { light: 'gray-300', dark: 'gray-600' },
  'text':          { light: 'gray-900', dark: 'white' },
  'textSecondary': { light: 'gray-600', dark: 'gray-300' },
  'textMuted':     { light: 'gray-500', dark: 'gray-400' },
  'textLight':     { light: 'gray-500', dark: 'gray-500' },
  'btnPrimaryBg':  { light: 'gray-900', dark: 'white' },
  'btnPrimaryTxt': { light: 'white',    dark: 'gray-900' },
  'btnSecBorder':  { light: 'gray-300', dark: 'gray-600' },
  'btnSecText':    { light: 'gray-700', dark: 'gray-300' },
  'border':        { light: 'gray-200', dark: 'gray-700' },
  'borderLight':   { light: 'gray-100', dark: 'gray-800' },
  'hlBg':          { light: 'gray-900', dark: 'white' },
  'hlText':        { light: 'white',    dark: 'gray-900' },
  'hlTextSec':     { light: 'gray-300', dark: 'gray-500' },
  'hlBtnBg':       { light: 'white',    dark: 'gray-900' },
  'hlBtnText':     { light: 'gray-900', dark: 'white' },
};

// Typography — exact Tailwind type scale {fontSize, lineHeight}
var FONT_SIZE = {
  'xs':  { s: 12, lh: 16 },
  'sm':  { s: 14, lh: 20 },
  'base':{ s: 16, lh: 24 },
  'lg':  { s: 18, lh: 28 },
  'xl':  { s: 20, lh: 28 },
  '2xl': { s: 24, lh: 32 },
  '3xl': { s: 30, lh: 36 },
  '4xl': { s: 36, lh: 40 },
  '5xl': { s: 48, lh: 48 },
};

// Tailwind max-width values in pixels
var MAX_W = {
  '2xl': 672,
  '3xl': 768,
  '4xl': 896,
  '5xl': 1024,
  '6xl': 1152,
  '7xl': 1280,
};

// Canvas width
var W = 1440;

// Font references
var FR = { family: "Inter", style: "Regular" };
var FM = { family: "Inter", style: "Medium" };
var FS = { family: "Inter", style: "Semi Bold" };
var FB = { family: "Inter", style: "Bold" };

async function loadFonts() {
  await figma.loadFontAsync(FR);
  await figma.loadFontAsync(FM);
  await figma.loadFontAsync(FS);
  await figma.loadFontAsync(FB);
}

// ── Resolve semantic color to RGB ──
function sc(token, mode) {
  mode = mode || 'light';
  var s = SEMANTIC[token];
  if (!s) return PRIMITIVES['gray-500'];
  return PRIMITIVES[s[mode]] || PRIMITIVES['gray-500'];
}

// ══════════════════════════════════════════════════════════════
// FIGMA VARIABLES — Primitives + Semantic with Light/Dark modes
// ══════════════════════════════════════════════════════════════

var primVars = {};
var semVars = {};
var semCol = null;
var lightModeId = null;
var darkModeId = null;

function createVariableCollections() {
  try {
    // Primitives collection — single mode, raw color values
    var primCol = figma.variables.createVariableCollection("Primitives");
    for (var name in PRIMITIVES) {
      var v = figma.variables.createVariable(name, primCol, "COLOR");
      v.setValueForMode(primCol.modes[0].modeId, PRIMITIVES[name]);
      primVars[name] = v;
    }

    // Semantic collection — two modes (Light/Dark), aliases to primitives
    semCol = figma.variables.createVariableCollection("Semantic Colors");
    lightModeId = semCol.modes[0].modeId;
    semCol.renameMode(lightModeId, "Light");
    darkModeId = semCol.addMode("Dark");

    for (var token in SEMANTIC) {
      var v = figma.variables.createVariable(token, semCol, "COLOR");
      var lightPrim = primVars[SEMANTIC[token].light];
      var darkPrim = primVars[SEMANTIC[token].dark];
      if (lightPrim) v.setValueForMode(lightModeId, figma.variables.createVariableAlias(lightPrim));
      if (darkPrim) v.setValueForMode(darkModeId, figma.variables.createVariableAlias(darkPrim));
      semVars[token] = v;
    }
  } catch (e) {
    console.log("Variables creation error:", e.message);
  }
}

// ══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════

// Bind a semantic variable to a node's fill color
function bindFill(node, semToken) {
  if (!semVars[semToken]) return;
  try {
    var fills = JSON.parse(JSON.stringify(node.fills));
    if (!fills.length) fills = [{ type: 'SOLID', color: sc(semToken) }];
    fills[0] = figma.variables.setBoundVariableForPaint(fills[0], 'color', semVars[semToken]);
    node.fills = fills;
  } catch (e) { console.log('bindFill error:', e.message); }
}

// Bind a semantic variable to a node's stroke color
function bindStroke(node, semToken) {
  if (!semVars[semToken]) return;
  try {
    var strokes = JSON.parse(JSON.stringify(node.strokes));
    if (!strokes.length) strokes = [{ type: 'SOLID', color: sc(semToken) }];
    strokes[0] = figma.variables.setBoundVariableForPaint(strokes[0], 'color', semVars[semToken]);
    node.strokes = strokes;
  } catch (e) { console.log('bindStroke error:', e.message); }
}

// Create text node with Tailwind size key and semantic color binding
function txt(name, text, twSize, font, semToken, opts) {
  opts = opts || {};
  var fs = FONT_SIZE[twSize] || FONT_SIZE['base'];
  var t = figma.createText();
  t.name = name;
  t.characters = String(text || ' ');
  t.fontSize = fs.s;
  t.fontName = font;
  t.lineHeight = { value: fs.lh, unit: 'PIXELS' };
  // Set initial fill color, then bind to variable
  t.fills = [{ type: 'SOLID', color: sc(semToken) }];
  bindFill(t, semToken);
  if (opts.w) { t.resize(opts.w, t.height); t.textAutoResize = "HEIGHT"; }
  if (opts.align) t.textAlignHorizontal = opts.align;
  return t;
}

// Create rectangle with semantic fill binding
function rect(w, h, semToken, r) {
  var rc = figma.createRectangle();
  rc.resize(w, h);
  rc.fills = [{ type: 'SOLID', color: sc(semToken) }];
  bindFill(rc, semToken);
  if (r) rc.cornerRadius = r;
  return rc;
}

// Create auto-layout frame
function frame(name, opts) {
  opts = opts || {};
  var f = figma.createFrame();
  f.name = name;
  var dir = opts.dir || "VERTICAL";
  f.layoutMode = dir;
  if (opts.w) {
    f.resize(opts.w, opts.h || 100);
    if (dir === "HORIZONTAL") {
      // For HORIZONTAL: width = primary axis, height = counter axis
      f.primaryAxisSizingMode = opts.fh ? "FIXED" : "FIXED"; // width is fixed
      f.counterAxisSizingMode = "AUTO"; // height hugs content
    } else {
      // For VERTICAL: width = counter axis, height = primary axis
      f.counterAxisSizingMode = "FIXED"; // width is fixed
      f.primaryAxisSizingMode = opts.fh ? "FIXED" : "AUTO"; // height auto
    }
  } else {
    f.primaryAxisSizingMode = opts.fh ? "FIXED" : "AUTO";
    f.counterAxisSizingMode = opts.fw ? "FIXED" : "AUTO";
  }

  // Background fill with variable binding
  if (opts.bg) {
    f.fills = [{ type: 'SOLID', color: sc(opts.bg) }];
    bindFill(f, opts.bg);
  } else {
    f.fills = [];
  }

  // Individual padding
  if (opts.pt !== undefined) f.paddingTop = opts.pt;
  if (opts.pb !== undefined) f.paddingBottom = opts.pb;
  if (opts.pl !== undefined) f.paddingLeft = opts.pl;
  if (opts.pr !== undefined) f.paddingRight = opts.pr;
  // Shorthand padding
  if (opts.px !== undefined) { f.paddingLeft = opts.px; f.paddingRight = opts.px; }
  if (opts.py !== undefined) { f.paddingTop = opts.py; f.paddingBottom = opts.py; }
  if (opts.p !== undefined) { f.paddingTop = opts.p; f.paddingRight = opts.p; f.paddingBottom = opts.p; f.paddingLeft = opts.p; }

  if (opts.g !== undefined) f.itemSpacing = opts.g;
  if (opts.ca) f.counterAxisAlignItems = opts.ca;
  if (opts.ma) f.primaryAxisAlignItems = opts.ma;
  if (opts.r) f.cornerRadius = opts.r;
  if (opts.wrap) f.layoutWrap = "WRAP";

  if (opts.stroke) {
    f.strokes = [{ type: 'SOLID', color: sc(opts.stroke) }];
    bindStroke(f, opts.stroke);
    f.strokeWeight = 1;
    f.strokeAlign = "INSIDE";
  }

  if (opts.clip) f.clipsContent = true;
  return f;
}

// Create the standard outer-section + inner-container structure
function sectionFrame(name, opts) {
  opts = opts || {};
  var bg = opts.bg || 'bg';
  var outer = frame(name, {
    dir: "VERTICAL", w: W, bg: bg,
    pt: opts.py || 80, pb: opts.py || 80,
    pl: opts.px || 32, pr: opts.px || 32,
    ca: "CENTER"
  });
  var maxW = opts.maxW || MAX_W['7xl'];
  var inner = frame(name + "_content", {
    dir: opts.dir || "VERTICAL",
    w: maxW,
    g: opts.g !== undefined ? opts.g : 0,
    ca: opts.ca,
    ma: opts.ma,
  });

  outer.appendChild(inner);
  return { outer: outer, inner: inner };
}

// Set a frame to have fixed width, auto height (regardless of layout direction)
function setFixedW(node, w) {
  node.resize(w, node.height || 100);
  if (node.layoutMode === "HORIZONTAL") {
    node.primaryAxisSizingMode = "FIXED";
    node.counterAxisSizingMode = "AUTO";
  } else {
    node.counterAxisSizingMode = "FIXED";
    node.primaryAxisSizingMode = "AUTO";
  }
}

function hug(node) {
  try { node.layoutSizingVertical = "HUG"; node.layoutSizingHorizontal = "HUG"; } catch (e) {}
}
function fillH(node) {
  try { node.layoutSizingHorizontal = "FILL"; } catch (e) {}
}
function fillV(node) {
  try { node.layoutSizingVertical = "FILL"; } catch (e) {}
}

function linkText(node, key) {
  try {
    var refs = node.componentPropertyReferences || {};
    refs.characters = key;
    node.componentPropertyReferences = refs;
  } catch (e) {}
}
function linkVis(node, key) {
  try {
    var refs = node.componentPropertyReferences || {};
    refs.visible = key;
    node.componentPropertyReferences = refs;
  } catch (e) {}
}

function resizeSection(section, padding) {
  padding = padding || 60;
  var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (var i = 0; i < section.children.length; i++) {
    var c = section.children[i];
    if (c.x < minX) minX = c.x;
    if (c.y < minY) minY = c.y;
    if (c.x + c.width > maxX) maxX = c.x + c.width;
    if (c.y + c.height > maxY) maxY = c.y + c.height;
  }
  if (minX === Infinity) return;
  var dx = padding - minX;
  var dy = padding - minY;
  for (var i = 0; i < section.children.length; i++) {
    section.children[i].x += dx;
    section.children[i].y += dy;
  }
  section.resizeWithoutConstraints(maxX - minX + padding * 2, maxY - minY + padding * 2);
}

function makeObj(k, v) { var o = {}; o[k] = v; return o; }

// ══════════════════════════════════════════════════════════════
// IONS — Design Token Reference Page
// ══════════════════════════════════════════════════════════════

function createIons(page) {
  page.appendChild(txt("_label", "🔬 Ions — Design Tokens", '2xl', FB, 'text'));

  var tokenFrame = frame("Token Reference", { dir: "VERTICAL", w: 900, g: 32, p: 40, bg: 'bg' });

  // Color swatches
  var colorRow = frame("Colors", { dir: "HORIZONTAL", g: 12, wrap: true });
  for (var name in PRIMITIVES) {
    var swatch = frame(name, { dir: "VERTICAL", g: 4, ca: "CENTER" });
    var r = figma.createRectangle();
    r.resize(48, 48); r.fills = [{ type: 'SOLID', color: PRIMITIVES[name] }]; r.cornerRadius = 8;
    swatch.appendChild(r);
    swatch.appendChild(txt("name", name, 'xs', FR, 'textMuted'));
    colorRow.appendChild(swatch);
  }
  tokenFrame.appendChild(colorRow);

  // Typography scale
  var typeCol = frame("Typography", { dir: "VERTICAL", g: 8 });
  for (var size in FONT_SIZE) {
    typeCol.appendChild(txt("type_" + size, size + " — " + FONT_SIZE[size].s + "px/" + FONT_SIZE[size].lh + "px", size === 'xs' ? 'sm' : size, FR, 'text'));
  }
  tokenFrame.appendChild(typeCol);

  page.appendChild(tokenFrame);
  tokenFrame.x = 0; tokenFrame.y = 60;
}

// ══════════════════════════════════════════════════════════════
// ATOMS — Base Components (variable-bound)
// ══════════════════════════════════════════════════════════════

function createAtoms(page) {
  var atoms = {};

  page.appendChild(txt("_label", "⚛️ Atoms — Base Components", '2xl', FB, 'text'));

  // ── Button Primary ── (rounded-lg px-6 py-3 text-sm font-medium)
  var btnPrimary = figma.createComponent();
  btnPrimary.name = "Style=Primary";
  btnPrimary.layoutMode = "HORIZONTAL";
  btnPrimary.primaryAxisSizingMode = "AUTO";
  btnPrimary.counterAxisSizingMode = "AUTO";
  btnPrimary.paddingLeft = 24; btnPrimary.paddingRight = 24;
  btnPrimary.paddingTop = 12; btnPrimary.paddingBottom = 12;
  btnPrimary.cornerRadius = 8;
  btnPrimary.counterAxisAlignItems = "CENTER";
  btnPrimary.primaryAxisAlignItems = "CENTER";
  btnPrimary.fills = [{ type: 'SOLID', color: sc('btnPrimaryBg') }];
  bindFill(btnPrimary, 'btnPrimaryBg');
  var pk = btnPrimary.addComponentProperty("Label", "TEXT", "Get Started");
  var pLabel = txt("label", "Get Started", 'sm', FM, 'btnPrimaryTxt');
  btnPrimary.appendChild(pLabel);
  linkText(pLabel, pk);

  // ── Button Secondary ── (border rounded-lg px-6 py-3 text-sm font-medium)
  var btnSecondary = figma.createComponent();
  btnSecondary.name = "Style=Secondary";
  btnSecondary.layoutMode = "HORIZONTAL";
  btnSecondary.primaryAxisSizingMode = "AUTO";
  btnSecondary.counterAxisSizingMode = "AUTO";
  btnSecondary.paddingLeft = 24; btnSecondary.paddingRight = 24;
  btnSecondary.paddingTop = 12; btnSecondary.paddingBottom = 12;
  btnSecondary.cornerRadius = 8;
  btnSecondary.counterAxisAlignItems = "CENTER";
  btnSecondary.primaryAxisAlignItems = "CENTER";
  btnSecondary.fills = [];
  btnSecondary.strokes = [{ type: 'SOLID', color: sc('btnSecBorder') }];
  bindStroke(btnSecondary, 'btnSecBorder');
  btnSecondary.strokeWeight = 1; btnSecondary.strokeAlign = "INSIDE";
  var sk = btnSecondary.addComponentProperty("Label", "TEXT", "Learn More");
  var sLabel = txt("label", "Learn More", 'sm', FM, 'btnSecText');
  btnSecondary.appendChild(sLabel);
  linkText(sLabel, sk);

  // ── Button Tertiary (link) ──
  var btnTertiary = figma.createComponent();
  btnTertiary.name = "Style=Tertiary";
  btnTertiary.layoutMode = "HORIZONTAL";
  btnTertiary.primaryAxisSizingMode = "AUTO";
  btnTertiary.counterAxisSizingMode = "AUTO";
  btnTertiary.paddingLeft = 4; btnTertiary.paddingRight = 4;
  btnTertiary.paddingTop = 12; btnTertiary.paddingBottom = 12;
  btnTertiary.counterAxisAlignItems = "CENTER";
  btnTertiary.fills = [];
  var tk = btnTertiary.addComponentProperty("Label", "TEXT", "Learn more");
  var tLabel = txt("label", "Learn more", 'sm', FM, 'textSecondary');
  btnTertiary.appendChild(tLabel);
  linkText(tLabel, tk);

  // Combine buttons into variant set
  page.appendChild(btnPrimary); page.appendChild(btnSecondary); page.appendChild(btnTertiary);
  var btnSet = figma.combineAsVariants([btnPrimary, btnSecondary, btnTertiary], page);
  btnSet.name = "Button";
  btnSet.layoutMode = "HORIZONTAL"; btnSet.itemSpacing = 24;
  btnSet.paddingLeft = 24; btnSet.paddingRight = 24; btnSet.paddingTop = 24; btnSet.paddingBottom = 24;
  btnSet.primaryAxisSizingMode = "AUTO"; btnSet.counterAxisSizingMode = "AUTO";
  btnSet.x = 0; btnSet.y = 60;
  atoms.Button = btnSet;

  // ── Avatar ── (w-10 h-10 rounded-full)
  var avatar = figma.createComponent();
  avatar.name = "Avatar";
  avatar.layoutMode = "HORIZONTAL";
  avatar.primaryAxisSizingMode = "AUTO";
  avatar.counterAxisSizingMode = "AUTO";
  avatar.counterAxisAlignItems = "CENTER";
  avatar.primaryAxisAlignItems = "CENTER";
  var avCircle = figma.createEllipse();
  avCircle.resize(40, 40);
  avCircle.fills = [{ type: 'SOLID', color: sc('bgPlaceholder') }];
  bindFill(avCircle, 'bgPlaceholder');
  avCircle.name = "circle";
  avatar.appendChild(avCircle);
  page.appendChild(avatar); avatar.x = 300; avatar.y = 60;
  atoms.Avatar = avatar;

  // ── Image Placeholder ── (rounded-2xl = 16px, fill bound to bgPlaceholder)
  var imgPlaceholder = figma.createComponent();
  imgPlaceholder.name = "Image Placeholder";
  imgPlaceholder.resize(400, 240);
  imgPlaceholder.cornerRadius = 16;
  imgPlaceholder.fills = [{ type: 'SOLID', color: sc('bgPlaceholder') }];
  bindFill(imgPlaceholder, 'bgPlaceholder');
  page.appendChild(imgPlaceholder); imgPlaceholder.x = 400; imgPlaceholder.y = 60;
  atoms.ImagePlaceholder = imgPlaceholder;

  // ── Icon Placeholder ── (w-10 h-10 rounded-lg = 8px)
  var iconPlaceholder = figma.createComponent();
  iconPlaceholder.name = "Icon Placeholder";
  iconPlaceholder.resize(40, 40);
  iconPlaceholder.cornerRadius = 8;
  iconPlaceholder.fills = [{ type: 'SOLID', color: sc('bgPlaceholder') }];
  bindFill(iconPlaceholder, 'bgPlaceholder');
  page.appendChild(iconPlaceholder); iconPlaceholder.x = 850; iconPlaceholder.y = 60;
  atoms.IconPlaceholder = iconPlaceholder;

  // ── Badge ── (px-2 py-1 text-xs font-medium rounded)
  var badge = figma.createComponent();
  badge.name = "Badge";
  badge.layoutMode = "HORIZONTAL";
  badge.primaryAxisSizingMode = "AUTO";
  badge.counterAxisSizingMode = "AUTO";
  badge.paddingLeft = 8; badge.paddingRight = 8;
  badge.paddingTop = 4; badge.paddingBottom = 4;
  badge.cornerRadius = 4;
  badge.fills = [{ type: 'SOLID', color: sc('bgMuted') }];
  bindFill(badge, 'bgMuted');
  var bk = badge.addComponentProperty("Label", "TEXT", "Badge");
  var bLabel = txt("label", "Badge", 'xs', FM, 'textSecondary');
  badge.appendChild(bLabel); linkText(bLabel, bk);
  page.appendChild(badge); badge.x = 930; badge.y = 60;
  atoms.Badge = badge;

  // ── Small Button ── (text-sm px-4 py-2 rounded-lg — used in headers)
  var btnSmall = figma.createComponent();
  btnSmall.name = "Button Small";
  btnSmall.layoutMode = "HORIZONTAL";
  btnSmall.primaryAxisSizingMode = "AUTO";
  btnSmall.counterAxisSizingMode = "AUTO";
  btnSmall.paddingLeft = 16; btnSmall.paddingRight = 16;
  btnSmall.paddingTop = 8; btnSmall.paddingBottom = 8;
  btnSmall.cornerRadius = 8;
  btnSmall.fills = [{ type: 'SOLID', color: sc('btnPrimaryBg') }];
  bindFill(btnSmall, 'btnPrimaryBg');
  var bsk = btnSmall.addComponentProperty("Label", "TEXT", "Get Started");
  var bsLabel = txt("label", "Get Started", 'sm', FM, 'btnPrimaryTxt');
  btnSmall.appendChild(bsLabel); linkText(bsLabel, bsk);
  page.appendChild(btnSmall); btnSmall.x = 1020; btnSmall.y = 60;
  atoms.ButtonSmall = btnSmall;

  // ── Input Field ── (border rounded-lg px-4 py-3)
  var inputField = figma.createComponent();
  inputField.name = "Input Field";
  inputField.layoutMode = "HORIZONTAL";
  inputField.primaryAxisSizingMode = "AUTO";
  inputField.counterAxisSizingMode = "AUTO";
  inputField.paddingLeft = 16; inputField.paddingRight = 16;
  inputField.paddingTop = 12; inputField.paddingBottom = 12;
  inputField.cornerRadius = 8;
  inputField.fills = [{ type: 'SOLID', color: sc('bg') }];
  bindFill(inputField, 'bg');
  inputField.strokes = [{ type: 'SOLID', color: sc('border') }];
  bindStroke(inputField, 'border');
  inputField.strokeWeight = 1; inputField.strokeAlign = "INSIDE";
  var ifk = inputField.addComponentProperty("Placeholder", "TEXT", "Enter text...");
  var ifLabel = txt("placeholder", "Enter text...", 'sm', FR, 'textMuted');
  inputField.appendChild(ifLabel); linkText(ifLabel, ifk);
  page.appendChild(inputField); inputField.x = 1150; inputField.y = 60;
  atoms.InputField = inputField;

  return atoms;
}

// ══════════════════════════════════════════════════════════════
// MOLECULES — Compound Components
// ══════════════════════════════════════════════════════════════

function createMolecules(page, atoms) {
  var molecules = {};
  page.appendChild(txt("_label", "🧬 Molecules — Compound Components", '2xl', FB, 'text'));

  // ── Feature Card ── (from FeaturesGrid: bgAlt rounded-xl p-8)
  var featureCard = figma.createComponent();
  featureCard.name = "Feature Card";
  featureCard.layoutMode = "VERTICAL";
  featureCard.resize(380, 100); featureCard.counterAxisSizingMode = "FIXED";
  featureCard.primaryAxisSizingMode = "AUTO";
  featureCard.paddingLeft = 32; featureCard.paddingRight = 32;
  featureCard.paddingTop = 32; featureCard.paddingBottom = 32;
  featureCard.itemSpacing = 0; featureCard.cornerRadius = 12;
  featureCard.fills = [{ type: 'SOLID', color: sc('bgAlt') }];
  bindFill(featureCard, 'bgAlt');

  var fcIcon = atoms.IconPlaceholder.createInstance(); fcIcon.name = "icon";
  featureCard.appendChild(fcIcon); hug(fcIcon);

  // Title section with mt-5=20px gap from icon
  var fcTextBlock = frame("textBlock", { dir: "VERTICAL", g: 8, pt: 20 });
  var fcTk = featureCard.addComponentProperty("Title", "TEXT", "Feature Title");
  var fcTitle = txt("title", "Feature Title", 'lg', FS, 'text');
  fcTextBlock.appendChild(fcTitle); linkText(fcTitle, fcTk);
  var fcDk = featureCard.addComponentProperty("Description", "TEXT", "A brief description of this feature.");
  var fcDesc = txt("description", "A brief description of this feature.", 'sm', FR, 'textSecondary');
  fcTextBlock.appendChild(fcDesc); linkText(fcDesc, fcDk); fillH(fcDesc);
  featureCard.appendChild(fcTextBlock); fillH(fcTextBlock);
  page.appendChild(featureCard); featureCard.x = 0; featureCard.y = 60;
  molecules.FeatureCard = featureCard;

  // ── Testimonial Card ── (bg rounded-2xl p-8 border)
  var testCard = figma.createComponent();
  testCard.name = "Testimonial Card";
  testCard.layoutMode = "VERTICAL";
  testCard.resize(380, 100); testCard.counterAxisSizingMode = "FIXED";
  testCard.primaryAxisSizingMode = "AUTO";
  testCard.paddingLeft = 32; testCard.paddingRight = 32;
  testCard.paddingTop = 32; testCard.paddingBottom = 32;
  testCard.itemSpacing = 24; testCard.cornerRadius = 16;
  testCard.fills = [{ type: 'SOLID', color: sc('bg') }];
  bindFill(testCard, 'bg');
  testCard.strokes = [{ type: 'SOLID', color: sc('border') }];
  bindStroke(testCard, 'border');
  testCard.strokeWeight = 1; testCard.strokeAlign = "INSIDE";

  var tcQk = testCard.addComponentProperty("Quote", "TEXT", "This product has completely transformed how we work.");
  var tcQuote = txt("quote", "\u201CThis product has completely transformed how we work.\u201D", 'base', FR, 'textSecondary');
  testCard.appendChild(tcQuote); linkText(tcQuote, tcQk); fillH(tcQuote);

  var tcAuth = frame("author", { dir: "HORIZONTAL", g: 12, ca: "CENTER" });
  var tcAvatar = atoms.Avatar.createInstance(); tcAvatar.name = "avatar";
  tcAuth.appendChild(tcAvatar); hug(tcAvatar);
  var tcInfo = frame("info", { dir: "VERTICAL", g: 2 });
  var tcNk = testCard.addComponentProperty("Author", "TEXT", "Jane Cooper");
  var tcName = txt("author", "Jane Cooper", 'sm', FS, 'text');
  tcInfo.appendChild(tcName);
  var tcRk = testCard.addComponentProperty("Role", "TEXT", "CEO at TechCorp");
  var tcRole = txt("role", "CEO at TechCorp", 'sm', FR, 'textMuted');
  tcInfo.appendChild(tcRole);
  tcAuth.appendChild(tcInfo);
  testCard.appendChild(tcAuth);
  linkText(tcName, tcNk); linkText(tcRole, tcRk);
  page.appendChild(testCard); testCard.x = 420; testCard.y = 60;
  molecules.TestimonialCard = testCard;

  // ── Stat Item ── (text-center)
  var statItem = figma.createComponent();
  statItem.name = "Stat Item";
  statItem.layoutMode = "VERTICAL";
  statItem.itemSpacing = 8; statItem.counterAxisAlignItems = "CENTER";
  statItem.primaryAxisSizingMode = "AUTO"; statItem.counterAxisSizingMode = "AUTO";
  var siVk = statItem.addComponentProperty("Value", "TEXT", "10K+");
  var siValue = txt("value", "10K+", '4xl', FB, 'text', { align: "CENTER" });
  statItem.appendChild(siValue); linkText(siValue, siVk);
  var siLk = statItem.addComponentProperty("Label", "TEXT", "Active Users");
  var siLabel = txt("label", "Active Users", 'sm', FR, 'textSecondary', { align: "CENTER" });
  statItem.appendChild(siLabel); linkText(siLabel, siLk);
  page.appendChild(statItem); statItem.x = 840; statItem.y = 60;
  molecules.StatItem = statItem;

  // ── Nav Link ── (text-sm textSecondary)
  var navLink = figma.createComponent();
  navLink.name = "Nav Link";
  navLink.layoutMode = "HORIZONTAL";
  navLink.primaryAxisSizingMode = "AUTO"; navLink.counterAxisSizingMode = "AUTO";
  navLink.counterAxisAlignItems = "CENTER";
  var nlk = navLink.addComponentProperty("Label", "TEXT", "Link");
  var nlLabel = txt("label", "Link", 'sm', FR, 'textSecondary');
  navLink.appendChild(nlLabel); linkText(nlLabel, nlk);
  page.appendChild(navLink); navLink.x = 960; navLink.y = 60;
  molecules.NavLink = navLink;

  // ── FAQ Item ── (py-6, question text-lg font-semibold, answer textSecondary)
  var faqItem = figma.createComponent();
  faqItem.name = "FAQ Item";
  faqItem.layoutMode = "VERTICAL";
  faqItem.primaryAxisSizingMode = "AUTO";
  faqItem.paddingTop = 24; faqItem.paddingBottom = 24;
  faqItem.itemSpacing = 8;
  var fqQk = faqItem.addComponentProperty("Question", "TEXT", "How does it work?");
  var fqQ = txt("question", "How does it work?", 'lg', FS, 'text');
  faqItem.appendChild(fqQ); linkText(fqQ, fqQk); fillH(fqQ);
  var fqAk = faqItem.addComponentProperty("Answer", "TEXT", "It works like magic.");
  var fqA = txt("answer", "It works like magic.", 'base', FR, 'textSecondary');
  faqItem.appendChild(fqA); linkText(fqA, fqAk); fillH(fqA);
  page.appendChild(faqItem); faqItem.x = 1060; faqItem.y = 60;
  molecules.FaqItem = faqItem;

  return molecules;
}

// ══════════════════════════════════════════════════════════════
// ORGANISM BUILDERS — Pixel-perfect variant-specific
// ══════════════════════════════════════════════════════════════

function findVariant(set, styleName) {
  if (set.type === "COMPONENT") return set;
  var children = set.children || [];
  for (var i = 0; i < children.length; i++) {
    if (children[i].name && children[i].name.indexOf(styleName) >= 0) return children[i];
  }
  return children[0] || set;
}

// ── HEADER BUILDERS ──

function buildHeaderSimple(comp, content, atoms, molecules) {
  // header: bg py-4 px-8 → max-w-7xl flex items-center justify-between
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 32; comp.paddingRight = 32;
  comp.paddingTop = 16; comp.paddingBottom = 16;
  comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: sc('bg') }]; bindFill(comp, 'bg');

  var inner = frame("content", { dir: "HORIZONTAL", w: MAX_W['7xl'], ca: "CENTER", ma: "SPACE_BETWEEN" });


  // Logo
  var lk = comp.addComponentProperty("Logo", "TEXT", content.logo || "Logo");
  var ln = txt("logo", content.logo || "Logo", 'xl', FB, 'text');
  inner.appendChild(ln); linkText(ln, lk);

  // Nav links
  var nav = frame("nav", { dir: "HORIZONTAL", g: 32, ca: "CENTER" });
  var links = Array.isArray(content.links) ? content.links : [];
  for (var i = 0; i < links.length; i++) {
    var link = molecules.NavLink.createInstance(); link.name = "link_" + i;
    try { var props = link.componentProperties; for (var k in props) { if (k.indexOf("Label") === 0) link.setProperties(makeObj(k, links[i].label || '')); } } catch (e) {}
    nav.appendChild(link);
  }
  inner.appendChild(nav);

  // CTA button
  var ctaBtn = atoms.ButtonSmall.createInstance(); ctaBtn.name = "cta";
  try { var props = ctaBtn.componentProperties; for (var k in props) { if (k.indexOf("Label") === 0) ctaBtn.setProperties(makeObj(k, content.ctaText || "Get Started")); } } catch (e) {}
  inner.appendChild(ctaBtn); hug(ctaBtn);

  comp.appendChild(inner);
}

function buildHeaderCentered(comp, content, atoms, molecules) {
  // header: bg px-8 py-5 → flex-col items-center gap-4
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 32; comp.paddingRight = 32;
  comp.paddingTop = 20; comp.paddingBottom = 20;
  comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: sc('bg') }]; bindFill(comp, 'bg');

  var inner = frame("content", { dir: "VERTICAL", w: MAX_W['7xl'], g: 16, ca: "CENTER" });


  var lk = comp.addComponentProperty("Logo", "TEXT", content.logo || "Logo");
  var ln = txt("logo", content.logo || "Logo", 'xl', FB, 'text');
  inner.appendChild(ln); linkText(ln, lk);

  var nav = frame("nav", { dir: "HORIZONTAL", g: 32, ca: "CENTER" });
  var links = Array.isArray(content.links) ? content.links : [];
  for (var i = 0; i < links.length; i++) {
    var link = molecules.NavLink.createInstance(); link.name = "link_" + i;
    try { var props = link.componentProperties; for (var k in props) { if (k.indexOf("Label") === 0) link.setProperties(makeObj(k, links[i].label || '')); } } catch (e) {}
    nav.appendChild(link);
  }
  var ctaBtn = atoms.ButtonSmall.createInstance(); ctaBtn.name = "cta";
  try { var props = ctaBtn.componentProperties; for (var k in props) { if (k.indexOf("Label") === 0) ctaBtn.setProperties(makeObj(k, content.ctaText || "Get Started")); } } catch (e) {}
  nav.appendChild(ctaBtn); hug(ctaBtn);
  inner.appendChild(nav);

  comp.appendChild(inner);
}

// ── HERO BUILDERS ──

function buildHeroCentered(comp, content, atoms) {
  // section: bgAlt py-20 px-8 → max-w-3xl text-center
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 32; comp.paddingRight = 32;
  comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: sc('bgAlt') }]; bindFill(comp, 'bgAlt');

  var inner = frame("content", { dir: "VERTICAL", w: MAX_W['3xl'], ca: "CENTER" });


  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Build something amazing today");
  var tn = txt("title", content.title || "Build something amazing today", '5xl', FB, 'text', { w: MAX_W['3xl'], align: "CENTER" });
  inner.appendChild(tn); linkText(tn, tk);

  // mt-6 = 24px gap
  var sub = frame("subtitle_wrap", { dir: "VERTICAL", pt: 24 });
  var stk = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle || "A short description of your product or service.");
  var sn = txt("subtitle", content.subtitle || "A short description of your product or service.", 'xl', FR, 'textSecondary', { w: MAX_W['3xl'], align: "CENTER" });
  sub.appendChild(sn); linkText(sn, stk);
  inner.appendChild(sub);

  // mt-10 = 40px, buttons row
  var btns = frame("buttons", { dir: "HORIZONTAL", g: 16, pt: 40, ca: "CENTER" });
  var pb = findVariant(atoms.Button, "Primary").createInstance(); pb.name = "primaryBtn";
  try { var props = pb.componentProperties; for (var k in props) { if (k.indexOf("Label") === 0) pb.setProperties(makeObj(k, content.ctaText || "Get Started")); } } catch (e) {}
  btns.appendChild(pb); hug(pb);
  var sb = findVariant(atoms.Button, "Secondary").createInstance(); sb.name = "secondaryBtn";
  try { var props = sb.componentProperties; for (var k in props) { if (k.indexOf("Label") === 0) sb.setProperties(makeObj(k, content.ctaSecondaryText || "Learn More")); } } catch (e) {}
  btns.appendChild(sb); hug(sb);
  inner.appendChild(btns);

  comp.appendChild(inner);
}

function buildHeroSplit(comp, content, atoms) {
  // section: bg px-8 py-24 → max-w-7xl grid-cols-2 gap-16 items-center
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 32; comp.paddingRight = 32;
  comp.paddingTop = 96; comp.paddingBottom = 96;
  comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: sc('bg') }]; bindFill(comp, 'bg');

  var inner = frame("content", { dir: "HORIZONTAL", w: MAX_W['7xl'], g: 64, ca: "CENTER" });

  // Text column — takes remaining space
  var textColW = Math.floor((MAX_W['7xl'] - 64) / 2);
  var textCol = frame("textContent", { dir: "VERTICAL", w: textColW });

  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Build something amazing today");
  var tn = txt("title", content.title || "Build something amazing today", '5xl', FB, 'text', { w: textColW });
  textCol.appendChild(tn); linkText(tn, tk);

  var sub = frame("subtitle_wrap", { dir: "VERTICAL", pt: 24 });
  var stk = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle || "A short description of your product or service.");
  var sn = txt("subtitle", content.subtitle || "A short description of your product or service.", 'xl', FR, 'textSecondary', { w: textColW });
  sub.appendChild(sn); linkText(sn, stk);
  textCol.appendChild(sub);

  var btns = frame("buttons", { dir: "HORIZONTAL", g: 16, pt: 40 });
  var pb = findVariant(atoms.Button, "Primary").createInstance(); pb.name = "primaryBtn";
  try { var props = pb.componentProperties; for (var k in props) { if (k.indexOf("Label") === 0) pb.setProperties(makeObj(k, content.ctaText || "Get Started")); } } catch (e) {}
  btns.appendChild(pb); hug(pb);
  var sb = findVariant(atoms.Button, "Secondary").createInstance(); sb.name = "secondaryBtn";
  try { var props = sb.componentProperties; for (var k in props) { if (k.indexOf("Label") === 0) sb.setProperties(makeObj(k, content.ctaSecondaryText || "Learn More")); } } catch (e) {}
  btns.appendChild(sb); hug(sb);
  textCol.appendChild(btns);

  inner.appendChild(textCol);
  fillH(textCol);

  // Image placeholder (aspect-[4/3]) — same width as text col
  var img = atoms.ImagePlaceholder.createInstance(); img.name = "heroImage";
  img.resize(textColW, Math.round(textColW * 0.75));
  inner.appendChild(img);

  comp.appendChild(inner);
}

function buildHeroWithImage(comp, content, atoms) {
  // section: bgAlt py-20 px-8 → max-w-5xl text-center
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 32; comp.paddingRight = 32;
  comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: sc('bgAlt') }]; bindFill(comp, 'bgAlt');

  var inner = frame("content", { dir: "VERTICAL", w: MAX_W['5xl'], ca: "CENTER" });


  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Build something amazing today");
  var tn = txt("title", content.title || "Build something amazing today", '5xl', FB, 'text', { w: MAX_W['5xl'], align: "CENTER" });
  inner.appendChild(tn); linkText(tn, tk);

  var sub = frame("subtitle_wrap", { dir: "VERTICAL", pt: 24, ca: "CENTER" });
  var stk = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle || "A short description of your product or service.");
  var sn = txt("subtitle", content.subtitle || "A short description of your product or service.", 'xl', FR, 'textSecondary', { w: MAX_W['2xl'], align: "CENTER" });
  sub.appendChild(sn); linkText(sn, stk);
  inner.appendChild(sub);

  var btns = frame("buttons", { dir: "HORIZONTAL", g: 16, pt: 40, ca: "CENTER" });
  var pb = findVariant(atoms.Button, "Primary").createInstance(); pb.name = "primaryBtn";
  try { var props = pb.componentProperties; for (var k in props) { if (k.indexOf("Label") === 0) pb.setProperties(makeObj(k, content.ctaText || "Get Started")); } } catch (e) {}
  btns.appendChild(pb); hug(pb);
  var sb = findVariant(atoms.Button, "Secondary").createInstance(); sb.name = "secondaryBtn";
  try { var props = sb.componentProperties; for (var k in props) { if (k.indexOf("Label") === 0) sb.setProperties(makeObj(k, content.ctaSecondaryText || "Learn More")); } } catch (e) {}
  btns.appendChild(sb); hug(sb);
  inner.appendChild(btns);

  // mt-16 = 64px, image placeholder (w-full h-80 = 320px)
  var imgWrap = frame("image_wrap", { dir: "VERTICAL", pt: 64 });
  var img = atoms.ImagePlaceholder.createInstance(); img.name = "heroImage";
  img.resize(MAX_W['5xl'], 320);
  imgWrap.appendChild(img); fillH(img);
  inner.appendChild(imgWrap);

  comp.appendChild(inner);
}

// ── FEATURES BUILDERS ──

function buildFeaturesGrid(comp, content, atoms, molecules) {
  // section: bg py-20 px-8 → max-w-7xl
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 32; comp.paddingRight = 32;
  comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: sc('bg') }]; bindFill(comp, 'bg');

  var inner = frame("content", { dir: "VERTICAL", w: MAX_W['7xl'], ca: "CENTER" });

  // Header: text-center max-w-2xl mx-auto (672px centered within 1280px inner)
  var header = frame("header", { dir: "VERTICAL", w: MAX_W['2xl'], ca: "CENTER" });
  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Everything you need");
  var tn = txt("title", content.title || "Everything you need", '3xl', FB, 'text', { align: "CENTER" });
  header.appendChild(tn); linkText(tn, tk); fillH(tn);
  if (content.subtitle) {
    var sub = frame("sub_wrap", { dir: "VERTICAL", pt: 16 });
    var stk = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle);
    var sn = txt("subtitle", content.subtitle, 'lg', FR, 'textSecondary', { align: "CENTER" });
    sub.appendChild(sn); linkText(sn, stk); fillH(sn);
    header.appendChild(sub); fillH(sub);
  }
  inner.appendChild(header);

  // mt-16 = 64px, grid gap-8 = 32px, 3 cols
  var gridWrap = frame("grid_wrap", { dir: "VERTICAL", pt: 64 });
  var grid = frame("grid", { dir: "HORIZONTAL", w: MAX_W['7xl'], g: 32, wrap: true });
  grid.counterAxisSpacing = 32;

  var features = Array.isArray(content.features) ? content.features : [];
  var colW = Math.floor((MAX_W['7xl'] - 64) / 3);
  for (var i = 0; i < features.length; i++) {
    var card = molecules.FeatureCard.createInstance(); card.name = "feature_" + i;
    card.resize(colW, card.height);
    try {
      var props = card.componentProperties;
      for (var k in props) {
        if (k.indexOf("Title") === 0) card.setProperties(makeObj(k, features[i].title || ''));
        if (k.indexOf("Description") === 0) card.setProperties(makeObj(k, features[i].description || ''));
      }
    } catch (e) {}
    grid.appendChild(card);
    fillH(card);
  }
  gridWrap.appendChild(grid); fillH(grid);
  inner.appendChild(gridWrap); fillH(gridWrap);
  comp.appendChild(inner);
}

function buildFeaturesAlternating(comp, content, atoms) {
  // section: bgAlt px-8 py-24 → max-w-7xl
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 32; comp.paddingRight = 32;
  comp.paddingTop = 96; comp.paddingBottom = 96;
  comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: sc('bgAlt') }]; bindFill(comp, 'bgAlt');

  var inner = frame("content", { dir: "VERTICAL", w: MAX_W['7xl'], ca: "CENTER" });

  // Header: text-center max-w-2xl mx-auto
  var header = frame("header", { dir: "VERTICAL", w: MAX_W['2xl'], ca: "CENTER" });
  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Features");
  var tn = txt("title", content.title || "Features", '3xl', FB, 'text', { align: "CENTER" });
  header.appendChild(tn); linkText(tn, tk); fillH(tn);
  if (content.subtitle) {
    var sub = frame("sub_wrap", { dir: "VERTICAL", pt: 16 });
    var stk = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle);
    var sn = txt("subtitle", content.subtitle, 'lg', FR, 'textSecondary', { align: "CENTER" });
    sub.appendChild(sn); linkText(sn, stk); fillH(sn);
    header.appendChild(sub); fillH(sub);
  }
  inner.appendChild(header);

  // mt-20=80px, gap-24=96px between rows
  var rows = frame("features", { dir: "VERTICAL", g: 96, pt: 80 });
  setFixedW(rows, MAX_W['7xl']);
  var features = Array.isArray(content.features) ? content.features : [];
  for (var i = 0; i < features.length; i++) {
    // grid-cols-2 gap-16=64px items-center
    var row = frame("feature_" + i, { dir: "HORIZONTAL", g: 64, ca: "CENTER" });
    setFixedW(row, MAX_W['7xl']);

    var textBlock = frame("text_" + i, { dir: "VERTICAL" });
    var ft = txt("featTitle_" + i, features[i].title || '', '2xl', FS, 'text');
    textBlock.appendChild(ft); fillH(ft);
    var descWrap = frame("desc_wrap", { dir: "VERTICAL", pt: 16 });
    var fd = txt("featDesc_" + i, features[i].description || '', 'base', FR, 'textSecondary');
    descWrap.appendChild(fd); fillH(fd);
    textBlock.appendChild(descWrap); fillH(descWrap);

    var img = atoms.ImagePlaceholder.createInstance(); img.name = "image_" + i;
    img.resize(560, 420);

    if (i % 2 === 0) { row.appendChild(textBlock); row.appendChild(img); }
    else { row.appendChild(img); row.appendChild(textBlock); }
    fillH(textBlock);

    rows.appendChild(row);
  }
  inner.appendChild(rows); fillH(rows);
  comp.appendChild(inner);
}

function buildFeaturesWithImage(comp, content, atoms) {
  // section: bg px-8 py-24 → max-w-7xl
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 32; comp.paddingRight = 32;
  comp.paddingTop = 96; comp.paddingBottom = 96;
  comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: sc('bg') }]; bindFill(comp, 'bg');

  var inner = frame("content", { dir: "VERTICAL", w: MAX_W['7xl'], ca: "CENTER" });

  // Header: text-center max-w-2xl mx-auto
  var header = frame("header", { dir: "VERTICAL", w: MAX_W['2xl'], ca: "CENTER" });
  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Features");
  var tn = txt("title", content.title || "Features", '3xl', FB, 'text', { align: "CENTER" });
  header.appendChild(tn); linkText(tn, tk); fillH(tn);
  if (content.subtitle) {
    var sub = frame("sub_wrap", { dir: "VERTICAL", pt: 16 });
    var stk = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle);
    var sn = txt("subtitle", content.subtitle, 'lg', FR, 'textSecondary', { align: "CENTER" });
    sub.appendChild(sn); linkText(sn, stk); fillH(sn);
    header.appendChild(sub); fillH(sub);
  }
  inner.appendChild(header);

  // grid-cols-2 gap-12=48px items-center
  var grid = frame("grid", { dir: "HORIZONTAL", g: 48, pt: 64, ca: "CENTER" });
  setFixedW(grid, MAX_W['7xl']);

  var img = atoms.ImagePlaceholder.createInstance(); img.name = "heroImage";
  img.resize(560, 320);
  grid.appendChild(img);

  var featCol = frame("features", { dir: "VERTICAL", g: 32 });
  var features = Array.isArray(content.features) ? content.features : [];
  for (var i = 0; i < features.length; i++) {
    var feat = frame("feat_" + i, { dir: "HORIZONTAL", g: 16 });
    var icon = atoms.IconPlaceholder.createInstance(); icon.name = "icon_" + i;
    feat.appendChild(icon); hug(icon);
    var textBlock = frame("text_" + i, { dir: "VERTICAL", g: 4 });
    textBlock.appendChild(txt("featTitle_" + i, features[i].title || '', 'lg', FS, 'text'));
    var fwd = txt("featDesc_" + i, features[i].description || '', 'sm', FR, 'textSecondary');
    textBlock.appendChild(fwd); fillH(fwd);
    feat.appendChild(textBlock);
    featCol.appendChild(feat);
  }
  grid.appendChild(featCol);
  fillH(featCol);

  inner.appendChild(grid);
  comp.appendChild(inner);
}

// ── PRICING BUILDER ──

function buildPricing3Col(comp, content, atoms) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 32; comp.paddingRight = 32;
  comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: sc('bg') }]; bindFill(comp, 'bg');

  var inner = frame("content", { dir: "VERTICAL", w: MAX_W['6xl'], ca: "CENTER" });


  // Header: text-center max-w-2xl mx-auto
  var header = frame("header", { dir: "VERTICAL", w: MAX_W['2xl'], ca: "CENTER" });
  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Simple, transparent pricing");
  var tn = txt("title", content.title || "Simple, transparent pricing", '3xl', FB, 'text', { align: "CENTER" });
  header.appendChild(tn); linkText(tn, tk); fillH(tn);
  var sub = frame("sub_wrap", { dir: "VERTICAL", pt: 16 });
  var stk = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle || "Choose the plan that works best for you.");
  var sn = txt("subtitle", content.subtitle || "Choose the plan that works best for you.", 'lg', FR, 'textSecondary', { align: "CENTER" });
  sub.appendChild(sn); linkText(sn, stk); fillH(sn);
  header.appendChild(sub); fillH(sub);
  inner.appendChild(header);

  // grid gap-8=32px, mt-16=64px
  var grid = frame("plans", { dir: "HORIZONTAL", g: 32, pt: 64 });
  setFixedW(grid, MAX_W['6xl']);

  var plans = Array.isArray(content.plans) ? content.plans : [];
  for (var i = 0; i < plans.length; i++) {
    var p = plans[i];
    var hl = p.highlighted;
    var cardBg = hl ? 'hlBg' : 'bg';
    var cardText = hl ? 'hlText' : 'text';
    var cardTextSec = hl ? 'hlTextSec' : 'textSecondary';
    var card = frame("plan_" + i, {
      dir: "VERTICAL", p: 32, r: 16,
      bg: cardBg,
      stroke: hl ? null : 'border',
    });
    card.resize(350, 100); card.counterAxisSizingMode = "FIXED";

    card.appendChild(txt("planName_" + i, p.name || 'Plan', 'xl', FS, cardText));

    // Price row
    var priceRow = frame("priceRow", { dir: "HORIZONTAL", g: 4, ca: "MAX", pt: 8 });
    priceRow.appendChild(txt("planPrice_" + i, p.price || '$9', '4xl', FB, cardText));
    priceRow.appendChild(txt("planPeriod_" + i, p.period || '/mo', 'sm', FR, cardTextSec));
    card.appendChild(priceRow);

    var descWrap = frame("desc_wrap", { dir: "VERTICAL", pt: 16 });
    descWrap.appendChild(txt("planDesc_" + i, p.description || '', 'sm', FR, cardTextSec));
    card.appendChild(descWrap);

    // Features list
    var feats = String(p.features || '').split(',');
    var featList = frame("features", { dir: "VERTICAL", g: 12, pt: 24 });
    for (var j = 0; j < feats.length && j < 6; j++) {
      var f = feats[j].trim();
      if (f) featList.appendChild(txt("planFeat_" + i + "_" + j, "✓  " + f, 'sm', FR, cardTextSec));
    }
    card.appendChild(featList);

    // CTA button
    var btnWrap = frame("btn_wrap", { dir: "VERTICAL", pt: 32 });
    if (hl) {
      var btn = frame("planCta_" + i, { dir: "HORIZONTAL", bg: 'hlBtnBg', px: 24, py: 12, r: 8, ca: "CENTER", ma: "CENTER" });
      btn.resize(card.width - 64, 44); btn.counterAxisSizingMode = "FIXED";
      btn.appendChild(txt("ctaText", p.ctaText || "Get Started", 'sm', FM, 'hlBtnText', { align: "CENTER" }));
      btnWrap.appendChild(btn); fillH(btn);
    } else {
      var btn = findVariant(atoms.Button, "Primary").createInstance(); btn.name = "planCta_" + i;
      try { var props = btn.componentProperties; for (var k in props) { if (k.indexOf("Label") === 0) btn.setProperties(makeObj(k, p.ctaText || "Get Started")); } } catch (e) {}
      btnWrap.appendChild(btn); fillH(btn);
    }
    card.appendChild(btnWrap);

    grid.appendChild(card);
    fillH(card);
  }
  inner.appendChild(grid);
  comp.appendChild(inner);
}

// ── TESTIMONIALS BUILDER ──

function buildTestimonialsCards(comp, content, atoms, molecules) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 32; comp.paddingRight = 32;
  comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: sc('bgAlt') }]; bindFill(comp, 'bgAlt');

  var inner = frame("content", { dir: "VERTICAL", w: MAX_W['6xl'], ca: "CENTER" });


  // Header: text-center (no narrow constraint here, single line)
  var header = frame("header", { dir: "VERTICAL", w: MAX_W['2xl'], ca: "CENTER" });
  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "What our customers say");
  var tn = txt("title", content.title || "What our customers say", '3xl', FB, 'text', { align: "CENTER" });
  header.appendChild(tn); linkText(tn, tk); fillH(tn);
  inner.appendChild(header);

  var grid = frame("testimonials", { dir: "HORIZONTAL", g: 32, pt: 64 });
  setFixedW(grid, MAX_W['6xl']);
  var items = Array.isArray(content.testimonials) ? content.testimonials : [];
  for (var i = 0; i < items.length; i++) {
    var card = molecules.TestimonialCard.createInstance(); card.name = "testimonial_" + i;
    try {
      var props = card.componentProperties;
      for (var k in props) {
        if (k.indexOf("Quote") === 0) card.setProperties(makeObj(k, items[i].quote || ''));
        if (k.indexOf("Author") === 0) card.setProperties(makeObj(k, items[i].author || ''));
        if (k.indexOf("Role") === 0) card.setProperties(makeObj(k, items[i].role || ''));
      }
    } catch (e) {}
    grid.appendChild(card);
    fillH(card);
  }
  inner.appendChild(grid);
  comp.appendChild(inner);
}

// ── CTA BUILDER ──

function buildCtaCentered(comp, content, atoms) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 32; comp.paddingRight = 32;
  comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: sc('bgAlt') }]; bindFill(comp, 'bgAlt');

  var inner = frame("content", { dir: "VERTICAL", w: MAX_W['3xl'], ca: "CENTER" });


  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Ready to get started?");
  var tn = txt("title", content.title || "Ready to get started?", '3xl', FB, 'text', { w: MAX_W['3xl'], align: "CENTER" });
  inner.appendChild(tn); linkText(tn, tk);

  var sub = frame("sub_wrap", { dir: "VERTICAL", pt: 16 });
  var stk = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle || "Join thousands of satisfied customers today.");
  var sn = txt("subtitle", content.subtitle || "Join thousands of satisfied customers today.", 'lg', FR, 'textSecondary', { w: MAX_W['3xl'], align: "CENTER" });
  sub.appendChild(sn); linkText(sn, stk);
  inner.appendChild(sub);

  var btns = frame("buttons", { dir: "HORIZONTAL", g: 16, pt: 32, ca: "CENTER" });
  var pb = findVariant(atoms.Button, "Primary").createInstance(); pb.name = "primaryBtn";
  try { var props = pb.componentProperties; for (var k in props) { if (k.indexOf("Label") === 0) pb.setProperties(makeObj(k, content.ctaText || "Start Free Trial")); } } catch (e) {}
  btns.appendChild(pb); hug(pb);
  if (content.ctaSecondaryText) {
    var sb = findVariant(atoms.Button, "Secondary").createInstance(); sb.name = "secondaryBtn";
    try { var props = sb.componentProperties; for (var k in props) { if (k.indexOf("Label") === 0) sb.setProperties(makeObj(k, content.ctaSecondaryText)); } } catch (e) {}
    btns.appendChild(sb); hug(sb);
  }
  inner.appendChild(btns);

  comp.appendChild(inner);
}

// ── FAQ BUILDER ──

function buildFaqAccordion(comp, content, atoms, molecules) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 32; comp.paddingRight = 32;
  comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: sc('bg') }]; bindFill(comp, 'bg');

  var inner = frame("content", { dir: "VERTICAL", w: MAX_W['3xl'] });

  // Header: text-center mb-12
  var header = frame("header", { dir: "VERTICAL", w: MAX_W['3xl'], ca: "CENTER" });
  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Frequently asked questions");
  var tn = txt("title", content.title || "Frequently asked questions", '3xl', FB, 'text', { w: MAX_W['3xl'], align: "CENTER" });
  header.appendChild(tn); linkText(tn, tk);
  if (content.subtitle) {
    var sub = frame("sub_wrap", { dir: "VERTICAL", pt: 16 });
    var stk = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle);
    var sn = txt("subtitle", content.subtitle, 'lg', FR, 'textSecondary', { w: MAX_W['3xl'], align: "CENTER" });
    sub.appendChild(sn); linkText(sn, stk);
    header.appendChild(sub);
  }
  inner.appendChild(header); fillH(header);

  // FAQ list: divide-y border-t border-b (only top/bottom borders, dividers between items)
  var list = frame("questions", { dir: "VERTICAL", g: 0, pt: 48 });
  setFixedW(list, MAX_W['3xl']);

  // Top border line
  var topLine = rect(MAX_W['3xl'], 1, 'border', 0);
  list.appendChild(topLine); fillH(topLine);

  var questions = Array.isArray(content.questions) ? content.questions : [];
  for (var i = 0; i < questions.length; i++) {
    // Build each FAQ item inline (not molecule instance) so content flows through
    var item = frame("qa_" + i, { dir: "VERTICAL", g: 8, py: 24 });
    setFixedW(item, MAX_W['3xl']);
    var qi = txt("question_" + i, questions[i].question || '', 'lg', FS, 'text');
    item.appendChild(qi); fillH(qi);
    var ai = txt("answer_" + i, questions[i].answer || '', 'base', FR, 'textSecondary');
    item.appendChild(ai); fillH(ai);
    list.appendChild(item);
    fillH(item);

    // Divider line after each item
    var divLine = rect(MAX_W['3xl'], 1, 'border', 0);
    list.appendChild(divLine); fillH(divLine);
  }

  inner.appendChild(list);
  comp.appendChild(inner);
}

// ── STATS BUILDER ──

function buildStatsRow(comp, content, atoms, molecules) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 32; comp.paddingRight = 32;
  comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: sc('bg') }]; bindFill(comp, 'bg');

  var inner = frame("content", { dir: "VERTICAL", w: MAX_W['6xl'], ca: "CENTER" });


  // Header: text-center (narrow for stats)
  var header = frame("header", { dir: "VERTICAL", w: MAX_W['2xl'], ca: "CENTER" });
  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Trusted by thousands");
  var tn = txt("title", content.title || "Trusted by thousands", '3xl', FB, 'text', { align: "CENTER" });
  header.appendChild(tn); linkText(tn, tk); fillH(tn);
  inner.appendChild(header);

  var row = frame("stats", { dir: "HORIZONTAL", g: 32, pt: 64 });
  setFixedW(row, MAX_W['6xl']);
  var stats = Array.isArray(content.stats) ? content.stats : [];
  for (var i = 0; i < stats.length; i++) {
    var item = molecules.StatItem.createInstance(); item.name = "stat_" + i;
    try {
      var props = item.componentProperties;
      for (var k in props) {
        if (k.indexOf("Value") === 0) item.setProperties(makeObj(k, stats[i].value || ''));
        if (k.indexOf("Label") === 0) item.setProperties(makeObj(k, stats[i].label || ''));
      }
    } catch (e) {}
    row.appendChild(item);
    fillH(item);
  }
  inner.appendChild(row);
  comp.appendChild(inner);
}

// ── LOGOS BUILDER ──

function buildLogosSimple(comp, content, atoms) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 32; comp.paddingRight = 32;
  comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: sc('bg') }]; bindFill(comp, 'bg');

  var inner = frame("content", { dir: "VERTICAL", w: MAX_W['5xl'], ca: "CENTER" });


  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Trusted by leading companies");
  var tn = txt("title", content.title || "Trusted by leading companies", 'lg', FM, 'textSecondary', { w: MAX_W['5xl'], align: "CENTER" });
  inner.appendChild(tn); linkText(tn, tk);

  var row = frame("logos", { dir: "HORIZONTAL", g: 32, pt: 40, ca: "CENTER", ma: "CENTER", wrap: true });
  setFixedW(row, MAX_W['5xl']);
  var logos = Array.isArray(content.logos) ? content.logos : [{},{},{},{},{}];
  for (var i = 0; i < logos.length; i++) {
    var logoItem = frame("logo_" + i, { dir: "VERTICAL", g: 8, ca: "CENTER" });
    var r = rect(96, 48, 'bgPlaceholder', 8);
    logoItem.appendChild(r);
    if (logos[i].name) logoItem.appendChild(txt("name_" + i, logos[i].name, 'xs', FR, 'textMuted'));
    row.appendChild(logoItem);
  }
  inner.appendChild(row);
  comp.appendChild(inner);
}

// ── BANNER BUILDER ──

function buildBannerSimple(comp, content) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 16; comp.paddingRight = 16;
  comp.paddingTop = 12; comp.paddingBottom = 12;
  comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: sc('bgAlt') }]; bindFill(comp, 'bgAlt');
  comp.strokes = [{ type: 'SOLID', color: sc('border') }];
  bindStroke(comp, 'border');
  comp.strokeWeight = 1; comp.strokeAlign = "INSIDE";

  var tk = comp.addComponentProperty("Text", "TEXT", content.text || "We just launched v2.0!");
  var tn = txt("text", content.text || "We just launched v2.0!", 'sm', FR, 'textSecondary', { align: "CENTER" });
  comp.appendChild(tn); linkText(tn, tk);
}

// ── CONTACT BUILDER ──

function buildContactSplit(comp, content, atoms) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 32; comp.paddingRight = 32;
  comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: sc('bg') }]; bindFill(comp, 'bg');

  var inner = frame("content", { dir: "HORIZONTAL", w: MAX_W['5xl'], g: 48 });


  // Left column — info
  var leftCol = frame("info", { dir: "VERTICAL" });
  var tk = comp.addComponentProperty("Title", "TEXT", content.title || "Get in touch");
  var tn = txt("title", content.title || "Get in touch", '3xl', FB, 'text');
  leftCol.appendChild(tn); linkText(tn, tk);

  if (content.subtitle) {
    var sub = frame("sub_wrap", { dir: "VERTICAL", pt: 16 });
    var stk = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle);
    var sn = txt("subtitle", content.subtitle, 'base', FR, 'textSecondary');
    sub.appendChild(sn); linkText(sn, stk);
    leftCol.appendChild(sub);
  }

  var infoGroup = frame("details", { dir: "VERTICAL", g: 16, pt: 32 });
  if (content.email) {
    var emailRow = frame("email", { dir: "HORIZONTAL", g: 12, ca: "CENTER" });
    emailRow.appendChild(rect(20, 20, 'bgAvatar', 4));
    emailRow.appendChild(txt("email", content.email, 'base', FR, 'textSecondary'));
    infoGroup.appendChild(emailRow);
  }
  if (content.phone) {
    var phoneRow = frame("phone", { dir: "HORIZONTAL", g: 12, ca: "CENTER" });
    phoneRow.appendChild(rect(20, 20, 'bgAvatar', 4));
    phoneRow.appendChild(txt("phone", content.phone, 'base', FR, 'textSecondary'));
    infoGroup.appendChild(phoneRow);
  }
  leftCol.appendChild(infoGroup);
  inner.appendChild(leftCol);
  fillH(leftCol);

  // Right column — form
  var rightCol = frame("form", { dir: "VERTICAL", g: 16 });
  var nameInput = atoms.InputField.createInstance(); nameInput.name = "nameInput";
  try { var props = nameInput.componentProperties; for (var k in props) { if (k.indexOf("Placeholder") === 0) nameInput.setProperties(makeObj(k, "Your name")); } } catch (e) {}
  rightCol.appendChild(nameInput); fillH(nameInput);
  var emailInput = atoms.InputField.createInstance(); emailInput.name = "emailInput";
  try { var props = emailInput.componentProperties; for (var k in props) { if (k.indexOf("Placeholder") === 0) emailInput.setProperties(makeObj(k, "Your email")); } } catch (e) {}
  rightCol.appendChild(emailInput); fillH(emailInput);
  // Textarea placeholder
  var ta = frame("textarea", { dir: "VERTICAL", bg: 'bg', stroke: 'border', px: 16, py: 12, r: 8 });
  ta.resize(400, 120); ta.counterAxisSizingMode = "FIXED";
  ta.appendChild(txt("placeholder", "Your message", 'sm', FR, 'textMuted'));
  rightCol.appendChild(ta); fillH(ta);
  // Submit button
  var submitBtn = findVariant(atoms.Button, "Primary").createInstance(); submitBtn.name = "submitBtn";
  try { var props = submitBtn.componentProperties; for (var k in props) { if (k.indexOf("Label") === 0) submitBtn.setProperties(makeObj(k, "Send Message")); } } catch (e) {}
  rightCol.appendChild(submitBtn); fillH(submitBtn);
  inner.appendChild(rightCol);
  fillH(rightCol);

  comp.appendChild(inner);
}

// ── FOOTER BUILDERS ──

function buildFooter4Col(comp, content, atoms, molecules) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 32; comp.paddingRight = 32;
  comp.paddingTop = 64; comp.paddingBottom = 64;
  comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: sc('bg') }]; bindFill(comp, 'bg');

  var inner = frame("content", { dir: "VERTICAL", w: MAX_W['5xl'] });


  // Columns: grid-cols-4 gap-8=32px
  var grid = frame("columns", { dir: "HORIZONTAL", g: 32 });
  setFixedW(grid, MAX_W['5xl']);

  // Logo column
  var logoCol = frame("logoCol", { dir: "VERTICAL", g: 16 });
  var lk = comp.addComponentProperty("Logo", "TEXT", content.logo || "Logo");
  var ln = txt("logo", content.logo || "Logo", 'xl', FB, 'text');
  logoCol.appendChild(ln); linkText(ln, lk);
  if (content.description) {
    var dk = comp.addComponentProperty("Description", "TEXT", content.description);
    var dn = txt("description", content.description, 'sm', FR, 'textMuted');
    logoCol.appendChild(dn); linkText(dn, dk); fillH(dn);
  }
  grid.appendChild(logoCol);
  fillH(logoCol);

  // Link columns
  var columns = Array.isArray(content.columns) ? content.columns : [];
  for (var i = 0; i < columns.length; i++) {
    var colFrame = frame("column_" + i, { dir: "VERTICAL", g: 8 });
    colFrame.appendChild(txt("columnTitle_" + i, columns[i].title || '', 'sm', FS, 'text'));
    var linkList = frame("links_" + i, { dir: "VERTICAL", g: 8, pt: 8 });
    var links = String(columns[i].links || '').split(',');
    for (var j = 0; j < links.length; j++) {
      var l = links[j].trim();
      if (l) linkList.appendChild(txt("link_" + i + "_" + j, l, 'sm', FR, 'textMuted'));
    }
    colFrame.appendChild(linkList);
    grid.appendChild(colFrame);
    fillH(colFrame);
  }
  inner.appendChild(grid);

  // Divider + copyright
  var divider = frame("divider", { dir: "VERTICAL", pt: 48 });
  var line = rect(MAX_W['5xl'], 1, 'border', 0);
  divider.appendChild(line); fillH(line);
  var cpWrap = frame("copyright_wrap", { dir: "VERTICAL", pt: 32, ca: "CENTER" });
  var ck = comp.addComponentProperty("Copyright", "TEXT", content.copyright || "© 2024");
  var cn = txt("copyright", content.copyright || "© 2024", 'sm', FR, 'textMuted', { align: "CENTER" });
  cpWrap.appendChild(cn); linkText(cn, ck);
  divider.appendChild(cpWrap);
  inner.appendChild(divider);

  comp.appendChild(inner);
}

function buildFooterSimple(comp, content) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 32; comp.paddingRight = 32;
  comp.paddingTop = 64; comp.paddingBottom = 64;
  comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: sc('bgAlt') }]; bindFill(comp, 'bgAlt');

  var inner = frame("content", { dir: "VERTICAL", w: MAX_W['5xl'], ca: "CENTER" });


  var lk = comp.addComponentProperty("Logo", "TEXT", content.logo || "Logo");
  var ln = txt("logo", content.logo || "Logo", 'xl', FB, 'text');
  inner.appendChild(ln); linkText(ln, lk);

  // Links row
  var linksWrap = frame("links_wrap", { dir: "HORIZONTAL", g: 24, pt: 24, ca: "CENTER", ma: "CENTER", wrap: true });
  var links = Array.isArray(content.links) ? content.links : [];
  for (var i = 0; i < links.length; i++) {
    linksWrap.appendChild(txt("link_" + i, links[i].label || '', 'sm', FR, 'textMuted'));
  }
  // Also try columns format
  if (!links.length) {
    var columns = Array.isArray(content.columns) ? content.columns : [];
    for (var i = 0; i < columns.length; i++) {
      var cls = String(columns[i].links || '').split(',');
      for (var j = 0; j < cls.length; j++) {
        var l = cls[j].trim();
        if (l) linksWrap.appendChild(txt("link_" + i + "_" + j, l, 'sm', FR, 'textMuted'));
      }
    }
  }
  inner.appendChild(linksWrap);

  var cpWrap = frame("copyright_wrap", { dir: "VERTICAL", pt: 32 });
  var ck = comp.addComponentProperty("Copyright", "TEXT", content.copyright || "© 2024");
  var cn = txt("copyright", content.copyright || "© 2024", 'sm', FR, 'textMuted', { align: "CENTER" });
  cpWrap.appendChild(cn); linkText(cn, ck);
  inner.appendChild(cpWrap);

  comp.appendChild(inner);
}

// ══════════════════════════════════════════════════════════════
// GENERIC FALLBACK — Enhanced with container pattern
// ══════════════════════════════════════════════════════════════

function buildGenericOrganism(comp, content, category) {
  comp.layoutMode = "VERTICAL"; comp.resize(W, 100);
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.paddingLeft = 32; comp.paddingRight = 32;
  comp.paddingTop = 80; comp.paddingBottom = 80;
  comp.counterAxisAlignItems = "CENTER";
  comp.fills = [{ type: 'SOLID', color: sc('bg') }]; bindFill(comp, 'bg');

  var inner = frame("content", { dir: "VERTICAL", w: MAX_W['6xl'], ca: "CENTER" });


  var tk = comp.addComponentProperty("Title", "TEXT", content.title || getCategoryLabel(category));
  var tn = txt("title", content.title || getCategoryLabel(category), '3xl', FB, 'text', { w: MAX_W['3xl'], align: "CENTER" });
  inner.appendChild(tn); linkText(tn, tk);

  if (content.subtitle) {
    var sub = frame("sub_wrap", { dir: "VERTICAL", pt: 16 });
    var stk = comp.addComponentProperty("Subtitle", "TEXT", content.subtitle);
    var sn = txt("subtitle", content.subtitle, 'lg', FR, 'textSecondary', { w: MAX_W['2xl'], align: "CENTER" });
    sub.appendChild(sn); linkText(sn, stk);
    inner.appendChild(sub);
  }

  comp.appendChild(inner);
}

// ── BUILDER REGISTRY ──

var VARIANT_BUILDERS = {
  'header-simple': buildHeaderSimple,
  'header-centered': buildHeaderCentered,
  'hero-centered': buildHeroCentered,
  'hero-split': buildHeroSplit,
  'hero-with-image': buildHeroWithImage,
  'features-grid': buildFeaturesGrid,
  'features-alternating': buildFeaturesAlternating,
  'features-with-image': buildFeaturesWithImage,
  'pricing-3col': buildPricing3Col,
  'testimonials-cards': buildTestimonialsCards,
  'cta-centered': buildCtaCentered,
  'faq-accordion': buildFaqAccordion,
  'stats-row': buildStatsRow,
  'logos-simple': buildLogosSimple,
  'banner-simple': buildBannerSimple,
  'banner-minimal': buildBannerSimple,
  'contact-split': buildContactSplit,
  'footer-4col': buildFooter4Col,
  'footer-simple': buildFooterSimple,
};

var CATEGORY_BUILDERS = {
  header: buildHeaderSimple,
  hero: buildHeroCentered,
  features: buildFeaturesGrid,
  pricing: buildPricing3Col,
  testimonials: buildTestimonialsCards,
  cta: buildCtaCentered,
  faq: buildFaqAccordion,
  stats: buildStatsRow,
  logos: buildLogosSimple,
  banner: buildBannerSimple,
  contact: buildContactSplit,
  footer: buildFooter4Col,
};

function buildOrganism(comp, category, variantId, content, atoms, molecules) {
  var builder = VARIANT_BUILDERS[variantId];
  if (builder) { builder(comp, content, atoms, molecules); return; }
  builder = CATEGORY_BUILDERS[category];
  if (builder) { builder(comp, content, atoms, molecules); return; }
  buildGenericOrganism(comp, content, category);
}

// ── Content defaults & helpers ──

function getDefaultContent(cat) {
  var defaults = {
    header: { logo: 'Logo', links: [{ label: 'Features' }, { label: 'Pricing' }, { label: 'About' }], ctaText: 'Get Started' },
    hero: { title: 'Build something amazing today', subtitle: 'A short description of your product or service that explains the value proposition.', ctaText: 'Get Started', ctaSecondaryText: 'Learn More' },
    logos: { title: 'Trusted by leading companies', logos: [{ name: 'Acme' }, { name: 'Globex' }, { name: 'Initech' }, { name: 'Umbrella' }, { name: 'Stark' }] },
    features: { title: 'Everything you need', subtitle: 'Our platform provides all the tools you need to succeed.', features: [{ title: 'Feature One', description: 'A brief description of this feature.' }, { title: 'Feature Two', description: 'A brief description of this feature.' }, { title: 'Feature Three', description: 'A brief description of this feature.' }] },
    stats: { title: 'Trusted by thousands', stats: [{ value: '10K+', label: 'Active Users' }, { value: '99.9%', label: 'Uptime' }, { value: '150+', label: 'Countries' }] },
    pricing: { title: 'Simple, transparent pricing', subtitle: 'Choose the plan that works best for you.', plans: [{ name: 'Starter', price: '$9', period: '/mo', description: 'For individuals', features: 'Feature 1, Feature 2, Feature 3', ctaText: 'Get Started' }, { name: 'Pro', price: '$29', period: '/mo', description: 'For teams', features: 'Everything in Starter, Feature 4, Feature 5', ctaText: 'Get Started', highlighted: true }, { name: 'Enterprise', price: '$99', period: '/mo', description: 'For organizations', features: 'Everything in Pro, Feature 6, Priority support', ctaText: 'Contact Sales' }] },
    testimonials: { title: 'What our customers say', testimonials: [{ quote: 'This product has completely transformed how we work.', author: 'Jane Cooper', role: 'CEO at TechCorp' }, { quote: 'The best investment we made this year.', author: 'John Smith', role: 'CTO at StartupXYZ' }, { quote: 'Simple, effective, and beautifully designed.', author: 'Sarah Johnson', role: 'Designer at CreativeCo' }] },
    faq: { title: 'Frequently asked questions', subtitle: 'Find answers to common questions.', questions: [{ question: 'How do I get started?', answer: 'Simply sign up for a free account and follow the onboarding guide.' }, { question: 'Is there a free trial?', answer: 'Yes, we offer a 14-day free trial with full access to all features.' }, { question: 'Can I cancel anytime?', answer: 'Absolutely. Cancel your subscription at any time with no penalties.' }] },
    cta: { title: 'Ready to get started?', subtitle: 'Join thousands of satisfied customers today.', ctaText: 'Start Free Trial' },
    blog: { title: 'Latest from the blog', subtitle: 'Insights, tips, and news.', posts: [{ title: 'Getting Started Guide', excerpt: 'Learn how to set up.' }, { title: '10 Productivity Tips', excerpt: 'Discover best practices.' }, { title: 'What is New in V2', excerpt: 'Explore the latest.' }] },
    about: { title: 'About our company', description: 'We are a team of passionate individuals dedicated to building the best products.' },
    team: { title: 'Meet our team', subtitle: 'The people behind the product.', members: [{ name: 'Jane Cooper', role: 'CEO' }, { name: 'John Smith', role: 'CTO' }, { name: 'Sarah Johnson', role: 'Design Lead' }, { name: 'Michael Brown', role: 'Engineer' }] },
    contact: { title: 'Get in touch', subtitle: 'We would love to hear from you.', email: 'hello@example.com', phone: '+1 (555) 123-4567' },
    footer: { logo: 'Structr', description: 'Building the future of web design.', copyright: '© 2024 Structr. All rights reserved.', columns: [{ title: 'Product', links: 'Features, Pricing, Changelog' }, { title: 'Company', links: 'About, Blog, Careers' }, { title: 'Resources', links: 'Docs, Help, API' }] },
    banner: { text: 'We just launched v2.0! Check out the new features.', ctaText: 'Learn More' },
    process: { title: 'How it works', subtitle: 'Get started in a few simple steps.', steps: [{ title: 'Sign Up', description: 'Create your free account.' }, { title: 'Configure', description: 'Set up your workspace.' }, { title: 'Build', description: 'Start creating.' }] },
    error: { title: 'Page not found', subtitle: 'Sorry, we could not find the page you are looking for.', ctaText: 'Go Home' },
    store: { title: 'Our Products', subtitle: 'Browse our latest collection.' },
    gallery: { title: 'Our Work', subtitle: 'A showcase of what we have built.' },
    showcase: { title: 'Featured', subtitle: 'Our latest highlights.' },
    comparison: { title: 'Compare plans', subtitle: 'See which plan is right for you.' },
    downloads: { title: 'Download our app', subtitle: 'Available on all platforms.' },
  };
  return defaults[cat] || { title: getCategoryLabel(cat), subtitle: 'Section description.' };
}

function getCategoryLabel(cat) {
  var labels = { header: 'Header', hero: 'Hero', logos: 'Logo Cloud', features: 'Features', stats: 'Stats', pricing: 'Pricing', testimonials: 'Testimonials', faq: 'FAQ', cta: 'CTA', footer: 'Footer', blog: 'Blog', about: 'About', team: 'Team', gallery: 'Gallery', contact: 'Contact', banner: 'Banner', showcase: 'Showcase', error: 'Error Page', process: 'How It Works', downloads: 'Downloads', comparison: 'Comparison', store: 'Store' };
  return labels[cat] || cat;
}

function getVariantName(vid) {
  var parts = vid.split('-').slice(1);
  return parts.map(function (p) { return p.charAt(0).toUpperCase() + p.slice(1); }).join(' ') || 'Default';
}

// ── Override instance content ──
async function overrideInstance(inst, content, cat) {
  try {
    var props = inst.componentProperties;
    for (var k in props) {
      if (props[k].type !== 'TEXT') continue;
      var name = k.split('#')[0];
      var map = { 'Title': content.title, 'Subtitle': content.subtitle, 'Logo': content.logo, 'Description': content.description, 'Copyright': content.copyright, 'Button Text': content.ctaText, 'CTA': content.ctaText, 'Text': content.text };
      if (map[name]) inst.setProperties(makeObj(k, map[name]));
    }
  } catch (e) {}

  var fields = ['title', 'subtitle', 'logo', 'description', 'copyright', 'ctaText', 'text'];
  for (var i = 0; i < fields.length; i++) {
    if (content[fields[i]]) {
      var n = inst.findOne(function (n) { return n.name === fields[i] && n.type === "TEXT"; });
      if (n) { try { await figma.loadFontAsync(n.fontName); n.characters = String(content[fields[i]]); } catch (e) {} }
    }
  }
}

// ══════════════════════════════════════════════════════════════
// MAIN — Import Pipeline
// ══════════════════════════════════════════════════════════════

figma.ui.onmessage = async function (msg) {
  if (msg.type !== 'import') return;
  try {
    await loadFonts();
    var project = msg.data;
    if (!project || !project.pages || !project.pages.length) {
      figma.ui.postMessage({ type: 'error', message: 'No pages found' }); return;
    }

    // Phase 0: Create variable collections
    figma.ui.postMessage({ type: 'progress', message: 'Creating design tokens...' });
    createVariableCollections();

    // Phase 1: Analyze used categories/variants
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
    var componentsPage = figma.createPage();
    componentsPage.name = "Components";

    // Ions
    figma.ui.postMessage({ type: 'progress', message: '🔬 Creating design tokens...' });
    var ionsSection = figma.createSection();
    ionsSection.name = "🔬 Ions — Design Tokens";
    createIons(ionsSection);
    componentsPage.appendChild(ionsSection);
    resizeSection(ionsSection);
    ionsSection.x = 0; ionsSection.y = 0;

    // Atoms
    figma.ui.postMessage({ type: 'progress', message: '⚛️ Building atoms...' });
    var atomsSection = figma.createSection();
    atomsSection.name = "⚛️ Atoms — Base Components";
    var atoms = createAtoms(atomsSection);
    componentsPage.appendChild(atomsSection);
    resizeSection(atomsSection);
    atomsSection.x = 0; atomsSection.y = ionsSection.y + ionsSection.height + 100;

    // Molecules
    figma.ui.postMessage({ type: 'progress', message: '🧬 Building molecules...' });
    var moleculesSection = figma.createSection();
    moleculesSection.name = "🧬 Molecules — Compound Components";
    var molecules = createMolecules(moleculesSection, atoms);
    componentsPage.appendChild(moleculesSection);
    resizeSection(moleculesSection);
    moleculesSection.x = 0; moleculesSection.y = atomsSection.y + atomsSection.height + 100;

    // Organisms
    figma.ui.postMessage({ type: 'progress', message: '🏗️ Building organisms...' });
    var organismsSection = figma.createSection();
    organismsSection.name = "🏗️ Organisms — Section Components";
    var compSets = {};
    var cy = 60;

    for (var cat in used) {
      var comps = [];
      var catComps = {};
      var vids = Object.keys(used[cat]);

      var catLabel = txt("label_" + cat, getCategoryLabel(cat), 'xl', FB, 'text');
      organismsSection.appendChild(catLabel);
      catLabel.x = 60; catLabel.y = cy;
      cy += 40;

      for (var v = 0; v < vids.length; v++) {
        var vid = vids[v];
        var comp = figma.createComponent();
        comp.name = "Variant=" + getVariantName(vid);
        buildOrganism(comp, cat, vid, getDefaultContent(cat), atoms, molecules);
        organismsSection.appendChild(comp);
        comp.x = 60; comp.y = cy;
        cy += (comp.height > 100 ? comp.height : 200) + 60;
        comps.push(comp);
        catComps[vid] = comp;
      }

      if (comps.length > 1) {
        try {
          var set = figma.combineAsVariants(comps, organismsSection);
          set.name = getCategoryLabel(cat);
          set.layoutMode = "VERTICAL"; set.itemSpacing = 40;
          set.paddingLeft = 40; set.paddingRight = 40; set.paddingTop = 40; set.paddingBottom = 40;
          set.primaryAxisSizingMode = "AUTO"; set.counterAxisSizingMode = "AUTO";
          set.x = 60; set.y = catLabel.y + 40;
          cy = set.y + set.height + 100;
        } catch (e) { console.error("combineAsVariants error for " + cat, e); }
      } else if (comps.length === 1) {
        comps[0].name = getCategoryLabel(cat);
      }
      compSets[cat] = catComps;
      cy += 60;
    }

    componentsPage.appendChild(organismsSection);
    resizeSection(organismsSection, 80);
    organismsSection.x = 0; organismsSection.y = moleculesSection.y + moleculesSection.height + 100;

    // ════════════════════════════════════════
    // PAGE 2: Pages (template instances with dark mode support)
    // ════════════════════════════════════════
    var pagesPage = figma.createPage();
    pagesPage.name = "Pages";
    var total = 0;
    var pageSectionY = 0;

    for (var p = 0; p < project.pages.length; p++) {
      var pd = project.pages[p];
      var secs = pd.sections || [];
      figma.ui.postMessage({ type: 'progress', message: '📄 Building "' + pd.name + '" (' + secs.length + ' sections)...' });

      var pageSection = figma.createSection();
      pageSection.name = "📄 " + (pd.name || "Page " + (p + 1));

      var pf = figma.createFrame();
      pf.name = pd.name || 'Page';
      pf.resize(W, 100);
      pf.layoutMode = "VERTICAL";
      pf.primaryAxisSizingMode = "AUTO";
      pf.primaryAxisSizingMode = "AUTO"; pf.counterAxisSizingMode = "FIXED";
      pf.itemSpacing = 0;
      pf.fills = [{ type: 'SOLID', color: sc('bg') }];
      bindFill(pf, 'bg');

      for (var s = 0; s < secs.length; s++) {
        try {
          var cc = compSets[secs[s].category];
          if (!cc || !cc[secs[s].variantId]) continue;
          var inst = cc[secs[s].variantId].createInstance();
          await overrideInstance(inst, secs[s].content, secs[s].category);
          pf.appendChild(inst);
          fillH(inst);

          // Dark mode: set explicit variable mode on the instance
          if (secs[s].colorMode === 'dark' && semCol && darkModeId) {
            try {
              inst.setExplicitVariableModeForCollection(semCol, darkModeId);
            } catch (e) { console.log('Mode set error:', e.message); }
          }

          total++;
        } catch (e) { console.error("Error:", secs[s].category, e); }
      }

      pageSection.appendChild(pf);
      resizeSection(pageSection);
      pagesPage.appendChild(pageSection);
      pageSection.x = 0; pageSection.y = pageSectionY;
      pageSectionY += pf.height + 200;
    }

    figma.currentPage = pagesPage;
    var firstSection = pagesPage.children[0];
    if (firstSection) figma.viewport.scrollAndZoomIntoView([firstSection]);

    figma.ui.postMessage({ type: 'done', sectionCount: total, pageCount: project.pages.length });
  } catch (e) {
    figma.ui.postMessage({ type: 'error', message: String(e) });
  }
};
