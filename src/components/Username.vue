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
        autofocus
        type="text"
        v-model="username"
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
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: 'Username',
  emits: ['input'],
  setup(props, { emit }) {
    const username = ref('');

    function setUsername() {
      emit('input', username.value);
    }

    return {
      username,
      setUsername,
    };
  }
});
</script>
