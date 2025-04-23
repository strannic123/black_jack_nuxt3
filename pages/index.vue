<template lang="pug">
.blackjack-container

  .message-container(v-if="message && canShowNotification")
    p.game-message {{ message }}

  .game-header
    h1.game-title Black Jack

  .game-table
    Hand(
      title="Дилер"
      :cards="dealerCards"
      :score="visibleDealerScore"
      :isDealer="true"
      :hideFirstCard="gameStatus === 'playerTurn'"
      :showScore="true"
      :gameStatus="gameStatus"
      @all-cards-flipped="onHandCardsFlipped"
      @card-flipped="onCardFlipped"
    )

    .table-divider

    Hand(
      title="Игрок"
      :cards="playerCards"
      :score="playerScore"
      :gameStatus="gameStatus"
      @all-cards-flipped="onHandCardsFlipped"
      @card-flipped="onCardFlipped"
    )

  GameControls(
    :gameStatus="gameStatus"
    :message="message"
    :isLoading="isLoading"
    :playerScore="playerScore"
    @start-game="startNewGame"
    @player-hit="playerHit"
    @player-stand="playerStand"
  )
</template>

<script setup>
  import { useGameStore } from '~/stores/game'
  import { storeToRefs } from 'pinia'
  import { ref, watch, computed, onUnmounted } from 'vue'
  import Hand from '~/components/Hand.vue'
  import GameControls from '~/components/GameControls.vue'

  const gameStore = useGameStore()
  const { playerCards, dealerCards, gameStatus, message, isLoading, playerScore, dealerScore } =
    storeToRefs(gameStore)

  // Извлекаем методы из хранилища
  const { playerHit, playerStand, checkPlayerBust, onCardFlipped } = gameStore

  // Создаем обертку для startNewGame, чтобы скрывать сообщение при начале новой игры
  const startNewGame = () => {
    // Скрываем сообщение немедленно
    hideNotification()
    // Запускаем новую игру
    gameStore.startNewGame()
  }

  const flippedHands = ref(new Set())
  const canShowNotification = ref(true)
  let notificationTimer = null

  // Функция для немедленного скрытия сообщения
  const hideNotification = () => {
    // Очищаем предыдущий таймер, если он существует
    if (notificationTimer) {
      clearTimeout(notificationTimer)
    }

    // Сначала добавляем класс для плавного исчезновения
    const messageContainer = document.querySelector('.message-container')
    if (messageContainer) {
      messageContainer.style.opacity = '0'

      // Затем скрываем после завершения анимации
      setTimeout(() => {
        canShowNotification.value = false
      }, 500) // Время анимации исчезновения
    } else {
      canShowNotification.value = false
    }
  }

  // Функция для автоматического скрытия сообщения с задержкой
  const hideNotificationAfterDelay = (delay = 5000) => {
    // Очищаем предыдущий таймер, если он существует
    if (notificationTimer) {
      clearTimeout(notificationTimer)
    }

    // Устанавливаем новый таймер
    notificationTimer = setTimeout(() => {
      hideNotification()
    }, delay)
  }

  // Очищаем таймер при размонтировании компонента
  onUnmounted(() => {
    if (notificationTimer) {
      clearTimeout(notificationTimer)
    }
  })

  // Функция для сброса прозрачности сообщения
  const resetMessageOpacity = () => {
    setTimeout(() => {
      const messageContainer = document.querySelector('.message-container')
      if (messageContainer) {
        messageContainer.style.opacity = '1'
      }
    }, 10)
  }

  watch(
    () => gameStatus.value,
    newStatus => {
      if (newStatus === 'playing') {
        flippedHands.value.clear()
        canShowNotification.value = true
        resetMessageOpacity()
      } else if (newStatus === 'finished') {
        // Когда игра заканчивается, показываем сообщение и устанавливаем таймер на его скрытие
        canShowNotification.value = true
        resetMessageOpacity()
        hideNotificationAfterDelay(10000) // Увеличенное время отображения - 10 секунд
      }
    }
  )

  // Следим за изменениями сообщения
  watch(
    () => message.value,
    newMessage => {
      if (newMessage && gameStatus.value === 'finished') {
        canShowNotification.value = true
        resetMessageOpacity()
        hideNotificationAfterDelay(10000) // Увеличенное время отображения - 10 секунд
      }
    }
  )

  const visibleDealerScore = computed(() => {
    if (gameStatus.value === 'playerTurn' && dealerCards.value.length > 0) {
      const firstCard = dealerCards.value[0]
      let score = 0

      if (firstCard.value === 'ACE') {
        score = 11
      } else if (['KING', 'QUEEN', 'JACK'].includes(firstCard.value)) {
        score = 10
      } else {
        score = parseInt(firstCard.value)
      }

      return score
    }

    return dealerScore.value
  })

  const onHandCardsFlipped = handTitle => {
    flippedHands.value.add(handTitle)

    if (handTitle === 'Игрок') {
      checkPlayerBust()
    }

    if (
      flippedHands.value.size >= 2 ||
      (flippedHands.value.has('Дилер') && dealerCards.value.length === 0) ||
      (flippedHands.value.has('Игрок') && playerCards.value.length === 0)
    ) {
      canShowNotification.value = true

      // Если игра завершена, устанавливаем таймер на скрытие сообщения
      if (gameStatus.value === 'finished') {
        resetMessageOpacity()
        hideNotificationAfterDelay(10000) // Увеличенное время отображения - 10 секунд
      }
    }
  }
</script>

<style lang="scss" scoped>
  .blackjack-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    background: linear-gradient(135deg, #1e5799 0%, #207cca 51%, #2989d8 100%);
    font-family: 'Roboto', sans-serif;
    overflow: hidden;
  }

  .message-container {
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    margin-bottom: 15px;
    text-align: center;
    max-width: 80%;
    position: absolute;
    top: 20px;
    left: 30px;
    z-index: 10;
    animation: fadeIn 0.5s ease-in-out;
    transition: opacity 0.5s ease-out;
  }

  .game-message {
    font-size: 1.2rem;
    margin: 0;
    font-weight: 500;
  }

  .game-header {
    margin-bottom: 15px;
    text-align: center;
  }

  .game-title {
    font-size: 3rem;
    color: #ecf0f1;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    margin: 0;
    font-weight: 700;
    letter-spacing: 1px;
  }

  .game-table {
    background-color: #27ae60;
    background-image: linear-gradient(to bottom, #2ecc71, #27ae60);
    border-radius: 20px;
    padding: 15px 20px;
    box-shadow:
      0 15px 30px rgba(0, 0, 0, 0.3),
      inset 0 1px 1px rgba(255, 255, 255, 0.2);
    width: 100%;
    max-width: 900px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;
    height: calc(100vh - 150px);
    max-height: 700px;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 100%;
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="2"/></svg>');
      opacity: 0.3;
      pointer-events: none;
    }
  }

  .table-divider {
    width: 90%;
    height: 2px;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.5), transparent);
    margin: 8px 0;
    border-radius: 3px;
    position: relative;

    &::before,
    &::after {
      content: '';
      position: absolute;
      width: 10px;
      height: 10px;
      background-color: rgba(255, 255, 255, 0.7);
      border-radius: 50%;
      top: -3.5px;
    }

    &::before {
      left: 10%;
    }

    &::after {
      right: 10%;
    }
  }
</style>
