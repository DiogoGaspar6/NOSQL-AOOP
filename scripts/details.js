document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get("id");

  if (!movieId) {
    document.getElementById("movie-details").innerHTML = "<p>Filme não encontrado.</p>";
    return;
  }

  const showSkeletonLoading = () => {
    const detailsContainer = document.getElementById("movie-details");
    detailsContainer.innerHTML = `
      <div class="skeleton-details">
        <div class="skeleton-poster skeleton"></div>
        <div class="skeleton-info">
          <div class="skeleton-text-short skeleton"></div>
          <div class="skeleton-text-short skeleton"></div>
          <div class="skeleton-text-long skeleton"></div>
          <div class="skeleton-text-long skeleton"></div>
          <div class="skeleton-text-long skeleton"></div>
          <div class="skeleton-text-short skeleton"></div>
        </div>
      </div>
    `;
  };

  showSkeletonLoading();

  try {
    const movie = await fetch(`http://localhost:8888/.netlify/functions/get_movie_by_id?id=${movieId}`)
      .then((res) => res.json());

    if (movie.error) {
      document.getElementById("movie-details").innerHTML = `<p>${movie.error}</p>`;
      return;
    }

    const detailsContainer = document.getElementById("movie-details");

    detailsContainer.innerHTML = `
      <div class="movie-details-container">
        <div class="movie-poster">
          <img src="${movie.poster}" alt="${movie.title}" onerror="this.src='../images/background-pictures.jpg'" />
        </div>
        <div class="movie-details-info">
          <div class="movie-header">
            <h2>${movie.title}</h2>
            <div class="movie-rating">
              <span class="star">⭐</span>
              <span class="rating-value">${movie.imdb.rating}/10</span>
            </div>
          </div>
          <div class="movie-meta">
            <span class="year">${movie.year}</span>
            <span class="separator">•</span>
            <span class="genres">${movie.genres.join(", ")}</span>
          </div>
          <div class="movie-crew">
            <div class="crew-section">
              <h3>Diretor</h3>
              <p>${movie.directors.join(", ")}</p>
            </div>
            <div class="crew-section">
              <h3>Elenco</h3>
              <p>${movie.cast.join(", ")}</p>
            </div>
          </div>
          <div class="plot-section">
            <h3>Sinopse</h3>
            <p>${movie.plot}</p>
          </div>
          <div class="additional-info">
            <div class="runtime">
              <h3>Tempo</h3>
              <p>${movie.runtime} minutos</p>
            </div>
            <div class="language">
              <h3>Linguagens</h3>
              <p>${movie.languages.join(", ")}</p>
            </div>
            <div class="awards">
              <h3>Escritores</h3>
              <p>${movie.writers.map(writer => `<span class="writer">${writer}</span>`).join("<br>")}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    detailsContainer.style.textAlign = "left";
  } catch (error) {
    console.error("Erro ao carregar os detalhes do filme:", error);
    document.getElementById("movie-details").innerHTML = "<p>Erro ao carregar os detalhes do filme.</p>";
  }
  
  // Add share button to the movie details
  const shareButton = document.createElement('button');
  shareButton.classList.add('share-button');
  shareButton.innerHTML = '📤 Partilhar';
  shareButton.onclick = shareMovie;
  document.querySelector('.movie-details-container').appendChild(shareButton);
});

const shareMovie = () => {
  if (navigator.share) {
    navigator.share({
      title: document.title,
      url: window.location.href
    })
    .catch(error => console.log('Error sharing:', error));
  } else {
    // Fallback for browsers that don't support Web Share API
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('Link copied to clipboard!'))
      .catch(error => console.log('Error copying link:', error));
  }
};