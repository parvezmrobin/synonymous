<template>
  <h1>{{ header }}</h1>
  <button @click="increment">count is: {{ count }}</button>
</template>

<script lang="ts">
import { defineComponent, ref, onBeforeUnmount } from "vue";
import Database from "../Database";
import { Pair } from "../schema";

export default defineComponent({
  name: 'HelloWorld',
  props: {
    header: {
      type: String,
      required: true,
    }
  },
  async setup() {
    const count = ref(0);
    const increment = () => count.value++;
    onBeforeUnmount(Database.clear);

    const db = await Database.get();
    const pairs = await db.collection<Pair>('pairs').find({}).asArray();
    console.log(pairs);


    return {
      count,
      increment,
    }
  },
});
</script>
