function loadCargoCategories(){

    let cargoCategories = ["tiny","small","medium","large","giant"];

    let cargoCategoriesListHTML = '';

    let i;

    for(i = 0; i < cargoCategories.length; i++){
        cargoCategoriesListHTML += "<option>" + cargoCategories[i] + "</option>";
    }

    document.getElementById('category').innerHTML = cargoCategoriesListHTML;
}