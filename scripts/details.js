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
    const movie = await fetch(`/.netlify/functions/get_movie_by_id?id=${movieId}`)
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
              <span class="rating-value">${movie.imdb?.rating || 'N/A'}/10</span>
            </div>
          </div>
          <div class="movie-meta">
            <span class="year">${movie.year || 'N/A'}</span>
            <span class="separator">•</span>
            <span class="genres">${movie.genres?.join(", ") || 'N/A'}</span>
          </div>
          <div class="movie-crew">
            <div class="crew-section">
              <h3>Diretor</h3>
              <p>${movie.directors?.join(", ") || 'N/A'}</p>
            </div>
            <div class="crew-section">
              <h3>Elenco</h3>
              <p>${movie.cast?.join(", ") || 'N/A'}</p>
            </div>
          </div>
          <div class="plot-section">
            <h3>Sinopse</h3>
            <p>${movie.plot || 'N/A'}</p>
          </div>
          <div class="additional-info">
            <div class="runtime">
              <h3>Tempo</h3>
              <p>${movie.runtime || 'N/A'} minutos</p>
            </div>
            <div class="language">
              <h3>Linguagens</h3>
              <p>${movie.languages?.join(", ") || 'N/A'}</p>
            </div>
            <div class="awards">
              <h3>Escritores</h3>
              <p>${movie.writers?.map(writer => `<span class="writer">${writer}</span>`).join("<br>") || 'N/A'}</p>
            </div>
          </div>
          <div class="charts-container">
            <div class="chart-wrapper">
              <canvas id="combinedChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;

    // Criar gráfico combinado
    const ctxCombined = document.getElementById('combinedChart').getContext('2d');
    new Chart(ctxCombined, {
      type: 'bar',
      data: {
        labels: ['IMDB', 'Tomatoes Público', 'Tomatoes Críticos'],
        datasets: [{
          label: 'Avaliações do Filme',
          data: [
            movie.imdb?.rating || 'Sem dados',
            movie.tomatoes?.viewer?.rating || 'Sem dados',
            movie.tomatoes?.critic?.rating || 'Sem dados'
          ],
          backgroundColor: [
            'rgba(255, 204, 0, 0.8)',  //? Cor para o IMDB
            'rgba(255, 0, 0, 0.8)',     //? Cor o Tomatoes
            'rgba(0, 128, 0, 0.8)'      //? Cor o Críticos
          ],
          borderColor: [
            '#ffcc00',
            '#ff0000',
            '#008000'
          ],
          borderWidth: 2
        }, {
          label: 'Número de Avaliações',
          data: [
            movie.imdb?.votes || 'Sem dados',
            movie.tomatoes?.viewer?.numReviews || 'Sem dados',
            movie.tomatoes?.critic?.numReviews || 'Sem dados'
          ],
          type: 'line',
          yAxisID: 'y1',
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.1,
          fill: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#fff',
              callback: function(value) {
                return typeof value === 'number' ? value.toFixed(1) : 'Sem dados';
              }
            }
          },
          y1: {
            beginAtZero: true,
            position: 'right',
            grid: {
              drawOnChartArea: false
            },
            ticks: {
              color: '#fff',
              callback: function(value) {
                return typeof value === 'number' ? value.toLocaleString() : 'Sem dados';
              }
            }
          },
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#fff'
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#fff'
            }
          },
          title: {
            display: true,
            text: 'Comparação de Avaliações e Número de Avaliações',
            color: '#fff',
            font: {
              size: 16
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                if (context.dataset.label === 'Avaliações do Filme') {
                  return `Nota: ${context.raw.toFixed(1)}/10`;
                } else {
                  return `Número de avaliações: ${context.raw.toLocaleString()}`;
                }
              }
            }
          }
        }
      }
    });

    detailsContainer.style.textAlign = "left";
  } catch (error) {
    console.error("Erro ao carregar os detalhes do filme:", error);
    document.getElementById("movie-details").innerHTML = "<p>Erro ao carregar os detalhes do filme.</p>";
  }

  // Adiciona o botão de compartilhar apenas se o container existir
  const movieDetailsContainer = document.querySelector('.movie-details-container');
  if (movieDetailsContainer) {
    const shareButton = document.createElement('button');
    shareButton.classList.add('share-button');
    shareButton.innerHTML = '🔗 Partilhar';
    shareButton.onclick = shareMovie;
    movieDetailsContainer.appendChild(shareButton);
  }

  const loadingComments = async () => {
    const commentsList = document.getElementById("commentsList");
    commentsList.innerHTML = `
      <div class="comment-loading">
        <div class="loading-spinner"></div>
        <p>Carregando comentários...</p>
      </div>
    `;
  };

  const stopLoadingComments = () => {
    const commentsList = document.getElementById("commentsList");
    commentsList.innerHTML = "";
  };

  const loadComments = async () => {
    try {
      loadingComments();
      const comments = await fetch(`/.netlify/functions/get_comments?movieId=${movieId}`)
        .then((res) => res.json());
  
      const commentsList = document.getElementById("commentsList");
      commentsList.innerHTML = "";

      if (!Array.isArray(comments) || comments.length === 0) {
        commentsList.innerHTML = "<p>Sem comentários ainda.</p>";
        return;
      }

      commentsList.innerHTML = comments.map(comment => `
        <div class="comment" data-id="${comment._id}">
          <div class="comment-header">
              <span class="comment-date">${new Date(comment.date).toLocaleDateString()}</span>
              <div class="comment-actions">
                <button class="edit-comment-btn" onclick="editComment('${comment._id}')"><i class="fa-regular fa-pen-to-square"></i></button>
                <button class="delete-comment-btn" onclick="deleteComment('${comment._id}')"><i class="fa-regular fa-trash-can"></i></button>
              </div>
            </div>
            <div class="comment-content">${comment.text}</div>
            ${comment.edited ? '<span class="edited-mark">(editado)</span>' : ''}
        </div>
      `).join("");
  
    } catch (error) {
      console.error("Erro ao carregar comentários:", error);
    }
  };
  
  editComment = async (commentId) => {
    const commentElement = document.querySelector(`[data-id="${commentId}"]`);
    const contentElement = commentElement.querySelector(".comment-content");
    const currentText = contentElement.textContent;
  
    const textarea = document.createElement("textarea");
    textarea.value = currentText;
    textarea.classList.add("edit-textarea");
    
    const saveButton = document.createElement("button");
    saveButton.innerHTML = `<i class="fa-regular fa-floppy-disk"></i>`;
    saveButton.classList.add("save-comment-btn");
    
    const cancelButton = document.createElement("button");
    cancelButton.innerHTML = `<i class="fa-solid fa-ban"></i>`;
    cancelButton.classList.add("cancel-comment-btn");
  
    contentElement.replaceWith(textarea);
    commentElement.appendChild(saveButton);
    commentElement.appendChild(cancelButton);
  
    saveButton.onclick = async () => {
      try {
        const editedText = textarea.value.trim();
        if (!editedText) {
          throw new Error('O comentário não pode estar vazio');
        }
  
        const response = await fetch('/.netlify/functions/edit_comment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            movieId: movieId,
            commentId: commentElement.dataset.id,
            text: editedText
          })
        }).then(
          loadComments(),
        );
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao atualizar comentário');
        }
        
        if (!commentElement.querySelector('.edited-mark')) {
          const editedMark = document.createElement('span');
          editedMark.className = 'edited-mark';
          editedMark.textContent = '(editado)';
          commentText.appendChild(editedMark);
        }
      } catch (error) {
        console.error('Erro ao editar comentário:', error);
        alert(error.message);
      }
    };
  
    cancelButton.onclick = () => {
      textarea.replaceWith(contentElement);
      saveButton.remove();
      cancelButton.remove();
    };
  };
  
  window.deleteComment = async (commentId) => {
    if (confirm("Tem certeza que deseja excluir este comentário?")) {
      try {
        const response = await fetch("/.netlify/functions/delete_comment", {
          method: "POST",
          body: JSON.stringify({
            movieId,
            commentId
          })
        });
  
        if (response.ok) {
          loadComments();
        } else {
          throw new Error("Erro ao excluir comentário");
        }
      } catch (error) {
        console.error("Erro ao excluir comentário:", error);
        alert("Não foi possível excluir o comentário");
      }
    }
  };
  
  document.getElementById('submitComment').addEventListener('click', async () => {
    const commentText = document.getElementById('commentText').value.trim();
    const button = document.getElementById('submitComment')
    
    if (!commentText) return;
  
    try {
      await fetch('/.netlify/functions/add_comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId,
          text: commentText,
          date: new Date().toISOString()
        })
      }).then(
        button.innerHTML = 'A enviar ...',
        button.disabled = true,
      )
  
      document.getElementById('commentText').value = '';
      
      await loadComments();
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
    } finally {
      button.innerHTML = 'Enviar',
      button.disabled = false
    }
  });
  
  loadComments();
});

const shareMovie = () => {
  if (navigator.share) {
    navigator.share({
      url: window.location.href
    })
    .catch(error => console.log('Error sharing:', error));
  } else {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('Link copiado!'))
      .catch(error => console.log('Error copying link:', error));
  }
};
