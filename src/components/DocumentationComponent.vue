<template>
    <q-card class="q-pb-xs q-pt-xs q-ma-xs" bordered dark flat>
      <div class="q-mt-es row gutter text-overline justify-center" @click="isEnabled = !isEnabled">
        {{ title }}
      </div>
    </q-card>
</template>

<script>
import { explain } from "../boot/explain";
  export default {
    setup() {
        return {}
    },
    data() {
      return {
        isEnabled: true,
        title: "DOCUMENTATION"
      }
    },
    methods: {},
    beforeUnmount() {},
    mounted(){}

}
</script>

  <style></style>