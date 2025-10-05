//*---------------------------------------------
//* CHANGEMENT DE PALETTE DE COULEURS
//*---------------------------------------------
import { paletteGenerator } from "./colors.js";

//VARIABLES                                     
const root = document.documentElement.style;
const inputColor = document.getElementById('input-color');
const body = document.querySelector('body');
const themeBtn = document.getElementById('theme-button');

//FUNCTION                                      
const applyPalette = (palette) => {
    //On change les variables en fonction de la palette créée et du thème

    // Les variables qui ne changent pas
    root.setProperty('--primary-accent-color',palette.base.color);
    root.setProperty('--primary-accent-text',palette.base.text);
    root.setProperty('--hover-color', palette.base.hover);
    root.setProperty('--active-color', palette.base.active);

    // Les variables qui changent
    if(body.classList.contains('dark-theme')) {
        root.setProperty('--background-color', palette.black);
        root.setProperty('--text-color', palette.white);
        root.setProperty('--secondary-accent-color', palette.comp.onBlack);
        root.setProperty('--border-color', palette.ligns.border.onBlack);
        root.setProperty('--separator-color', palette.ligns.separator.onBlack);
    } else {
        root.setProperty('--background-color', palette.white);
        root.setProperty('--text-color', palette.black);
        root.setProperty('--secondary-accent-color', palette.comp.onWhite);
        root.setProperty('--border-color', palette.ligns.border.onWhite);
        root.setProperty('--separator-color', palette.ligns.separator.onWhite);
    }
};

//EVENT LISTENER                                
inputColor.addEventListener('change', (e) => {
    const currentColor = e.target.value;
    const palette = paletteGenerator(currentColor);
    applyPalette(palette);
        
});

//*---------------------------------------------
//* LIGHT/DARK MODE
//*---------------------------------------------

//EVENT LISTENER                                
themeBtn.addEventListener('click', () => {
    body.classList.toggle('dark-theme');

    // Texte dans le bouton : 
    if(body.classList.contains('dark-theme')) {
        themeBtn.textContent = "Light Theme";
    } else {
        themeBtn.textContent = "Dark Theme";
    }

    // Générer la palette : 
    const currentColor = inputColor.value
    const palette = paletteGenerator(currentColor);
    applyPalette(palette);
});