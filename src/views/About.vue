<template>
  <div>
    <NavBar page='About' />

    <div class="main-content">
      <h3>このサイトについて</h3>
      <p>
        このサイトは、バーチャルにクイズ大会「abc」を再現できるPython3向けツール「vbc」にインスパイアを受け、
        同等の処理をWeb上で行えるように取り組んだWebアプリです。<br/>
        本家のvbcについては<a href="https://github.com/NMLibrary/vbc">こちら</a><br/>
        クイズ大会「abc」については<a href="http://abc-dive.com/">こちら</a>
      </p>

      <h3>使い方</h3>
      <p>
        「参加者データCSVファイル」のフォーム内にある<strong>ファイル選択</strong>ボタンでCSVファイルを読み込むか、
        CSVファイルを直接ドラッグ＆ドロップしてください。<br/>
        CSVファイルの形式は<a href="https://github.com/NMLibrary/vbc#sample_datacsv%E3%81%AE%E5%BD%A2%E5%BC%8F%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6">本家vbcのREADME.md</a>をご覧ください。
      </p>
      <p>
        ＜拡張要素について＞<br/>
        本家vbcのCSVデータを拡張し、<strong>10 up-downのコース希望</strong>のうしろにカンマ区切りで「所属」を設定できるようにしています。
        （未設定の場合は所属は空欄です）
      </p>

      <h3>注意事項・免責事項</h3>
      <p>
        インスパイア元のクイズ大会「abc」やツール「vbc」とは無関係です。
        何かあっても問い合わせはしないようにお願いします。
      </p>
      <p>
        本プログラムを利用したことによる不具合や損害については一切の責任を負いません。
        自己責任での利用をお願いします。
      </p>

      <h3>作者・問い合わせ先</h3>
      <p>
        <a href="https://twitter.com/nano2_aloerina">なのなの(@nano2_aloerina)</a>
      </p>

      <h3>更新履歴</h3>
      <p>2020/08/30 公開開始</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import NavBar from '@/components/NavBar.vue';

export default defineComponent({
  components: {
    NavBar
  },
  setup() {
    return {
    }
  }
})
</script>

<style scoped>
.main-content {
  margin: 16px;
}
</style>