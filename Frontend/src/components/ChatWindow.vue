<script setup>
import { ref } from 'vue'

const message = ref('')

defineProps({
  messages: Array
})

const emit = defineEmits([
  'send'
])

function sendMessage() {

  if (!message.value.trim()) return

  emit('send', message.value)

  message.value = ''
}
</script>

<template>

<div class="chat-area">

  <div class="chat-messages">

    <div
      v-for="msg in messages"
      :key="msg.id"
      class="message"
      :class="msg.sender"
    >
      {{ msg.content }}
    </div>

  </div>

  <div class="chat-input-area">

    <input
      v-model="message"
      type="text"
      placeholder="Type message..."
    />

    <button
      class="btn-icon"
      @click="sendMessage"
    >
      <i class="fa-solid fa-paper-plane"></i>
    </button>

  </div>

</div>

</template>