<template>
  <div class="item d-inline-block">
    <div class="badge text-bg-secondary">
      {{ name }}
    </div>
    <span
      class="edit"
      title="Edit"
      aria-hidden="true"
      @click="$emit('edit')"
    >
    <span class="text-info">✏️</span>
    </span>
    &nbsp;
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Item",
  emits: ['edit'],
  props: {
    name: {
      type: String,
      required: true,
    },
  },
});
</script>

<style scoped>
.item {
  position: relative;
}

.edit {
  display: none;
  position: absolute;
  cursor: pointer;
  top: -5px;
  right: -3px;
  z-index: 1;
}

.item:hover .edit,
.item:focus .edit {
  display: inline !important;
}
</style>
