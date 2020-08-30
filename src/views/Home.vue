<template>
  <div>
    <NavBar page='Home' />

    <div class="main-content">
      <div class="container">
        <!-- 参加者データインポート -->
        <CsvImportView
          class="item-bottom-margin"
          :onClearObservable="clearObservable"
          @onFileSelected="onImportFileSelected"
        />

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
              <b-button block v-b-toggle.accordion-paper variant="secondary">Round 1: ペーパークイズ 結果</b-button>
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
              <b-button block v-b-toggle.accordion-r2 variant="secondary">Round 2: 連答つき５○２× 結果</b-button>
            </b-card-header>
            <b-collapse id="accordion-r2" role="tabpanel">
              <b-card-body>
                <Round2Result :playerList="state.playerdataList" @onFinish2r="onFinish2r" />
              </b-card-body>
            </b-collapse>
          </b-card>

          <!-- 3R -->
          <b-card no-body class="item-bottom-margin">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button block v-b-toggle.accordion-r3 variant="secondary">Round 3: Number 10 結果</b-button>
            </b-card-header>
            <b-collapse id="accordion-r3" role="tabpanel">
              <b-card-body>
                <Round3Result :playerList="state.playerdataList" />
              </b-card-body>
            </b-collapse>
          </b-card>

          <!-- ExR -->
          <b-card no-body class="item-bottom-margin">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button block v-b-toggle.accordion-ex variant="secondary">Extra Round: 敗者復活 結果</b-button>
            </b-card-header>
            <b-collapse id="accordion-ex" role="tabpanel">
              <b-card-body>
                <ExRResult :playerList="state.playerdataList" />
              </b-card-body>
            </b-collapse>
          </b-card>

          <!-- SF -->
          <b-card no-body class="item-bottom-margin">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button block v-b-toggle.accordion-sf variant="secondary">Semi Final: 3セット制タイムレース Nine Hundred 結果</b-button>
            </b-card-header>
            <b-collapse id="accordion-sf" role="tabpanel">
              <b-card-body>
                <SemiFinalResult :playerList="state.playerdataList" />
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
import Round3Result from '@/components/Home/3RResult.vue';
import ExRResult from '@/components/Home/ExRResult.vue';
import SemiFinalResult from '@/components/Home/SFResult.vue';
import { Observable, Observer } from 'rxjs';

export default defineComponent({
  components: {
    NavBar,
    CsvImportView,
    PaperResult,
    Round2Result,
    Round3Result,
    ExRResult,
    SemiFinalResult,
  },
  setup() {
    const state = reactive<{
      isFileLoaded: boolean;
      playerdataList: PlayerEntity[];
      vbcLogList: any;
      clearObserver: Observer<void> | null;
    }>({
      isFileLoaded: false,
      playerdataList: [],
      vbcLogList: [],
      clearObserver: null
    });
    const clearObservable = Observable.create((observer: Observer<void>) => (state.clearObserver = observer));

    const onImportFileSelected = (playerdataList: PlayerEntity[]) => {
      state.isFileLoaded = false;
      state.playerdataList = playerdataList;
      state.vbcLogList = [];
      if (playerdataList.length != 0) {
        state.isFileLoaded = true;
      }
    }

    const onClearClicked = () => {
      // 参加者データインポートViewへクリアボタン押下を通知
      if (state.clearObserver != null) {
        state.clearObserver.next();
      }
    }

    const onFinish2r = (logStr: string) => {
      state.vbcLogList.push({ round: '2R', str: logStr });
    }

    return {
      state,
      clearObservable,
      onImportFileSelected,
      onClearClicked,
      onFinish2r
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