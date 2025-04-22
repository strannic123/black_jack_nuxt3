<template lang="pug">
.controls-container
  .buttons-row
    button.control-btn.start-btn(
      v-if="showStartButton"
      @click="emit('start-game')"
      :disabled="isLoading"
    ) {{ startButtonText }}

    template(v-if="showPlayerControls")
      button.control-btn.hit-btn(
        @click="emit('player-hit')"
        :disabled="isLoading || !canTakeCard"
      ) Взять карту

      button.control-btn.stand-btn(
        @click="emit('player-stand')"
        :disabled="isLoading"
      ) Остановиться

  .loader(v-if="isLoading")
    span Загрузка...
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  gameStatus: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  playerScore: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['start-game', 'player-hit', 'player-stand'])

const startButtonText = computed(() => props.gameStatus === 'idle' ? 'Начать игру' : 'Новая игра')
const showStartButton = computed(() => props.gameStatus === 'idle' || props.gameStatus === 'finished')
const showPlayerControls = computed(() => props.gameStatus === 'playerTurn')

const canTakeCard = computed(() => props.playerScore < 21)
</script>

<style lang="scss" scoped>
.controls-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 15px;
  width: 100%;
  max-width: 800px;
  position: relative;
}

.buttons-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.control-btn {
  padding: 14px 28px;
  margin: 0;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2), transparent);
    opacity: 0.5;
    transition: opacity 0.3s ease;
  }

  &:hover:not(:disabled)::before {
    opacity: 0.7;
  }

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.start-btn {
  background-color: #2ecc71;
  background-image: linear-gradient(to bottom, #2ecc71, #27ae60);
  color: white;
  min-width: 200px;

  &:hover:not(:disabled) {
    background-image: linear-gradient(to bottom, #3ce884, #2ecc71);
  }
}

.hit-btn {
  background-color: #3498db;
  background-image: linear-gradient(to bottom, #3498db, #2980b9);
  color: white;

  &:hover:not(:disabled) {
    background-image: linear-gradient(to bottom, #4aa3df, #3498db);
  }
}

.stand-btn {
  background-color: #e74c3c;
  background-image: linear-gradient(to bottom, #e74c3c, #c0392b);
  color: white;

  &:hover:not(:disabled) {
    background-image: linear-gradient(to bottom, #f65b4d, #e74c3c);
  }
}

.message-container {
  position: absolute;
  top: 50px;
  left: 20px;
  padding: 15px 25px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeIn 0.5s ease-in-out;
  z-index: 10;
}

.game-message {
  color: #ecf0f1;
  font-size: 1.3rem;
  margin: 0;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.loader {
  margin-top: 20px;
  color: #ecf0f1;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  font-weight: 500;

  &::after {
    content: '';
    width: 22px;
    height: 22px;
    margin-left: 12px;
    border: 3px solid #ecf0f1;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
