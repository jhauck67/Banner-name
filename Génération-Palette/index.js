// VARIABLES :                                 //
//*------------- Dark/Light Mode ----------------
const toggleBtn = document.getElementById("toggle");
const body = document.querySelector("body");
//*-------------- Choose Color ------------------
const inputColor = document.getElementById("color0");
const root = document.documentElement.style;
let currentBaseColor = {};
//*----------- Palette de couleurs --------------
const color1 = document.getElementById("color1");
const color2 = document.getElementById("color2");
const color3 = document.getElementById("color3");
const color4 = document.getElementById("color4");
const color5 = document.getElementById("color5");

// UTILS FUNCTIONS :                           //
//*----------- Convert HEX to HSL ---------------
const hexToRgb = (hex) => {
  // 1. Nettoyage : retirer le #
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => {
    return r + r + g + g + b + b;
  });

  // 2. Extraire les paires et convertir en décimal (0-255)
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  return result
    ? {
        r: parseInt(result[1], 16), // Conversion Hex (base 16) en Décimal (base 10)
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const rgbToHsl = (r, g, b) => {
  // 1. Normalisation (de 0-255 à 0-1)
  r /= 255;
  g /= 255;
  b /= 255;

  // Trouver Min et Max
  const cmax = Math.max(r, g, b),
    cmin = Math.min(r, g, b),
    delta = cmax - cmin; // Différence (Chroma)
  let h = 0,
    s = 0,
    l = 0;

  // 2. Calcul de la Luminosité (L)
  l = (cmax + cmin) / 2;

  // 3. Cas Gris : Cmax = Cmin
  if (delta === 0) {
    h = s = 0; // Gris, donc H et S sont à 0
  }
  // 4. Cas Couleur : Cmax ≠ Cmin
  else {
    // Calcul de la Saturation (S)
    s = delta / (1 - Math.abs(2 * l - 1));

    // Calcul de la Teinte (H)
    switch (cmax) {
      case r:
        h = (g - b) / delta + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      case b:
        h = (r - g) / delta + 4;
        break;
    }
    h /= 6; // Ramène la valeur dans la plage 0-1
  }

  // 5. Conversion des résultats dans les plages standards (H: 0-360, S/L: 0-100)
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return { h, s, l };
};

const hexToHsl = (hex) => {
  // 1. HEX -> RVB
  const rgb = hexToRgb(hex);

  if (!rgb) {
    console.error("Format HEX invalide");
    return null;
  }

  // 2. RVB -> HSL
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Retourne le format utile pour les calculs
  return hsl;
};

//*-------- Génération de la palette ------------
const generatePalette = (baseColor) => {
  // 1. On crée la hue de base et la hue complémentaire
  const baseHue = baseColor.h;
  const complementaryHue = (baseHue + 180) % 360;
  const psychologyText = document.querySelector('.psychology');

  // 2. On crée la variable pour la couleur d'accent
  const accentColor = `hsl(${baseHue}, 100%, 50%)`;

  if (baseHue > 0 && baseHue < 15) {
    psychologyText.textContent = "Energie, passion, force, confiance, danger, alerte, amour, séduction, tradition, culture, ...";
  } else if (baseHue > 16 && baseHue < 40) {
    psychologyText.textContent = "Energie, dynamisme, chaleur, convivialité, créativité, originalité, attraction, ...";
  } else if (baseHue > 41 && baseHue < 65) {
    psychologyText.textContent = "Optimisme, joie, créativité, intellect, énergie, activité, attention, alerte, chaleur, convivialité, ...";
  } else if (baseHue > 66 && baseHue < 165) {
    psychologyText.textContent = "Nature, fraicheur, santé, bien-être, stabilité, permission, créativité, croissance, ...";
  } else if (baseHue > 166 && baseHue < 270) {
    psychologyText.textContent = "Confiance, fiabilité, calme, sérénité, intelligence, professionnalisme, liberté, inspiration, froideur, distance, ...";
  } 

  // 3. On crée les autres variables de couleur
  const whiteColor = `hsl(${complementaryHue}, 10%, 95%)`;
  const greyDarkColor = `hsl(${complementaryHue}, 50%, 30%)`;
  const greyLightColor = `hsl(${complementaryHue}, 50%, 70%)`;
  const blackColor = `hsl(${complementaryHue}, 10%, 5%)`;

  // 4. Palette :
  color1.style.background = whiteColor;
  color2.style.background = accentColor;
  color3.style.background = greyDarkColor;
  color4.style.background = greyLightColor;
  color5.style.background = blackColor;

  const separator = `hsl(${baseHue}, 100%, 50%, 0.1)`;
  const cardBackgroundLight = `hsl(${complementaryHue}, 10%, 5%, 0.3)`;
  const cardBackgroundDark = `hsl(${complementaryHue}, 10%, 95%, 0.3)`;
  const borderColor = `hsl(${baseHue}, 100%, 50%, 0.3)`;
  const hover = `hsl(${baseHue}, 100%, 50%, 0.6)`;
  const hoverCta = `hsl(${baseHue}, 100%, 50%, 0.9)`;

  // 5. On remplace les variables CSS
  // Celles qui ne changent pas selon le theme
  root.setProperty("--primary-accent-color", accentColor);
  root.setProperty("--border-color", borderColor);
  root.setProperty("--separator-color", separator);
  root.setProperty("--hover-color", hover);
  root.setProperty("--hover-cta-color", hoverCta);
  // Attention si 215 < Hue < 284
  if (baseHue > 215 && baseHue < 284) {
    root.setProperty("--primary-accent-text", whiteColor);
  } else {
    root.setProperty("--primary-accent-text", blackColor);
  }
  // Celles qui changent selon le theme
  if (body.classList.contains("theme")) {
    root.setProperty("--background-color", blackColor);
    root.setProperty("--text-color", whiteColor);
    root.setProperty("--secondary-accent-color", greyLightColor);
    root.setProperty("--card-background", cardBackgroundDark);
  } else {
    root.setProperty("--background-color", whiteColor);
    root.setProperty("--text-color", blackColor);
    root.setProperty("--secondary-accent-color", greyDarkColor);
    root.setProperty("--card-background", cardBackgroundLight);
  }
};

// EVENT LISTENER :                            //
//*------------- Dark/Light Mode ----------------
toggleBtn.addEventListener("click", () => {
  body.classList.toggle("theme");
  if (body.classList.contains("theme")) {
    toggleBtn.textContent = "Dark Theme";
  } else {
    toggleBtn.textContent = "Light Theme";
  }
  // On rejoue generatePalette
  generatePalette(currentBaseColor);
});

inputColor.addEventListener("change", (e) => {
  // 1. On récupère le code HSL de l'input
  currentBaseColor = hexToHsl(e.target.value);

  // 2. On génère la palette de couleurs
  generatePalette(currentBaseColor);

});
