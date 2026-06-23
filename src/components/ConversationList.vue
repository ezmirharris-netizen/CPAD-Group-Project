<script setup>
defineProps({
  conversations: Array,
  activeId: Number
})

const emit = defineEmits([
  'select'
])
</script>

<template>

<div class="conversation-list">

  <div
    v-for="c in conversations"
    :key="c.id"
    class="conversation-item"
    :class="{ active: activeId===c.id }"
    @click="$emit('select', c)"
  >

    <div class="conversation-avatar">
      {{ c.name.charAt(0) }}
    </div>

    <div class="conversation-details">
      <h4>{{ c.name }}</h4>
      <p>{{ c.lastMessage }}</p>
    </div>

  </div>

</div>

</template>