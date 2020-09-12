<template>
  <div>
    <div v-for="(players, idx) in setList" :key="idx">
      <h4>第{{ (idx + 1) }}セット</h4>
      <table class="table table-sm" style="table-layout: fixed;">
        <thead>
          <tr>
            <th 
              v-for="(player, idx2) in players"
              :key="idx2"
              class="tate-th"
              :class="getNamePlateClass(player)"
            >
              <span class="tate-span">{{ player.name }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td v-for="(player, idx2) in players" :key="idx2" class="centering-td" style="padding: 4px;">
              <small>{{ convertRankNumberToText(player) }}</small>
            </td>
          </tr>
          <tr>
            <td v-for="(player, idx2) in players" :key="idx2" class="centering-td">
              <small>{{ player.belonging }}</small>
            </td>
          </tr>
          <tr>
            <td v-for="(player, idx2) in players" :key="idx2" class="centering-td">
              <small>{{ player.r2Status.answered }}</small>
            </td>
          </tr>
          <tr>
            <td v-for="(player, idx2) in players" :key="idx2" class="centering-td">
              <span :class="getWinnedStateLabelStyle(player.r2Status.status)">{{ player.r2Status.status }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext } from "@vue/composition-api";
import { PlayerEntity } from '@/vbc-entity'
import { WinnedState, AnswerState } from '@/vbc-state';
import { NamePlateUtils, WinnedStateUtils } from '@/logic/common-logic';
import { QuizResultUtils } from '@/logic/quiz-logic';

const getWinState = (nWinner: number) => {
  switch (nWinner) {
    case 0:
      return WinnedState.FIRST_WINNED;
    case 1:
      return WinnedState.SECOND_WINNED;
    case 2:
      return WinnedState.THIRD_WINNED;
    case 3:
      return WinnedState.FOURTH_WINNED;
    case 4:
      return WinnedState.FIFTH_WINNED;
    default:
      return '';
  }
}

const setAdvantageValue = (player: PlayerEntity) => {
  if (player.paperRank <= 4) {
    player.r2Status.points = 3;
      player.r2Status.answered = AnswerState.CORRECT_ADVANTAGE + AnswerState.CORRECT_ADVANTAGE + AnswerState.CORRECT_ADVANTAGE;
    } else if (player.paperRank <= 12) {
      player.r2Status.points = 2;
      player.r2Status.answered = AnswerState.CORRECT_ADVANTAGE + AnswerState.CORRECT_ADVANTAGE;
    } else if (player.paperRank <= 24) {
      player.r2Status.points = 1;
      player.r2Status.answered = AnswerState.CORRECT_ADVANTAGE;
    } else {
      player.r2Status.points = 0;
      player.r2Status.answered = '';
    }
}

type Props = {
  playerList: PlayerEntity[];
}
  
export default defineComponent({
  props: {
    playerList: {},
  },
  setup(props: Props, context: SetupContext) {
    const getNamePlateClass = (player: PlayerEntity) => NamePlateUtils.getBgColorClass(player.paperRank);
    const convertRankNumberToText = (player: PlayerEntity) => NamePlateUtils.convertRankNumberToText(player.paperRank);
    const getWinnedStateLabelStyle = (state: string) => WinnedStateUtils.getWinnedStateLabelStyle(state);

    let vbcLog = '【Round 2: 連答つき５○２×】\n';
    
    const setList: PlayerEntity[][] = [[], [], [], []];
    for(let i = 0; i < 48; i++) {
      const player = props.playerList[i];
      setAdvantageValue(player);
      setList[i % 4].push(player);
    }

    for (let i = 0; i < setList.length; i++) {
      vbcLog += `（第${i + 1}セット）\n`;

      const set = setList[i];
      let nWinnedPlayer = 0;
      let nLosedPlayer = 0;
      let currentCorrectPlayerIndex = -1; // 連答権持ちプレイヤーのindex

      for (const player of set) {
        vbcLog += `[${player.name}]`;
      }
      vbcLog += '\n';
  
      while (nWinnedPlayer < 5  && nLosedPlayer < 7) {
        // クイズ実行
        const result = QuizResultUtils.operateQuiz(set);
        if (result.pushedPlayerIndex == -1) {
          // 問題スルー
          vbcLog += `（スルー）\n`;
          continue;
        } else if (set[result.pushedPlayerIndex].r2Status.status != WinnedState.UNDEFINED) {
          // その解答者が既に勝ち抜け or 敗退している
          continue;
        } else {
          // 誰かが解答権を得ている
          vbcLog += `${set[result.pushedPlayerIndex].name} `;
          if (result.isCorrected) {
            // 正解した
            if (result.pushedPlayerIndex == currentCorrectPlayerIndex) {
              // 連答正解
              vbcLog += `${AnswerState.CORRECT_DOUBLE} `;
              set[result.pushedPlayerIndex].r2Status.points
                = Math.min(5, set[result.pushedPlayerIndex].r2Status.points + 2);
              set[result.pushedPlayerIndex].r2Status.answered += AnswerState.CORRECT_DOUBLE;
            } else {
              // 通常正解
              vbcLog += `${AnswerState.CORRECT} `;
              set[result.pushedPlayerIndex].r2Status.points += 1;
              set[result.pushedPlayerIndex].r2Status.answered += AnswerState.CORRECT;
            }
            // 連答権セット
            currentCorrectPlayerIndex = result.pushedPlayerIndex;
  
            if (set[result.pushedPlayerIndex].r2Status.points == 5) {
              // 勝ち抜け
              vbcLog += `=> ${getWinState(nWinnedPlayer)}`;
              set[result.pushedPlayerIndex].r2Status.status = getWinState(nWinnedPlayer);
              nWinnedPlayer++;
            }
            vbcLog += '\n';
          } else {
            // 誤答した
            vbcLog += `${AnswerState.INCORRECT} `;
            set[result.pushedPlayerIndex].r2Status.misses += 1;
            set[result.pushedPlayerIndex].r2Status.answered += AnswerState.INCORRECT;
            if (result.pushedPlayerIndex == currentCorrectPlayerIndex) {
              // 連答権リセット
              currentCorrectPlayerIndex = -1;
            }
  
            if (set[result.pushedPlayerIndex].r2Status.misses == 2) {
              // 敗退
              vbcLog += `=> ${WinnedState.LOSED}`;
              set[result.pushedPlayerIndex].r2Status.status = WinnedState.LOSED;
              nLosedPlayer++;
            }
            vbcLog += '\n';
          }
        }
  
        if (nLosedPlayer == 7) {
          // トビ残り処理
          const remainedPlayers = set
            .filter((player) => player.r2Status.status == WinnedState.UNDEFINED)
            .sort((playerA, playerB) => {
              if (playerA.r2Status.points > playerB.r2Status.points) return -1; // ポイント多い順
              if (playerA.r2Status.points < playerB.r2Status.points) return 1;
              if (playerA.r2Status.misses < playerB.r2Status.misses) return -1; // 誤答少ない順
              if (playerA.r2Status.misses > playerB.r2Status.misses) return 1;
              return playerA.paperRank - playerB.paperRank; // ペーパー上位順
            });
          for (const player of remainedPlayers) {
            // 勝ち抜け設定
            player.r2Status.status = getWinState(nWinnedPlayer);
            nWinnedPlayer++;
          }
        }
      }

      const winnerPlayersName = set
        .filter((player) => (player.r2Status.status != WinnedState.UNDEFINED && player.r2Status.status != WinnedState.LOSED))
        .map((player) => player.name);
      vbcLog += '勝ち抜け ';
      for (const name of winnerPlayersName) {
        vbcLog += `[${name}]`;
      }
      vbcLog += '\n';
    }

    vbcLog += '【Round 2: 連答つき５○２× おわり】\n';
    context.emit('onFinish2r', vbcLog);

    return {
      props,
      setList,
      getNamePlateClass,
      convertRankNumberToText,
      getWinnedStateLabelStyle
    }
  }
})
</script>