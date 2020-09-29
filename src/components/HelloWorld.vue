<template>
  <div class="container">
    <div class="row">
      <div class="col-md-8 offset-md-2">
        <h1 class="text-center">{{ header }}</h1>
        <hr>
        <form
          v-if="!isUsernameSet"
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
                  :class="errorA || errorB ? 'btn-outline-danger' : 'btn-outline-success'"
                >
                  Add Pair
                </button>
              </div>
            </div>
          </form>
          <div style="display: flex; justify-content: center;">
            <table
              v-if="groups.length"
              class="table"
            >
              <tbody>
                <tr v-for="group in groups">
                  <th>{{ group[0] }}</th>
                  <td>
                    {{ [...group.slice(1)].join(', ') }}
                  </td>
                </tr>
              </tbody>
            </table>
            <div
              v-else
              class="alert alert-primary text-center w-100"
            >
              <strong>Welcome to Synonymous!</strong> <br>
              <span class="d-inline-block">
              Keep adding synonym pairs.
            </span>
              <span class="d-inline-block">
              &nbsp;Words of similar meaning will be grouped automatically.
            </span>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onBeforeUnmount, computed, Ref, nextTick } from "vue";
import Database from "../Database";
import { Pair } from "../schema";

let db;

function useUsername(isUsernameSet: Ref<boolean>) {
  const username = ref('');

  function setUsername() {
    isUsernameSet.value = true;
  }

  return {
    username,
    setUsername,
  };
}

function useSynonym(isUsernameSet: Ref<boolean>, username: Ref<string>) {
  const a = ref('');
  const b = ref('');
  const errorA = ref(false);
  const errorB = ref(false);
  const inputA = ref<HTMLInputElement>(null);
  const list = ref<Pair[]>([]);

  watch(isUsernameSet, async () => {
    await nextTick();
    inputA.value.focus();
    db = (await Database.get());
    const pairs = await db.find({ username: username.value }).asArray();
    list.value = pairs;
  });
  onBeforeUnmount(Database.clear);

  const append = async () => {
    errorA.value = !a.value.trim();
    errorB.value = !b.value.trim();
    if (errorA.value || errorB.value) {
      return;
    }

    const pair = { username: username.value, a: a.value.trim(), b: b.value.trim() };
    list.value.push(pair);
    a.value = '';
    b.value = '';
    inputA.value.focus();
    await db.insertOne(pair);
  };

  const groups = computed(() => {
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

  return {
    a,
    b,
    errorA,
    errorB,
    inputA,
    list,
    groups,
    append,
  }
}

export default defineComponent({
  name: 'HelloWorld',
  props: {
    header: {
      type: String,
      required: true,
    }
  },
  setup() {
    const isUsernameSet = ref(false);
    const { username, setUsername } = useUsername(isUsernameSet);

    return {
      isUsernameSet,
      username,
      setUsername,
      ...useSynonym(isUsernameSet, username),
    }
  },
});
</script>
