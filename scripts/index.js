let currentPage = 1;
const limit = 10;
let isLoading = false;

const loadMovies = async () => {
  if (isLoading) return;
  isLoading = true;

  const movies = await fetch(`/movies?page=${currentPage}&limit=${limit}`).then((res) => res.json());

  const moviesContainer = document.getElementById("movies");

  movies.forEach((movie) => {
    const movieElement = document.createElement("div");
    movieElement.classList.add("movie");

    movieElement.innerHTML = `
      <img src="${movie.poster}" alt="${movie.title}"">
      <div class="movie-info">
        <h2>${movie.title}</h2>
        <p><strong>Ano:</strong> ${movie.year}</p>
        <p><strong>Pontuação:</strong> ${movie.imdb.rating}/10</p>
        <a href="/movie/${movie._id}" class="details-button">View Details</a>
      </div>
    `;

    moviesContainer.appendChild(movieElement);
  });

  currentPage++;
  isLoading = false;
};

const handleScroll = () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  if (scrollTop + clientHeight >= scrollHeight - 10) {
    loadMovies();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  loadMovies();
  window.addEventListener("scroll", handleScroll);
});