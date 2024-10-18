// URL de base pour les appels à l'API
const baseUrl = "http://localhost:5678/api";

// Regex pour valider le format de l'email
// Cette regex permet de s'assurer que l'email saisi a le bon format (ex: nom@domaine.com)
const validEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

// Authentifcation d'un utilisateur
// ---------------------------------------------------------------------------

//  Gérer la soumission du formulaire de connexion
async function handleLogin(event) {
    // Empêche le comportement par défaut de soumission du formulaire (rechargement de la page)
    event.preventDefault();

    // Récupération des valeurs entrées dans les champs du formulaire (email et mot de passe)
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    
    // Sélection de l'élément où les messages d'erreur seront affichés
    const errorMessage = document.getElementById('login-error-message');

    // Réinitialisation du message d'erreur (on le cache au début)
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';

    // On vérifie que l'email est au bon format et que le mot de passe n'est pas vide
    if (!email.match(validEmailRegex) || !password) {
        errorMessage.textContent = "Veuillez entrer un email et un mot de passe valides.";
        errorMessage.style.display = "block"; 
        return; 
    }

    // Si validation réussie, on tente de se connecter
    try {
        // Appel à la fonction loginUser pour envoyer les informations de connexion à l'API
        const data = await loginUser({ email, password });

        // Si la connexion est réussie, on sauvegarde les informations dans le localStorage
        localStorage.setItem('token', data.token); 
        localStorage.setItem('userId', data.userId);

        // Redirection vers la page d'accueil après succès de la connexion
        window.location.href = 'index.html';
    } catch (error) {
        //Si une erreur survient lors de la tentative de connexion, on affiche un message d'erreur
        errorMessage.style.display = "block"; 
        errorMessage.textContent = error.message || 'Erreur inconnue !';
    }
}


// APPELS API
// ---------------------------------------------------------------------------

// Envoie des informations de connexion (email et mot de passe) à l'API et récupération le token si l'authentification est réussie.
async function loginUser(user) {
    // Appel à l'API pour tenter de se connecter avec les informations de l'utilisateur
    const response = await fetch(`${baseUrl}/users/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user), 
    });

    // Si la réponse est correcte (code HTTP 200), on renvoie les données sous forme de JSON
    if (response.ok) {
        return response.json(); //
    } else {
        // En cas d'échec (par exemple, email ou mot de passe incorrect), on génère un message d'erreur approprié
        const errorMessage = (response.status === 401 || response.status === 404) ? "Email ou mot de passe incorrect !" : "Erreur inconnue !";
        throw new Error(errorMessage);
    }
}

// Evenements à déclencher à chargement de la page login
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Ajout de l'événement "submit" au formulaire avec ID "user-login-form"
    document.getElementById('user-login-form').addEventListener('submit', handleLogin);
});
