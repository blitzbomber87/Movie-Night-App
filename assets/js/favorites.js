
// Retrieve favorites from localStorage
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Populate the list dynamically
function renderFavoriteMovies(data) {
    const moviePoster = data.poster_path;
    const imgURL = `https://image.tmdb.org/t/p/w200/${moviePoster}`
    const figure = $("<figure>").addClass("col d-flex flex-column align-items-center");
    const div = $("<div>").addClass("poster");
    const img = $("<img>")
        .attr("src", imgURL)
        .attr("alt", `Movie poster for ${data.title}`)
        .attr("data-id", data.id)
        .attr("data-title", data.title);

    const addBtn = $("<img>")
        .addClass("add")
        .attr("src", "./assets/img/minus.png")
        .attr("data-button", "remove")
        .attr("title", "Remove from favorites");
        
    const figcaption = $("<figcaption>").html(data.title);

    div.append(img, addBtn);
    figure.append(div, figcaption);

    return figure;
}

function displayFavorites() {
    for (let i = 0; i < favorites.length; i++) {
        const movieID = favorites[i]
        const requestURL = `https://api.themoviedb.org/3/movie/${movieID}?api_key=${apiKeyTMDB}`;

        fetch(requestURL)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                $("#my-favorites").append(renderFavoriteMovies(data))
            })
    }
}
$(document).ready(function () {
    displayFavorites();
});