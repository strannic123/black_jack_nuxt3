import { defineStore } from 'pinia'

const DECK_COUNT = 6
const BASE_URL = 'https://deckofcardsapi.com/api/deck'
let deckId = ''

/**
 * Выполняет запрос к API колоды карт
 * @param {string} endpoint - Конечная точка API
 * @returns {Promise<Object>} - Результат запроса в формате JSON
 */
async function fetchDeckAPI(endpoint) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`)
    return await response.json()
  } catch (error) {
    console.error('Ошибка API колоды:', error)
    throw error
  }
}

/**
 * Получает ID новой колоды
 * @returns {Promise<boolean>} - Успешность операции
 */
const getFullDeckId = async function () {
  try {
    const data = await fetchDeckAPI(`/new/shuffle/?deck_count=${DECK_COUNT}`)
    deckId = data.deck_id
    return true
  } catch (error) {
    console.warn('Не удалось получить ID колоды:', error)
    return false
  }
}

// Эти функции не используются в текущей версии приложения
// Но могут пригодиться в будущем

/**
 * Получает следующую карту
 * @returns {Promise<Object>} - Данные с одной картой
 */
const getNextCard = async function () {
  return fetchDeckAPI(`/${deckId}/draw/?count=1`)
}

export const useGameStore = defineStore('game', {
  state: () => ({
    playerCards: [],
    dealerCards: [],
    gameStatus: 'idle',
    winner: null,
    message: '',
    isLoading: false,
  }),

  getters: {
    playerScore() {
      return this.calculateScore(this.playerCards)
    },

    dealerScore() {
      return this.calculateScore(this.dealerCards)
    },

    playerHasBlackjack() {
      return this.playerCards.length === 2 && this.playerScore === 21
    },

    dealerHasBlackjack() {
      return this.dealerCards.length === 2 && this.dealerScore === 21
    },

    isGameOver() {
      return this.gameStatus === 'finished'
    },
  },

  actions: {
    /**
     * Проверяет, есть ли у дилера "soft 17" (т.е. 17 очков с тузом, считающимся за 11)
     * Дилер должен брать карту при "soft 17"
     * @returns {boolean} - true, если у дилера "soft 17"
     */
    hasSoft17() {
      if (this.dealerScore !== 17) {
        return false
      }

      let aceCount = 0
      let scoreWithoutAces = 0

      for (const card of this.dealerCards) {
        if (card.value === 'ACE') {
          aceCount++
        } else if (['KING', 'QUEEN', 'JACK'].includes(card.value)) {
          scoreWithoutAces += 10
        } else {
          scoreWithoutAces += parseInt(card.value)
        }
      }

      return aceCount > 0 && scoreWithoutAces === 6
    },

    /**
     * Рассчитывает счет для набора карт
     * @param {Array} cards - Массив карт
     * @returns {number} - Общий счет
     */
    calculateScore(cards) {
      if (!cards || cards.length === 0) return 0

      let score = 0
      let aceCount = 0

      const result = cards.reduce(
        (acc, card) => {
          const value = card.value
          if (value === 'ACE') {
            acc.aceCount++
            acc.score += 11
          } else if (['KING', 'QUEEN', 'JACK'].includes(value)) {
            acc.score += 10
          } else {
            acc.score += parseInt(value)
          }
          return acc
        },
        { score: 0, aceCount: 0 }
      )

      score = result.score
      aceCount = result.aceCount

      while (score > 21 && aceCount > 0) {
        score -= 10
        aceCount--
      }

      return score
    },

    /**
     * Начинает новую игру
     */
    async startNewGame() {
      this.isLoading = true
      this.playerCards = []
      this.dealerCards = []
      this.gameStatus = 'playing'
      this.winner = null
      this.message = ''

      try {
        await getFullDeckId()
        const firstFourCards = await fetchDeckAPI(`/${deckId}/draw/?count=4`)

        if (firstFourCards.cards && firstFourCards.cards.length === 4) {
          this.playerCards = [firstFourCards.cards[0], firstFourCards.cards[1]]
          this.dealerCards = [firstFourCards.cards[2], firstFourCards.cards[3]]

          const playerHasBlackjack = this.playerScore === 21 && this.playerCards.length === 2
          const dealerHasBlackjack = this.dealerScore === 21 && this.dealerCards.length === 2

          if (playerHasBlackjack || dealerHasBlackjack) {
            this.gameStatus = 'finished'

            this.winner =
              playerHasBlackjack && dealerHasBlackjack
                ? 'tie'
                : playerHasBlackjack
                  ? 'player'
                  : 'dealer'

            if (playerHasBlackjack && dealerHasBlackjack) {
              this.message = 'Ничья! У вас и у дилера Black Jack.'
            } else if (playerHasBlackjack) {
              this.message = 'Вы выиграли с Black Jack! Поздравляем!'
            } else {
              this.message = 'Дилер выиграл с Black Jack!'
            }
          } else {
            this.gameStatus = 'playerTurn'
            this.message = 'Карты разданы. Ваш ход!'
          }
        }
      } catch (error) {
        this.message = 'Ошибка при начале игры. Пожалуйста, попробуйте еще раз.'
        this.gameStatus = 'idle'
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Игрок берет еще одну карту
     */
    async playerHit() {
      if (this.gameStatus !== 'playerTurn' || this.playerScore >= 21) return

      this.isLoading = true
      try {
        const nextCard = await getNextCard()
        if (nextCard.cards && nextCard.cards.length === 1) {
          this.playerCards.push(nextCard.cards[0])
          this.message = 'Вы взяли карту...'
        }
      } catch (error) {
        this.message = 'Ошибка при взятии карты. Пожалуйста, попробуйте еще раз.'
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Обработчик события переворота карты
     * @param {Object} card - Карта, которая была перевернута
     */
    onCardFlipped(card) {
      if (this.playerCards.some(c => c.code === card.code) && this.gameStatus === 'playerTurn') {
        this.message = `Вы взяли ${card.value} ${card.suit}. Ваш счет: ${this.playerScore}`
        this.checkPlayerBust()
      } else if (this.dealerCards.some(c => c.code === card.code)) {
        this.message = ''
      }
    },

    /**
     * Проверяет, есть ли у игрока перебор
     * Вызывается после того, как карта перевернулась
     * @returns {boolean} - true если у игрока перебор
     */
    checkPlayerBust() {
      if (this.gameStatus === 'playerTurn' && this.playerScore > 21) {
        this.gameStatus = 'finished'
        this.winner = 'dealer'
        this.message = 'Перебор! Вы набрали больше 21 очка. Вы проиграли.'
        return true
      }
      return false
    },

    /**
     * Игрок останавливается, ход переходит к дилеру
     */
    async playerStand() {
      if (this.gameStatus !== 'playerTurn') return
      this.gameStatus = 'dealerTurn'
      await this.dealerPlay()
    },

    /**
     * Показывает уведомление - отключено
     * @param {string} _title - Заголовок уведомления (не используется)
     * @param {string} message - Текст уведомления
     */
    showNotification(_title, message) {
      if (message) {
        this.message = message
      }
    },

    /**
     * Дилер играет по правилам (берет карты до 17 очков, берет карту при мягких 17)
     */
    async dealerPlay() {
      this.isLoading = true
      try {
        this.message = ''

        while (this.dealerScore < 17 || this.hasSoft17()) {
          await new Promise(resolve => setTimeout(resolve, 400))
          const nextCard = await getNextCard()
          if (!(nextCard.cards && nextCard.cards.length === 1)) {
            break
          }
          this.dealerCards.push(nextCard.cards[0])
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        this.gameStatus = 'finished'

        if (this.dealerScore > 21) {
          this.winner = 'player'
          this.message = 'Дилер перебрал! Вы выиграли.'
        } else {
          const dealerWins = this.dealerScore > this.playerScore
          const playerWins = this.dealerScore < this.playerScore
          const tie = this.dealerScore === this.playerScore

          if (dealerWins) {
            this.winner = 'dealer'
            this.message = 'Дилер выиграл!'
          } else if (playerWins) {
            this.winner = 'player'
            this.message = 'Вы выиграли!'
          } else if (tie) {
            this.winner = 'tie'
            this.message = 'Ничья! У вас и у дилера одинаковое количество очков.'
          }
        }
      } catch (error) {
        this.message = 'Ошибка в ходе дилера. Пожалуйста, попробуйте еще раз.'
        this.gameStatus = 'idle'
      } finally {
        this.isLoading = false
      }
    },
  },
})
