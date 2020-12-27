<template>
  <h1>{{ msg }} {{ a }}</h1>
  <button @click="count++">count is: {{ count }}</button>
  <p>Edit <code>components/HelloWorld.vue</code> to test hot module replacement.</p>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'HelloWorld',
  props: {
    msg: String
  },
  setup(props) {
    const count = ref(0)
    const a: number = 1112
    return {
      count,
      a
    }
  }
})
</script>
