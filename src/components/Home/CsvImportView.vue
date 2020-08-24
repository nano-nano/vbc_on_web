<template>
  <div class="file-import-view card">
      <div class="card-body" @dragover.prevent @drop.prevent="onFileSelect">
        <div class="h4">参加者データCSVファイル</div>
        <div class="d-flex">
            <div class="flex-grow-1 text-truncate" style="align-self: center">{{ state.importFileName }}</div>
            <button type="button" class="btn btn-primary text-nowrap" @click="onClickFileSelectBtn">ファイル選択</button>
        </div>
        <!-- ファイル選択用（非表示） -->
        <input style="display: none" ref="input" type="file" accept=".csv" @input="onFileSelect">
      </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, SetupContext } from "@vue/composition-api";
import { PlayerEntity } from '@/vbc-entity'

const DEFAULT_FILE_NAME_STR = 'ファイル選択ボタンで選択するか、ここにファイルをドラッグ';

export default defineComponent({
  setup(_, context: SetupContext) {
    const state = reactive({
      importFileName: DEFAULT_FILE_NAME_STR,
    })
    const input = ref();

    const _convertCsvToPlayerDataList = async (file: File) => {
      const rawStr = await file.text();
      const result: PlayerEntity[] = [];
      for (const line of rawStr.split('\n')) {
        if (line == "") continue;
        const lineItems = line.split(',');
        result.push({
          paperRank: parseInt(lineItems[0]),
          name: lineItems[1],
          knowledge: parseInt(lineItems[2]),
          pushSpeed: parseInt(lineItems[3]),
          request10o10x: parseInt(lineItems[4]),
          requestSwedish10: parseInt(lineItems[5]),
          request10by10: parseInt(lineItems[6]),
          request10updown: parseInt(lineItems[7]),
          belonging: (lineItems[8] ? lineItems[8] : '-'),
          r2Status: {},
        } as PlayerEntity);
      }
      return result;
    }

    const onClickFileSelectBtn = () => input.value.click();

    const onFileSelect = async (event: any) => {
      const files: File[] = event.target.files || event.dataTransfer.files;
      if (files.length == 0 || files[0] == undefined) {
        state.importFileName = DEFAULT_FILE_NAME_STR;
        return;
      }
      // 拡張子を確認
      const extension = files[0].name.slice((files[0].name.lastIndexOf('.') - 1 >>> 0) + 2);
      if (extension != 'csv') {
        state.importFileName = DEFAULT_FILE_NAME_STR;
        return;
      }

      state.importFileName = files[0].name
      context.emit('onFileSelected', await _convertCsvToPlayerDataList(files[0]));
    }

    return {
      state,
      input,
      onClickFileSelectBtn,
      onFileSelect,
    }
  }
})
</script>

<style scoped>
.file-import-view {
    background-color: #e7e7e7;
}
</style>