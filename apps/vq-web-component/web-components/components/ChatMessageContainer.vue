<template>
  <div class="message-container">
    <div
      class="message-item"
      :class="{ 'is-sent': message.role === 'user' }"
      v-for="(message, index) in messages"
      :key="index"
    >
      <div class="message-role">
        {{ message.role }}
      </div>
      <div class="message-content">{{ message.content }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const messages = ref([
  {
    role: 'user',
    content: 'Hello, I am a user'
  },
  {
    role: 'bot',
    content: 'Hello, I am a bot'
  },
  {
    role: 'user',
    content: 'How are you?'
  },
  {
    role: 'bot',
    content: 'I am fine, thank you'
  }
]);
</script>

<style lang="scss">
.message-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message-item {
  display: flex;
  flex-direction: column;

  &.is-sent {
    margin-left: auto;
  }
}
</style>
