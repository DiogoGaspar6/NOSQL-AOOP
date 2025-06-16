const { client } = require('./database');
const axios = require('axios');
require('dotenv').config();

class MovieChatbot {
  constructor() {
    this.db = client.db(process.env.DBNAME);
    this.collection = this.db.collection(process.env.MONGODB_COLLECTION);
    this.userTypes = {
      casual: {
        systemMessage: "Você é um assistente de filmes amigável e acessível. Ajude o utilizador a encontrar bons filmes e responda de forma natural, entusiasmada e sempre em português de Portugal."
      },
      critic: {
        systemMessage: "Você é um crítico de cinema experiente. Analise tecnicamente os filmes e faça recomendações criteriosas, sempre respondendo em português de Portugal."
      },
      enthusiast: {
        systemMessage: "Você é um entusiasta de cinema especializado. Compartilhe curiosidades e contexto histórico de forma apaixonada, usando sempre português de Portugal."
      }
    };

    this.apiKey = process.env.GEMINI_API_KEY;
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  }

  async processQuery(query, userType) {
    try {
      const directTitleMatch = await this.collection.findOne({
        title: { $regex: new RegExp(query, 'i') }
      });

      if (directTitleMatch) {
        const responsePrompt = {
          query,
          movies: [directTitleMatch],
          intent: 'info',
          systemMessage: this.userTypes[userType].systemMessage
        };
        const llmResponse = await this.getLLMResponse(responsePrompt, userType);
        return this.formatFinalResponse(llmResponse, [directTitleMatch], userType);
      }

      let keywords = await this.extractKeywords(query);

      if (!Array.isArray(keywords) || keywords.length === 0 || keywords.every(k => k.length < 3)) {
        console.warn('⚠️ Keywords não confiáveis, usando fallback');
        keywords = ['filme', 'culto', 'incompreendido'];
      }

      console.log('🔎 Keywords extraídas:', keywords);

      const movies = await this.searchMoviesByKeywords(keywords);

      console.log('🎬 Filmes encontrados:', movies.map(m => m.title));

      if (!movies.length) {
        return 'Desculpe, não encontrei filmes que correspondam à sua busca. Pode tentar reformular a pergunta?';
      }

      const responsePrompt = {
        query,
        movies,
        intent: 'search',
        systemMessage: this.userTypes[userType].systemMessage
      };

      const llmResponse = await this.getLLMResponse(responsePrompt, userType);
      return this.formatFinalResponse(llmResponse, movies, userType);

    } catch (error) {
      console.error('❌ Erro ao processar query:', error);
      return 'Desculpe, não consegui processar sua pergunta. Pode tentar reformular?';
    }
  }

  async extractKeywords(query) {
    const prompt = {
      systemMessage: `Você é um assistente especializado em perguntas sobre filmes.
Extraia até 5 palavras-chave relevantes da pergunta a seguir.
Responda apenas com uma lista JSON simples como: ["ação", "futurista", "espaço", "aventura"]`,
      query
    };

    try {
      const response = await this.getLLMResponse(prompt);
      const clean = response.replace(/```json\n?|```|\n/g, '').trim();
      return JSON.parse(clean);
    } catch (error) {
      console.error('❌ Erro ao extrair palavras-chave:', error);
      return query.split(/\s+/).slice(0, 5);
    }
  }

  async searchMoviesByKeywords(keywords) {
    if (!Array.isArray(keywords) || !keywords.length) return [];

    const regexFilters = keywords.map(kw => ({
      $or: [
        { title: { $regex: kw, $options: 'i' } },
        { plot: { $regex: kw, $options: 'i' } },
        { genres: { $regex: kw, $options: 'i' } }
      ]
    }));

    return await this.collection.find({ $or: regexFilters }).sort({ 'imdb.rating': -1 }).limit(6).toArray();
  }

  async getLLMResponse(prompt, userType) {
    try {
      let inputText = '';

      if (prompt.systemMessage?.includes('Extraia até 5 palavras-chave')) {
        inputText = `${prompt.systemMessage}\n\nPergunta: ${prompt.query}`;
      } else if (prompt.movies) {
        const movieList = prompt.movies.map(movie =>
          `- ${movie.title} (${movie.year}): ${movie.genres?.join(', ') || 'N/A'}, Avaliação: ${movie.imdb?.rating ?? 'N/A'}/10`
        ).join('\n');

        const tone = userType === 'critic'
          ? 'analítica e técnica'
          : userType === 'enthusiast'
            ? 'apaixonada e cheia de curiosidades'
            : 'simpática e acessível';

        inputText = `
                ${prompt.systemMessage}

                Por favor, responda sempre em português de Portugal.

                Com base nos seguintes filmes, responda à pergunta do utilizador com uma abordagem ${tone}:

                Filmes disponíveis:
                ${movieList}

                Pergunta do utilizador: "${prompt.query}"
            `.trim();
      } else {
        inputText = prompt.query;
      }

      console.log('📤 Prompt enviado para Gemini:\n', inputText);

      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        {
          contents: [{ parts: [{ text: inputText }] }]
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) throw new Error('Resposta inválida da API');

      console.log('📥 Resposta do Gemini:\n', content.trim());
      return content.trim();

    } catch (error) {
      console.error('❌ Erro ao chamar Gemini API:', error);
      return null;
    }
  }

  formatMovieResponse(movies, header, userType) {
    const details = movies.map(movie =>
      `🎬 ${movie.title} (${movie.year}) - ${movie.genres?.join(', ') || 'Género não especificado'}\n` +
      `⭐ Avaliação: ${movie.imdb?.rating ?? 'N/A'}\n` +
      `📖 ${movie.fullplot || movie.plot || 'Sem descrição disponível.'}`
    ).join('\n\n');

    return `${header}\n\n${details}`;
  }

  formatFinalResponse(llmResponse, movies, userType) {
    if (!llmResponse || typeof llmResponse !== 'string' || llmResponse.length < 5) {
      return this.formatMovieResponse(movies, 'Resultado gerado com base nos dados disponíveis:', userType);
    }
    return llmResponse.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  }
}


module.exports = MovieChatbot;