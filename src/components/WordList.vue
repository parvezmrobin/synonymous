<!--
 - Parvez M Robin
 - this@parvezmrobin.com
 - Oct 01, 2020
 -->

<template>
  <table class="table table-dark">
    <tbody>
      <tr v-for="group in groups">
        <th>{{ group[0] }}</th>
        <td>
          <Item
            v-for="item in group.slice(1)"
            :name="item"
            @edit="$emit('edit', item)"
          />
        </td>
      </tr>
    </tbody>
  </table>
</template>
<script lang="ts">
import Item from "./Item.vue"
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: 'WordList',
  components: { Item },
  emits: ['edit'],
  props: {
    groups: {
      type: Array as PropType<string[][]>,
      required: true,
    },
  },
});
</script>
