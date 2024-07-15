<template>here {{ apiKey }}</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    apiKey: string;
  }>(),
  {}
);
</script>
