// Sélection des éléments de la modal
const modal = document.getElementById('modal');
const overlay = document.getElementById('modal-overlay');
const openBtn = document.getElementById('modifier-btn');
const closeBtn = document.getElementById('fermer-btn');
const addBtn = document.getElementById('ajouter-btn');
const returnBtn = document.getElementById('retour-btn');
const validBtn = document.getElementById('valider-btn');
const partOne = document.querySelector('.part-one');
const partTwo = document.querySelector('.part-two');
const form = document.getElementById("photo-form");
const imagePreview = document.getElementById('image-preview');

// Gestion de la page index pour afficher les éléments d'admin si on est authentifié
// -----------------------------------------------------------------------------------

// Mise à jour des liens de connexion/déconnexion
function updateAuthLinks() {
    const token = localStorage.getItem('token');
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');

    // Affiche/masque les liens en fonction de la présence du token
    if(token) {
        loginLink && (loginLink.style.display = 'none');
        logoutLink && (logoutLink.style.display = 'block');
    } else {
        loginLink && (loginLink.style.display = 'block');
        logoutLink && (logoutLink.style.display = 'none');
    }
}

// Gestion de l'affichage du mode édition
async function displayEditMode() {
    const token = localStorage.getItem('token');
    const editModeDiv = document.getElementById('edit-mode');
    const spacerDiv = document.getElementById('spacer');
    const allFilters = document.getElementById('all-filters');
    const modifierProjetBtn = document.getElementById('modifier-projets-btn');
    
    // Si l'utilisateur est connecté, affiche le mode édition
    if (token) {
        editModeDiv && (editModeDiv.style.display = 'flex');
        spacerDiv && (spacerDiv.style.display = 'block');
        allFilters && (allFilters.style.display = 'none');
        modifierProjetBtn && (modifierProjetBtn.style.display = 'flex');
    } else {
        editModeDiv && (editModeDiv.style.display = 'none');
        spacerDiv && (spacerDiv.style.display = 'none');
        allFilters && (allFilters.style.display = 'flex');
        modifierProjetBtn && (modifierProjetBtn.style.display = 'none');
    }
}

// Gestion de la deconnexion
function handleLogout() {
    const logoutLink = document.getElementById('logout-link');
    
    if (logoutLink) {
        logoutLink.addEventListener('click', event => {
            event.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            window.location.href = 'index.html';
        });
    }
}


// Gestion des evenements de la modale
// ---------------------------------------

// Affichage de la modale
function openModal() {
    modal.style.display = 'block';
    overlay.style.display = 'block';
    partOne.style.display = 'flex';
    partTwo.style.display = 'none';
    returnBtn.style.display = 'none';
}

// Ouvrir la modale
openBtn.addEventListener('click', async () => {
    openModal();
    const categories = await getCategoriesFromApi();
    if (categories.length === 0) {
        console.log('Aucune catégorie à afficher.');
        return;
    }
    populateCategories(categories);
});

// Fermeture de la modale
function closeModal() {
    modal.style.display = 'none';
    overlay.style.display = 'none';
    partOne.style.display = 'none';
    partTwo.style.display = 'none';
    returnBtn.style.display = 'none';
    resetModal();
}

// Fermer la modale
closeBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

// Réinitialisation de la modale
function resetModal() {
    imagePreview.src = "./assets/icons/image.png";
    form.reset();
    resetErrorMessages();
    desactiverValiderBtn();
}

// Basculer entre les parties de la modale
// Bouton "Ajouter"
addBtn.addEventListener('click', () => {
    returnBtn.style.display = 'block';
    partOne.style.display = 'none';
    partTwo.style.display = 'flex';
    resetModal();
});

// Bouton "Retour"
returnBtn.addEventListener('click', () => {
    returnBtn.style.display = 'none';
    partOne.style.display = 'flex';
    partTwo.style.display = 'none';
    resetModal();
});


// Ajout des projets
// ---------------------------------------------------------------------------

// Gestion de la prévisualisation de l'image avec validation de taille et format
document.getElementById('image-upload').addEventListener('change', function(event) {
    // On récupère l'image uploadée
    const file = event.target.files[0];

    // On prépare le block de mesage d'erreur
    const imageError = document.getElementById('image-error');
    imageError.style.display = 'none';

    // Validation : Vérification du format d'image
    const validImageTypes = ['image/jpeg', 'image/png'];
    if (!validImageTypes.includes(file.type)) {
        imageError.textContent = 'Veuillez télécharger une image valide (JPEG ou PNG).';
        imageError.style.display = 'block';
        return;
    }

    // Validation : Vérification de la taille maximale (4 Mo ici)
    const maxSizeInBytes = 4 * 1024 * 1024; // 4 Mo
    if (file.size > maxSizeInBytes) {
        imageError.textContent = 'La taille du fichier ne doit pas dépasser 4 Mo.';
        imageError.style.display = 'block';
        return;
    }

    if (file) {
        // On affiche l'image uploadée dans le formulaire
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// Récupérer et populer la selectbox avec la lite des catégorie depuis l'api
function populateCategories(categories) {
    // On récupère le select dans la modale par son id
    const categorySelect = document.getElementById('category-select'); 
    
    // Je vide les options existantes
    categorySelect.innerHTML = '<option></option>';
    
    // Je boucle à travers les catégories et je les  ajoute au select
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.text = category.name;
        categorySelect.appendChild(option);
    });
}

// Charger les images dans la modale
function loadImages() {
    const images = document.querySelectorAll('.img-class');
    const div = document.getElementById("images-modale");
    div.innerHTML = "";

    images.forEach(image => {
        const figure = document.createElement('figure');
        const deleteBtn = document.createElement('a');
        deleteBtn.classList.add("supprimer-btn");
        deleteBtn.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
        figure.classList.add("figure-container");
        figure.innerHTML = `<img class="image-chargee" src="${image.src}" alt="${image.alt}">`;
        figure.appendChild(deleteBtn);
        div.appendChild(figure);

        // Bouton supprimer
        deleteBtn.addEventListener('click', async (event) => {
            event.preventDefault();
            await deleteWork(image.id);
            document.querySelector(`figure[id="fig-${image.id}"]`).remove();
            figure.remove();
            console.log("Projet supprimé avec succès !");
        });
    });
}

// Validation du formulaire et envoi des données
validBtn.addEventListener('click', function(event) {
    event.preventDefault(); 

    const imageInput = document.getElementById('image-upload');
    const image = imageInput.files[0];
    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category-select').value;

    resetErrorMessages();

    let isValid = true;

    // Vérification des champs du formulaire
    if (!image) {
        displayError('image-error', 'Veuillez sélectionner une image.');
        isValid = false;
    } else if (image.size > 4 * 1024 * 1024) {
        displayError('image-error', 'L\'image ne doit pas dépasser 4 Mo.');
        isValid = false;
    }

    if (!title) {
        displayError('title-error', 'Veuillez entrer un titre.');
        isValid = false;
    }

    if (!category) {
        displayError('category-error', 'Veuillez sélectionner une catégorie.');
        isValid = false;
    }

    if (isValid) {
        const formData = new FormData();
        formData.append('image', image);
        formData.append('title', title);
        formData.append('category', category);

        addWork(formData)
            .then(async data => {
                closeModal();
                await displayWorks("tous");
                loadImages();
            })
            .catch(error => {
                console.error('Erreur lors de l\'ajout du projet :', error);
            });
    }
});

// Activation/désactivation du bouton Valider selon les champs remplis
form.addEventListener('change', () => {
    const imageInput = document.getElementById('image-upload').files[0];
    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category-select').value;

    if (imageInput && title && category) {
        activerValiderBtn();
    } else {
        desactiverValiderBtn();
    }
});

// Activation du bouton "Valider" si les champs sont remplis
function activerValiderBtn() {
    validBtn.removeAttribute("disabled");
    validBtn.classList.add("valider-btn-active");
}

// Désactivation du bouton "Valider" si les champs sont vides
function desactiverValiderBtn() {
    validBtn.setAttribute("disabled", "true");
    validBtn.classList.remove("valider-btn-active");
}

// Affichage des messages d'erreur
function displayError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Réinitialisation des messages d'erreur
function resetErrorMessages() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
        element.style.display = 'none';
    });
}


// APPELS API AVEC VÉRIFICATION DU TOKEN ET DE L'ID UTILISATEUR
// ---------------------------------------------------------------------------

// Appel API pour ajouter un projet (vérification de l'authentification)
async function addWork(formData) {
    const url = `${baseUrl}/works`;
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    // Vérification du token et de l'ID utilisateur (admin)
    if (!token || userId !== "1") {
        console.error("Accès non autorisé. Seul un administrateur peut effectuer cette action.");
        return;
    } 
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Projet ajouté avec succès !');
            return data;
        } else {
            throw new Error(`Erreur lors de l'ajout du projet : ${response.status}`);
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel API :', error);
        throw error;
    }
}

// Appel API pour supprimer une photo (vérification de l'authentification)
async function deleteWork(id) {
    const url = `${baseUrl}/works/${id}`;
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    // Vérification du token et de l'ID utilisateur (admin)
    if (!token || userId !== "1") {
        console.error("Accès non autorisé. Seul un administrateur peut effectuer cette action.");
        return;
    } 
    
    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            console.log('Photo supprimée avec succès');
        } else if (response.status === 401) {
            console.error('Vous n\'avez pas le droit de suppression');
        } else {
            console.error('Un problème est survenu lors de la suppression', response.status);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Récupération des catégories depuis l'API (pas de vérification nécessaire car lecture seule)
async function getCategoriesFromApi() {
    const url = `${baseUrl}/categories`;
    try {
        const response = await fetch(url);
        const categories = await response.json();
        return categories;
    } catch (error) {
        console.error('Erreur lors de la récupération des catégories :', error);
        return [];
    }
}