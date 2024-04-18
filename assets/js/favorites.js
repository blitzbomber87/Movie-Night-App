// grab references to the important DOM elements
const myFavorites = $("#my-favorites");

// Populate the list dynamically by creating the movie poster element using information from response data
function renderFavoriteMovies(data) {
    // create movie card elements
    const moviePoster = data.poster_path;
    const imgURL = `https://image.tmdb.org/t/p/w200/${moviePoster}`
    const releaseYear = dayjs(data.release_date).format("YYYY");
    
    const figure = $("<figure>").addClass("col d-flex flex-column align-items-center");
    const div = $("<div>").addClass("poster");
    const img = $("<img>")
        .addClass("movie")
        .attr("src", imgURL)
        .attr("alt", `Movie poster for ${data.title}`)
        .attr("data-id", data.id)
        .attr("data-title", data.title)
        .attr("data-year", releaseYear);

    const addBtn = $("<img>")
        .addClass("add")
        .attr("src", "./assets/img/minus.png")
        .attr("data-button", "remove")
        .attr("data-id", data.id)
        .attr("title", "Remove from favorites");
        
    const figcaption = $("<figcaption>").html(data.title);

    // append movie elements to appropriate parent
    div.append(img, addBtn);
    figure.append(div, figcaption);

    return figure;
}

// retrieves favorited movies in local storage from response and displays them
function displayFavorites() {
    // loop through favorites array to append movie poster
    for (let i = 0; i < favorites.length; i++) {
        const movieID = favorites[i]
        const requestURL = `https://api.themoviedb.org/3/movie/${movieID}?api_key=${apiKeyTMDB}`;

        fetch(requestURL)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                myFavorites.append(renderFavoriteMovies(data))
            })
    }
}

$(document).ready(function () {
    // display favorited movies
    displayFavorites();

    // open modal when clicking on a movie poster
    myFavorites.on("click", ".movie", openModal)

    // add/remove movie to/from favorites list when user clicks the button on poster
    myFavorites.on("click", ".add", addToFavorites)
});