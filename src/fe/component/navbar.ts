// script/components/navbar.ts

// Definisco un tipo per le voci di menu
type MenuItem = {
    text: string;
    url: string;
    icon?: string; // Per il futuro
};

// Funzione che CREA la navbar
export function createNavbar(menuItems: MenuItem[] = []): HTMLElement
{
    // 1. Creo l'elemento navbar
    const navbar = document.createElement('nav');
    navbar.className = 'navbar';

    // 2. Logo/Home link
    const logo = document.createElement('a');
    logo.href = '/';
    logo.className = 'navbar-logo';
    logo.textContent = 'Il Mio Sito';

    // 3. Menu
    const menu = document.createElement('ul');
    menu.className = 'navbar-menu';

    // 4. Aggiungo le voci di menu
    menuItems.forEach(item =>
    {
        const menuItem = document.createElement('li');
        menuItem.className = 'navbar-item';

        const link = document.createElement('a');
        link.href = item.url;
        link.textContent = item.text;

        // Per il futuro: se c'è un'icona
        if (item.icon)
        {
            // Qui potresti aggiungere un elemento <i> o <img>
        }

        menuItem.appendChild(link);
        menu.appendChild(menuItem);
    });

    // 5. Assemblo tutto
    navbar.appendChild(logo);
    navbar.appendChild(menu);

    return navbar;
}

// Funzione che INIETTA la navbar in una pagina
export function injectNavbar(
    containerId: string = 'navbar-container',
    menuItems?: MenuItem[]
): void
{
    const container = document.getElementById(containerId);

    if (!container)
    {
        console.warn(`Contenitore #${containerId} non trovato`);
        return;
    }

    const navbar = createNavbar(menuItems);
    container.appendChild(navbar);
}