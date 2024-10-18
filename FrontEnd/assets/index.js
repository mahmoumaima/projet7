// URL de base pour les appels à l'API
const baseUrl = "http://localhost:5678/api";

// Sélection des éléments de la gélérie
const gallery = document.querySelector('.gallery');
const filtersContainer = document.getElementById('all-filters');

// Affichage des travaux et mise en place du filtre
// ---------------------------------------------------------------------------

// Fonction pour afficher les travaux (projets) dans la galerie
// La fonction accepte un identifiant de catégorie pour filtrer les travaux
async function displayWorks(categoryId) {
    if (!gallery) {
        console.error('Élément gallery non trouvé.');
        return;
    }

    // Récupère les travaux depuis l'API
    const works = await getWorksFromApi(); 

    // On vérifie si on a récuper des travaux, la liste n'est pas vide
    if (works.length === 0) {
        console.log('Aucun travail à afficher.');
        return;
    }

    gallery.innerHTML = ''; // Réinitialise la galerie

    // Filtrer les travaux en fonction de la catégorie sélectionnée
    // Si la catégorie est "tous", afficher tous les travaux, sinon filtrer par categoryId
    const filteredWorks = works.filter(work => categoryId === "tous" || work.categoryId === categoryId);

    // Création des éléments DOM pour chaque travail filtré
    filteredWorks.map(work => {
        const figure = document.createElement('figure');
        figure.id = "fig-" + work.id; // Ajoute un ID dynamique à chaque figure

        figure.innerHTML = `
            <img id="${work.id}" class="img-class" src="${work.imageUrl}" alt="${work.title}">
            <figcaption>${work.title}</figcaption>
        `; // Structure HTML pour chaque travail

        gallery.appendChild(figure); // Ajout de l'élément figure à la galerie
    });
}

// Fonction pour afficher les boutons de filtre
async function displayFilters() {
    if (!filtersContainer) {
        console.error('Élément all-filters non trouvé.');
        return;
    }

    // Récupère les catégories depuis l'API
    const categories = await getCategoriesFromApi(); 

    // On vérifie si on a récuper des catégories, la liste n'est pas vide
    if (categories.length === 0) {
        console.log('Aucune catégorie à afficher.');
        return;
    }

    // Ajout de la catégorie spéciale "Tous" pour afficher tous les travaux
    const categorieTous = { name: "Tous", id: "tous" };
    categories.unshift(categorieTous); // Ajoute "Tous" en début de liste

    // Création des boutons de filtre pour chaque catégorie
    categories.map(category => {
        const button = document.createElement('input');
        button.setAttribute("name", "categories");
        button.type = "radio";
        button.id = "btn-" + category.id;

        const label = document.createElement('label');
        label.setAttribute("for", "btn-" + category.id);
        label.textContent = category.name;

        // Par défaut, le bouton "Tous" est sélectionné
        if (category.id === "tous") {
            button.checked = true;
        }

        // Ajoute un écouteur d'événement pour chaque bouton, appelant displayWorks avec l'ID de la catégorie sélectionnée
        button.addEventListener('click', () => displayWorks(category.id));

        // Ajout des boutons et labels dans le conteneur des filtres
        filtersContainer.appendChild(button);
        filtersContainer.appendChild(label);
    });
}


// APPELS API
// ---------------------------------------------------------------------------

// Fonction pour récupérer les projets (travaux) depuis l'API
async function getWorksFromApi() {
    try {
        const response = await fetch(`${baseUrl}/works`);
        if (!response.ok) {
            throw new Error(`Erreur de réponse : ${response.status}`);
        }
        return await response.json(); // Renvoie la liste des travaux en JSON
    } catch (error) {
        console.error('Erreur lors de la récupération des travaux :', error);
        return []; // Renvoie un tableau vide en cas d'erreur
    }
}

// Fonction pour récupérer les catégories depuis l'API
async function getCategoriesFromApi() {
    try {
        const response = await fetch(`${baseUrl}/categories}`);
        if (!response.ok) {
            throw new Error(`Erreur de réponse : ${response.status}`);
        }
        return await response.json(); // Renvoie la liste des catégories en JSON
    } catch (error) {
        console.error('Erreur lors de la récupération des catégories :', error);
        return []; // Renvoie un tableau vide en cas d'erreur
    }
}

// Evenements à déclencher à chargement de la page index
// ---------------------------------------------------------------------------

// Fonction d'initialisation lors du chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
    await displayFilters(); // Afficher les filtres (catégories)
    await displayWorks("tous"); // Afficher tous les travaux par défaut
    updateAuthLinks(); // Mettre à jour les liens d'authentification (connexion/déconnexion)
    handleLogout(); // Gérer la déconnexion
    displayEditMode(); // Gérer l'affichage du mode édition si l'utilisateur est connecté
    loadImages(); // Charger les images dans la modale (pour la gestion admin)
});
