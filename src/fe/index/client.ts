// script/index/client.js
// import { injectNavbar } from '../component/navbar';

import { injectNavbar } from "../component/navbar.js";

// Definisco le voci di menu
const menuItems = [
    { text: 'Home', url: '/' },
    { text: 'About', url: '/about.html' },
    { text: 'Progetti', url: '/projects.html' },
    { text: 'Contatti', url: '/contact.html' }
];

// Inietto la navbar quando la pagina è pronta
document.addEventListener('DOMContentLoaded', () =>
{
    injectNavbar('navbar-container', menuItems);

    // Eventuali altri script per questa pagina specifica
    console.log('Navbar caricata!');
});