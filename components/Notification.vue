<template lang="pug">
.notification-container(v-if="show")
  .notification(:class="{ 'success': type === 'success', 'error': type === 'error', 'info': type === 'info' }")
    .notification-content
      .notification-title {{ title }}
      .notification-message {{ message }}
</template>

<script setup>
  defineProps({
    show: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'info',
      validator: value => ['success', 'error', 'info'].includes(value),
    },
  })
</script>

<style lang="scss" scoped>
  .notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    max-width: 350px;
    animation: slideIn 0.3s ease-out forwards;
  }

  .notification {
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    margin-bottom: 10px;

    &.success {
      background-color: rgba(46, 204, 113, 0.9);
      border-left: 4px solid #27ae60;
    }

    &.error {
      background-color: rgba(231, 76, 60, 0.9);
      border-left: 4px solid #c0392b;
    }

    &.info {
      background-color: rgba(52, 152, 219, 0.9);
      border-left: 4px solid #2980b9;
    }
  }

  .notification-content {
    color: white;
  }

  .notification-title {
    font-weight: bold;
    font-size: 1.1rem;
    margin-bottom: 5px;
  }

  .notification-message {
    font-size: 0.95rem;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
</style>
