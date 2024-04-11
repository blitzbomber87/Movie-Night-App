// api credentials for tmdb
const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZTFkZTliZmM4MWJjYmY3YWVjOGE0OTNjNTVjMDlmNCIsInN1YiI6IjY2MTQ4ZjI4NmM4NDkyMDE2MmZjY2QyNyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.1_c18yDf2syYp8DPtlQLVrnTe8xjGrAiN03eQa7-9vQ'
    }
  };

// retrieves trending movies from response and displays the top 10
function displayTrending() {
    const requestURL = "https://api.themoviedb.org/3/movie/popular?language=en-US&page=1"
      
    fetch(requestURL, options)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log(data);
        
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
})

$('#link').click(function () {
    var src = 'http://www.youtube.com/v/FSi2fJALDyQ&amp;autoplay=1';
    $('#myModal').modal('show');
    $('#myModal iframe').attr('src', src);
});

$('#myModal button').click(function () {
    $('#myModal iframe').removeAttr('src');
});