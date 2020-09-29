<template>
  <Synonymous header="Synonymous" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import Synonymous from './components/Synonymous.vue';

export default defineComponent({
  name: 'App',
  components: {
    Synonymous
  },
});
</script>
