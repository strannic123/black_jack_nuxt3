<template lang="pug">
.card-container
  .flip-container(:class="{ 'flipped': !initiallyHidden && !hidden }")
    .flipper
      .front
        .card-back
      .back
        .card-front
          img.card-image(:src="card.image", :alt="`${card.value} of ${card.suit}`")
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  card: {
    type: Object,
    required: true
  },
  hidden: {
    type: Boolean,
    default: false
  },
  index: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['card-flipped'])


const initiallyHidden = ref(true)


const flipCard = (delay = 0) => {
  if (props.hidden) return

  setTimeout(() => {
    initiallyHidden.value = false

    setTimeout(() => emit('card-flipped', props.card), 600)
  }, delay)
}

flipCard(500 + props.index * 300)

watch(() => props.hidden, (newValue) => {
  if (!newValue) {
    flipCard(300)
  }
})


</script>

<style lang="scss" scoped>
.card-container {
  width: 120px;
  height: 167px;
  margin: 0 5px;
}

.card-front, .card-back {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.card-front {
  background-color: white;


}

.card-back {
  background-color: #2c3e50;
  background-image: url('https://deckofcardsapi.com/static/img/back.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  border: none;
  outline: none;
  filter: none;
  position: relative;
  box-sizing: border-box;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  transform: translateZ(0);
}


.flip-container {
  -webkit-perspective: 1000;
  -moz-perspective: 1000;
  -o-perspective: 1000;
  perspective: 1000;
  width: 100%;
  height: 100%;
}

.flipper {
  transform: perspective(1000px);
  -moz-transform: perspective(1000px);
  -webkit-transform: perspective(1000px);
  transform-style: preserve-3d;
  -moz-transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;
  position: relative;
  width: 100%;
  height: 100%;
}

.front,
.back {
  -webkit-backface-visibility: hidden;
  -moz-backface-visibility: hidden;
  -o-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-transition: 0.6s;
  -webkit-transform-style: preserve-3d;
  -moz-transition: 0.6s;
  -moz-transform-style: preserve-3d;
  -o-transition: 0.6s;
  -o-transform-style: preserve-3d;
  -ms-transition: 0.6s;
  -ms-transform-style: preserve-3d;
  transition: 0.6s;
  transform-style: preserve-3d;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.back {
  -webkit-transform: rotateY(180deg);
  -moz-transform: rotateY(180deg);
  -o-transform: rotateY(180deg);
  -ms-transform: rotateY(180deg);
  transform: rotateY(180deg);
}

.flip-container.flipped .back {
  -webkit-transform: rotateY(0deg);
  -moz-transform: rotateY(0deg);
  -o-transform: rotateY(0deg);
  -ms-transform: rotateY(0deg);
  transform: rotateY(0deg);
}

.flip-container.flipped .front {
  -webkit-transform: rotateY(180deg);
  -moz-transform: rotateY(180deg);
  -o-transform: rotateY(180deg);
  -ms-transform: rotateY(180deg);
  transform: rotateY(180deg);
}

.front {
  z-index: 2;
}
</style>
