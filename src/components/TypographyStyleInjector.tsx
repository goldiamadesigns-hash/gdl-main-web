import React, { useState, useEffect } from 'react';

// Maps spacing options to CSS letter-spacing values
const SPACING_MAP: Record<string, string> = {
  normal: '0',
  tight: '-0.025em',
  tighter: '-0.05em',
  wide: '0.05em',
  widest: '0.1em'
};

export function TypographyStyleInjector() {
  const [styles, setStyles] = useState('');

  const loadAndApplyStyles = () => {
    // 1. General typography families
    const headingFont = localStorage.getItem('min_eco_typo_heading_font') || 'Gilda Display';
    const bodyFont = localStorage.getItem('min_eco_typo_body_font') || 'Montserrat';

    // 2. Element specific values
    const queryStyle = (element: string, defaultFont: 'heading' | 'body' | 'mono', defaultWeight: string, defaultTransform: string, defaultSpacing: string, defaultSize: string, defaultLineHeight: string) => {
      return {
        fontChoice: localStorage.getItem(`min_eco_typo_${element}_font`) || defaultFont,
        weight: localStorage.getItem(`min_eco_typo_${element}_weight`) || defaultWeight,
        transform: localStorage.getItem(`min_eco_typo_${element}_transform`) || defaultTransform,
        spacing: localStorage.getItem(`min_eco_typo_${element}_spacing`) || defaultSpacing,
        sizeScale: localStorage.getItem(`min_eco_typo_${element}_size`) || defaultSize,
        lineHeight: localStorage.getItem(`min_eco_typo_${element}_line_height`) || defaultLineHeight
      };
    };

    const h1 = queryStyle('h1', 'heading', '700', 'uppercase', 'tight', '100%', '1.1');
    const h2 = queryStyle('h2', 'heading', '700', 'uppercase', 'tight', '100%', '1.2');
    const h3 = queryStyle('h3', 'heading', '600', 'uppercase', 'normal', '100%', '1.25');
    const h4 = queryStyle('h4', 'body', '700', 'uppercase', 'normal', '100%', '1.3');
    const h5 = queryStyle('h5', 'body', '600', 'none', 'normal', '100%', '1.4');
    const h6 = queryStyle('h6', 'body', '500', 'none', 'normal', '100%', '1.4');
    const body = queryStyle('body', 'body', '400', 'none', 'normal', '100%', '1.5');

    // Resolve font stacks
    const getFontFamily = (choice: string) => {
      if (choice === 'heading') return `"${headingFont}", "Georgia", serif`;
      if (choice === 'body') return `"${bodyFont}", "Inter", sans-serif`;
      if (choice === 'mono') return `"JetBrains Mono", "Fira Code", monospace`;
      // Direct font values
      if (choice === 'Gilda Display') return '"Gilda Display", serif';
      if (choice === 'Montserrat') return '"Montserrat", sans-serif';
      if (choice === 'Space Grotesk') return '"Space Grotesk", sans-serif';
      if (choice === 'Inter') return '"Inter", sans-serif';
      if (choice === 'Playfair Display') return '"Playfair Display", serif';
      if (choice === 'JetBrains Mono') return '"JetBrains Mono", monospace';
      if (choice === 'Fira Code') return '"Fira Code", monospace';
      return `"${bodyFont}", "Inter", sans-serif`;
    };

    const h1Font = getFontFamily(h1.fontChoice);
    const h2Font = getFontFamily(h2.fontChoice);
    const h3Font = getFontFamily(h3.fontChoice);
    const h4Font = getFontFamily(h4.fontChoice);
    const h5Font = getFontFamily(h5.fontChoice);
    const h6Font = getFontFamily(h6.fontChoice);
    const bodyFontStack = getFontFamily(body.fontChoice);

    const generatedCss = `
      :root {
        --font-sans: "${bodyFont}", "Inter", sans-serif !important;
        --font-serif: "${headingFont}", Georgia, serif !important;
      }

      /* Dynamically override font stacks across storefront and cockpit */
      body, .font-sans {
        font-family: ${bodyFontStack} !important;
        letter-spacing: ${SPACING_MAP[body.spacing] || '0'} !important;
        font-size: ${body.sizeScale === '100%' ? '' : `calc(0.875rem * ${parseFloat(body.sizeScale) / 100})`} !important;
        line-height: ${body.lineHeight} !important;
      }

      p, span, a, button, label, input, select, textarea {
        font-family: ${bodyFontStack};
      }

      h1, [class*="text-"][class*="font-black"], [class*="text-"][class*="font-extrabold"] {
        font-family: ${h1Font} !important;
        font-weight: ${h1.weight} !important;
        text-transform: ${h1.transform} !important;
        letter-spacing: ${SPACING_MAP[h1.spacing] || '0'} !important;
        line-height: ${h1.lineHeight} !important;
        ${h1.sizeScale !== '100%' ? `font-size: calc(2.25rem * ${parseFloat(h1.sizeScale) / 100}) !important;` : ''}
      }

      h2 {
        font-family: ${h2Font} !important;
        font-weight: ${h2.weight} !important;
        text-transform: ${h2.transform} !important;
        letter-spacing: ${SPACING_MAP[h2.spacing] || '0'} !important;
        line-height: ${h2.lineHeight} !important;
        ${h2.sizeScale !== '100%' ? `font-size: calc(1.5rem * ${parseFloat(h2.sizeScale) / 100}) !important;` : ''}
      }

      h3 {
        font-family: ${h3Font} !important;
        font-weight: ${h3.weight} !important;
        text-transform: ${h3.transform} !important;
        letter-spacing: ${SPACING_MAP[h3.spacing] || '0'} !important;
        line-height: ${h3.lineHeight} !important;
        ${h3.sizeScale !== '100%' ? `font-size: calc(1.25rem * ${parseFloat(h3.sizeScale) / 100}) !important;` : ''}
      }

      h4 {
        font-family: ${h4Font} !important;
        font-weight: ${h4.weight} !important;
        text-transform: ${h4.transform} !important;
        letter-spacing: ${SPACING_MAP[h4.spacing] || '0'} !important;
        line-height: ${h4.lineHeight} !important;
        ${h4.sizeScale !== '100%' ? `font-size: calc(1.125rem * ${parseFloat(h4.sizeScale) / 100}) !important;` : ''}
      }

      h5 {
        font-family: ${h5Font} !important;
        font-weight: ${h5.weight} !important;
        text-transform: ${h5.transform} !important;
        letter-spacing: ${SPACING_MAP[h5.spacing] || '0'} !important;
        line-height: ${h5.lineHeight} !important;
        ${h5.sizeScale !== '100%' ? `font-size: calc(1rem * ${parseFloat(h5.sizeScale) / 100}) !important;` : ''}
      }

      h6 {
        font-family: ${h6Font} !important;
        font-weight: ${h6.weight} !important;
        text-transform: ${h6.transform} !important;
        letter-spacing: ${SPACING_MAP[h6.spacing] || '0'} !important;
        line-height: ${h6.lineHeight} !important;
        ${h6.sizeScale !== '100%' ? `font-size: calc(0.875rem * ${parseFloat(h6.sizeScale) / 100}) !important;` : ''}
      }
    `;

    setStyles(generatedCss);
  };

  useEffect(() => {
    loadAndApplyStyles();

    // Listen to custom typography update event triggers
    const handleUpdate = () => {
      loadAndApplyStyles();
    };

    window.addEventListener('min-eco-typography-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('min-eco-typography-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}
