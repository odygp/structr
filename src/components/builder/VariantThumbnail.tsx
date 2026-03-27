import React from 'react';

const C = {
  bg: '#f5f5f5',
  img: '#d4d4d4',
  text: '#a3a3a3',
  title: '#737373',
  dark: '#404040',
  accent: '#525252',
};

type Thumb = () => React.ReactElement;

// ── Variant-specific thumbnails ──
const thumbs: Record<string, Thumb> = {
  // ── Header ──
  'header-simple': () => (
    <>
      <rect x="4" y="26" width="16" height="5" rx="1" fill={C.title} />
      <rect x="30" y="27" width="8" height="3" rx="1" fill={C.text} />
      <rect x="40" y="27" width="8" height="3" rx="1" fill={C.text} />
      <rect x="50" y="27" width="8" height="3" rx="1" fill={C.text} />
      <rect x="92" y="26" width="22" height="6" rx="2" fill={C.dark} />
    </>
  ),
  'header-centered': () => (
    <>
      <rect x="48" y="18" width="24" height="5" rx="1" fill={C.title} />
      <rect x="20" y="32" width="8" height="3" rx="1" fill={C.text} />
      <rect x="32" y="32" width="8" height="3" rx="1" fill={C.text} />
      <rect x="56" y="32" width="8" height="3" rx="1" fill={C.text} />
      <rect x="68" y="32" width="8" height="3" rx="1" fill={C.text} />
      <rect x="80" y="32" width="8" height="3" rx="1" fill={C.text} />
    </>
  ),
  'header-with-cta': () => (
    <>
      <rect x="4" y="26" width="16" height="5" rx="1" fill={C.title} />
      <rect x="30" y="27" width="8" height="3" rx="1" fill={C.text} />
      <rect x="40" y="27" width="8" height="3" rx="1" fill={C.text} />
      <rect x="74" y="26" width="18" height="6" rx="2" fill={C.bg} stroke={C.text} strokeWidth="0.5" />
      <rect x="94" y="26" width="20" height="6" rx="2" fill={C.dark} />
    </>
  ),
  'header-mega': () => (
    <>
      <rect x="4" y="16" width="16" height="5" rx="1" fill={C.title} />
      <rect x="30" y="17" width="8" height="3" rx="1" fill={C.text} />
      <rect x="40" y="17" width="8" height="3" rx="1" fill={C.text} />
      <rect x="92" y="16" width="22" height="6" rx="2" fill={C.dark} />
      <rect x="4" y="28" width="112" height="28" rx="3" fill="none" stroke={C.img} strokeWidth="1" strokeDasharray="3 2" />
    </>
  ),

  // ── Hero ──
  'hero-centered': () => (
    <>
      <rect x="30" y="10" width="60" height="6" rx="1" fill={C.title} />
      <rect x="35" y="20" width="50" height="3" rx="1" fill={C.text} />
      <rect x="38" y="26" width="44" height="3" rx="1" fill={C.text} />
      <rect x="40" y="38" width="18" height="7" rx="2" fill={C.dark} />
      <rect x="60" y="38" width="18" height="7" rx="2" fill={C.bg} stroke={C.text} strokeWidth="0.5" />
    </>
  ),
  'hero-split': () => (
    <>
      <rect x="6" y="12" width="40" height="6" rx="1" fill={C.title} />
      <rect x="6" y="22" width="35" height="3" rx="1" fill={C.text} />
      <rect x="6" y="28" width="30" height="3" rx="1" fill={C.text} />
      <rect x="6" y="40" width="16" height="6" rx="2" fill={C.dark} />
      <rect x="24" y="40" width="16" height="6" rx="2" fill={C.bg} stroke={C.text} strokeWidth="0.5" />
      <rect x="62" y="8" width="52" height="48" rx="6" fill={C.img} />
    </>
  ),
  'hero-with-image': () => (
    <>
      <rect x="30" y="6" width="60" height="5" rx="1" fill={C.title} />
      <rect x="35" y="14" width="50" height="3" rx="1" fill={C.text} />
      <rect x="44" y="22" width="16" height="5" rx="2" fill={C.dark} />
      <rect x="62" y="22" width="16" height="5" rx="2" fill={C.bg} stroke={C.text} strokeWidth="0.5" />
      <rect x="16" y="32" width="88" height="28" rx="4" fill={C.img} />
    </>
  ),
  'hero-minimal': () => (
    <>
      <rect x="20" y="18" width="80" height="8" rx="1" fill={C.title} />
      <rect x="44" y="38" width="32" height="8" rx="3" fill={C.dark} />
    </>
  ),
  'hero-with-form': () => (
    <>
      <rect x="25" y="10" width="70" height="6" rx="1" fill={C.title} />
      <rect x="30" y="20" width="60" height="3" rx="1" fill={C.text} />
      <rect x="30" y="26" width="50" height="3" rx="1" fill={C.text} />
      <rect x="26" y="38" width="48" height="8" rx="3" fill={C.bg} stroke={C.text} strokeWidth="0.5" />
      <rect x="76" y="38" width="20" height="8" rx="3" fill={C.dark} />
    </>
  ),

  // ── Logo Cloud ──
  'logos-simple': () => (
    <>
      <rect x="30" y="20" width="60" height="3" rx="1" fill={C.text} />
      {[10, 28, 46, 64, 82, 100].map((x, i) => (
        <rect key={i} x={x} y="32" width="14" height="8" rx="2" fill={C.img} />
      ))}
    </>
  ),
  'logos-with-title': () => (
    <>
      <rect x="4" y="22" width="30" height="5" rx="1" fill={C.title} />
      <rect x="4" y="30" width="26" height="3" rx="1" fill={C.text} />
      {[42, 60, 78, 96].map((x, i) => (
        <rect key={i} x={x} y="24" width="14" height="8" rx="2" fill={C.img} />
      ))}
    </>
  ),
  'logos-grid': () => (
    <>
      <rect x="35" y="8" width="50" height="4" rx="1" fill={C.title} />
      {[8, 44, 80].map((x, ri) => [18, 38].map((y, ci) => (
        <rect key={`${ri}-${ci}`} x={x} y={y} width="32" height="14" rx="3" fill={C.bg} stroke={C.img} strokeWidth="0.5" />
      )))}
    </>
  ),

  // ── Features ──
  'features-grid': () => (
    <>
      <rect x="35" y="4" width="50" height="5" rx="1" fill={C.title} />
      {[8, 44, 80].map((x, i) => (
        <React.Fragment key={i}>
          <rect x={x} y="16" width="32" height="40" rx="4" fill={C.bg} stroke={C.img} strokeWidth="0.5" />
          <rect x={x+4} y="20" width="6" height="6" rx="1" fill={C.img} />
          <rect x={x+4} y="30" width="20" height="3" rx="1" fill={C.title} />
          <rect x={x+4} y="36" width="24" height="2" rx="1" fill={C.text} />
          <rect x={x+4} y="40" width="20" height="2" rx="1" fill={C.text} />
        </React.Fragment>
      ))}
    </>
  ),
  'features-alternating': () => (
    <>
      <rect x="35" y="2" width="50" height="4" rx="1" fill={C.title} />
      <rect x="6" y="12" width="30" height="3" rx="1" fill={C.title} />
      <rect x="6" y="18" width="26" height="2" rx="1" fill={C.text} />
      <rect x="6" y="22" width="22" height="2" rx="1" fill={C.text} />
      <rect x="46" y="10" width="68" height="20" rx="4" fill={C.img} />
      <rect x="46" y="38" width="68" height="20" rx="4" fill={C.img} />
      <rect x="84" y="40" width="30" height="3" rx="1" fill={C.title} />
      <rect x="84" y="46" width="26" height="2" rx="1" fill={C.text} />
    </>
  ),
  'features-2column': () => (
    <>
      <rect x="35" y="4" width="50" height="5" rx="1" fill={C.title} />
      {[8, 62].map((x, i) => [18, 40].map((y, j) => (
        <React.Fragment key={`${i}-${j}`}>
          <rect x={x} y={y} width="8" height="8" rx="2" fill={C.img} />
          <rect x={x+12} y={y} width="30" height="3" rx="1" fill={C.title} />
          <rect x={x+12} y={y+5} width="38" height="2" rx="1" fill={C.text} />
        </React.Fragment>
      )))}
    </>
  ),
  'features-with-image': () => (
    <>
      <rect x="4" y="8" width="52" height="48" rx="6" fill={C.img} />
      <rect x="64" y="10" width="40" height="5" rx="1" fill={C.title} />
      <rect x="64" y="18" width="36" height="3" rx="1" fill={C.text} />
      {[28, 38, 48].map((y, i) => (
        <React.Fragment key={i}>
          <rect x="64" y={y} width="6" height="6" rx="1" fill={C.img} />
          <rect x="74" y={y} width="30" height="3" rx="1" fill={C.title} />
          <rect x="74" y={y+4} width="36" height="2" rx="1" fill={C.text} />
        </React.Fragment>
      ))}
    </>
  ),
  'features-bento': () => (
    <>
      <rect x="35" y="2" width="50" height="4" rx="1" fill={C.title} />
      <rect x="4" y="10" width="68" height="24" rx="4" fill={C.bg} stroke={C.img} strokeWidth="0.5" />
      <rect x="76" y="10" width="40" height="24" rx="4" fill={C.bg} stroke={C.img} strokeWidth="0.5" />
      <rect x="4" y="38" width="36" height="20" rx="4" fill={C.bg} stroke={C.img} strokeWidth="0.5" />
      <rect x="44" y="38" width="36" height="20" rx="4" fill={C.bg} stroke={C.img} strokeWidth="0.5" />
      <rect x="84" y="38" width="32" height="20" rx="4" fill={C.bg} stroke={C.img} strokeWidth="0.5" />
    </>
  ),
  'features-icon-list': () => (
    <>
      <rect x="35" y="4" width="50" height="5" rx="1" fill={C.title} />
      {[16, 30, 44].map((y, i) => (
        <React.Fragment key={i}>
          <rect x="20" y={y} width="80" height="1" fill={C.img} />
          <rect x="24" y={y+3} width="6" height="6" rx="1" fill={C.img} />
          <rect x="34" y={y+3} width="30" height="3" rx="1" fill={C.title} />
          <rect x="34" y={y+8} width="50" height="2" rx="1" fill={C.text} />
        </React.Fragment>
      ))}
    </>
  ),

  // ── Stats ──
  'stats-row': () => (
    <>
      <rect x="35" y="10" width="50" height="5" rx="1" fill={C.title} />
      {[10, 35, 60, 85].map((x, i) => (
        <React.Fragment key={i}>
          <rect x={x} y="26" width="20" height="8" rx="1" fill={C.title} />
          <rect x={x+2} y="38" width="16" height="3" rx="1" fill={C.text} />
        </React.Fragment>
      ))}
    </>
  ),
  'stats-with-description': () => (
    <>
      <rect x="35" y="6" width="50" height="5" rx="1" fill={C.title} />
      <rect x="14" y="18" width="92" height="36" rx="6" fill={C.bg} />
      {[22, 52, 82].map((x, i) => (
        <React.Fragment key={i}>
          <rect x={x} y="28" width="18" height="7" rx="1" fill={C.title} />
          <rect x={x+1} y="38" width="16" height="3" rx="1" fill={C.text} />
        </React.Fragment>
      ))}
    </>
  ),
  'stats-cards': () => (
    <>
      <rect x="35" y="6" width="50" height="5" rx="1" fill={C.title} />
      {[6, 32, 58, 84].map((x, i) => (
        <rect key={i} x={x} y="18" width="24" height="36" rx="4" fill={C.bg} stroke={C.img} strokeWidth="0.5" />
      ))}
      {[6, 32, 58, 84].map((x, i) => (
        <React.Fragment key={i}>
          <rect x={x+4} y="26" width="16" height="6" rx="1" fill={C.title} />
          <rect x={x+4} y="36" width="14" height="3" rx="1" fill={C.text} />
        </React.Fragment>
      ))}
    </>
  ),

  // ── Pricing ──
  'pricing-3col': () => (
    <>
      <rect x="35" y="2" width="50" height="4" rx="1" fill={C.title} />
      {[8, 44, 80].map((x, i) => (
        <React.Fragment key={i}>
          <rect x={x} y="10" width="32" height="48" rx="4" fill={i===1 ? C.dark : C.bg} stroke={i===1 ? undefined : C.img} strokeWidth={i===1 ? 0 : 0.5} />
          <rect x={x+4} y="16" width="16" height="3" rx="1" fill={i===1 ? '#999' : C.title} />
          <rect x={x+4} y="22" width="20" height="5" rx="1" fill={i===1 ? '#ccc' : C.accent} />
          <rect x={x+4} y="44" width="24" height="6" rx="2" fill={i===1 ? '#ccc' : C.dark} />
        </React.Fragment>
      ))}
    </>
  ),
  'pricing-2col': () => (
    <>
      <rect x="35" y="2" width="50" height="4" rx="1" fill={C.title} />
      {[16, 64].map((x, i) => (
        <React.Fragment key={i}>
          <rect x={x} y="12" width="40" height="46" rx="5" fill={i===1 ? C.dark : C.bg} stroke={i===1 ? undefined : C.img} strokeWidth={i===1 ? 0 : 0.5} />
          <rect x={x+6} y="18" width="20" height="3" rx="1" fill={i===1 ? '#999' : C.title} />
          <rect x={x+6} y="24" width="24" height="6" rx="1" fill={i===1 ? '#ccc' : C.accent} />
          <rect x={x+6} y="44" width="28" height="6" rx="2" fill={i===1 ? '#ccc' : C.dark} />
        </React.Fragment>
      ))}
    </>
  ),
  'pricing-simple': () => (
    <>
      <rect x="35" y="6" width="50" height="5" rx="1" fill={C.title} />
      {[18, 32, 46].map((y, i) => (
        <React.Fragment key={i}>
          <rect x="20" y={y} width="80" height="1" fill={C.img} />
          <rect x="24" y={y+3} width="24" height="3" rx="1" fill={C.title} />
          <rect x="64" y={y+3} width="14" height="4" rx="1" fill={C.accent} />
          <rect x="82" y={y+3} width="16" height="5" rx="2" fill={C.dark} />
        </React.Fragment>
      ))}
    </>
  ),
  'pricing-toggle': () => (
    <>
      <rect x="35" y="2" width="50" height="4" rx="1" fill={C.title} />
      <rect x="44" y="8" width="32" height="5" rx="3" fill={C.bg} stroke={C.img} strokeWidth="0.5" />
      <rect x="45" y="9" width="15" height="3" rx="2" fill={C.dark} />
      {[8, 44, 80].map((x, i) => (
        <rect key={i} x={x} y="18" width="32" height="40" rx="4" fill={i===1 ? C.dark : C.bg} stroke={i===1 ? undefined : C.img} strokeWidth={i===1 ? 0 : 0.5} />
      ))}
    </>
  ),
  'pricing-comparison': () => (
    <>
      <rect x="35" y="4" width="50" height="5" rx="1" fill={C.title} />
      <rect x="8" y="14" width="104" height="1" fill={C.img} />
      <rect x="50" y="16" width="16" height="3" rx="1" fill={C.title} />
      <rect x="70" y="16" width="16" height="3" rx="1" fill={C.title} />
      <rect x="90" y="16" width="16" height="3" rx="1" fill={C.title} />
      {[24, 34, 44].map((y, i) => (
        <React.Fragment key={i}>
          <rect x="8" y={y} width="104" height="1" fill={C.img} />
          <rect x="12" y={y+3} width="30" height="3" rx="1" fill={C.text} />
          <rect x="54" y={y+3} width="8" height="3" rx="1" fill={C.accent} />
          <rect x="74" y={y+3} width="8" height="3" rx="1" fill={C.accent} />
          <rect x="94" y={y+3} width="8" height="3" rx="1" fill={C.accent} />
        </React.Fragment>
      ))}
    </>
  ),

  // ── Testimonials ──
  'testimonials-cards': () => (
    <>
      <rect x="30" y="4" width="60" height="4" rx="1" fill={C.title} />
      {[8, 44, 80].map((x, i) => (
        <React.Fragment key={i}>
          <rect x={x} y="14" width="32" height="42" rx="4" fill={C.bg} stroke={C.img} strokeWidth="0.5" />
          <rect x={x+4} y="18" width="24" height="2" rx="1" fill={C.text} />
          <rect x={x+4} y="22" width="20" height="2" rx="1" fill={C.text} />
          <circle cx={x+10} cy="38" r="5" fill={C.img} />
          <rect x={x+18} y="36" width="10" height="2" rx="1" fill={C.title} />
          <rect x={x+18} y="40" width="8" height="2" rx="1" fill={C.text} />
        </React.Fragment>
      ))}
    </>
  ),
  'testimonials-single': () => (
    <>
      <rect x="30" y="8" width="60" height="5" rx="1" fill={C.title} />
      <rect x="20" y="20" width="80" height="3" rx="1" fill={C.text} />
      <rect x="24" y="26" width="72" height="3" rx="1" fill={C.text} />
      <rect x="28" y="32" width="64" height="3" rx="1" fill={C.text} />
      <circle cx="52" cy="46" r="6" fill={C.img} />
      <rect x="62" y="44" width="16" height="3" rx="1" fill={C.title} />
      <rect x="62" y="49" width="12" height="2" rx="1" fill={C.text} />
    </>
  ),
  'testimonials-minimal': () => (
    <>
      <rect x="30" y="6" width="60" height="5" rx="1" fill={C.title} />
      <rect x="25" y="18" width="70" height="3" rx="1" fill={C.text} />
      <rect x="30" y="24" width="60" height="3" rx="1" fill={C.text} />
      <rect x="44" y="32" width="32" height="2" rx="1" fill={C.title} />
      <rect x="25" y="42" width="70" height="3" rx="1" fill={C.text} />
      <rect x="30" y="48" width="60" height="3" rx="1" fill={C.text} />
      <rect x="44" y="56" width="32" height="2" rx="1" fill={C.title} />
    </>
  ),
  'testimonials-grid': () => (
    <>
      <rect x="30" y="2" width="60" height="4" rx="1" fill={C.title} />
      {[[8,12],[62,12],[8,38],[62,38]].map(([x,y], i) => (
        <React.Fragment key={i}>
          <rect x={x} y={y} width="50" height="22" rx="4" fill={C.bg} stroke={C.img} strokeWidth="0.5" />
          <rect x={x+4} y={y+4} width="30" height="2" rx="1" fill={C.text} />
          <circle cx={x+8} cy={y+16} r="4" fill={C.img} />
          <rect x={x+16} y={y+14} width="14" height="2" rx="1" fill={C.title} />
        </React.Fragment>
      ))}
    </>
  ),
  'testimonials-carousel': () => (
    <>
      <rect x="30" y="4" width="60" height="4" rx="1" fill={C.title} />
      <rect x="4" y="26" width="8" height="12" rx="2" fill={C.img} />
      <rect x="108" y="26" width="8" height="12" rx="2" fill={C.img} />
      {[16, 44, 72].map((x, i) => (
        <rect key={i} x={x} y="14" width="24" height="36" rx="3" fill={C.bg} stroke={C.img} strokeWidth="0.5" />
      ))}
    </>
  ),

  // ── FAQ ──
  'faq-accordion': () => (
    <>
      <rect x="30" y="4" width="60" height="5" rx="1" fill={C.title} />
      {[16, 28, 40, 52].map((y, i) => (
        <React.Fragment key={i}>
          <rect x="20" y={y} width="80" height="1" fill={C.img} />
          <rect x="24" y={y+3} width="40" height="3" rx="1" fill={C.accent} />
          <rect x="24" y={y+8} width="60" height="2" rx="1" fill={C.text} />
        </React.Fragment>
      ))}
    </>
  ),
  'faq-two-column': () => (
    <>
      <rect x="30" y="4" width="60" height="5" rx="1" fill={C.title} />
      {[6, 62].map((x, ri) => [18, 40].map((y, ci) => (
        <React.Fragment key={`${ri}-${ci}`}>
          <rect x={x} y={y} width="44" height="3" rx="1" fill={C.accent} />
          <rect x={x} y={y+6} width="50" height="2" rx="1" fill={C.text} />
          <rect x={x} y={y+10} width="46" height="2" rx="1" fill={C.text} />
        </React.Fragment>
      )))}
    </>
  ),
  'faq-centered': () => (
    <>
      <rect x="30" y="4" width="60" height="5" rx="1" fill={C.title} />
      {[16, 34, 52].map((y, i) => (
        <React.Fragment key={i}>
          <rect x="16" y={y} width="88" height="14" rx="4" fill={C.bg} />
          <rect x="22" y={y+3} width="40" height="3" rx="1" fill={C.accent} />
          <rect x="22" y={y+8} width="70" height="2" rx="1" fill={C.text} />
        </React.Fragment>
      ))}
    </>
  ),
  'faq-side-title': () => (
    <>
      <rect x="6" y="16" width="36" height="5" rx="1" fill={C.title} />
      <rect x="6" y="24" width="30" height="3" rx="1" fill={C.text} />
      {[14, 30, 46].map((y, i) => (
        <React.Fragment key={i}>
          <rect x="50" y={y} width="62" height="1" fill={C.img} />
          <rect x="54" y={y+3} width="36" height="3" rx="1" fill={C.accent} />
          <rect x="54" y={y+8} width="52" height="2" rx="1" fill={C.text} />
        </React.Fragment>
      ))}
    </>
  ),

  // ── CTA ──
  'cta-centered': () => (
    <>
      <rect x="0" y="0" width="120" height="64" fill={C.dark} />
      <rect x="25" y="16" width="70" height="6" rx="1" fill="#ccc" />
      <rect x="30" y="26" width="60" height="3" rx="1" fill="#888" />
      <rect x="38" y="38" width="20" height="7" rx="3" fill="#eee" />
      <rect x="62" y="38" width="20" height="7" rx="3" fill="none" stroke="#777" strokeWidth="0.5" />
    </>
  ),
  'cta-banner': () => (
    <>
      <rect x="0" y="10" width="120" height="44" fill={C.dark} />
      <rect x="10" y="24" width="50" height="5" rx="1" fill="#ccc" />
      <rect x="10" y="32" width="40" height="3" rx="1" fill="#888" />
      <rect x="82" y="26" width="28" height="8" rx="3" fill="#eee" />
    </>
  ),
  'cta-with-image': () => (
    <>
      <rect x="0" y="0" width="120" height="64" fill={C.bg} />
      <rect x="6" y="14" width="46" height="5" rx="1" fill={C.title} />
      <rect x="6" y="24" width="40" height="3" rx="1" fill={C.text} />
      <rect x="6" y="36" width="16" height="6" rx="2" fill={C.dark} />
      <rect x="24" y="36" width="16" height="6" rx="2" fill={C.bg} stroke={C.text} strokeWidth="0.5" />
      <rect x="62" y="8" width="52" height="48" rx="6" fill={C.img} />
    </>
  ),
  'cta-simple': () => (
    <>
      <rect x="0" y="16" width="120" height="1" fill={C.img} />
      <rect x="0" y="47" width="120" height="1" fill={C.img} />
      <rect x="30" y="22" width="60" height="5" rx="1" fill={C.title} />
      <rect x="35" y="30" width="50" height="3" rx="1" fill={C.text} />
      <rect x="42" y="38" width="36" height="7" rx="3" fill={C.dark} />
    </>
  ),
  'cta-newsletter': () => (
    <>
      <rect x="25" y="12" width="70" height="6" rx="1" fill={C.title} />
      <rect x="30" y="22" width="60" height="3" rx="1" fill={C.text} />
      <rect x="22" y="34" width="52" height="8" rx="3" fill={C.bg} stroke={C.text} strokeWidth="0.5" />
      <rect x="76" y="34" width="22" height="8" rx="3" fill={C.dark} />
    </>
  ),

  // ── Footer ──
  'footer-4col': () => (
    <>
      <rect x="0" y="0" width="120" height="64" fill={C.dark} />
      <rect x="4" y="8" width="16" height="4" rx="1" fill="#999" />
      <rect x="4" y="16" width="20" height="2" rx="1" fill="#666" />
      {[30, 50, 70, 90].map((x, i) => (
        <React.Fragment key={i}>
          <rect x={x} y="8" width="14" height="3" rx="1" fill="#999" />
          {[16, 20, 24, 28].map((y, j) => (
            <rect key={j} x={x} y={y} width="12" height="2" rx="1" fill="#555" />
          ))}
        </React.Fragment>
      ))}
      <rect x="4" y="54" width="112" height="0.5" fill="#555" />
      <rect x="4" y="58" width="50" height="2" rx="1" fill="#555" />
    </>
  ),
  'footer-simple': () => (
    <>
      <rect x="0" y="0" width="120" height="64" fill={C.dark} />
      <rect x="46" y="12" width="28" height="4" rx="1" fill="#999" />
      <rect x="26" y="28" width="12" height="2" rx="1" fill="#666" />
      <rect x="42" y="28" width="12" height="2" rx="1" fill="#666" />
      <rect x="58" y="28" width="12" height="2" rx="1" fill="#666" />
      <rect x="74" y="28" width="12" height="2" rx="1" fill="#666" />
      <rect x="36" y="48" width="48" height="2" rx="1" fill="#555" />
    </>
  ),
  'footer-centered': () => (
    <>
      <rect x="0" y="0" width="120" height="64" fill={C.dark} />
      <rect x="44" y="8" width="32" height="4" rx="1" fill="#999" />
      <rect x="36" y="16" width="48" height="2" rx="1" fill="#666" />
      {[28, 42, 56, 70, 84].map((x, i) => (
        <rect key={i} x={x} y="28" width="10" height="2" rx="1" fill="#666" />
      ))}
      <rect x="36" y="50" width="48" height="2" rx="1" fill="#555" />
    </>
  ),
  'footer-minimal': () => (
    <>
      <rect x="0" y="0" width="120" height="64" fill={C.bg} />
      <rect x="0" y="0" width="120" height="0.5" fill={C.img} />
      <rect x="30" y="28" width="60" height="3" rx="1" fill={C.text} />
    </>
  ),
  'footer-with-newsletter': () => (
    <>
      <rect x="0" y="0" width="120" height="64" fill={C.dark} />
      <rect x="4" y="8" width="16" height="4" rx="1" fill="#999" />
      <rect x="4" y="16" width="20" height="2" rx="1" fill="#666" />
      <rect x="4" y="24" width="28" height="5" rx="2" fill="#555" />
      {[40, 60, 80, 100].map((x, i) => (
        <React.Fragment key={i}>
          <rect x={x} y="8" width="12" height="3" rx="1" fill="#999" />
          <rect x={x} y="16" width="10" height="2" rx="1" fill="#555" />
          <rect x={x} y="20" width="12" height="2" rx="1" fill="#555" />
        </React.Fragment>
      ))}
    </>
  ),
};

// Category fallbacks for variants without specific thumbnails
const categoryFallbacks: Record<string, Thumb> = {
  header: thumbs['header-simple']!,
  hero: thumbs['hero-centered']!,
  logos: thumbs['logos-simple']!,
  features: thumbs['features-grid']!,
  stats: thumbs['stats-row']!,
  pricing: thumbs['pricing-3col']!,
  testimonials: thumbs['testimonials-cards']!,
  faq: thumbs['faq-accordion']!,
  cta: thumbs['cta-centered']!,
  blog: () => (
    <>
      <rect x="30" y="4" width="60" height="5" rx="1" fill={C.title} />
      {[8, 44, 80].map((x, i) => (
        <React.Fragment key={i}>
          <rect x={x} y="14" width="32" height="18" rx="3" fill={C.img} />
          <rect x={x} y="35" width="28" height="3" rx="1" fill={C.title} />
          <rect x={x} y="41" width="24" height="2" rx="1" fill={C.text} />
        </React.Fragment>
      ))}
    </>
  ),
  about: () => (
    <>
      <rect x="8" y="12" width="40" height="5" rx="1" fill={C.title} />
      <rect x="8" y="22" width="36" height="3" rx="1" fill={C.text} />
      <rect x="8" y="28" width="38" height="3" rx="1" fill={C.text} />
      <rect x="60" y="10" width="52" height="44" rx="6" fill={C.img} />
    </>
  ),
  team: () => (
    <>
      <rect x="35" y="4" width="50" height="5" rx="1" fill={C.title} />
      {[14, 38, 62, 86].map((x, i) => (
        <React.Fragment key={i}>
          <circle cx={x+8} cy="28" r="8" fill={C.img} />
          <rect x={x} y="40" width="16" height="3" rx="1" fill={C.title} />
          <rect x={x+2} y="46" width="12" height="2" rx="1" fill={C.text} />
        </React.Fragment>
      ))}
    </>
  ),
  gallery: () => (
    <>
      <rect x="35" y="4" width="50" height="5" rx="1" fill={C.title} />
      {[[4,16,36,22],[42,16,36,22],[80,16,36,22],[4,40,36,18],[42,40,36,18],[80,40,36,18]].map(([x,y,w,h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="3" fill={C.img} />
      ))}
    </>
  ),
  banner: () => (
    <>
      <rect x="0" y="20" width="120" height="24" fill={C.dark} />
      <rect x="20" y="29" width="50" height="3" rx="1" fill="#bbb" />
      <rect x="76" y="28" width="24" height="6" rx="2" fill="#888" />
    </>
  ),
  contact: () => (
    <>
      <rect x="35" y="6" width="50" height="5" rx="1" fill={C.title} />
      <rect x="8" y="20" width="40" height="3" rx="1" fill={C.text} />
      <rect x="8" y="26" width="36" height="3" rx="1" fill={C.text} />
      <rect x="60" y="18" width="52" height="8" rx="2" fill={C.bg} stroke={C.img} strokeWidth="0.5" />
      <rect x="60" y="30" width="52" height="8" rx="2" fill={C.bg} stroke={C.img} strokeWidth="0.5" />
      <rect x="60" y="42" width="52" height="12" rx="2" fill={C.bg} stroke={C.img} strokeWidth="0.5" />
    </>
  ),
  footer: thumbs['footer-4col']!,
  showcase: () => (
    <>
      <rect x="4" y="4" width="40" height="5" rx="1" fill={C.title} />
      <rect x="90" y="4" width="26" height="6" rx="3" fill={C.dark} />
      {[20, 32, 44, 56].map((x, i) => (
        <rect key={i} x={x} y="14" width="10" height="3" rx="1" fill={i === 0 ? C.accent : C.text} />
      ))}
      <rect x="4" y="22" width="36" height="36" rx="4" fill={C.dark} />
      {[44, 70, 96].map((x, i) => (
        <React.Fragment key={i}>
          <rect x={x} y="22" width="22" height="16" rx="2" fill={C.img} />
          <rect x={x} y="40" width="18" height="3" rx="1" fill={C.title} />
          <rect x={x} y="45" width="16" height="2" rx="1" fill={C.text} />
          <rect x={x} y="52" width="12" height="3" rx="1" fill={C.accent} />
        </React.Fragment>
      ))}
    </>
  ),
  error: () => (
    <>
      <rect x="35" y="8" width="50" height="14" rx="1" fill={C.img} />
      <rect x="30" y="28" width="60" height="5" rx="1" fill={C.title} />
      <rect x="25" y="36" width="70" height="3" rx="1" fill={C.text} />
      <rect x="44" y="46" width="32" height="8" rx="3" fill={C.dark} />
    </>
  ),
  process: () => (
    <>
      <rect x="30" y="4" width="60" height="5" rx="1" fill={C.title} />
      {[16, 42, 68, 94].map((x, i) => (
        <React.Fragment key={i}>
          <circle cx={x+6} cy="28" r="8" fill={C.dark} />
          <rect x={x-2} y="40" width="16" height="3" rx="1" fill={C.title} />
          <rect x={x} y="46" width="12" height="2" rx="1" fill={C.text} />
        </React.Fragment>
      ))}
    </>
  ),
  downloads: () => (
    <>
      <rect x="30" y="8" width="60" height="5" rx="1" fill={C.title} />
      <rect x="35" y="16" width="50" height="3" rx="1" fill={C.text} />
      {[16, 48, 80].map((x, i) => (
        <React.Fragment key={i}>
          <rect x={x} y="26" width="32" height="30" rx="4" fill={C.bg} stroke={C.img} strokeWidth="0.5" />
          <rect x={x+8} y="30" width="16" height="10" rx="2" fill={C.img} />
          <rect x={x+4} y="44" width="24" height="3" rx="1" fill={C.title} />
          <rect x={x+6} y="50" width="20" height="4" rx="2" fill={C.dark} />
        </React.Fragment>
      ))}
    </>
  ),
  comparison: () => (
    <>
      <rect x="30" y="4" width="60" height="5" rx="1" fill={C.title} />
      <rect x="8" y="14" width="104" height="1" fill={C.img} />
      {[20, 32, 44].map((y, i) => (
        <React.Fragment key={i}>
          <rect x="8" y={y} width="104" height="1" fill={C.img} />
          <rect x="12" y={y+3} width="30" height="3" rx="1" fill={C.text} />
          <rect x="54" y={y+3} width="6" height="3" rx="1" fill={C.accent} />
          <rect x="74" y={y+3} width="6" height="3" rx="1" fill={C.accent} />
          <rect x="94" y={y+3} width="6" height="3" rx="1" fill={C.accent} />
        </React.Fragment>
      ))}
    </>
  ),
  store: () => (
    <>
      <rect x="30" y="4" width="60" height="5" rx="1" fill={C.title} />
      {[8, 44, 80].map((x, i) => (
        <React.Fragment key={i}>
          <rect x={x} y="14" width="32" height="20" rx="3" fill={C.img} />
          <rect x={x+2} y="37" width="24" height="3" rx="1" fill={C.title} />
          <rect x={x+2} y="43" width="16" height="3" rx="1" fill={C.accent} />
          <rect x={x+2} y="50" width="28" height="6" rx="2" fill={C.dark} />
        </React.Fragment>
      ))}
    </>
  ),
};

export default function VariantThumbnail({ variantId, variantName }: { variantId: string; variantName?: string }) {
  const category = variantId.split('-')[0];
  const renderer = thumbs[variantId] || categoryFallbacks[category];

  return (
    <svg
      width="120"
      height="64"
      viewBox="0 0 120 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Layout preview: ${variantName || variantId}`}
      className="w-full h-auto rounded border border-gray-200 bg-white"
    >
      {renderer ? renderer() : (
        <>
          <rect x="30" y="20" width="60" height="6" rx="1" fill={C.title} />
          <rect x="35" y="32" width="50" height="3" rx="1" fill={C.text} />
        </>
      )}
    </svg>
  );
}
