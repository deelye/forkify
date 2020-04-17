import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";
import { elements, renderLoader, clearLoader } from  "./views/base";

const state = {};
window.state = state;

// SEARCH CONTROLLER
const controlSearch = async () => {
  // 1. Get query from view
  const query = searchView.getInput();

  if (query) {
    // 2. New search object and add to state
    state.search = new Search(query);

    // 3. Prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);

    try {
      // 4. Search for recipes
      await state.search.getResults();

      // 5. Render results on UI
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (error) {
      alert("Something went wrong with the search.");
      clearLoader();
    };
  };
};

elements.searchForm.addEventListener("submit", event => {
  event.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener("click", event => {
  const btn = event.target.closest(".btn-inline");
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage)
  };
});

// RECIPE CONTROLLER
const controlRecipe = async () => {
  const id = window.location.hash.replace("#", "");

  if (id) {
    // Prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // Highlight selected recipe
    if (state.search) {
      searchView.highlightSelected(id);
    };

    // Create new recipe object
    state.recipe = new Recipe(id);

    try {
      // Get recipe data
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      // Calculate time and servings
      state.recipe.calcTime();
      state.recipe.calcServings();

      // Render recipe
      clearLoader();
      recipeView.renderRecipe(
        state.recipe,
        state.likes.isLiked(id)
      );
    } catch (err) {
      alert("Error processing recipe.");
    };
  };
};

["hashchange", "load"].forEach(event => window.addEventListener(event, controlRecipe));

// LIST CONTROLLER
state.likes = new Likes();
likesView.toggleLikeMenu(state.likes.getNumberLikes());

const controlList = () => {
  if (!state.list) state.list = new List();

  state.recipe.ingredients.forEach(ingredient => {
    const item = state.list.addItem(ingredient.count, ingredient.unit, ingredient.ingredient);
    listView.renderItem(item);
  });
};

elements.shopping.addEventListener("click", event => {
  const id = event.target.closest(".shopping__item").dataset.itemid;

  if (event.target.matches(".shopping__delete, .shopping__delete *")) {
    state.list.deleteItem(id);
    listView.deleteItem(id);
  } else if (event.target.matches(".shopping__count-value")) {
    const value = parseInt(event.target.value, 10);
    state.list.updateCount(id, value);
  };
});

// LIKE CONTROLLER
const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currentID = state.recipe.id;

  if (!state.likes.isLiked(currentID)) {
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
      );
    likesView.toggleLikeBtn(true);
    likesView.renderLike(newLike);
  } else {
    state.likes.deleteLike(currentID);
    likesView.toggleLikeBtn(false);
    likesView.deleteLike(currentID);
  };
  likesView.toggleLikeMenu(state.likes.getNumberLikes());
};

// Handling recipe button clicks
elements.recipe.addEventListener("click", event => {
  if (event.target.matches(".btn-decrease, .btn-decrease *")) {
    if (state.recipe.servings > 1) {
      state.recipe.updateServings("decrease");
      recipeView.updateServingsIngredients(state.recipe);
    };
  } else if (event.target.matches(".btn-increase, .btn-increase *")) {
    state.recipe.updateServings("increase");
    recipeView.updateServingsIngredients(state.recipe);
  } else if (event.target.matches(".recipe__btn--add, .recipe__btn--add *")) {
    controlList();
  } else if (event.target.matches(".recipe__love, .recipe__love *")) {
    controlLike();
  } ;
});

window.list = new List();
