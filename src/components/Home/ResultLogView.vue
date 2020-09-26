<template>
  <div class="result-log-view card">
      <div class="card-body">
        <div class="h4">1問ログ</div>
        <div class="d-flex">
          <textarea class="form-control" readonly rows="6" v-model="formattedLog" />
        </div>
        <div class="d-flex justify-content-end m-2">
          <b-button variant="secondary" class="ml-2"
            v-if="isSupportClipboardCopy" @click="onCopyClicked">クリップボードへコピー</b-button>
          <b-button variant="secondary" class="ml-2" @click="onSaveClicked">テキストファイルに保存</b-button>
        </div>      
      </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import moment from 'moment';

type Props = {
  vbcLogList: { index: number; str: string }[];
}
export default defineComponent({
  props: {
    vbcLogList: {}
  },
  setup(props: Props) {
    const isSupportClipboardCopy = navigator.clipboard;

    const formattedLog = props.vbcLogList
      .sort((logA, logB) => logA.index - logB.index)
      .map((item) => item.str)
      .join('');

    const onCopyClicked = () => {
      navigator.clipboard.writeText(formattedLog).then(() => {
        alert('クリップボードにコピーしました');
      });
    };

  const onSaveClicked = () => {
    const blob = new Blob([formattedLog], { type: 'text/plain' });
    const fileName = `vbc_result_${moment().format('YYYYMMDDHHmmss')}.txt`;

    if (window.navigator.msSaveBlob != undefined) {
      // IEやEdgeの場合
      window.navigator.msSaveOrOpenBlob(blob, fileName);
    } else {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
    }
  };

    return {
      isSupportClipboardCopy,
      formattedLog,
      onCopyClicked,
      onSaveClicked
    }
  }
})
</script>

<style scoped>
.result-log-view {
    background-color: #e7e7e7;
}
</style>