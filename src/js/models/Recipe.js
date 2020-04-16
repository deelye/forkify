import axios from "axios";

export default class Recipe {
  constructor(id) {
    this.id = id;
  }

  async getRecipe() {
    try {
      const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
      this.title = res.data.recipe.title;
      this.author = res.data.recipe.publisher;
      this.img = res.data.recipe.image_url;
      this.url = res.data.recipe.source_url;
      this.ingredients = res.data.recipe.ingredients;
    } catch (error) {
      console.log(error);
      alert("Something went wrong.")
    };
  };

  calcTime() {
    const numIng = this.ingredients.length;
    const periods = Math.ceil(numIng / 3);
    this.time = periods * 15;
  }

  calcServings() {
    this.servings = 4;
  }

  parseIngredients() {
    const unitsLong = ["tablespoons", "tablespoon", "ounces", "ounce", "teaspoons", "teaspoons", "cups", "pounds"];
    const unitsShort = ["tbsp", "tbsp", "oz", "oz", "tsp", "tsp", "cup", "pound"];
    const units = [...unitsShort, "kg", "g"]

    const newIngredients = this.ingredients.map(item => {
      // 1. Uniform ingredients
      let ingredient = item.toLowerCase();
      unitsLong.forEach((unit, i) => {
        ingredient = ingredient.replace(unit, unitsShort[i]);
      });
      // 2. Remove brackets
      ingredient = ingredient.replace(/ *\([^]*\) */g, " ");
      // 3. Parse ingredients into count, unit and ingredient
      const arrayIngredient = ingredient.split(" ");
      const unitIndex = arrayIngredient.findIndex(element => units.includes(element));

      let objectIngredient;
      if (unitIndex > -1) {
        const arrayCount = arrayIngredient.slice(0, unitIndex);

        let count;
        if (arrayCount.length === 1) {
          count = eval(arrayIngredient[0].replace("-", "+"));
        } else {
          count = eval(arrayIngredient.slice(0, unitIndex).join("+"));
        };

        objectIngredient = {
          count,
          unit: arrayIngredient[unitIndex],
          ingredient: arrayIngredient.slice(unitIndex + 1).join(" ")
        };
      } else if (parseInt(arrayIngredient[0], 10)) {
        objectIngredient = {
          count: parseInt(arrayIngredient[0], 10),
          unit: "",
          ingredient: arrayIngredient.slice(1).join(" ")
        };
      } else if (unitIndex === -1) {
        objectIngredient = {
          count: 1,
          unit: "",
          ingredient
        };
      }


      return objectIngredient;
    });
    this.ingredients = newIngredients;
  }
}


















