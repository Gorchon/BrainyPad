<script setup>
import { ref, onMounted } from "vue";

// reactive state
const count = ref(0);

// functions that mutate state and trigger updates
function increment() {
  count.value++;
}

// lifecycle hooks
onMounted(() => {
  setInterval(increment, 1000);
});
</script>

<template>
  <div class="bg-green-400">
    <p>Hello from Vue: {{ count }}</p>
  </div>
</template>
