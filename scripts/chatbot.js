const { client } = require('./database');
const axios = require('axios');
require('dotenv').config();

class MovieChatbot {
    constructor() {
        this.db = client.db(process.env.DBNAME);
        this.collection = this.db.collection(process.env.MONGODB_COLLECTION);
        this.userTypes = {
            casual: {
                systemMessage: "Você é um assistente de filmes amigável e acessível, focado em recomendações populares e entretenimento."
            },
            critic: {
                systemMessage: "Você é um crítico de cinema experiente, focado em análise técnica, direção, roteiro e aspectos artísticos."
            },
            enthusiast: {
                systemMessage: "Você é um entusiasta de cinema, especializado em gêneros específicos e filmes cult, com conhecimento profundo de cinema."
            }
        };
        
        this.model = process.env.HUGGINGFACE_MODEL || 'pierreguillou/gpt2-small-portuguese';
    }

    async processQuery(query, userType = 'casual') {
        try {
            const lowerQuery = query.toLowerCase();
            
            let movies = [];
            if (lowerQuery.includes('gostei') || lowerQuery.includes('similar') || lowerQuery.includes('como')) {
                movies = await this.getSimilarMovies(query);
            } else if (lowerQuery.includes('cult') || lowerQuery.includes('seguidores') || lowerQuery.includes('seguindo')) {
                movies = await this.getCultMovies();
            } else if (lowerQuery.includes('90') || lowerQuery.includes('anos 90') || lowerQuery.includes('década')) {
                movies = await this.getHiddenGemsByDecade('90');
            } else {
                movies = await this.getGeneralRecommendation(query, userType);
            }

            if (!movies || movies.length === 0) {
                return 'Desculpe, não encontrei filmes que correspondam à sua busca.';
            }

            const prompt = this.preparePrompt(query, movies, userType);
            const llmResponse = await this.getLLMResponse(prompt, userType);
            return this.formatFinalResponse(llmResponse, movies, userType);
        } catch (error) {
            console.error('Erro ao processar query:', error);
            return 'Desculpe, não consegui processar sua pergunta. Pode tentar reformular?';
        }
    }

    async getLLMResponse(prompt, userType) {
        try {
            // Usando Hugging Face Inference API
            const response = await axios.post(
                `https://api-inference.huggingface.co/models/${this.model}`,
                {
                    inputs: this.formatPromptForHuggingFace(prompt, userType),
                    parameters: {
                        max_length: 500,
                        temperature: 0.7,
                        return_full_text: false
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data[0].generated_text;
        } catch (error) {
            console.error('Erro ao chamar Hugging Face API:', error);
            return null;
        }
    }

    formatPromptForHuggingFace(prompt, userType) {
        const systemMessage = this.userTypes[userType].systemMessage;
        const movieList = prompt.movies.map(movie => 
            `- ${movie.title} (${movie.year}): ${movie.description || 'Sem descrição'}`
        ).join('\n');

        return `${systemMessage}\n\nContexto dos filmes:\n${movieList}\n\nPergunta do usuário: ${prompt.query}\n\nResposta:`;
    }

    preparePrompt(query, movies, userType) {
        const movieContext = movies.map(movie => ({
            title: movie.title,
            year: movie.year,
            genre: movie.genre,
            rating: movie.rating,
            description: movie.description,
            director: movie.director,
            writer: movie.writer,
            technicalScore: movie.technicalScore,
            subgenres: movie.subgenres,
            influences: movie.influences
        }));

        return {
            query,
            movies: movieContext,
            userType,
            systemMessage: this.userTypes[userType].systemMessage
        };
    }

    formatFinalResponse(llmResponse, movies, userType) {
        if (!llmResponse) {
            return this.formatMovieResponse(movies, 'Recomendações baseadas na sua busca:', userType);
        }

        let response = llmResponse + '\n\n';
        response += this.formatMovieResponse(movies, 'Detalhes dos filmes:', userType);
        return response;
    }

    async getSimilarMovies(query) {
        const movieName = this.extractMovieName(query);
        if (!movieName) {
            return 'Por favor, mencione um filme para que eu possa encontrar recomendações similares.';
        }

        const referenceMovie = await this.collection.findOne({
            title: { $regex: movieName, $options: 'i' }
        });

        if (!referenceMovie) {
            return `Não encontrei o filme "${movieName}". Pode verificar o nome e tentar novamente?`;
        }

        const similarMovies = await this.collection.find({
            _id: { $ne: referenceMovie._id },
            $or: [
                { genre: referenceMovie.genre },
                { rating: { $gte: referenceMovie.rating - 1, $lte: referenceMovie.rating + 1 } }
            ]
        })
        .sort({ rating: -1 })
        .limit(5)
        .toArray();

        return this.formatMovieResponse(similarMovies, `Filmes similares a "${referenceMovie.title}":`);
    }

    async getCultMovies() {
        const cultMovies = await this.collection.find({
            rating: { $lt: 7 },
            $or: [
                { tags: { $in: ['cult', 'culto', 'underground'] } },
                { description: { $regex: 'cult|culto|underground', $options: 'i' } }
            ]
        })
        .sort({ rating: 1 })
        .limit(5)
        .toArray();

        return this.formatMovieResponse(cultMovies, 'Filmes cult com avaliações mais baixas:');
    }

    async getHiddenGemsByDecade(decade) {
        const startYear = parseInt(decade + '0');
        const endYear = startYear + 9;

        const hiddenGems = await this.collection.find({
            year: { $gte: startYear, $lte: endYear },
            rating: { $gte: 7.5 },
            $or: [
                { tags: { $in: ['hidden gem', 'escondido', 'pérola'] } },
                { description: { $regex: 'hidden gem|escondido|pérola', $options: 'i' } }
            ]
        })
        .sort({ rating: -1 })
        .limit(5)
        .toArray();

        return this.formatMovieResponse(hiddenGems, `Pérolas escondidas dos anos ${decade}:`);
    }

    async getGeneralRecommendation(query, userType) {
        const systemMessage = this.userTypes[userType].systemMessage;
        
        const movies = await this.collection
            .find({
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { tags: { $regex: query, $options: 'i' } }
                ]
            })
            .limit(5)
            .toArray();
        
        return this.formatMovieResponse(movies, 'Recomendações baseadas na sua busca:', userType);
    }

    formatMovieResponse(movies, header, userType = 'casual') {
        if (movies.length === 0) {
            return 'Desculpe, não encontrei filmes que correspondam à sua busca.';
        }

        let response = `${header}\n\n`;
        movies.forEach((movie, index) => {
            response += `${index + 1}. ${movie.title} (${movie.year})\n`;
          
            switch(userType) {
                case 'critic':
                    response += `   Direção: ${movie.director || 'N/A'}\n`;
                    response += `   Roteiro: ${movie.writer || 'N/A'}\n`;
                    response += `   Análise Técnica: ${movie.technicalScore || 'N/A'}\n`;
                    break;
                case 'enthusiast':
                    response += `   Gênero: ${movie.genre}\n`;
                    response += `   Subgêneros: ${movie.subgenres || 'N/A'}\n`;
                    response += `   Influências: ${movie.influences || 'N/A'}\n`;
                    break;
                default:
                    response += `   Gênero: ${movie.genre}\n`;
                    response += `   Avaliação: ${movie.rating}/10\n`;
                    response += `   ${movie.shortDescription || ''}\n`;
            }
            response += '\n';
        });

        return response;
    }

    extractMovieName(query) {
        const movieMatch = query.match(/"([^"]+)"/);
        if (movieMatch) {
            return movieMatch[1];
        }
        
        const keywords = ['gostei de', 'similar a', 'como', 'parecido com'];
        for (const keyword of keywords) {
            if (query.toLowerCase().includes(keyword)) {
                const parts = query.split(keyword);
                if (parts[1]) {
                    return parts[1].trim();
                }
            }
        }
        
        return null;
    }
}

module.exports = MovieChatbot; 