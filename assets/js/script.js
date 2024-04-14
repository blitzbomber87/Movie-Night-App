// grab references to the important DOM elements
const movieTitleInput = $("#movie-title");
const searchBtn = $("#search");
const searchResults = $("#search-results");
const resultsHeader = searchResults.children().eq(0);
const modal = $(".modal");
const closeBtn = $(".btn-close");
const movie = $(".movie");

// api key for tmdb
const apiKey = "8beab362f984c637f891ce523f758c61"

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
        .html(`${data.results[i].title} (${releaseYear})`);

    return resultItem;
}

// accepts and fetches response for user input/movie title
// displays up to 5 movie titles in search results
function searchMovie(event) {
    // prevent default behavior
    event.preventDefault();
    
    const requestURL = `https://api.themoviedb.org/3/search/movie?query=${movieTitleInput.val()}&include_adult=false&language=en-US&page=1&api_key=${apiKey}`

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
    const requestURL = `https://api.themoviedb.org/3/movie/popular?language=en-US&page=1&api_key=${apiKey}`
      
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
                    .attr("data-id", data.results[i].id);
                $("figcaption").eq(i)
                    .html(data.results[i].title)
            }
        })
}

// Function to open modal and load video
function openModal(event) {
    // retrieve movie id from data attribute
    let movieID = event.target.dataset.id;

    // tmdb api request url
    const tmdbRequestURL = `https://api.themoviedb.org/3/movie/${movieID}?api_key=${apiKey}`;

    // Show modal
    // modal.style.display = "block";
    modal.show();

    // Close modal when user clicks on 'x' button
    // var closeBtn = document.getElementsByClassName("close")[0];
    // closeBtn.onclick = function() {
    //     modal.style.display = "none";
    //     player.stopVideo(); // Stop video when modal is closed
    // };
    closeBtn.on("click", function() {
        modal.hide();
        // player.stopVideo();
    });

    // fetch movie data from tmdb API
    fetch(tmdbRequestURL)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log(data);
            const moviePoster = data.poster_path;
            const imgURL = `https://image.tmdb.org/t/p/w200/${moviePoster}`

            // retrieves information from response data
            $(".modal-title").html(data.title);
            $("#modal-poster")
                .attr("src", imgURL)
                .attr("alt", `Movie poster for ${data.title}`);
            $("#summary").html(data.overview);
        })


    // // Fetch movie data from TMDB API
    // fetch(tmdbRequestURL)
    //     .then(function(response) {
    //         return response.json;
    //     }) 
    //     .then(function(data) {
    //         // Get YouTube video key
    //         var videoKey = data.results[0].key;

    //         // Create YouTube player
    //         var player = new YT.Player('player', {
    //             height: '360',
    //             width: '640',
    //             videoId: videoKey,
    //             events: {
    //                 'onReady': onPlayerReady,
    //                 'onStateChange': onPlayerStateChange
    //             }
    //         });

    //         // Function to autoplay video when player is ready
    //         function onPlayerReady(event) {
    //             event.target.playVideo();
    //         }

    //         // Function to stop video when modal is closed
    //         function onPlayerStateChange(event) {
    //             if (event.data == YT.PlayerState.ENDED) {
    //                 modal.style.display = "none";
    //             }
    //         }
    //     })
    //     .catch(error => console.error('Error:', error));
}

$(document).ready(function () {
    displayTrending();

    searchBtn.on("click", searchMovie);

    // $('#link').on("click", function () {
    //     var src = 'http://www.youtube.com/v/FSi2fJALDyQ&amp;autoplay=1';
    //     $('#myModal').modal('show');
    //     $('#myModal iframe').attr('src', src);
    // });
    
    // $('#myModal button').click(function () {
    //     $('#myModal iframe').removeAttr('src');
    // });

    movie.on("click", openModal);
    searchResults.on("click", ".list-group-item", openModal);
});