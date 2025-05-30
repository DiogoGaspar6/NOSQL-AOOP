let currentPage = 1;
const limit = 10;
let isLoading = false;

const createSkeletonMovie = () => {
  return `
    <div class="skeleton-movie">
      <div class="skeleton-image skeleton"></div>
      <div class="skeleton-content">
        <div class="skeleton-title skeleton"></div>
        <div class="skeleton-text skeleton"></div>
        <div class="skeleton-text skeleton"></div>
        <div class="skeleton-button skeleton"></div>
      </div>
    </div>
  `;
};

const showSkeletonLoading = () => {
  const moviesContainer = document.getElementById("movies");
  const skeletonHTML = Array(limit).fill(createSkeletonMovie()).join("");
  moviesContainer.insertAdjacentHTML("beforeend", skeletonHTML);
};

const removeSkeletonLoading = () => {
  const skeletons = document.querySelectorAll(".skeleton-movie");
  skeletons.forEach(skeleton => skeleton.remove());
};

const loadMovies = async () => {
  if (isLoading) return;
  isLoading = true;
  showSkeletonLoading();

  try {
    const response = await fetch(`/.netlify/functions/get_movies?page=${currentPage}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Dados recebidos não estão no formato esperado');
    }

    const moviesContainer = document.getElementById("movies");
    removeSkeletonLoading();

    data.forEach((movie) => {
      const movieElement = document.createElement("div");
      movieElement.classList.add("movie");

      movieElement.innerHTML = `
        <img src="${movie.poster}" alt="${movie.title}" onerror="this.src='../images/background-pictures.jpg'" />
        <div class="movie-info">
          <h2>${movie.title}</h2>
          <p><strong>Ano:</strong> ${movie.year}</p>
          <p><strong>Pontuação:</strong> ${movie.imdb.rating}/10</p>
          <a href="/details?id=${movie._id}" class="details-button">Ver detalhes</a>
        </div>
      `;

      moviesContainer.appendChild(movieElement);
    });

    currentPage++;
  } catch (error) {
    console.error("Erro ao carregar os filmes:", error);
    const moviesContainer = document.getElementById("movies");
    removeSkeletonLoading();
    moviesContainer.innerHTML = '<p>Erro ao carregar os filmes. Por favor, tente novamente mais tarde.</p>';
  } finally {
    isLoading = false;
  }
};

// Detecta o scroll para carregar mais filmes
const handleScroll = () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  if (scrollTop + clientHeight >= scrollHeight - 10) {
    loadMovies();
  }
};

const searchMovies = async (query) => {
  if (isLoading) return;
  isLoading = true;
  showSkeletonLoading();

  try {
    const movies = await fetch(`/.netlify/functions/search_movies?query=${encodeURIComponent(query)}`)
      .then((res) => res.json());

    const moviesContainer = document.getElementById("movies");
    moviesContainer.innerHTML = '';
    removeSkeletonLoading();

    if (movies.error) {
      moviesContainer.innerHTML = '<p>Error searching movies</p>';
      return;
    }

    movies.forEach((movie) => {
      const movieElement = document.createElement("div");
      movieElement.classList.add("movie");

      movieElement.innerHTML = `
        <img src="${movie.poster}" alt="${movie.title}" onerror="this.src='../images/background-pictures.jpg'" />
        <div class="movie-info">
          <h2>${movie.title}</h2>
          <p><strong>Ano:</strong> ${movie.year}</p>
          <p><strong>Pontuação:</strong> ${movie.imdb.rating}/10</p>
          <a href="/details?id=${movie._id}" class="details-button">Ver detalhes</a>
        </div>
      `;

      moviesContainer.appendChild(movieElement);
    });

    isLoading = false;
  } catch (error) {
    console.error("Error searching movies:", error);
    isLoading = false;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  loadMovies();
  window.addEventListener("scroll", handleScroll);

  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");

  // Add debounce function to prevent too many API calls
  let debounceTimer;
  const debounce = (callback, time) => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(callback, time);
  };

  // Search as user types
  searchInput.addEventListener("input", (event) => {
    const query = event.target.value.trim();
    debounce(() => {
      if (query) {
        searchMovies(query);
      } else {
        const moviesContainer = document.getElementById("movies");
        moviesContainer.innerHTML = '';
        currentPage = 1;
        loadMovies();
      }
    }, 200);
  });


  searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) {
      searchMovies(query);
    } else {
      const moviesContainer = document.getElementById("movies");
      moviesContainer.innerHTML = '';
      currentPage = 1;
      loadMovies();
    }
  });
});