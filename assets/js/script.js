// grab references to the important DOM elements
const movieTitleInput = $("#movie-title");
const searchBtn = $("#search");

// api key for tmdb
const apiKey = "8beab362f984c637f891ce523f758c61"

function searchMovie(event) {
    event.preventDefault();
    
    const requestURL = `https://api.themoviedb.org/3/search/movie?query=${movieTitleInput.val()}&include_adult=false&language=en-US&page=1&api_key=${apiKey}`

    console.log
    fetch(requestURL)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log(data);
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
                moviePoster = data.results[i].poster_path;
                imgURL = `https://image.tmdb.org/t/p/w200/${moviePoster}`
                $("img").eq(i)
                    .attr("src", imgURL)
                    .attr("data-id", data.results[i].id)
                    .attr("data-title", data.results[i].original_title);
            }
        })
}

$(document).ready(function () {
    displayTrending();

    searchBtn.on("click", searchMovie);

    $('#link').click(function () {
        var src = 'http://www.youtube.com/v/FSi2fJALDyQ&amp;autoplay=1';
        $('#myModal').modal('show');
        $('#myModal iframe').attr('src', src);
    });
    
    $('#myModal button').click(function () {
        $('#myModal iframe').removeAttr('src');
    });
});
