<template>
  <h1>{{ header }}</h1>
  <input type="text" v-model="a">
  <input type="text" v-model="b">
  <button @click="append">Append</button>
  <div style="display: flex; justify-content: center;">
    <table>
      <thead>
        <tr>
          <th>A</th>
          <th>B</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="[a, b] in list">
          <td>{{a}}</td>
          <td>{{b}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from "vue";
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
  setup() {
    const a = ref('');
    const b = ref('');
    const list = ref<string[][]>([]);
    const append = () => {
      list.value.push([a.value, b.value]);
      console.log('list', list);
    };
    onMounted(async () => {
      const db = await Database.get();
      const pairs = await db.collection<Pair>('pairs').find({}).asArray();
      console.log(pairs);
    });
    onBeforeUnmount(Database.clear);

    return {
      a,
      b,
      list,
      append,
    }
  },
});
</script>
