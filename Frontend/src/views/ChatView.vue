<script setup>
import { computed, ref } from 'vue'

import ConversationList from '../components/ConversationList.vue'
import ChatWindow from '../components/ChatWindow.vue'

import { useChatStore } from '../stores/chat'

const chatStore = useChatStore()

const activeConversation = ref(1)

const messages = computed(() => {
  return chatStore.messages[activeConversation.value] || []
})

function selectConversation(conversation) {
  activeConversation.value = conversation.id
}

function sendMessage(text) {
  chatStore.sendMessage(activeConversation.value, text)
}
</script>

<template>

<div class="card chat-wrapper">

  <div class="chat-sidebar">

    <h3>Conversations</h3>

    <ConversationList
      :conversations="chatStore.conversations"
      :active-id="activeConversation"
      @select="selectConversation"
    />

  </div>

  <ChatWindow
    :messages="messages"
    @send="sendMessage"
  />

</div>

</template>