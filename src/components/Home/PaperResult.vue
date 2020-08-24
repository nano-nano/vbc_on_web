<template>
  <div>
    <b-table 
      striped
      hover
      bordered
      small
      :items="props.playerList"
      :fields="tableFields" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import { PlayerEntity } from '@/vbc-entity'

type Props = {
  playerList: PlayerEntity[];
}

export default defineComponent({
  props: {
    playerList: {}
  },
  setup(props: Props) {
    const tableFields = [
      { key: 'paperRank', label: '順位'},
      { key: 'name', label: '名前'},
      { key: 'knowledge', label: '知識力'},
      { key: 'pushSpeed', label: '早押し力'},
      { key: 'request10o10x', label: '3R 10○10×希望'},
      { key: 'requestSwedish10', label: '3R Swedish10希望'},
      { key: 'request10by10', label: '3R 10by10希望'},
      { key: 'request10updown', label: '3R 10up-down希望'},
      { key: 'belonging', label: '（所属）'},
    ];

    return {
      props,
      tableFields
    }
  }
})
</script>

<style scoped>
</style>