// grab references to the important DOM elements
const movieTitleInput = $("#movie-title");
const searchBtn = $("#search");
const searchResults = $("#search-results");
const resultsHeader = searchResults.children().eq(0);
const modal = $(".modal");
const closeBtn = $(".btn-close");
const movie = $(".movie");
const video = $("iframe");

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
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            
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
                    for (let i=0; i < 5; i++) {
                        searchResults.append(renderSearchResults(data, i));
                    }
                } else {
                    for (let i=0; i < data.total_results; i++) {
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
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            // loop through the response data and grab the movie poster, title, and id
            for (let i=0; i < 10; i++) {
                const moviePoster = data.results[i].poster_path;
                const imgURL = `https://image.tmdb.org/t/p/w200/${moviePoster}`
                $("img[class*='movie']").eq(i)
                    .attr("src", imgURL)
                    .attr("alt", `Movie poster for ${data.results[i].title}`)
                    .attr("data-id", data.results[i].id)
                    .attr("data-title", data.results[i].title)
                $("figcaption").eq(i)
                    .html(data.results[i].title)
            }
        })
}

// Function to open modal and load video
function openModal(event) {
    // retrieve movie id from data attribute
    let movieID = event.target.dataset.id;
    let movieTitle = event.target.dataset.title;

    // request urls for tmdb and youtube APIs
    const tmdbRequestURL = `https://api.themoviedb.org/3/movie/${movieID}?api_key=${apiKeyTMDB}`;
    const youtubeRequestURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${movieTitle}+trailer&type=video&videoEmbeddable=true&key=${apiKeyGoogle}`;

    // show modal
    modal.show();

    // close modal and stop video from playing when user clicks on 'x' button
    closeBtn.on("click", function() {
        modal.hide();
        video.removeAttr("src");
    });

    // fetch movie data from tmdb api
    fetch(tmdbRequestURL)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            const moviePoster = data.poster_path;
            const imgURL = `https://image.tmdb.org/t/p/w200/${moviePoster}`

            // retrieves movie information from response data
            $(".modal-title").html(data.title);
            $("#modal-poster")
                .attr("src", imgURL)
                .attr("alt", `Movie poster for ${data.title}`);
            $("#summary").html(data.overview);
        })
    
    // fetch movie trailer from youtube api
    fetch(youtubeRequestURL)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            // retrieve video id from response data
            const videoID = data.items[0].id.videoId;
            const videoURL = `https://www.youtube.com/embed/${videoID}`;

            // attach video url to iframe src attribute
            video.attr("src", videoURL);
        })
}

$(document).ready(function () {
    // show trending/popular movies
    displayTrending();

    // show results when user searches for a movie
    searchBtn.on("click", searchMovie);

    // open modal when either clicking on a movie poster or a search result
    movie.on("click", openModal);
    searchResults.on("click", ".list-group-item", openModal);
});
