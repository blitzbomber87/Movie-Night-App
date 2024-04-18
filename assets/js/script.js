// grab references to the important DOM elements
const movieTitleInput = $("#movie-title");
const searchBtn = $("#search");
const searchResults = $("#search-results");
const resultsHeader = searchResults.children().eq(0);
const modal = $(".modal");
const closeBtn = $(".close");
const movie = $(".movie-list");
const video = $("iframe");
const reviews = $("#reviews");
const addBtn = $(".add");
const modalAddBtn = $("#favorites");

// api key for tmdb and google
const apiKeyTMDB = "8beab362f984c637f891ce523f758c61";
const apiKeyGoogle = "AIzaSyAJLkU5bqlhEG9W26-CAn8RjLRD_iq924s";

// Retrieve existing favorites from localStorage or initialize an empty array
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

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

                // loop through favorites array and change add button to remove for that poster
                for (let x=0; x < favorites.length; x++) {
                    if (favorites[x] == data.results[i].id) {
                        console.log(favorites[x])
                        console.log(data.results[i].id)
                        addBtn.eq(i)
                        .attr("src", "./assets/img/minus.png")
                        .attr("data-button", "remove")
                        .attr("title", "Remove from favorites");
                    }
                }

                $("figcaption").eq(i)
                    .html(data.results[i].title);
            }

        })
}

// creates review for accordion element using information from fetch response
function renderReviews(data, i) {
    const reviewerRating = data.results[i].author_details.rating;

    // if the reviewer didn't give a rating, show  "n/a'"
    if (reviewerRating === null) {
        reviewerRating = "N/A";
    }

    // create accordion elements
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

    // append accordion elements to appropriate parent
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

    console.log(event)
    // request urls for tmdb movies & reviews and youtube APIs
    const tmdbRequestURL = `https://api.themoviedb.org/3/movie/${movieID}?api_key=${apiKeyTMDB}`;
    const movieReviewRequestURL = `https://api.themoviedb.org/3/movie/${movieID}/reviews?language=en-US&page=1&api_key=${apiKeyTMDB}`;
    const youtubeRequestURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${movieTitle}+trailer&type=video&videoEmbeddable=true&key=${apiKeyGoogle}`;

    // create the appropriate add/remove button on modal depending on the button on poster
    if (event.target.nextElementSibling.dataset.button === "add") {
        modalAddBtn
            .removeClass("btn-outline-danger")
            .addClass("btn-outline-success")
            .attr("data-button", "add")
            .html("Add to Favorites");
    } else {
        modalAddBtn
            .removeClass("btn-outline-success")
            .addClass("btn-outline-danger")
            .attr("data-button", "remove")
            .html("Remove from Favorites");
    }
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
            //retrieve each movie rating
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
            // remove any reviews from other movies, if any
            reviews.children().remove();

            // show up to first 3 reviews
            if (reviews.length < 3) {
                for (let i = 0; i < reviews.length; i++) {
                    reviews.append(renderReviews(data, i));
                }
            } else {
                for (let i = 0; i < 3; i++) {
                    reviews.append(renderReviews(data, i));
                }
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
function toggleButton(event, movieID) {
    // if button is +, change image, data attribute, and tooltip to remove
    if (event.target.className === "add") {
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
    } else {
        // if button is "Add to Favorites", change image, button class, data attribute, and inner html to remove
        if (event.target.dataset.button === "add") {
            event.target.className = "btn btn-outline-danger";
            event.target.dataset.button = "remove";
            event.target.innerHTML = "Remove from Favorites"

            $(`.add[data-id=${movieID}]`)
                .attr("src", "./assets/img/minus.png")
                .attr("data-button", "remove")
                .attr("title", "Remove from favorites");

        // if button is "Remove from Favorites", change image, button class, data attribute, and inner html to add
        } else {
            event.target.className = "btn btn-outline-success";
            event.target.dataset.button = "add";
            event.target.innerHTML = "Add to Favorites"

            $(`.add[data-id='${movieID}']`)
                .attr("src", "./assets/img/plus.png")
                .attr("data-button", "add")
                .attr("title", "Add to favorites");
        }
    }
}

// function to add/remove a movie to/from favorites array
function addToFavorites(event) {
    let movieID = event.target.dataset.id;
    if (typeof (Storage) !== "undefined") {
        // if the movie is not in favorites and the button is an add button
        if (!favorites.includes(movieID) && event.target.dataset.button === "add") {
            // Add the movie to favorites
            favorites.push(movieID);
        
        // if movie is  in favorites and the button is a remove button
        } else if (favorites.includes(movieID) && event.target.dataset.button === "remove") {
            // loop through favorites array to find index of movie id to remove it
            for (let i=0; i < favorites.length; i++) {
                if (favorites[i] === movieID) {
                    favorites.splice(i, 1);
                }
            }
        }

        // Update localStorage with the new favorites array
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }

    // change add button to remove button, and vice versa
    toggleButton(event, movieID);
}

$(document).ready(function () {
    // run functions only if pathname contains index.html
    // src: https://stackoverflow.com/questions/4597050/how-to-check-if-the-url-contains-a-given-string
    if (window.location.pathname.indexOf("/index.html") !==1) {
        // display trending movies
        displayTrending();

        // open modal when clicking on a movie poster
        movie.on("click", openModal);

        // add/remove movie to/from favorites list when user clicks the button on poster
        addBtn.on("click", addToFavorites);
    }

    // show results when user searches for a movie
    searchBtn.on("click", searchMovie);

    // open modal when clicking on a search result
    searchResults.on("click", ".list-group-item", openModal);

    // add/remove movie to/from favorites list when user clicks the button on modal
    modalAddBtn.on("click", addToFavorites);
});
