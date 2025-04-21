<template>
  <div class="container">
    <div class="row">
      <div class="col-md-8 offset-md-2">
        <h1 class="text-center text-info fw-light mt-3 mb-5">{{ header }}</h1>

        <Username
          v-if="!username"
          @input="setUsername"
        />

        <template v-else>
          <form @submit.prevent="append">
            <div class="mb-3 row">
              <div class="col">
                <input
                  type="text"
                  v-model="a"
                  class="form-control"
                  :class="{'is-invalid': errorA}"
                  ref="inputA"
                  placeholder="First Word"
                  title="First Word"
                >
                <div class="invalid-feedback">
                  {{ errorA }}
                </div>
              </div>
              <div class="col">
                <input
                  type="text"
                  v-model="b"
                  class="form-control"
                  :class="{'is-invalid': errorB}"
                  placeholder="Second Word"
                  title="First Word"
                >
                <div class="invalid-feedback">
                  {{ errorB }}
                </div>
              </div>
              <div class="col" style="flex: 0 0 160px">
                <div class="d-grid gap-2">
                <button
                  type="submit"
                  class="btn"
                  :class="btnClass"
                >
                  {{ btnText }}
                </button>
                </div>
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

        <button
          class="btn btn-danger position-fixed"
          style="bottom: 10px; right: 10px;"
          @click="logout"
        >Logout</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  watch,
  computed,
  nextTick,
  Ref,
  onBeforeMount,
  onBeforeUnmount,
} from "vue";
import Database, { Collection } from "../Database";
import { Pair } from "../schema";
import Item from "./Item.vue";
import Username from "./Username.vue";
import WordList from "./WordList.vue";

let db: Collection;

function useSynonym(username: Ref<string>) {
  const a = ref('');
  const b = ref('');
  const errorA = ref('');
  const errorB = ref('');
  const inputA = ref<HTMLInputElement>(null);
  const list = ref<Pair[]>();
  const editPair = ref<Pair>(null);

  onBeforeMount(async () => {
    db = await Database.get();
    // just to establish connection beforehand
    await db.findOne({}, { projection: { _id: 1 } });
  });
  onBeforeUnmount(Database.clear);

  watch(username, async () => {
    if (!username.value) {
      return;
    }
    await nextTick();
    inputA.value.focus();
    const pairs = await db.find({ username: username.value }).asArray();
    list.value = pairs;
  });

  function alreadyGrouped(a: string, b: string) {
    return groups.value.find((group) => group.includes(a) && group.includes(b));
  }

  async function append() {
    errorA.value = a.value.trim() ? '' : 'First word is required';
    errorB.value = b.value.trim() ? '' : 'Second word is required';
    if (errorA.value || errorB.value) {
      return;
    }

    const exists = alreadyGrouped(a.value, b.value);
    if (editPair.value) {
      // if it's in edit mode, but the words are the same as another pair
      if (exists &&  (editPair.value.a !== a.value || editPair.value.b !== b.value)) {
        errorA.value = 'Word pair already exists';
        errorB.value = ' ';
        return;
      }
    } else if (exists) {
      // if it's in add mode, but there is already a pair like this
      errorA.value = 'Word pair already exists';
      errorB.value = ' ';
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

  const btnClass = computed(() => {
    if (errorA.value || errorB.value) {
      return 'btn-outline-danger';
    }
    if (editPair.value) {
      return 'btn-outline-primary';
    }
    return 'btn-outline-success';
  });

  const groups = computed(() => {
    if (!list.value) {
      return undefined;
    }
    const groups = [] as Map<string, number>[];

    function merge(i: number, j: number, pair: Pair) {
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

    function logout() {
      username.value = '';
      window.history.pushState({}, '', window.location.origin);
    }

    return {
      username,
      setUsername,
      logout,
      ...useSynonym(username),
    }
  },
});
</script>
