// Structr Figma Plugin — Wireframe Import
// Receives a Structr project JSON and creates:
// 1. A "Components" page with component sets (one per category, variants inside)
// 2. One page per project page, each with a vertical frame of section instances

figma.showUI(__html__, { width: 380, height: 480 });

// ── Color Constants (Wireframe Grayscale) ──
const COLORS = {
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

const DARK_COLORS = {
  bg: COLORS.gray900,
  bgAlt: { r: 0.15, g: 0.15, b: 0.15 },
  text: COLORS.white,
  textSecondary: COLORS.gray300,
  textMuted: COLORS.gray400,
  placeholder: COLORS.gray700,
  avatar: COLORS.gray600,
  btnPrimary: COLORS.white,
  btnPrimaryText: COLORS.gray900,
  btnSecondary: COLORS.gray600,
  border: COLORS.gray700,
};

const LIGHT_COLORS = {
  bg: COLORS.white,
  bgAlt: COLORS.gray50,
  text: COLORS.gray900,
  textSecondary: COLORS.gray600,
  textMuted: COLORS.gray400,
  placeholder: COLORS.gray200,
  avatar: COLORS.gray300,
  btnPrimary: COLORS.gray900,
  btnPrimaryText: COLORS.white,
  btnSecondary: COLORS.gray300,
  border: COLORS.gray200,
};

function getTheme(colorMode) {
  return colorMode === 'dark' ? DARK_COLORS : LIGHT_COLORS;
}

// ── Font Loading ──
const FONT_REGULAR = { family: "Inter", style: "Regular" };
const FONT_MEDIUM = { family: "Inter", style: "Medium" };
const FONT_SEMIBOLD = { family: "Inter", style: "Semi Bold" };
const FONT_BOLD = { family: "Inter", style: "Bold" };

async function loadFonts() {
  await figma.loadFontAsync(FONT_REGULAR);
  await figma.loadFontAsync(FONT_MEDIUM);
  await figma.loadFontAsync(FONT_SEMIBOLD);
  await figma.loadFontAsync(FONT_BOLD);
}

// ── Primitive Builders ──

function createTextNode(text, fontSize, fontName, color, opts = {}) {
  const t = figma.createText();
  t.characters = String(text || '');
  t.fontSize = fontSize;
  t.fontName = fontName;
  t.fills = [{ type: 'SOLID', color }];
  if (opts.width) {
    t.resize(opts.width, t.height);
    t.textAutoResize = "HEIGHT";
  }
  if (opts.align) t.textAlignHorizontal = opts.align;
  if (opts.name) t.name = opts.name;
  return t;
}

function createBox(w, h, color, opts = {}) {
  const r = figma.createRectangle();
  r.resize(w, h);
  r.fills = [{ type: 'SOLID', color }];
  if (opts.radius) r.cornerRadius = opts.radius;
  if (opts.name) r.name = opts.name;
  if (opts.stroke) {
    r.strokes = [{ type: 'SOLID', color: opts.stroke }];
    r.strokeWeight = 1;
    r.strokeAlign = "INSIDE";
  }
  return r;
}

function createAutoFrame(name, opts = {}) {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = opts.direction || "VERTICAL";
  if (opts.width) f.resize(opts.width, opts.height || 10);
  f.primaryAxisSizingMode = opts.fixedHeight ? "FIXED" : "AUTO";
  f.counterAxisSizingMode = opts.fixedWidth ? "FIXED" : "AUTO";
  f.fills = opts.fill ? [{ type: 'SOLID', color: opts.fill }] : [];
  if (opts.padding) {
    f.paddingTop = opts.padding;
    f.paddingBottom = opts.padding;
    f.paddingLeft = opts.padding;
    f.paddingRight = opts.padding;
  }
  if (opts.paddingX) { f.paddingLeft = opts.paddingX; f.paddingRight = opts.paddingX; }
  if (opts.paddingY) { f.paddingTop = opts.paddingY; f.paddingBottom = opts.paddingY; }
  if (opts.gap !== undefined) f.itemSpacing = opts.gap;
  if (opts.align) f.counterAxisAlignItems = opts.align;
  if (opts.mainAlign) f.primaryAxisAlignItems = opts.mainAlign;
  if (opts.radius) f.cornerRadius = opts.radius;
  if (opts.stroke) {
    f.strokes = [{ type: 'SOLID', color: opts.stroke }];
    f.strokeWeight = 1;
    f.strokeAlign = "INSIDE";
  }
  return f;
}

// ── Section Builders ──
// Each returns a frame representing the section.
// The frame dimensions target 1440px width.

const PAGE_WIDTH = 1440;
const CONTENT_PADDING = 80;

function buildSection(section) {
  const { category, variantId, content, colorMode } = section;
  const c = getTheme(colorMode || 'light');

  // Dispatch to category builder
  const builder = SECTION_BUILDERS[category];
  if (builder) {
    return builder(content, c, variantId);
  }
  // Fallback: generic placeholder
  return buildGenericSection(content, c, category);
}

function buildGenericSection(content, c, category) {
  const frame = createAutoFrame(category, {
    direction: "VERTICAL", width: PAGE_WIDTH, fill: c.bg,
    paddingX: CONTENT_PADDING, paddingY: 64, gap: 16, align: "CENTER"
  });
  const title = createTextNode(content.title || category, 28, FONT_BOLD, c.text, { name: "title", align: "CENTER" });
  frame.appendChild(title);
  if (content.subtitle) {
    const sub = createTextNode(content.subtitle, 16, FONT_REGULAR, c.textSecondary, { name: "subtitle", width: 600, align: "CENTER" });
    frame.appendChild(sub);
  }
  return frame;
}

// ── Header ──
function buildHeader(content, c) {
  const frame = createAutoFrame("Header", {
    direction: "HORIZONTAL", width: PAGE_WIDTH, fill: c.bg,
    paddingX: 32, paddingY: 16, gap: 32, align: "CENTER"
  });
  frame.primaryAxisSizingMode = "FIXED";
  frame.counterAxisSizingMode = "AUTO";

  const logo = createTextNode(content.logo || 'Logo', 16, FONT_SEMIBOLD, c.text, { name: "logo" });
  frame.appendChild(logo);

  // Nav links
  const nav = createAutoFrame("nav", { direction: "HORIZONTAL", gap: 24, align: "CENTER" });
  const links = Array.isArray(content.links) ? content.links : [];
  for (const link of links) {
    const t = createTextNode(link.label || '', 13, FONT_REGULAR, c.textSecondary, { name: "link" });
    nav.appendChild(t);
  }
  nav.layoutGrow = 1;
  frame.appendChild(nav);

  if (content.ctaText) {
    const btn = createAutoFrame("cta", {
      direction: "HORIZONTAL", fill: c.btnPrimary,
      paddingX: 16, paddingY: 8, radius: 8, align: "CENTER"
    });
    const btnText = createTextNode(content.ctaText, 13, FONT_MEDIUM, c.btnPrimaryText, { name: "ctaText" });
    btn.appendChild(btnText);
    frame.appendChild(btn);
  }

  return frame;
}

// ── Hero ──
function buildHero(content, c) {
  const frame = createAutoFrame("Hero", {
    direction: "VERTICAL", width: PAGE_WIDTH, fill: c.bgAlt,
    paddingX: CONTENT_PADDING, paddingY: 80, gap: 24, align: "CENTER"
  });

  const title = createTextNode(content.title || 'Headline', 48, FONT_BOLD, c.text, { name: "title", width: 700, align: "CENTER" });
  frame.appendChild(title);

  if (content.subtitle) {
    const sub = createTextNode(content.subtitle, 18, FONT_REGULAR, c.textSecondary, { name: "subtitle", width: 600, align: "CENTER" });
    frame.appendChild(sub);
  }

  const showPrimary = content.showPrimaryButton !== false && content.ctaText;
  const showSecondary = content.showSecondaryButton && content.ctaSecondaryText;

  if (showPrimary || showSecondary) {
    const btns = createAutoFrame("buttons", { direction: "HORIZONTAL", gap: 12 });
    if (showPrimary) {
      const btn = createAutoFrame("primaryButton", {
        direction: "HORIZONTAL", fill: c.btnPrimary,
        paddingX: 24, paddingY: 12, radius: 8, align: "CENTER"
      });
      btn.appendChild(createTextNode(content.ctaText, 14, FONT_MEDIUM, c.btnPrimaryText, { name: "ctaText" }));
      btns.appendChild(btn);
    }
    if (showSecondary) {
      const btn = createAutoFrame("secondaryButton", {
        direction: "HORIZONTAL", stroke: c.btnSecondary,
        paddingX: 24, paddingY: 12, radius: 8, align: "CENTER"
      });
      btn.appendChild(createTextNode(content.ctaSecondaryText, 14, FONT_MEDIUM, c.textSecondary, { name: "ctaSecondaryText" }));
      btns.appendChild(btn);
    }
    frame.appendChild(btns);
  }

  return frame;
}

// ── Features ──
function buildFeatures(content, c) {
  const frame = createAutoFrame("Features", {
    direction: "VERTICAL", width: PAGE_WIDTH, fill: c.bg,
    paddingX: CONTENT_PADDING, paddingY: 80, gap: 40, align: "CENTER"
  });

  const header = createAutoFrame("header", { direction: "VERTICAL", gap: 12, align: "CENTER" });
  header.appendChild(createTextNode(content.title || 'Features', 28, FONT_BOLD, c.text, { name: "title", align: "CENTER" }));
  if (content.subtitle) {
    header.appendChild(createTextNode(content.subtitle, 16, FONT_REGULAR, c.textSecondary, { name: "subtitle", width: 500, align: "CENTER" }));
  }
  frame.appendChild(header);

  const grid = createAutoFrame("grid", { direction: "HORIZONTAL", gap: 24 });
  const features = Array.isArray(content.features) ? content.features : [];
  for (const feat of features) {
    const card = createAutoFrame("feature", {
      direction: "VERTICAL", fill: c.bgAlt, paddingX: 24, paddingY: 24, gap: 12, radius: 12
    });
    card.resize(260, 10);
    card.counterAxisSizingMode = "FIXED";
    const icon = createBox(32, 32, c.placeholder, { radius: 8, name: "icon" });
    card.appendChild(icon);
    card.appendChild(createTextNode(feat.title || '', 15, FONT_SEMIBOLD, c.text, { name: "featureTitle" }));
    card.appendChild(createTextNode(feat.description || '', 13, FONT_REGULAR, c.textSecondary, { name: "featureDesc", width: 212 }));
    grid.appendChild(card);
  }
  frame.appendChild(grid);

  return frame;
}

// ── Stats ──
function buildStats(content, c) {
  const frame = createAutoFrame("Stats", {
    direction: "VERTICAL", width: PAGE_WIDTH, fill: c.bg,
    paddingX: CONTENT_PADDING, paddingY: 64, gap: 32, align: "CENTER"
  });

  frame.appendChild(createTextNode(content.title || 'Stats', 28, FONT_BOLD, c.text, { name: "title", align: "CENTER" }));

  const row = createAutoFrame("stats", { direction: "HORIZONTAL", gap: 48 });
  const stats = Array.isArray(content.stats) ? content.stats : [];
  for (const stat of stats) {
    const item = createAutoFrame("stat", { direction: "VERTICAL", gap: 4, align: "CENTER" });
    item.appendChild(createTextNode(stat.value || '', 36, FONT_BOLD, c.text, { name: "value", align: "CENTER" }));
    item.appendChild(createTextNode(stat.label || '', 13, FONT_REGULAR, c.textSecondary, { name: "label", align: "CENTER" }));
    row.appendChild(item);
  }
  frame.appendChild(row);

  return frame;
}

// ── Pricing ──
function buildPricing(content, c) {
  const frame = createAutoFrame("Pricing", {
    direction: "VERTICAL", width: PAGE_WIDTH, fill: c.bg,
    paddingX: CONTENT_PADDING, paddingY: 80, gap: 40, align: "CENTER"
  });

  const header = createAutoFrame("header", { direction: "VERTICAL", gap: 12, align: "CENTER" });
  header.appendChild(createTextNode(content.title || 'Pricing', 28, FONT_BOLD, c.text, { name: "title", align: "CENTER" }));
  if (content.subtitle) {
    header.appendChild(createTextNode(content.subtitle, 16, FONT_REGULAR, c.textSecondary, { name: "subtitle", align: "CENTER" }));
  }
  frame.appendChild(header);

  const cards = createAutoFrame("plans", { direction: "HORIZONTAL", gap: 24 });
  const plans = Array.isArray(content.plans) ? content.plans : [];
  for (const plan of plans) {
    const hl = plan.highlighted === true || plan.highlighted === 'true';
    const cardBg = hl ? c.btnPrimary : c.bg;
    const cardText = hl ? c.btnPrimaryText : c.text;
    const cardSub = hl ? (c === DARK_COLORS ? COLORS.gray500 : COLORS.gray300) : c.textSecondary;

    const card = createAutoFrame("plan", {
      direction: "VERTICAL", fill: cardBg, paddingX: 28, paddingY: 28, gap: 16, radius: 16,
      stroke: hl ? undefined : c.border
    });
    card.resize(240, 10);
    card.counterAxisSizingMode = "FIXED";

    card.appendChild(createTextNode(plan.name || '', 16, FONT_SEMIBOLD, cardText, { name: "planName" }));
    card.appendChild(createTextNode(plan.description || '', 12, FONT_REGULAR, cardSub, { name: "planDesc" }));

    const priceRow = createAutoFrame("price", { direction: "HORIZONTAL", gap: 2, align: "MAX" });
    priceRow.appendChild(createTextNode(plan.price || '', 36, FONT_BOLD, cardText, { name: "price" }));
    priceRow.appendChild(createTextNode(plan.period || '', 13, FONT_REGULAR, cardSub, { name: "period" }));
    card.appendChild(priceRow);

    // Features list
    const featuresList = String(plan.features || '').split(',').map(f => f.trim()).filter(Boolean);
    if (featuresList.length > 0) {
      const list = createAutoFrame("features", { direction: "VERTICAL", gap: 8 });
      for (const f of featuresList) {
        list.appendChild(createTextNode("✓ " + f, 12, FONT_REGULAR, cardSub, { name: "feature" }));
      }
      card.appendChild(list);
    }

    // CTA button
    if (plan.ctaText) {
      const btnBg = hl ? c.btnPrimaryText : c.btnPrimary;
      const btnColor = hl ? c.btnPrimary : c.btnPrimaryText;
      const btn = createAutoFrame("cta", {
        direction: "HORIZONTAL", fill: btnBg,
        paddingX: 20, paddingY: 10, radius: 8, align: "CENTER", mainAlign: "CENTER"
      });
      btn.counterAxisSizingMode = "FIXED";
      btn.resize(184, 10);
      btn.appendChild(createTextNode(plan.ctaText, 13, FONT_MEDIUM, btnColor, { name: "ctaText", align: "CENTER" }));
      card.appendChild(btn);
    }

    cards.appendChild(card);
  }
  frame.appendChild(cards);

  return frame;
}

// ── Testimonials ──
function buildTestimonials(content, c) {
  const frame = createAutoFrame("Testimonials", {
    direction: "VERTICAL", width: PAGE_WIDTH, fill: c.bgAlt,
    paddingX: CONTENT_PADDING, paddingY: 80, gap: 32, align: "CENTER"
  });

  frame.appendChild(createTextNode(content.title || 'Testimonials', 28, FONT_BOLD, c.text, { name: "title", align: "CENTER" }));

  const cards = createAutoFrame("testimonials", { direction: "HORIZONTAL", gap: 24 });
  const items = Array.isArray(content.testimonials) ? content.testimonials : [];
  for (const item of items) {
    const card = createAutoFrame("testimonial", {
      direction: "VERTICAL", fill: c.bg, paddingX: 24, paddingY: 24, gap: 16, radius: 12
    });
    card.resize(280, 10);
    card.counterAxisSizingMode = "FIXED";

    card.appendChild(createTextNode('"' + (item.quote || '') + '"', 13, FONT_REGULAR, c.textSecondary, { name: "quote", width: 232 }));

    const author = createAutoFrame("author", { direction: "HORIZONTAL", gap: 10, align: "CENTER" });
    const avatar = figma.createEllipse();
    avatar.resize(36, 36);
    avatar.fills = [{ type: 'SOLID', color: c.avatar }];
    avatar.name = "avatar";
    author.appendChild(avatar);

    const info = createAutoFrame("info", { direction: "VERTICAL", gap: 2 });
    info.appendChild(createTextNode(item.author || '', 13, FONT_MEDIUM, c.text, { name: "author" }));
    info.appendChild(createTextNode(item.role || '', 11, FONT_REGULAR, c.textMuted, { name: "role" }));
    author.appendChild(info);
    card.appendChild(author);
    cards.appendChild(card);
  }
  frame.appendChild(cards);

  return frame;
}

// ── FAQ ──
function buildFaq(content, c) {
  const frame = createAutoFrame("FAQ", {
    direction: "VERTICAL", width: PAGE_WIDTH, fill: c.bg,
    paddingX: CONTENT_PADDING, paddingY: 80, gap: 32, align: "CENTER"
  });

  const header = createAutoFrame("header", { direction: "VERTICAL", gap: 12, align: "CENTER" });
  header.appendChild(createTextNode(content.title || 'FAQ', 28, FONT_BOLD, c.text, { name: "title", align: "CENTER" }));
  if (content.subtitle) {
    header.appendChild(createTextNode(content.subtitle, 16, FONT_REGULAR, c.textSecondary, { name: "subtitle", width: 500, align: "CENTER" }));
  }
  frame.appendChild(header);

  const list = createAutoFrame("questions", { direction: "VERTICAL", gap: 0 });
  list.resize(700, 10);
  list.counterAxisSizingMode = "FIXED";
  const questions = Array.isArray(content.questions) ? content.questions : [];
  for (const q of questions) {
    const item = createAutoFrame("qa", {
      direction: "VERTICAL", paddingY: 20, gap: 8, stroke: c.border
    });
    item.strokeBottomWeight = 1;
    item.strokeTopWeight = 0;
    item.strokeLeftWeight = 0;
    item.strokeRightWeight = 0;
    item.appendChild(createTextNode(q.question || '', 15, FONT_MEDIUM, c.text, { name: "question" }));
    item.appendChild(createTextNode(q.answer || '', 13, FONT_REGULAR, c.textSecondary, { name: "answer", width: 660 }));
    list.appendChild(item);
  }
  frame.appendChild(list);

  return frame;
}

// ── CTA ──
function buildCta(content, c) {
  // CTA sections are always dark-on-dark
  const frame = createAutoFrame("CTA", {
    direction: "VERTICAL", width: PAGE_WIDTH, fill: COLORS.gray900,
    paddingX: CONTENT_PADDING, paddingY: 80, gap: 24, align: "CENTER"
  });

  frame.appendChild(createTextNode(content.title || 'CTA', 28, FONT_BOLD, COLORS.white, { name: "title", align: "CENTER" }));
  if (content.subtitle) {
    frame.appendChild(createTextNode(content.subtitle, 16, FONT_REGULAR, COLORS.gray300, { name: "subtitle", width: 500, align: "CENTER" }));
  }

  const showPrimary = content.showPrimaryButton !== false && content.ctaText;
  if (showPrimary) {
    const btn = createAutoFrame("primaryButton", {
      direction: "HORIZONTAL", fill: COLORS.white,
      paddingX: 24, paddingY: 12, radius: 8, align: "CENTER"
    });
    btn.appendChild(createTextNode(content.ctaText, 14, FONT_MEDIUM, COLORS.gray900, { name: "ctaText" }));
    frame.appendChild(btn);
  }

  return frame;
}

// ── Footer ──
function buildFooter(content, c) {
  const frame = createAutoFrame("Footer", {
    direction: "VERTICAL", width: PAGE_WIDTH, fill: COLORS.gray900,
    paddingX: CONTENT_PADDING, paddingY: 48, gap: 32
  });

  const top = createAutoFrame("top", { direction: "HORIZONTAL", gap: 48 });
  top.resize(PAGE_WIDTH - CONTENT_PADDING * 2, 10);
  top.counterAxisSizingMode = "FIXED";

  // Logo column
  const logoCol = createAutoFrame("logoCol", { direction: "VERTICAL", gap: 8 });
  logoCol.appendChild(createTextNode(content.logo || 'Logo', 16, FONT_SEMIBOLD, COLORS.white, { name: "logo" }));
  if (content.description) {
    logoCol.appendChild(createTextNode(content.description, 12, FONT_REGULAR, COLORS.gray400, { name: "description", width: 200 }));
  }
  top.appendChild(logoCol);

  // Link columns
  const columns = Array.isArray(content.columns) ? content.columns : [];
  for (const col of columns) {
    const colFrame = createAutoFrame("column", { direction: "VERTICAL", gap: 8 });
    colFrame.appendChild(createTextNode(col.title || '', 13, FONT_SEMIBOLD, COLORS.white, { name: "columnTitle" }));
    const links = String(col.links || '').split(',').map(l => l.trim()).filter(Boolean);
    for (const link of links) {
      colFrame.appendChild(createTextNode(link, 12, FONT_REGULAR, COLORS.gray400, { name: "link" }));
    }
    top.appendChild(colFrame);
  }
  frame.appendChild(top);

  // Copyright
  if (content.copyright) {
    const divider = createBox(PAGE_WIDTH - CONTENT_PADDING * 2, 1, COLORS.gray700, { name: "divider" });
    frame.appendChild(divider);
    frame.appendChild(createTextNode(content.copyright, 12, FONT_REGULAR, COLORS.gray500, { name: "copyright" }));
  }

  return frame;
}

// ── Logos ──
function buildLogos(content, c) {
  const frame = createAutoFrame("Logos", {
    direction: "VERTICAL", width: PAGE_WIDTH, fill: c.bg,
    paddingX: CONTENT_PADDING, paddingY: 40, gap: 20, align: "CENTER"
  });

  frame.appendChild(createTextNode(content.title || '', 12, FONT_REGULAR, c.textMuted, { name: "title", align: "CENTER" }));

  const row = createAutoFrame("logos", { direction: "HORIZONTAL", gap: 40, align: "CENTER" });
  const logos = Array.isArray(content.logos) ? content.logos : [];
  for (const logo of logos) {
    const rect = createBox(80, 32, c.placeholder, { radius: 6, name: logo.name || "logo" });
    row.appendChild(rect);
  }
  frame.appendChild(row);

  return frame;
}

// ── Blog ──
function buildBlog(content, c) {
  const frame = createAutoFrame("Blog", {
    direction: "VERTICAL", width: PAGE_WIDTH, fill: c.bg,
    paddingX: CONTENT_PADDING, paddingY: 80, gap: 32, align: "CENTER"
  });

  const header = createAutoFrame("header", { direction: "VERTICAL", gap: 12, align: "CENTER" });
  header.appendChild(createTextNode(content.title || 'Blog', 28, FONT_BOLD, c.text, { name: "title", align: "CENTER" }));
  if (content.subtitle) {
    header.appendChild(createTextNode(content.subtitle, 16, FONT_REGULAR, c.textSecondary, { name: "subtitle", align: "CENTER" }));
  }
  frame.appendChild(header);

  const grid = createAutoFrame("posts", { direction: "HORIZONTAL", gap: 24 });
  const posts = Array.isArray(content.posts) ? content.posts : [];
  for (const post of posts) {
    const card = createAutoFrame("post", { direction: "VERTICAL", gap: 12 });
    card.resize(260, 10);
    card.counterAxisSizingMode = "FIXED";
    card.appendChild(createBox(260, 160, c.placeholder, { radius: 12, name: "image" }));
    card.appendChild(createTextNode(post.title || '', 15, FONT_SEMIBOLD, c.text, { name: "postTitle" }));
    card.appendChild(createTextNode(post.excerpt || '', 12, FONT_REGULAR, c.textSecondary, { name: "excerpt", width: 260 }));
    card.appendChild(createTextNode((post.author || '') + ' · ' + (post.date || ''), 11, FONT_REGULAR, c.textMuted, { name: "meta" }));
    grid.appendChild(card);
  }
  frame.appendChild(grid);

  return frame;
}

// ── Contact ──
function buildContact(content, c) {
  const frame = createAutoFrame("Contact", {
    direction: "VERTICAL", width: PAGE_WIDTH, fill: c.bg,
    paddingX: CONTENT_PADDING, paddingY: 80, gap: 32, align: "CENTER"
  });

  frame.appendChild(createTextNode(content.title || 'Contact', 28, FONT_BOLD, c.text, { name: "title", align: "CENTER" }));
  if (content.subtitle) {
    frame.appendChild(createTextNode(content.subtitle, 16, FONT_REGULAR, c.textSecondary, { name: "subtitle", width: 500, align: "CENTER" }));
  }

  const info = createAutoFrame("info", { direction: "HORIZONTAL", gap: 32 });
  if (content.email) info.appendChild(createTextNode(content.email, 13, FONT_REGULAR, c.textSecondary, { name: "email" }));
  if (content.phone) info.appendChild(createTextNode(content.phone, 13, FONT_REGULAR, c.textSecondary, { name: "phone" }));
  frame.appendChild(info);

  return frame;
}

// ── About ──
function buildAbout(content, c) {
  const frame = createAutoFrame("About", {
    direction: "HORIZONTAL", width: PAGE_WIDTH, fill: c.bg,
    paddingX: CONTENT_PADDING, paddingY: 80, gap: 48, align: "CENTER"
  });

  const text = createAutoFrame("text", { direction: "VERTICAL", gap: 16 });
  text.resize(550, 10);
  text.counterAxisSizingMode = "FIXED";
  text.appendChild(createTextNode(content.title || 'About', 28, FONT_BOLD, c.text, { name: "title" }));
  text.appendChild(createTextNode(content.description || '', 16, FONT_REGULAR, c.textSecondary, { name: "description", width: 550 }));
  if (content.mission) {
    text.appendChild(createTextNode(content.mission, 14, FONT_REGULAR, c.textSecondary, { name: "mission", width: 550 }));
  }
  frame.appendChild(text);

  const img = createBox(480, 320, c.placeholder, { radius: 16, name: "image" });
  frame.appendChild(img);

  return frame;
}

// ── Team ──
function buildTeam(content, c) {
  const frame = createAutoFrame("Team", {
    direction: "VERTICAL", width: PAGE_WIDTH, fill: c.bg,
    paddingX: CONTENT_PADDING, paddingY: 80, gap: 32, align: "CENTER"
  });

  const header = createAutoFrame("header", { direction: "VERTICAL", gap: 12, align: "CENTER" });
  header.appendChild(createTextNode(content.title || 'Team', 28, FONT_BOLD, c.text, { name: "title", align: "CENTER" }));
  if (content.subtitle) {
    header.appendChild(createTextNode(content.subtitle, 16, FONT_REGULAR, c.textSecondary, { name: "subtitle", align: "CENTER" }));
  }
  frame.appendChild(header);

  const grid = createAutoFrame("members", { direction: "HORIZONTAL", gap: 32, align: "CENTER" });
  const members = Array.isArray(content.members) ? content.members : [];
  for (const m of members) {
    const member = createAutoFrame("member", { direction: "VERTICAL", gap: 8, align: "CENTER" });
    const avatar = figma.createEllipse();
    avatar.resize(80, 80);
    avatar.fills = [{ type: 'SOLID', color: c.avatar }];
    avatar.name = "avatar";
    member.appendChild(avatar);
    member.appendChild(createTextNode(m.name || '', 14, FONT_MEDIUM, c.text, { name: "name", align: "CENTER" }));
    member.appendChild(createTextNode(m.role || '', 12, FONT_REGULAR, c.textSecondary, { name: "role", align: "CENTER" }));
    grid.appendChild(member);
  }
  frame.appendChild(grid);

  return frame;
}

// ── Gallery ──
function buildGallery(content, c) {
  const frame = createAutoFrame("Gallery", {
    direction: "VERTICAL", width: PAGE_WIDTH, fill: c.bg,
    paddingX: CONTENT_PADDING, paddingY: 80, gap: 32, align: "CENTER"
  });

  frame.appendChild(createTextNode(content.title || 'Gallery', 28, FONT_BOLD, c.text, { name: "title", align: "CENTER" }));

  const grid = createAutoFrame("images", { direction: "HORIZONTAL", gap: 16 });
  grid.layoutWrap = "WRAP";
  grid.resize(PAGE_WIDTH - CONTENT_PADDING * 2, 10);
  grid.counterAxisSizingMode = "FIXED";
  const images = Array.isArray(content.images) ? content.images : [];
  for (const img of images) {
    const card = createAutoFrame("image", { direction: "VERTICAL", gap: 8 });
    card.resize(400, 10);
    card.counterAxisSizingMode = "FIXED";
    card.appendChild(createBox(400, 240, c.placeholder, { radius: 12, name: "image" }));
    card.appendChild(createTextNode(img.caption || '', 12, FONT_REGULAR, c.textMuted, { name: "caption" }));
    grid.appendChild(card);
  }
  frame.appendChild(grid);

  return frame;
}

// ── Banner ──
function buildBanner(content, c) {
  const frame = createAutoFrame("Banner", {
    direction: "HORIZONTAL", width: PAGE_WIDTH, fill: COLORS.gray900,
    paddingX: 32, paddingY: 10, gap: 16, align: "CENTER", mainAlign: "CENTER"
  });
  frame.primaryAxisSizingMode = "FIXED";

  frame.appendChild(createTextNode(content.text || '', 13, FONT_REGULAR, COLORS.white, { name: "text" }));
  if (content.ctaText) {
    frame.appendChild(createTextNode(content.ctaText, 13, FONT_MEDIUM, COLORS.gray300, { name: "cta" }));
  }

  return frame;
}

// ── Section Builder Map ──
const SECTION_BUILDERS = {
  header: buildHeader,
  hero: buildHero,
  features: buildFeatures,
  stats: buildStats,
  pricing: buildPricing,
  testimonials: buildTestimonials,
  faq: buildFaq,
  cta: buildCta,
  footer: buildFooter,
  logos: buildLogos,
  blog: buildBlog,
  contact: buildContact,
  about: buildAbout,
  team: buildTeam,
  gallery: buildGallery,
  banner: buildBanner,
};

// ── Main Import Logic ──

figma.ui.onmessage = async (msg) => {
  if (msg.type !== 'import') return;

  try {
    await loadFonts();
    const project = msg.data;

    if (!project || !project.pages || project.pages.length === 0) {
      figma.ui.postMessage({ type: 'error', message: 'No pages found in project data' });
      return;
    }

    figma.ui.postMessage({ type: 'progress', message: 'Creating pages...' });

    let totalSections = 0;

    // Create a Figma page for each project page
    for (let i = 0; i < project.pages.length; i++) {
      const pageData = project.pages[i];
      const sections = pageData.sections || [];

      figma.ui.postMessage({ type: 'progress', message: `Building "${pageData.name}" (${sections.length} sections)...` });

      // Create or reuse page
      let figmaPage;
      if (i === 0) {
        figmaPage = figma.currentPage;
        figmaPage.name = pageData.name || 'Home';
      } else {
        figmaPage = figma.createPage();
        figmaPage.name = pageData.name || `Page ${i + 1}`;
      }

      // Create a main frame for the page
      const pageFrame = figma.createFrame();
      pageFrame.name = pageData.name || 'Page';
      pageFrame.resize(PAGE_WIDTH, 10);
      pageFrame.layoutMode = "VERTICAL";
      pageFrame.primaryAxisSizingMode = "AUTO";
      pageFrame.counterAxisSizingMode = "FIXED";
      pageFrame.itemSpacing = 0;
      pageFrame.fills = [{ type: 'SOLID', color: COLORS.white }];

      // Build each section
      for (const section of sections) {
        try {
          const sectionFrame = buildSection(section);
          // Make section fill width
          pageFrame.appendChild(sectionFrame);
          sectionFrame.layoutSizingHorizontal = "FILL";
          totalSections++;
        } catch (err) {
          console.error(`Error building section ${section.category}:`, err);
        }
      }

      figmaPage.appendChild(pageFrame);

      // Zoom to fit on the last page
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
