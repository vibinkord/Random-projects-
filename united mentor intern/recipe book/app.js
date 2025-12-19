// Utility: Convert image file to Base64
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Local Storage: Get and Set
function getRecipes() {
    return JSON.parse(localStorage.getItem('recipes') || '[]');
}
function setRecipes(recipes) {
    localStorage.setItem('recipes', JSON.stringify(recipes));
}

// UI References
const recipeForm = document.getElementById('recipe-form');
const recipesList = document.getElementById('recipes-list');
const searchInput = document.getElementById('search-input');
const recipeDetail = document.getElementById('recipe-detail');

// Add New Recipe
recipeForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('recipe-name').value.trim();
    const ingredients = document.getElementById('recipe-ingredients').value.trim();
    const steps = document.getElementById('recipe-steps').value.trim();
    const imageInput = document.getElementById('recipe-image');
    if (!name || !ingredients || !steps || !imageInput.files.length) {
        alert('All fields are required!');
        return;
    }
    const image = await toBase64(imageInput.files[0]);
    const recipe = { name, ingredients, steps, image };
    const recipes = getRecipes();
    recipes.push(recipe);
    setRecipes(recipes);
    showRecipes(recipes);
    recipeForm.reset();
});

// Display Recipes
function showRecipes(recipes) {
    recipesList.innerHTML = '';
    if (recipes.length === 0) {
        recipesList.innerHTML = '<p>No recipes added yet.</p>';
        return;
    }
    recipes.forEach((recipe, index) => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.name}">
            <h3>${recipe.name}</h3>
            <p><strong>Ingredients:</strong> ${recipe.ingredients.split(',').slice(0, 2).join(', ')}...</p>
        `;
        // Click to view details
        card.onclick = () => showRecipeDetails(recipe, index);
        recipesList.appendChild(card);
    });
}

// Recipe Details Modal
function showRecipeDetails(recipe, index) {
    recipeDetail.classList.remove('hidden');
    recipeDetail.innerHTML = `
        <div id="recipe-detail-content">
            <h2>${recipe.name}</h2>
            <img src="${recipe.image}" style="max-width:200px;">
            <p><strong>Ingredients:</strong> ${recipe.ingredients}</p>
            <p><strong>Steps:</strong><br> ${recipe.steps.replace(/\n/g, '<br>')}</p>
            <button onclick="document.getElementById('recipe-detail').classList.add('hidden')">Close</button>
        </div>
    `;
}

// Search Functionality
searchInput.addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase();
    const recipes = getRecipes();
    const filtered = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(query) ||
        recipe.ingredients.toLowerCase().includes(query)
    );
    showRecipes(filtered);
});

// Initial: Load and Show
document.addEventListener('DOMContentLoaded', () => {
    showRecipes(getRecipes());
});
