<template>
  <div class="container">
    <div class="row">
      <div class="col-md-8 offset-md-2">
        <h1 class="text-center">{{ header }}</h1>
        <hr>
        <Username
          v-if="!username"
          @input="setUsername"
        />
        <template v-else>
          <form
            @submit.prevent="append"
          >
            <div class="input-group mb-3">
              <input
                type="text"
                v-model="a"
                class="form-control"
                :class="{'is-invalid': errorA}"
                ref="inputA"
                placeholder="First Word"
                title="First Word"
              >
              <input
                type="text"
                v-model="b"
                class="form-control"
                :class="{'is-invalid': errorB}"
                placeholder="Second Word"
                title="First Word"
              >
              <div class="input-group-append">
                <button
                  type="submit"
                  class="btn"
                  :class="btnClass"
                >
                  {{ btnText }}
                </button>
              </div>
            </div>
          </form>
          <div style="display: flex; justify-content: center;">
            <template v-if="groups">
              <WordList
                v-if="groups.length"
                :groups="groups"
                @edit="setEditPair"
              />
              <div
                v-else
                class="alert alert-success text-center w-100"
              >
                <strong>Welcome to Synonymous!</strong> <br>
                <span class="d-inline-block">
                  Keep adding synonym pairs.
                </span>
                <span class="d-inline-block">
                  &nbsp;Words of similar meaning will be grouped automatically.
                </span>
                <span class="d-inline-block mt-2">
                  &nbsp;For example, add <code>increase</code> and <code>grow</code> and then <code>grow</code> and <code>expand</code>.
                </span>
                <span class="d-inline-block">
                  Eventually, <code>increase</code>, <code>grow</code> and <code>expand</code> will make a group.
                </span>
              </div>
            </template>
            <div
              v-else
              class="alert alert-primary text-center w-100"
            >
              <strong>Loading your synonyms...</strong> <br>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onBeforeUnmount, computed, Ref, nextTick } from "vue";
import Database, { Collection } from "../Database";
import { Pair } from "../schema";
import Item from "./Item.vue";
import Username from "./Username.vue";
import WordList from "./WordList.vue";

let db: Collection;

function useSynonym(username: Ref<string>) {
  const a = ref('');
  const b = ref('');
  const errorA = ref(false);
  const errorB = ref(false);
  const inputA = ref<HTMLInputElement>(null);
  const list = ref<Pair[]>();
  const editPair = ref<Pair>(null);

  watch(username, async () => {
    await nextTick();
    inputA.value.focus();
    db = await Database.get();
    const pairs = await db.find({ username: username.value }).asArray();
    list.value = pairs;
  });
  onBeforeUnmount(Database.clear);

  async function append() {
    errorA.value = !a.value.trim();
    errorB.value = !b.value.trim();
    if (errorA.value || errorB.value) {
      return;
    }

    const pair = { username: username.value, a: a.value.trim(), b: b.value.trim() };
    a.value = '';
    b.value = '';
    inputA.value.focus();
    if (editPair.value) {
      editPair.value.a = pair.a;
      editPair.value.b = pair.b;
      const id = editPair.value._id
      editPair.value = null;
      await db.updateOne({ _id: id }, pair);
    } else {
      list.value.push(pair);
      await db.insertOne(pair);
    }
  }

  async function setEditPair(w: string) {
    const pair = list.value.find((pair) => pair.a === w || pair.b === w);
    editPair.value = pair;
    a.value = pair.a;
    b.value = pair.b;
    inputA.value.scroll(0, 0);
    inputA.value.focus();
  }

  const groups = computed(() => {
    if (!list.value) {
      return undefined;
    }
    const groups = [] as Map<string, number>[];

    function merge(i, j, pair: Pair) {
      const groupJ = groups[j];
      groups.splice(j, 1);

      for (const key of Array.from(groupJ.keys())) {
        groups[i].set(key, groupJ.get(key));
      }
      groups[i].set(pair.a, groups[i].get(pair.a) + 1);
      groups[i].set(pair.b, groups[i].get(pair.b) + 1);
    }

    for (const pair of list.value) {
      let handled = false;
      let aFoundAt = -1;
      let bFoundAt = -1;
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        if (group.has(pair.a)) {
          if (bFoundAt !== -1) {
            merge(bFoundAt, i, pair);
            break;
          }
          aFoundAt = i;
          if (!group.has(pair.b)) {
            group.set(pair.b, 1);
          } else {
            bFoundAt = i;
            group.set(pair.b, group.get(pair.b) + 1);
          }
          group.set(pair.a, group.get(pair.a) + 1);
          handled = true;
        } else if (group.has(pair.b)) {
          if (aFoundAt !== -1) {
            merge(aFoundAt, i, pair);
            break;
          }
          bFoundAt = i;
          group.set(pair.a, 1);
          group.set(pair.b, group.get(pair.b) + 1);
          handled = true;
        }

        if (aFoundAt !== -1 && bFoundAt !== -1) {
          break;
        }
      }

      if (!handled) {
        const newGroup = new Map<string, number>().set(pair.a, 1).set(pair.b, 1);
        groups.push(newGroup);
      }
    }

    const sortedGroups = groups.map(
      (group) => Array.from(group.entries())
        .sort(([, c1], [, c2]) => c2 - c1)
        .map(([word]) => word),
    ).sort(([w1], [w2]) => w1 > w2 ? 1 : -1);

    return sortedGroups;
  });

  const btnClass = computed(() => {
    if (errorA.value || errorB.value) {
      return 'btn-outline-danger';
    }
    if (editPair.value) {
      return 'btn-outline-primary';
    }
    return 'btn-outline-success';
  });

  const btnText = computed(() => {
    return editPair.value ? 'Edit Pair' : 'Add Pair';
  });

  return {
    a,
    b,
    errorA,
    errorB,
    inputA,
    list,
    groups,
    append,
    setEditPair,
    btnText,
    btnClass,
  }
}

export default defineComponent({
  name: 'HelloWorld',
  components: {
    WordList,
    Username,
    Item,
  },
  props: {
    header: {
      type: String,
      required: true,
    }
  },
  setup() {
    const username = ref('');

    function setUsername(value: string) {
      username.value = value;
    }

    return {
      username,
      setUsername,
      ...useSynonym(username),
    }
  },
});
</script>
