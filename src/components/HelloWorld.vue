<template>
  <h1>{{ header }}</h1>
  <input type="text" v-model="a" placeholder="First Word" title="First Word">
  <input type="text" v-model="b" placeholder="Second Word" title="First Word">
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
        <tr v-for="{a, b} in list">
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

let db;

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
    const list = ref<Pair[]>([]);
    const append = async () => {
      const pair = { a: a.value, b: b.value };
      list.value.push(pair);
      await db.insertOne(pair);
    };
    onMounted(async () => {
      db = (await Database.get());
      const pairs = await db.find({}).asArray();
      list.value = pairs;
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
