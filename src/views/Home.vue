<template>
  <div>
    <NavBar page='Home' />

    <div class="main-content">
      <div class="container">
        <!-- 参加者データインポート -->
        <CsvImportView class="item-bottom-margin" @onFileSelected="onImportFileSelected" />

        <!-- 未インポート時の案内 -->
        <div v-if="!state.isFileLoaded" class="item-bottom-margin alert alert-primary" role="alert">
          参加者データの読み込み、演算が完了すると結果が下に表示されます
        </div>

        <!-- インポート完了後の結果表示 -->
        <div v-if="state.isFileLoaded">
          <div class="item-bottom-margin d-flex justify-content-end">
            <b-button variant="danger" class="ml-2" @click="onClearClicked">結果をクリア</b-button>
          </div>

          <!-- ペーパー -->
          <b-card no-body class="item-bottom-margin">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button block v-b-toggle.accordion-paper variant="secondary">Round 1: ペーパークイズ結果</b-button>
            </b-card-header>
            <b-collapse id="accordion-paper" visible role="tabpanel">
              <b-card-body>
                <PaperResult :playerList="state.playerdataList"/>
              </b-card-body>
            </b-collapse>
          </b-card>

          <!-- 2R -->
          <b-card no-body class="item-bottom-margin">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button block v-b-toggle.accordion-r2 variant="secondary">Round 2: 連答つき５○２×結果</b-button>
            </b-card-header>
            <b-collapse id="accordion-r2" role="tabpanel">
              <b-card-body>
                <Round2Result :playerList="state.playerdataList" />
              </b-card-body>
            </b-collapse>
          </b-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "@vue/composition-api";
import { PlayerEntity } from '@/vbc-entity'
import NavBar from '@/components/NavBar.vue';
import CsvImportView from '@/components/Home/CsvImportView.vue';
import PaperResult from '@/components/Home/PaperResult.vue';
import Round2Result from '@/components/Home/2RResult.vue';

export default defineComponent({
  components: {
    NavBar,
    CsvImportView,
    PaperResult,
    Round2Result,
  },
  setup() {
    const state = reactive<{
      isFileLoaded: boolean;
      playerdataList: PlayerEntity[];
      vbcLogList: string[];
    }>({
      isFileLoaded: false,
      playerdataList: [],
      vbcLogList: [],
    });

    const onImportFileSelected = (playerdataList: PlayerEntity[]) => {
      state.isFileLoaded = false;
      state.playerdataList = playerdataList;
      state.vbcLogList = [];
      state.isFileLoaded = true;
    }

    const onClearClicked = () => {
      // リロードでクリア
      location.reload();
    }

    return {
      state,
      onImportFileSelected,
      onClearClicked
    }
  }
})
</script>

<style>
.main-content {
  margin: 16px;
}
.item-bottom-margin {
  margin-bottom: 16px;
}

/* 縦書き（プレイヤー名用） */
.tate-span {
  -ms-writing-mode: tb-rl;
  writing-mode: vertical-rl;
}
.tate-th {
  vertical-align: top;
  text-align: center;
}

/* tdのセンタリング */
.centering-td {
  text-align: center;
}
</style>