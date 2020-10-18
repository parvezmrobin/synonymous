<!--
 - Parvez M Robin
 - this@parvezmrobin.com
 - Oct 01, 2020
 -->

<template>
  <form
    @submit.prevent="setUsername"
  >
    <div class="input-group mb-3">
      <input
        type="text"
        v-model="username"
        ref="usernameInput"
        class="form-control"
        placeholder="Username"
        title="Username"
      >
      <div class="input-group-append">
        <button type="submit" class="btn btn-outline-success">Set Username</button>
      </div>
    </div>
  </form>
</template>
<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";

export default defineComponent({
  name: 'Username',
  emits: ['input'],
  setup(props, { emit }) {
    const username = ref('');
    const usernameInput = ref<HTMLInputElement>(null);

    onMounted(() => {
      usernameInput.value.focus();
      const usernameFromUrl = new URLSearchParams(window.location.search).get('username');
      if (usernameFromUrl) {
        emit('input', usernameFromUrl);
      }
    });

    function setUsername() {
      window.history.pushState({}, '', `${window.location.href}?username=${username.value}`);
      emit('input', username.value);
    }

    return {
      username,
      usernameInput,
      setUsername,
    };
  }
});
</script>
