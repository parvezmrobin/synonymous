<template>
  <h1>{{ header }}</h1>
  <input type="text" v-model="a" placeholder="First Word" title="First Word">
  <input type="text" v-model="b" placeholder="Second Word" title="First Word">
  <button @click="append">Append</button>
  <div style="display: flex; justify-content: center;">
    <table>
      <tbody>
        <tr v-for="group in groups">
          <td>
            {{ [...group.keys()].join(', ') }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, computed } from "vue";
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

    const groups = computed(() => {
      const groups = [] as Map<string, number>[];
      for (const pair of list.value) {
        let handled = false;
        for (const group of groups) {
          if (group.has(pair.a)) {
            if (!group.has(pair.b)) {
              group.set(pair.b, 1);
            } else {
              group.set(pair.b, group.get(pair.b) + 1);
            }
            group.set(pair.a, group.get(pair.a) + 1);
            handled = true;
            break;
          } else if (group.has(pair.b)) {
            group.set(pair.a, 1);
            group.set(pair.b, group.get(pair.b) + 1);
            handled = true;
            break;
          }
        }

        if (!handled) {
          const newGroup = new Map<string, number>().set(pair.a, 1).set(pair.b, 1);
          groups.push(newGroup);
        }
      }

      return groups;
    });

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
      groups,
      append,
    }
  },
});
</script>
