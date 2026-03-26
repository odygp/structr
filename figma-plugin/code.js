// Structr Figma Plugin — Wireframe Import with Components + Instances
// Phase 1: Creates a "Components" page with component sets (one per category)
// Phase 2: Creates page(s) with instances of those components, overriding text content

figma.showUI(__html__, { width: 380, height: 480 });

// ── Colors (Light mode for components) ──
const C = {
  white: { r: 1, g: 1, b: 1 },
  gray50: { r: 0.98, g: 0.98, b: 0.98 },
  gray100: { r: 0.96, g: 0.96, b: 0.96 },
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
  t.characters = String(text || '');
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
    f.counterAxisSizingMode = "FIXED"; // lock width
    f.primaryAxisSizingMode = opts.fh ? "FIXED" : "AUTO"; // height auto
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

// ── Section Builders ──
// Each builds into a root node (Component or Frame) and names all text nodes

function buildHeader(root, content) {
  root.layoutMode = "HORIZONTAL";
  root.resize(W, 100); root.primaryAxisSizingMode = "FIXED"; root.counterAxisSizingMode = "AUTO";
  root.paddingLeft = 32; root.paddingRight = 32; root.paddingTop = 16; root.paddingBottom = 16;
  root.itemSpacing = 32; root.counterAxisAlignItems = "CENTER";
  root.fills = [{ type: 'SOLID', color: C.white }];

  root.appendChild(txt("logo", content.logo || 'Logo', 16, FS, C.gray900));
  const nav = af("nav", { dir: "HORIZONTAL", g: 24, ca: "CENTER" });
  const links = Array.isArray(content.links) ? content.links : [];
  links.forEach((l, i) => nav.appendChild(txt(`link_${i}`, l.label || '', 13, FR, C.gray600)));
  nav.layoutGrow = 1;
  root.appendChild(nav);
  if (content.ctaText) {
    const btn = af("ctaButton", { dir: "HORIZONTAL", bg: C.gray900, px: 16, py: 8, r: 8, ca: "CENTER" });
    btn.appendChild(txt("ctaText", content.ctaText, 13, FM, C.white));
    root.appendChild(btn);
  }
}

function buildHero(root, content) {
  root.layoutMode = "VERTICAL"; root.resize(W, 100);
  root.paddingLeft = 80; root.paddingRight = 80; root.paddingTop = 80; root.paddingBottom = 80;
  root.itemSpacing = 24; root.counterAxisAlignItems = "CENTER";
  root.fills = [{ type: 'SOLID', color: C.gray50 }];

  root.appendChild(txt("title", content.title || 'Headline', 48, FB, C.gray900, { w: 700, align: "CENTER" }));
  if (content.subtitle) root.appendChild(txt("subtitle", content.subtitle, 18, FR, C.gray500, { w: 600, align: "CENTER" }));

  const btns = af("buttons", { dir: "HORIZONTAL", g: 12 });
  if (content.ctaText) {
    const pb = af("primaryButton", { dir: "HORIZONTAL", bg: C.gray900, px: 24, py: 12, r: 8, ca: "CENTER" });
    pb.appendChild(txt("ctaText", content.ctaText, 14, FM, C.white));
    btns.appendChild(pb);
  }
  if (content.ctaSecondaryText) {
    const sb = af("secondaryButton", { dir: "HORIZONTAL", stroke: C.gray300, px: 24, py: 12, r: 8, ca: "CENTER" });
    sb.appendChild(txt("ctaSecondaryText", content.ctaSecondaryText, 14, FM, C.gray700));
    btns.appendChild(sb);
  }
  root.appendChild(btns);
}

function buildLogos(root, content) {
  root.layoutMode = "VERTICAL"; root.resize(W, 100);
  root.paddingLeft = 80; root.paddingRight = 80; root.paddingTop = 40; root.paddingBottom = 40;
  root.itemSpacing = 20; root.counterAxisAlignItems = "CENTER";
  root.fills = [{ type: 'SOLID', color: C.white }];

  root.appendChild(txt("title", content.title || '', 12, FR, C.gray500, { align: "CENTER" }));
  const row = af("logos", { dir: "HORIZONTAL", g: 40, ca: "CENTER" });
  const logos = Array.isArray(content.logos) ? content.logos : [];
  logos.forEach((l, i) => { const r = box(80, 32, C.gray200, 6); r.name = `logo_${i}`; row.appendChild(r); });
  root.appendChild(row);
}

function buildFeatures(root, content) {
  root.layoutMode = "VERTICAL"; root.resize(W, 100);
  root.paddingLeft = 80; root.paddingRight = 80; root.paddingTop = 80; root.paddingBottom = 80;
  root.itemSpacing = 40; root.counterAxisAlignItems = "CENTER";
  root.fills = [{ type: 'SOLID', color: C.white }];

  const header = af("header", { dir: "VERTICAL", g: 12, ca: "CENTER" });
  header.appendChild(txt("title", content.title || 'Features', 28, FB, C.gray900, { align: "CENTER" }));
  if (content.subtitle) header.appendChild(txt("subtitle", content.subtitle, 16, FR, C.gray500, { w: 500, align: "CENTER" }));
  root.appendChild(header);

  const grid = af("grid", { dir: "HORIZONTAL", g: 24 });
  const features = Array.isArray(content.features) ? content.features : [];
  features.forEach((f, i) => {
    const card = af(`feature_${i}`, { dir: "VERTICAL", bg: C.gray50, px: 24, py: 24, g: 12, r: 12 });
    card.resize(260, 100); card.counterAxisSizingMode = "FIXED";
    const icon = box(32, 32, C.gray200, 8); icon.name = `featureIcon_${i}`; card.appendChild(icon);
    card.appendChild(txt(`featureTitle_${i}`, f.title || '', 15, FS, C.gray900));
    card.appendChild(txt(`featureDesc_${i}`, f.description || '', 13, FR, C.gray500, { w: 212 }));
    grid.appendChild(card);
  });
  root.appendChild(grid);
}

function buildStats(root, content) {
  root.layoutMode = "VERTICAL"; root.resize(W, 100);
  root.paddingLeft = 80; root.paddingRight = 80; root.paddingTop = 64; root.paddingBottom = 64;
  root.itemSpacing = 32; root.counterAxisAlignItems = "CENTER";
  root.fills = [{ type: 'SOLID', color: C.white }];

  root.appendChild(txt("title", content.title || 'Stats', 28, FB, C.gray900, { align: "CENTER" }));
  const row = af("stats", { dir: "HORIZONTAL", g: 48 });
  const stats = Array.isArray(content.stats) ? content.stats : [];
  stats.forEach((s, i) => {
    const item = af(`stat_${i}`, { dir: "VERTICAL", g: 4, ca: "CENTER" });
    item.appendChild(txt(`statValue_${i}`, s.value || '', 36, FB, C.gray900, { align: "CENTER" }));
    item.appendChild(txt(`statLabel_${i}`, s.label || '', 13, FR, C.gray500, { align: "CENTER" }));
    row.appendChild(item);
  });
  root.appendChild(row);
}

function buildPricing(root, content) {
  root.layoutMode = "VERTICAL"; root.resize(W, 100);
  root.paddingLeft = 80; root.paddingRight = 80; root.paddingTop = 80; root.paddingBottom = 80;
  root.itemSpacing = 40; root.counterAxisAlignItems = "CENTER";
  root.fills = [{ type: 'SOLID', color: C.white }];

  const header = af("header", { dir: "VERTICAL", g: 12, ca: "CENTER" });
  header.appendChild(txt("title", content.title || 'Pricing', 28, FB, C.gray900, { align: "CENTER" }));
  if (content.subtitle) header.appendChild(txt("subtitle", content.subtitle, 16, FR, C.gray500, { align: "CENTER" }));
  root.appendChild(header);

  const cards = af("plans", { dir: "HORIZONTAL", g: 24 });
  const plans = Array.isArray(content.plans) ? content.plans : [];
  plans.forEach((p, i) => {
    const hl = p.highlighted === true || p.highlighted === 'true';
    const cardBg = hl ? C.gray900 : C.white;
    const cardText = hl ? C.white : C.gray900;
    const cardSub = hl ? C.gray300 : C.gray500;

    const card = af(`plan_${i}`, { dir: "VERTICAL", bg: cardBg, px: 28, py: 28, g: 16, r: 16, stroke: hl ? undefined : C.gray200 });
    card.resize(240, 100); card.counterAxisSizingMode = "FIXED";
    card.appendChild(txt(`planName_${i}`, p.name || '', 16, FS, cardText));
    card.appendChild(txt(`planDesc_${i}`, p.description || '', 12, FR, cardSub));

    const priceRow = af("price", { dir: "HORIZONTAL", g: 2, ca: "MAX" });
    priceRow.appendChild(txt(`planPrice_${i}`, p.price || '', 36, FB, cardText));
    priceRow.appendChild(txt(`planPeriod_${i}`, p.period || '', 13, FR, cardSub));
    card.appendChild(priceRow);

    const feats = String(p.features || '').split(',').map(f => f.trim()).filter(Boolean);
    if (feats.length) {
      const list = af("features", { dir: "VERTICAL", g: 8 });
      feats.forEach((f, j) => list.appendChild(txt(`planFeature_${i}_${j}`, "✓ " + f, 12, FR, cardSub)));
      card.appendChild(list);
    }

    if (p.ctaText) {
      const btnBg = hl ? C.white : C.gray900;
      const btnColor = hl ? C.gray900 : C.white;
      const btn = af("cta", { dir: "HORIZONTAL", bg: btnBg, px: 20, py: 10, r: 8, ca: "CENTER", ma: "CENTER" });
      btn.resize(184, 40); btn.counterAxisSizingMode = "FIXED";
      btn.appendChild(txt(`planCta_${i}`, p.ctaText, 13, FM, btnColor, { align: "CENTER" }));
      card.appendChild(btn);
    }
    cards.appendChild(card);
  });
  root.appendChild(cards);
}

function buildTestimonials(root, content) {
  root.layoutMode = "VERTICAL"; root.resize(W, 100);
  root.paddingLeft = 80; root.paddingRight = 80; root.paddingTop = 80; root.paddingBottom = 80;
  root.itemSpacing = 32; root.counterAxisAlignItems = "CENTER";
  root.fills = [{ type: 'SOLID', color: C.gray50 }];

  root.appendChild(txt("title", content.title || 'Testimonials', 28, FB, C.gray900, { align: "CENTER" }));
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
    auth.appendChild(info);
    card.appendChild(auth);
    cards.appendChild(card);
  });
  root.appendChild(cards);
}

function buildFaq(root, content) {
  root.layoutMode = "VERTICAL"; root.resize(W, 100);
  root.paddingLeft = 80; root.paddingRight = 80; root.paddingTop = 80; root.paddingBottom = 80;
  root.itemSpacing = 32; root.counterAxisAlignItems = "CENTER";
  root.fills = [{ type: 'SOLID', color: C.white }];

  const header = af("header", { dir: "VERTICAL", g: 12, ca: "CENTER" });
  header.appendChild(txt("title", content.title || 'FAQ', 28, FB, C.gray900, { align: "CENTER" }));
  if (content.subtitle) header.appendChild(txt("subtitle", content.subtitle, 16, FR, C.gray500, { w: 500, align: "CENTER" }));
  root.appendChild(header);

  const list = af("questions", { dir: "VERTICAL", g: 0 });
  list.resize(700, 100); list.counterAxisSizingMode = "FIXED";
  const questions = Array.isArray(content.questions) ? content.questions : [];
  questions.forEach((q, i) => {
    const item = af(`qa_${i}`, { dir: "VERTICAL", py: 20, g: 8 });
    item.appendChild(txt(`question_${i}`, q.question || '', 15, FM, C.gray900));
    item.appendChild(txt(`answer_${i}`, q.answer || '', 13, FR, C.gray500, { w: 660 }));
    list.appendChild(item);
  });
  root.appendChild(list);
}

function buildCta(root, content) {
  root.layoutMode = "VERTICAL"; root.resize(W, 100);
  root.paddingLeft = 80; root.paddingRight = 80; root.paddingTop = 80; root.paddingBottom = 80;
  root.itemSpacing = 24; root.counterAxisAlignItems = "CENTER";
  root.fills = [{ type: 'SOLID', color: C.gray900 }];

  root.appendChild(txt("title", content.title || 'CTA', 28, FB, C.white, { align: "CENTER" }));
  if (content.subtitle) root.appendChild(txt("subtitle", content.subtitle, 16, FR, C.gray300, { w: 500, align: "CENTER" }));
  if (content.ctaText) {
    const btn = af("ctaButton", { dir: "HORIZONTAL", bg: C.white, px: 24, py: 12, r: 8, ca: "CENTER" });
    btn.appendChild(txt("ctaText", content.ctaText, 14, FM, C.gray900));
    root.appendChild(btn);
  }
}

function buildFooter(root, content) {
  root.layoutMode = "VERTICAL"; root.resize(W, 100);
  root.paddingLeft = 80; root.paddingRight = 80; root.paddingTop = 48; root.paddingBottom = 48;
  root.itemSpacing = 32;
  root.fills = [{ type: 'SOLID', color: C.gray900 }];

  const top = af("top", { dir: "HORIZONTAL", g: 48 });
  top.resize(W - 160, 100); top.counterAxisSizingMode = "FIXED";
  const logoCol = af("logoCol", { dir: "VERTICAL", g: 8 });
  logoCol.appendChild(txt("logo", content.logo || 'Logo', 16, FS, C.white));
  if (content.description) logoCol.appendChild(txt("description", content.description, 12, FR, C.gray400, { w: 200 }));
  top.appendChild(logoCol);

  const columns = Array.isArray(content.columns) ? content.columns : [];
  columns.forEach((col, i) => {
    const colFrame = af(`column_${i}`, { dir: "VERTICAL", g: 8 });
    colFrame.appendChild(txt(`columnTitle_${i}`, col.title || '', 13, FS, C.white));
    const links = String(col.links || '').split(',').map(l => l.trim()).filter(Boolean);
    links.forEach((l, j) => colFrame.appendChild(txt(`columnLink_${i}_${j}`, l, 12, FR, C.gray400)));
    top.appendChild(colFrame);
  });
  root.appendChild(top);

  root.appendChild(box(W - 160, 1, C.gray700));
  root.appendChild(txt("copyright", content.copyright || '', 12, FR, C.gray500));
}

function buildBlog(root, content) {
  root.layoutMode = "VERTICAL"; root.resize(W, 100);
  root.paddingLeft = 80; root.paddingRight = 80; root.paddingTop = 80; root.paddingBottom = 80;
  root.itemSpacing = 32; root.counterAxisAlignItems = "CENTER";
  root.fills = [{ type: 'SOLID', color: C.white }];

  const header = af("header", { dir: "VERTICAL", g: 12, ca: "CENTER" });
  header.appendChild(txt("title", content.title || 'Blog', 28, FB, C.gray900, { align: "CENTER" }));
  if (content.subtitle) header.appendChild(txt("subtitle", content.subtitle, 16, FR, C.gray500, { align: "CENTER" }));
  root.appendChild(header);

  const grid = af("posts", { dir: "HORIZONTAL", g: 24 });
  const posts = Array.isArray(content.posts) ? content.posts : [];
  posts.forEach((p, i) => {
    const card = af(`post_${i}`, { dir: "VERTICAL", g: 12 });
    card.resize(260, 100); card.counterAxisSizingMode = "FIXED";
    const img = box(260, 160, C.gray200, 12); img.name = `postImage_${i}`; card.appendChild(img);
    card.appendChild(txt(`postTitle_${i}`, p.title || '', 15, FS, C.gray900));
    card.appendChild(txt(`postExcerpt_${i}`, p.excerpt || '', 12, FR, C.gray500, { w: 260 }));
    card.appendChild(txt(`postMeta_${i}`, (p.author || '') + ' · ' + (p.date || ''), 11, FR, C.gray500));
    grid.appendChild(card);
  });
  root.appendChild(grid);
}

function buildAbout(root, content) {
  root.layoutMode = "HORIZONTAL"; root.resize(W, 100);
  root.paddingLeft = 80; root.paddingRight = 80; root.paddingTop = 80; root.paddingBottom = 80;
  root.itemSpacing = 48; root.counterAxisAlignItems = "CENTER";
  root.fills = [{ type: 'SOLID', color: C.white }];

  const textCol = af("text", { dir: "VERTICAL", g: 16 });
  textCol.resize(550, 100); textCol.counterAxisSizingMode = "FIXED";
  textCol.appendChild(txt("title", content.title || 'About', 28, FB, C.gray900));
  textCol.appendChild(txt("description", content.description || '', 16, FR, C.gray500, { w: 550 }));
  if (content.mission) textCol.appendChild(txt("mission", content.mission, 14, FR, C.gray500, { w: 550 }));
  root.appendChild(textCol);

  const img = box(480, 320, C.gray200, 16); img.name = "image"; root.appendChild(img);
}

function buildTeam(root, content) {
  root.layoutMode = "VERTICAL"; root.resize(W, 100);
  root.paddingLeft = 80; root.paddingRight = 80; root.paddingTop = 80; root.paddingBottom = 80;
  root.itemSpacing = 32; root.counterAxisAlignItems = "CENTER";
  root.fills = [{ type: 'SOLID', color: C.white }];

  const header = af("header", { dir: "VERTICAL", g: 12, ca: "CENTER" });
  header.appendChild(txt("title", content.title || 'Team', 28, FB, C.gray900, { align: "CENTER" }));
  if (content.subtitle) header.appendChild(txt("subtitle", content.subtitle, 16, FR, C.gray500, { align: "CENTER" }));
  root.appendChild(header);

  const grid = af("members", { dir: "HORIZONTAL", g: 32, ca: "CENTER" });
  const members = Array.isArray(content.members) ? content.members : [];
  members.forEach((m, i) => {
    const member = af(`member_${i}`, { dir: "VERTICAL", g: 8, ca: "CENTER" });
    const av = figma.createEllipse(); av.resize(80, 80); av.fills = [{ type: 'SOLID', color: C.gray300 }]; av.name = `avatar_${i}`;
    member.appendChild(av);
    member.appendChild(txt(`memberName_${i}`, m.name || '', 14, FM, C.gray900, { align: "CENTER" }));
    member.appendChild(txt(`memberRole_${i}`, m.role || '', 12, FR, C.gray500, { align: "CENTER" }));
    grid.appendChild(member);
  });
  root.appendChild(grid);
}

function buildGallery(root, content) {
  root.layoutMode = "VERTICAL"; root.resize(W, 100);
  root.paddingLeft = 80; root.paddingRight = 80; root.paddingTop = 80; root.paddingBottom = 80;
  root.itemSpacing = 32; root.counterAxisAlignItems = "CENTER";
  root.fills = [{ type: 'SOLID', color: C.white }];

  root.appendChild(txt("title", content.title || 'Gallery', 28, FB, C.gray900, { align: "CENTER" }));
  const grid = af("images", { dir: "HORIZONTAL", g: 16 });
  const images = Array.isArray(content.images) ? content.images : [];
  images.forEach((img, i) => {
    const card = af(`image_${i}`, { dir: "VERTICAL", g: 8 });
    card.resize(400, 100); card.counterAxisSizingMode = "FIXED";
    const placeholder = box(400, 240, C.gray200, 12); placeholder.name = `imagePlaceholder_${i}`; card.appendChild(placeholder);
    card.appendChild(txt(`caption_${i}`, img.caption || '', 12, FR, C.gray500));
    grid.appendChild(card);
  });
  root.appendChild(grid);
}

function buildContact(root, content) {
  root.layoutMode = "VERTICAL"; root.resize(W, 100);
  root.paddingLeft = 80; root.paddingRight = 80; root.paddingTop = 80; root.paddingBottom = 80;
  root.itemSpacing = 32; root.counterAxisAlignItems = "CENTER";
  root.fills = [{ type: 'SOLID', color: C.white }];

  root.appendChild(txt("title", content.title || 'Contact', 28, FB, C.gray900, { align: "CENTER" }));
  if (content.subtitle) root.appendChild(txt("subtitle", content.subtitle, 16, FR, C.gray500, { w: 500, align: "CENTER" }));
  const info = af("info", { dir: "HORIZONTAL", g: 32 });
  if (content.email) info.appendChild(txt("email", content.email, 13, FR, C.gray500));
  if (content.phone) info.appendChild(txt("phone", content.phone, 13, FR, C.gray500));
  if (content.address) info.appendChild(txt("address", content.address, 13, FR, C.gray500));
  root.appendChild(info);
}

function buildBanner(root, content) {
  root.layoutMode = "HORIZONTAL"; root.resize(W, 100);
  root.paddingLeft = 32; root.paddingRight = 32; root.paddingTop = 10; root.paddingBottom = 10;
  root.itemSpacing = 16; root.counterAxisAlignItems = "CENTER"; root.primaryAxisAlignItems = "CENTER";
  root.primaryAxisSizingMode = "FIXED";
  root.fills = [{ type: 'SOLID', color: C.gray900 }];

  root.appendChild(txt("text", content.text || '', 13, FR, C.white));
  if (content.ctaText) root.appendChild(txt("ctaText", content.ctaText, 13, FM, C.gray300));
}

function buildGeneric(root, content, category) {
  root.layoutMode = "VERTICAL"; root.resize(W, 100);
  root.paddingLeft = 80; root.paddingRight = 80; root.paddingTop = 64; root.paddingBottom = 64;
  root.itemSpacing = 16; root.counterAxisAlignItems = "CENTER";
  root.fills = [{ type: 'SOLID', color: C.white }];
  root.appendChild(txt("title", content.title || category, 28, FB, C.gray900, { align: "CENTER" }));
  if (content.subtitle) root.appendChild(txt("subtitle", content.subtitle, 16, FR, C.gray500, { w: 600, align: "CENTER" }));
}

const BUILDERS = {
  header: buildHeader, hero: buildHero, logos: buildLogos, features: buildFeatures,
  stats: buildStats, pricing: buildPricing, testimonials: buildTestimonials, faq: buildFaq,
  cta: buildCta, footer: buildFooter, blog: buildBlog, about: buildAbout, team: buildTeam,
  gallery: buildGallery, contact: buildContact, banner: buildBanner,
};

// ── Override text content on an instance ──
async function overrideText(instance, name, value) {
  const node = instance.findOne(n => n.name === name && n.type === "TEXT");
  if (node && value !== undefined && value !== null) {
    try {
      await figma.loadFontAsync(node.fontName);
      node.characters = String(value);
    } catch (e) { /* skip if font fails */ }
  }
}

async function overrideInstanceContent(instance, content, category) {
  // Override simple text fields
  const simpleFields = ['title', 'subtitle', 'logo', 'description', 'mission', 'copyright', 'email', 'phone', 'address', 'text', 'ctaText', 'ctaSecondaryText'];
  for (const field of simpleFields) {
    if (content[field] !== undefined) await overrideText(instance, field, content[field]);
  }

  // Override array fields based on category
  if (category === 'header' && Array.isArray(content.links)) {
    for (let i = 0; i < content.links.length; i++) {
      await overrideText(instance, `link_${i}`, content.links[i].label);
    }
  }
  if (category === 'features' && Array.isArray(content.features)) {
    for (let i = 0; i < content.features.length; i++) {
      await overrideText(instance, `featureTitle_${i}`, content.features[i].title);
      await overrideText(instance, `featureDesc_${i}`, content.features[i].description);
    }
  }
  if (category === 'stats' && Array.isArray(content.stats)) {
    for (let i = 0; i < content.stats.length; i++) {
      await overrideText(instance, `statValue_${i}`, content.stats[i].value);
      await overrideText(instance, `statLabel_${i}`, content.stats[i].label);
    }
  }
  if (category === 'pricing' && Array.isArray(content.plans)) {
    for (let i = 0; i < content.plans.length; i++) {
      await overrideText(instance, `planName_${i}`, content.plans[i].name);
      await overrideText(instance, `planDesc_${i}`, content.plans[i].description);
      await overrideText(instance, `planPrice_${i}`, content.plans[i].price);
      await overrideText(instance, `planPeriod_${i}`, content.plans[i].period);
      await overrideText(instance, `planCta_${i}`, content.plans[i].ctaText);
    }
  }
  if (category === 'testimonials' && Array.isArray(content.testimonials)) {
    for (let i = 0; i < content.testimonials.length; i++) {
      await overrideText(instance, `quote_${i}`, '"' + content.testimonials[i].quote + '"');
      await overrideText(instance, `author_${i}`, content.testimonials[i].author);
      await overrideText(instance, `role_${i}`, content.testimonials[i].role);
    }
  }
  if (category === 'faq' && Array.isArray(content.questions)) {
    for (let i = 0; i < content.questions.length; i++) {
      await overrideText(instance, `question_${i}`, content.questions[i].question);
      await overrideText(instance, `answer_${i}`, content.questions[i].answer);
    }
  }
  if (category === 'blog' && Array.isArray(content.posts)) {
    for (let i = 0; i < content.posts.length; i++) {
      await overrideText(instance, `postTitle_${i}`, content.posts[i].title);
      await overrideText(instance, `postExcerpt_${i}`, content.posts[i].excerpt);
      await overrideText(instance, `postMeta_${i}`, (content.posts[i].author || '') + ' · ' + (content.posts[i].date || ''));
    }
  }
  if (category === 'team' && Array.isArray(content.members)) {
    for (let i = 0; i < content.members.length; i++) {
      await overrideText(instance, `memberName_${i}`, content.members[i].name);
      await overrideText(instance, `memberRole_${i}`, content.members[i].role);
    }
  }
  if (category === 'gallery' && Array.isArray(content.images)) {
    for (let i = 0; i < content.images.length; i++) {
      await overrideText(instance, `caption_${i}`, content.images[i].caption);
    }
  }
  if (category === 'footer' && Array.isArray(content.columns)) {
    for (let i = 0; i < content.columns.length; i++) {
      await overrideText(instance, `columnTitle_${i}`, content.columns[i].title);
    }
  }
}

// ── Variant name from variantId ──
function getVariantName(variantId) {
  // "hero-centered" -> "Centered", "features-3-column-grid" -> "3 Column Grid"
  const parts = variantId.split('-').slice(1);
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || 'Default';
}

function getCategoryLabel(category) {
  const labels = {
    header: 'Header', hero: 'Hero', logos: 'Logo Cloud', features: 'Features',
    stats: 'Stats', pricing: 'Pricing', testimonials: 'Testimonials', faq: 'FAQ',
    cta: 'CTA', footer: 'Footer', blog: 'Blog', about: 'About', team: 'Team',
    gallery: 'Gallery', contact: 'Contact', banner: 'Banner', showcase: 'Showcase', error: 'Error Page', process: 'How It Works', downloads: 'Downloads', comparison: 'Comparison', store: 'Store',
  };
  return labels[category] || category;
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

    // ── Phase 0: Collect used categories and variants ──
    figma.ui.postMessage({ type: 'progress', message: 'Analyzing sections...' });

    const usedVariants = new Map(); // category -> Set of variantIds
    for (const page of project.pages) {
      for (const section of (page.sections || [])) {
        if (!usedVariants.has(section.category)) usedVariants.set(section.category, new Set());
        usedVariants.get(section.category).add(section.variantId);
      }
    }

    // ── Phase 1: Create Components page ──
    figma.ui.postMessage({ type: 'progress', message: 'Building components...' });

    const componentsPage = figma.createPage();
    componentsPage.name = "⬡ Components";

    const componentSets = {}; // category -> { variantId -> ComponentNode }

    let compX = 0;
    for (const [category, variantIds] of usedVariants) {
      const components = [];
      const categoryComps = {};

      for (const variantId of variantIds) {
        const variantName = getVariantName(variantId);
        const comp = figma.createComponent();
        comp.name = `Variant=${variantName}`;

        // Build the section layout inside the component
        const builder = BUILDERS[category] || buildGeneric;
        // Use empty/default content for the component definition
        const defaultContent = getDefaultContent(category);
        builder(comp, defaultContent, category);

        comp.x = compX;
        comp.y = 0;
        componentsPage.appendChild(comp);
        components.push(comp);
        categoryComps[variantId] = comp;
      }

      // Combine into component set
      if (components.length > 1) {
        const set = figma.combineAsVariants(components, componentsPage);
        set.name = getCategoryLabel(category);
        set.x = compX;
        set.y = 0;
      } else if (components.length === 1) {
        components[0].name = getCategoryLabel(category);
      }

      componentSets[category] = categoryComps;
      compX += W + 100;
    }

    // ── Phase 2: Create pages with instances ──
    let totalSections = 0;

    for (let i = 0; i < project.pages.length; i++) {
      const pageData = project.pages[i];
      const sections = pageData.sections || [];

      figma.ui.postMessage({ type: 'progress', message: `Building page "${pageData.name}" (${sections.length} sections)...` });

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

          // Override text content
          await overrideInstanceContent(instance, section.content, section.category);

          pageFrame.appendChild(instance);
          instance.layoutSizingHorizontal = "FILL";
          totalSections++;
        } catch (err) {
          console.error(`Error creating instance for ${section.category}:`, err);
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

// ── Default content for component definitions ──
function getDefaultContent(category) {
  const defaults = {
    header: { logo: 'Logo', links: [{ label: 'Features' }, { label: 'Pricing' }, { label: 'About' }], ctaText: 'Get Started' },
    hero: { title: 'Build something amazing', subtitle: 'A short description of your product or service.', ctaText: 'Get Started', ctaSecondaryText: 'Learn More' },
    logos: { title: 'Trusted by leading companies', logos: [{ name: 'Acme' }, { name: 'Globex' }, { name: 'Initech' }, { name: 'Umbrella' }, { name: 'Stark' }] },
    features: { title: 'Features', subtitle: 'Everything you need.', features: [{ title: 'Feature 1', description: 'Description' }, { title: 'Feature 2', description: 'Description' }, { title: 'Feature 3', description: 'Description' }] },
    stats: { title: 'Stats', stats: [{ value: '10K+', label: 'Users' }, { value: '99%', label: 'Uptime' }, { value: '150+', label: 'Countries' }] },
    pricing: { title: 'Pricing', subtitle: 'Simple pricing.', plans: [{ name: 'Free', price: '$0', period: '/mo', description: 'For individuals', features: 'Feature 1, Feature 2', ctaText: 'Start', highlighted: false }, { name: 'Pro', price: '$29', period: '/mo', description: 'For teams', features: 'All Free features, Feature 3', ctaText: 'Start', highlighted: true }] },
    testimonials: { title: 'Testimonials', testimonials: [{ quote: 'Great product!', author: 'Jane', role: 'CEO' }, { quote: 'Love it!', author: 'John', role: 'CTO' }, { quote: 'Amazing!', author: 'Sarah', role: 'Designer' }] },
    faq: { title: 'FAQ', subtitle: 'Common questions.', questions: [{ question: 'Question 1?', answer: 'Answer 1.' }, { question: 'Question 2?', answer: 'Answer 2.' }] },
    cta: { title: 'Ready to start?', subtitle: 'Join thousands of users.', ctaText: 'Get Started' },
    footer: { logo: 'Logo', description: 'Description.', copyright: '© 2024', columns: [{ title: 'Product', links: 'Features, Pricing' }, { title: 'Company', links: 'About, Blog' }] },
    blog: { title: 'Blog', subtitle: 'Latest posts.', posts: [{ title: 'Post 1', excerpt: 'Excerpt.', author: 'Author', date: 'Jan 1' }, { title: 'Post 2', excerpt: 'Excerpt.', author: 'Author', date: 'Jan 2' }] },
    about: { title: 'About', description: 'Company description.', mission: 'Our mission.' },
    team: { title: 'Team', subtitle: 'Our people.', members: [{ name: 'Jane', role: 'CEO' }, { name: 'John', role: 'CTO' }] },
    gallery: { title: 'Gallery', subtitle: 'Our work.', images: [{ caption: 'Project 1' }, { caption: 'Project 2' }, { caption: 'Project 3' }] },
    contact: { title: 'Contact', subtitle: 'Get in touch.', email: 'hello@example.com', phone: '+1 555-0000' },
    banner: { text: 'Announcement text here.', ctaText: 'Learn More' },
  };
  return defaults[category] || { title: category };
}
