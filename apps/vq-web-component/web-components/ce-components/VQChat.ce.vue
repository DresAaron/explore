<template>
  <div class="chat-container">
    <h1>Chat</h1>
    <ChatMessageContainer></ChatMessageContainer>
  </div>
</template>

<script setup lang="ts">
import ChatMessageContainer from '../components/ChatMessageContainer.vue';

const props = withDefaults(
  defineProps<{
    apiKey: string;
  }>(),
  {}
);
</script>

<style lang="scss">
.chat-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
