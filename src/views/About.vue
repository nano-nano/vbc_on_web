<template>
  <div>
    <NavBar page='About' />

    <div class="main-content">
      <h3>このサイトについて</h3>
      <p>
        このサイトは、バーチャルにクイズ大会「abc」を再現できるPython3向けツール「vbc」にインスパイアを受け、
        同等の処理をWeb上で行えるように取り組んだWebアプリです。<br/>
        本家のvbcについては<a href="https://github.com/NMLibrary/vbc">こちら</a>
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
      <p>2020/--/-- 公開開始</p>
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