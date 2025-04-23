<template lang="pug">
.hand-container
  h2.hand-title {{ title }}
  .score-display(v-if="showScore") Счет: {{ score }}
  .cards-container(v-if="cards && cards.length > 0")
    Card(
      v-for="(card, index) in cards"
      :key="card.code || index"
      :card="card"
      :index="index"
      :hidden="shouldHideCard(index)"
      @card-flipped="onCardFlipped"
      :style="{ '--card-index': index }"
    )
  .empty-hand(v-else)
    .placeholder Ожидание карт...
</template>

<script setup>
  import { ref, watch, computed, watchEffect } from 'vue'

  const props = defineProps({
    title: {
      type: String,
      required: true,
    },
    cards: {
      type: Array,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    isDealer: {
      type: Boolean,
      default: false,
    },
    hideFirstCard: {
      type: Boolean,
      default: false,
    },
    showScore: {
      type: Boolean,
      default: true,
    },
    gameStatus: {
      type: String,
      default: 'playing',
    },
  })

  const emit = defineEmits(['all-cards-flipped', 'card-flipped'])

  const flippedCards = ref(new Set())
  const allCardsFlipped = ref(false)

  const shouldHideCard = index => {
    if (!props.isDealer || props.gameStatus === 'finished') return false

    return props.hideFirstCard && index === 1
  }

  const onCardFlipped = card => {
    const cardId = card.code || card.image
    flippedCards.value.add(cardId)

    emit('card-flipped', card)

    const visibleCardsCount = props.cards.filter((_, index) => !shouldHideCard(index)).length

    if (flippedCards.value.size >= visibleCardsCount && !allCardsFlipped.value) {
      allCardsFlipped.value = true
      emit('all-cards-flipped', props.title)
    }
  }

  watch(
    () => props.cards,
    () => {
      flippedCards.value.clear()
      allCardsFlipped.value = false
    },
    { deep: true }
  )

  const cardOverlap = computed(() => {
    const baseOverlap = 50 // Базовый нахлёст
    const screenWidth = window.innerWidth

    // Уменьшаем нахлёст при большом количестве карт
    const dynamicOverlap = Math.max(baseOverlap - (props.cards.length - 1) * 5, 10)

    // Уменьшаем нахлёст только на маленьких экранах
    return screenWidth <= 768 ? dynamicOverlap : baseOverlap
  })

  // Обновляем CSS-переменную только на экранах 768px и меньше77
  watchEffect(() => {
    if (window.innerWidth <= 768) {
      document.documentElement.style.setProperty('--card-overlap', `${cardOverlap.value}px`)
    }
  })
</script>

<style lang="scss" scoped>
  .hand-container {
    margin-bottom: 5px;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 800px;
    min-height: 220px;
  }

  .hand-title {
    font-size: 1.5rem;
    margin-bottom: 5px;
    color: #ecf0f1;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
    font-weight: 600;
  }

  .score-display {
    font-size: 1.1rem;
    margin-bottom: 8px;
    padding: 4px 15px;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 30px;
    color: #ecf0f1;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .cards-container {
    position: relative;
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
    min-height: 200px;
    width: 100%;
    @media (max-width: 768px) {
      margin-top: 0;
      align-items: center;
    }
    & > * {
      transform-origin: bottom center;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      -webkit-font-smoothing: subpixel-antialiased;
      will-change: transform;
      -webkit-transform-style: preserve-3d;
      transform-style: preserve-3d;
      transition: all 0.3s ease;

      @media (max-width: 768px) {
        position: absolute;
        left: 0;
        margin-left: calc(var(--card-overlap) * var(--card-index, 0));
        z-index: calc(var(--card-index, 0) + 1);
      }
    }
  }

  .empty-hand {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    width: 100%;
  }

  .placeholder {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.7);
    background-color: rgba(0, 0, 0, 0.2);
    padding: 10px 20px;
    border-radius: 8px;
    border: 1px dashed rgba(255, 255, 255, 0.3);
  }
</style>
