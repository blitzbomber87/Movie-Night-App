// grab references to the important DOM elements
const movieTitleInput = $("#movie-title");
const searchBtn = $("#search");
const searchResults = $("#search-results");
const resultsHeader = searchResults.children().eq(0);
const modal = $(".modal");
const closeBtn = $(".btn-close");
const movie = $(".movie-list");
const video = $("iframe");
const reviews = $("#reviews");
const addBtn = $(".add");
const modalAddBtn = $("#favorites");

// api key for tmdb and google
const apiKeyTMDB = "8beab362f984c637f891ce523f758c61";
const apiKeyGoogle = "AIzaSyAJLkU5bqlhEG9W26-CAn8RjLRD_iq924s";

// remove header and list items in search results
function removeSearchResults() {
    resultsHeader.html("");
    searchResults.children("li").remove();
}

// create list item for search results using information from response
function renderSearchResults(data, i) {
    const releaseYear = dayjs(data.results[i].release_date).format("YYYY");

    const resultItem = $("<li>")
        .addClass("list-group-item")
        .attr("data-id", data.results[i].id)
        .attr("data-title", data.results[i].title)
        .html(`${data.results[i].title} (${releaseYear})`);

    return resultItem;
}

// accepts and fetches response for user input/movie title
// displays up to 5 movie titles in search results
function searchMovie(event) {
    // prevent default behavior
    event.preventDefault();

    const requestURL = `https://api.themoviedb.org/3/search/movie?query=${movieTitleInput.val()}&include_adult=false&language=en-US&page=1&api_key=${apiKeyTMDB}`

    fetch(requestURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {

            // if there are no results, show error message
            if (data.total_results === 0 || data === null) {
                // removes previous search results, if any
                removeSearchResults();

                resultsHeader.html(`No results found for "${movieTitleInput.val()}"`);

                // clear user input
                movieTitleInput.val("");
            } else {
                // removes previous search results, if any
                removeSearchResults();

                resultsHeader.html(`Search results for '${movieTitleInput.val()}':`);

                // show up to 5 results
                if (data.total_results >= 5) {
                    for (let i = 0; i < 5; i++) {
                        searchResults.append(renderSearchResults(data, i));
                    }
                } else {
                    for (let i = 0; i < data.total_results; i++) {
                        searchResults.append(renderSearchResults(data, i));
                    }
                }

                // clear user input
                movieTitleInput.val("");
            }
        })
}

// retrieves trending movies from response and displays the top 10
function displayTrending() {
    const requestURL = `https://api.themoviedb.org/3/movie/popular?language=en-US&page=1&api_key=${apiKeyTMDB}`

    fetch(requestURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // loop through the response data and grab the movie poster, title, and id
            for (let i = 0; i < 10; i++) {
                const moviePoster = data.results[i].poster_path;
                const imgURL = `https://image.tmdb.org/t/p/w200/${moviePoster}`
                $("img[class*='movie']").eq(i)
                    .attr("src", imgURL)
                    .attr("alt", `Movie poster for ${data.results[i].title}`)
                    .attr("data-id", data.results[i].id)
                    .attr("data-title", data.results[i].title)
                addBtn.eq(i)
                    .attr("data-id", data.results[i].id);
                $("figcaption").eq(i)
                    .html(data.results[i].title)
            }
        })
}

// creates review for accordion element using information from fetch response
function renderReviews(data, i) {
    const reviewerRating = data.results[i].author_details.rating;

    // if the reviewer didn't give a ratingm, show  "n/a'"
    if (reviewerRating === null) {
        reviewerRating = "N/A";
    }

    const accordionItem = $("<div>").addClass("accordion-item");
    const accordionHeader = $("<h5>")
        .addClass("accordion-header")
        .attr("id", `heading${i}`);
    const collapseButton = $("<button>")
        .addClass("accordion-button collapsed")
        .attr("type", "button")
        .attr("data-bs-toggle", "collapse")
        .attr("data-bs-target", `#collapse${i}`)
        .attr("aria-expanded", "false")
        .attr("aria-controls", `collapse${i}`)
        .html(`Review by ${data.results[i].author} || Rating: ${data.results[i].author_details.rating}`);
    const accordionCollapse = $("<div>")
        .addClass("accordion-collapse collapse")
        .attr("id", `collapse${i}`)
        .attr("aria-labelledby", `heading${i}`)
        .attr("data-bs-parent", "#reviews");
    const accordionBody = $("<div>").addClass("accordion-body");
    const review = $("<p>").html(data.results[i].content);

    accordionBody.append(review);
    accordionCollapse.append(accordionBody);
    accordionHeader.append(collapseButton);
    accordionItem.append(accordionHeader, accordionCollapse);

    return accordionItem;
}

// Function to open modal and load video
function openModal(event) {
    // retrieve movie id from data attribute
    let movieID = event.target.dataset.id;
    let movieTitle = event.target.dataset.title;

    // request urls for tmdb movies & reviews and youtube APIs
    const tmdbRequestURL = `https://api.themoviedb.org/3/movie/${movieID}?api_key=${apiKeyTMDB}`;
    const movieReviewRequestURL = `https://api.themoviedb.org/3/movie/${movieID}/reviews?language=en-US&page=1&api_key=${apiKeyTMDB}`;
    const youtubeRequestURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${movieTitle}+trailer&type=video&videoEmbeddable=true&key=${apiKeyGoogle}`;

    // show modal
    modal.show();

    // close modal and stop video from playing when user clicks on 'x' button
    closeBtn.on("click", function () {
        modal.hide();
        video.removeAttr("src");
    });

    // fetch movie data from tmdb api
    fetch(tmdbRequestURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            const moviePoster = data.poster_path;
            const imgURL = `https://image.tmdb.org/t/p/w200/${moviePoster}`
            const releaseYear = dayjs(data.release_date).format("YYYY");

            // retrieves movie information from response data
            $(".modal-title").html(`${data.title} (${releaseYear})`);
            $("#modal-poster")
                .attr("src", imgURL)
                .attr("alt", `Movie poster for ${data.title}`);
            //retreive each movie rating
            $("#rating").html(`Overall rating: ${data.vote_average.toFixed(2)} / 10`);
            $("#summary").html(data.overview);
            $("#favorites").attr("data-id", movieID);
        })

    // fetch movie reviews from tmdb api
    fetch(movieReviewRequestURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // remove any reviews from other movies, if anu
            reviews.children().remove();

            // show first 3 reviews
            for (let i = 0; i < 3; i++) {
                reviews.append(renderReviews(data, i));
            }
        })

    // fetch movie trailer from youtube api
    fetch(youtubeRequestURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // retrieve video id from response data
            const videoID = data.items[0].id.videoId;
            const videoURL = `https://www.youtube.com/embed/${videoID}`;

            // attach video url to iframe src attribute
            video.attr("src", videoURL);
        })
}

// toggle add/remove button for favorites list
function toggleButton(event) {
    // if button is +, change image, data attribute, and tooltip to remove
    if (event.target.dataset.button === "add") {
        event.target.src = "./assets/img/minus.png";
        event.target.dataset.button = "remove";
        event.target.title = "Remove from favorites"
        // if button is -, change image, data attribute, and tooltip to add
    } else {
        event.target.src = "./assets/img/plus.png";
        event.target.dataset.button = "add";
        event.target.title = "Add to favorites"
    }
}

// Function to add a movie to favorites
function addToFavorites(event) {
    let movieID = parseInt(event.target.dataset.id);
    if (typeof (Storage) !== "undefined") {
        // Retrieve existing favorites from localStorage or initialize an empty array
        let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

        
        // Check if the movie is already in favorites
        if (!favorites.includes(movieID.toString())) {
            // Add the movie to favorites
            favorites.push(movieID.toString());
        }
        // Update localStorage with the new favorites array
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }


}

$(document).ready(function () {


    if (window.location.pathname === "/index.html") {
        displayTrending();
    }

    // show results when user searches for a movie
    searchBtn.on("click", searchMovie);

    // open modal when either clicking on a movie poster or a search result
    movie.on("click", openModal);
    searchResults.on("click", ".list-group-item", openModal);

    addBtn.on("click", addToFavorites);
    modalAddBtn.on("click", addToFavorites);
});
