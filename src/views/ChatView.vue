<script setup>
import { ref, computed } from 'vue'
import { useChatStore } from '../stores/chat'

const chatStore = useChatStore()

const selectedConversation = ref(
  chatStore.conversations[0] || null
)

const messageText = ref('')

const messages = computed(() => {

  if (!selectedConversation.value) {
    return []
  }

  return chatStore.messages.filter(
    message =>
      message.conversationId ===
      selectedConversation.value.id
  )
})

function selectConversation(conversation) {
  selectedConversation.value = conversation
}

function sendMessage() {

  if (
    !messageText.value.trim() ||
    !selectedConversation.value
  ) {
    return
  }

  chatStore.sendMessage({
    conversationId:
      selectedConversation.value.id,

    sender: 'You',

    role: 'tutee',

    text: messageText.value
  })

  messageText.value = ''
}
</script>

<template>

<div>

  <!-- HEADER -->

  <div class="header">

    <h1>Messages</h1>

    <p class="subtitle">
      Communicate with tutors and students
    </p>

  </div>

  <!-- CHAT CARD -->

  <div class="card chat-wrapper">

    <!-- CONVERSATION SIDEBAR -->

    <div class="chat-sidebar">

      <h3>
        Conversations
      </h3>

      <div class="conversation-list">

        <div
          v-for="conversation in chatStore.conversations"
          :key="conversation.id"
          class="conversation-item"
          :class="{
            active:
              selectedConversation?.id === conversation.id
          }"
          @click="selectConversation(conversation)"
        >

          <div class="conversation-avatar">

            {{ conversation.name.charAt(0) }}

          </div>

          <div class="conversation-details">

            <h4>
              {{ conversation.name }}
            </h4>

            <p>
              {{ conversation.lastMessage }}
            </p>

          </div>

        </div>

      </div>

    </div>

    <!-- CHAT WINDOW -->

    <div class="chat-area">

      <!-- TOP HEADER -->

      <div
        v-if="selectedConversation"
        class="chat-window-header"
      >

        <div
          style="
            display:flex;
            align-items:center;
            gap:15px;
          "
        >

          <div class="conversation-avatar">

            {{ selectedConversation.name.charAt(0) }}

          </div>

          <div>

            <h3>
              {{ selectedConversation.name }}
            </h3>

            <p
              style="
                color:var(--text-muted);
                font-size:.9rem;
              "
            >
              {{ selectedConversation.role }}
            </p>

          </div>

        </div>

      </div>

      <!-- NO CHAT SELECTED -->

      <div
        v-if="!selectedConversation"
        class="empty-state"
      >

        <i
          class="fa-solid fa-comments"
          style="
            font-size:3rem;
            margin-bottom:15px;
          "
        ></i>

        <h3>
          No Conversation Selected
        </h3>

        <p>
          Choose a tutor or student to begin chatting.
        </p>

      </div>

      <!-- CHAT CONTENT -->

      <template v-else>

        <div class="chat-messages">

          <div
            v-for="message in messages"
            :key="message.id"
            class="message"
            :class="
              message.sender === 'You'
                ? 'tutee'
                : 'tutor'
            "
          >

            <strong>
              {{ message.sender }}
            </strong>

            {{ message.text }}

          </div>

        </div>

        <!-- INPUT -->

        <div class="chat-input-area">

          <input
            v-model="messageText"
            type="text"
            placeholder="Type a message..."
            @keyup.enter="sendMessage"
          >

          <button
            class="btn-icon"
            @click="sendMessage"
          >
            <i
              class="fa-solid fa-paper-plane"
            ></i>
          </button>

        </div>

      </template>

    </div>

  </div>

</div>

</template>