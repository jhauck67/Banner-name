//§========================================================
//§        COLOR PALETTE GENERATOR - Version 1.0           
//§    Description : Génère des couleurs accessibles       
//§   et contrastées à partir d'une couleur de base.       
//§                  Auteur : Jennifer                     
//§========================================================


//FUNCTIONS : UTILS - Conversions et calculs de base       

//* HEX -> RGB --------------------------------------------
const hexToRgb = (hex) => {
    // transforme les formats courts #rbg en #rrggbb
    const shorthand = /^#?([a-f\d])([a-f\d])([a-f\d])$/i; 
    hex = hex.replace(shorthand, (m, r, g, b) => r + r + g + g + b + b);

    // .exec() vérifie si la chaine hex correspond à ce modèle.
    // S'il trouve une correspondance, il retourne un tableau.
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            // On transforme chaque paire hexadécimale en valeur décimale (0-255) 
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
};

//* RGB -> HSL --------------------------------------------
const rgbToHsl = (r, g, b) => {
    // On normalise les valeurs r, g et b
    r /= 255;
    g /= 255;
    b /= 255;

    // Max/Min servent à calculer la chroma (contraste couleur) et la luminosité
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2; // Moyenne du max et du min.
    // Si max = min, la couleur est grise (pas de teinte) et l est exactement la valeur de gris.

    if (max !== min) {
    // Si max !== min, il y a chroma(couleur réelle). d est la différence (chroma) entre max et min.
    const d = max - min;
    // 2 formules pour normaliser correctement la saturation quelle que soit la luminosité.
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    // Conversion en degrés et pourcentages
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

//* HSL -> RGB --------------------------------------------
const hslToRgb = (h, s, l) => {
    // Normaliser la hue dans [0,360)
    h = ((h % 360) + 360) % 360

    // Normaliser S et L en [0,1]
    s /= 100;
    l /= 100;

    // Calculer chroma (c), x et m
    const c = (1 - Math.abs(2 * l - 1)) * s; // chroma
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1)); // second terme
    const m = l - c / 2; // translateur

    // Déterminer r', g', b' selon le secteur de la hue
    let r1 = 0, g1 = 0, b1 = 0;
    if (0 <= h && h < 60) {
        r1 = c;
        g1 = x;
        b1 = 0;
    } else if (60 <= h && h < 120) {
        r1 = x;
        g1 = c;
        b1 = 0;
    } else if (120 <= h && h < 180) {
        r1 = 0;
        g1 = c;
        b1 = x;
    } else if (180 <= h && h < 240) {
        r1 = 0;
        g1 = x;
        b1 = c;
    } else if (240 <= h && h < 300) {
        r1 = x;
        g1 = 0;
        b1 = c;
    } else {
        r1 = c;
        g1 = 0;
        b1 = x;
    }

    // Ajouter m et convertir en 0..255
    const r = Math.round((r1 + m) * 255);
    const g = Math.round((g1 + m) * 255);
    const b = Math.round((b1 + m) * 255);

    return { r, g, b };
};

//FUNCTIONS : ACCESSIBILITY METRICS - Luminance & Contrast 

//* Luminance ---------------------------------------------
const getLuminance = ({ r, g, b }) => {
    // 1. Normaliser les valeurs (0–255 → 0–1)
    const [R, G, B] = [r, g, b].map(v => v / 255);

    // 2. Appliquer la correction gamma (linéarisation)
    const [rLin, gLin, bLin] = [R, G, B].map(c =>
        c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    );

    // 3. Calculer la luminance relative
    return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
};

//* Contrast Ratio ----------------------------------------
const getContrast = (rgb1, rgb2) => {
  const L1 = getLuminance(rgb1);
  const L2 = getLuminance(rgb2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
};

//* Couleur de texte lisible ------------------------------
const getTextColor = (rgb, whiteRgb = {r:255, g:255, b:255, h: 0, s: 0, l: 100}, blackRgb = {r:0, g:0, b:0, h: 0, s: 0, l: 0}) => {
    const contrastWithWhite = getContrast(rgb, whiteRgb);
    const contrastWithBlack = getContrast(rgb, blackRgb);
    return contrastWithWhite > contrastWithBlack 
        ? `hsl(${whiteRgb.h}, ${whiteRgb.s}%, ${whiteRgb.l}%)` 
        : `hsl(${blackRgb.h}, ${blackRgb.s}%, ${blackRgb.l}%)`;
};

//* Saturation adaptative ---------------------------------
const getAdaptiveSaturation = (luminance) => {
  // Couleur claire → saturation plus basse
  return Math.round(80 - luminance * 50); // entre environ 30 et 80
};

// FUNCTIONS : PALETTE GENERATION - Combinaisons & dérivés 

//* Génération des neutres --------------------------------
const generateNeutrals = baseHue => {
    const compHue = (baseHue + 180) % 360;
    const white = {h: compHue, s: 5, l:95};
    const black = {h: compHue, s: 5, l:5};
    
    // On calcule aussi les valeurs RGB et la couleur de texte lisible
    white.rgb = hslToRgb(white.h, white.s, white.l);
    black.rgb = hslToRgb(black.h, black.s, black.l);

    white.text = getTextColor(white.rgb);
    black.text = getTextColor(black.rgb);

    return { white, black };
};

//* Génération des couleurs complémentaires ---------------
const generateComplementaryForBackground = (baseHue, baseLuminance, bgColorRgb, targetContrast = 7) => {
    const compHue = (baseHue + 180) % 360;
    let s = getAdaptiveSaturation(baseLuminance);
    let l = 50;
    let step = 1;
    let rgb, contrast;

    do {
        rgb = hslToRgb(compHue, s, l);
        contrast = getContrast(rgb, bgColorRgb);
        if(getLuminance(bgColorRgb) > 0.5) {
            // Fond clair -> on assombrit
            l -= step;
        } else {
            // Fond foncé -> on éclaircit
            l += step;
        }
    } while (contrast < targetContrast && l >= 0 && l <= 100);

    return { h: compHue, s, l, rgb, contrast };
};

// FUNCTIONS : PALETTE GENERATOR - Génération de la palette

//* Génération de la palette ------------------------------
export const paletteGenerator = (baseColor) => {
    // Caractéristiques de la couleur de base
    const baseRgb = hexToRgb(baseColor);
    const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
    const baseLum = getLuminance(baseRgb);

    // Génération des autres couleurs (neutres et complémentaires)
    const neutrals = generateNeutrals(baseHsl.h);
    const complementaryOnWhite = generateComplementaryForBackground(baseHsl.h, baseLum, neutrals.white.rgb);
    const complementaryOnBlack = generateComplementaryForBackground(baseHsl.h, baseLum, neutrals.black.rgb);

    const REAL_WHITE = { ...neutrals.white.rgb, h: neutrals.white.h, s: neutrals.white.s, l: neutrals.white.l };
    const REAL_BLACK = { ...neutrals.black.rgb, h: neutrals.black.h, s: neutrals.black.s, l: neutrals.black.l };

    // Création de la palette de couleurs
    const palette = {
        white: `hsl(${neutrals.white.h}, ${neutrals.white.s}%, ${neutrals.white.l}%)`,
        black: `hsl(${neutrals.black.h}, ${neutrals.black.s}%, ${neutrals.black.l}%)`,
        base: {
            color: `hsl(${baseHsl.h}, ${baseHsl.s}%, ${baseHsl.l}%)`,
            text: getTextColor(baseRgb, REAL_WHITE, REAL_BLACK),
            hover: `hsl(${baseHsl.h}, ${baseHsl.s}%, ${Math.min(baseHsl.l + 10, 100)}%)`,
            active: `hsl(${baseHsl.h}, ${baseHsl.s}%, ${Math.max(baseHsl.l - 10, 0)}%)`,
        },
        comp: {
            onWhite: `hsl(${complementaryOnWhite.h}, ${complementaryOnWhite.s}%, ${complementaryOnWhite.l}%)`,
            onBlack: `hsl(${complementaryOnBlack.h}, ${complementaryOnBlack.s}%, ${complementaryOnBlack.l}%)`,
        },
        ligns: {
            separator: {
                onWhite: `hsl(${complementaryOnWhite.h}, ${complementaryOnWhite.s}%, ${complementaryOnWhite.l}%, 0.1)`,
                onBlack: `hsl(${complementaryOnBlack.h}, ${complementaryOnBlack.s}%, ${complementaryOnBlack.l}%, 0.1)`,
            },
            border: {
                onWhite: `hsl(${complementaryOnWhite.h}, ${complementaryOnWhite.s}%, ${complementaryOnWhite.l}%, 0.3)`,
                onBlack: `hsl(${complementaryOnBlack.h}, ${complementaryOnBlack.s}%, ${complementaryOnBlack.l}%, 0.3)`,
            },
        },
    };
    return palette;
};
