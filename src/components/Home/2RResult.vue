<template>
  <div>
    <div v-for="(players, idx) in setList" :key="idx">
      <h4>第{{ (idx + 1) }}セット</h4>
      <table class="table table-sm" style="table-layout: fixed;">
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
            <th 
              v-for="(player, idx2) in players"
              :key="idx2"
              class="tate-th"
              :class="getNamePlateClass(player)"
            >
              <span class="tate-span">{{ player.name }}</span>
            </th>
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

const getNamePlateClass = (player: PlayerEntity) => NamePlateUtils.getBgColorClass(player.paperRank);
const convertRankNumberToText = (player: PlayerEntity) => NamePlateUtils.convertRankNumberToText(player.paperRank);
const getWinnedStateLabelStyle = (state: string) => WinnedStateUtils.getWinnedStateLabelStyle(state);

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
  const r2Status = player.r2Status;
  if (player.paperRank <= 4) {
      r2Status.points = 3;
      r2Status.answered = AnswerState.CORRECT_ADVANTAGE + AnswerState.CORRECT_ADVANTAGE + AnswerState.CORRECT_ADVANTAGE;
    } else if (player.paperRank <= 12) {
      r2Status.points = 2;
      r2Status.answered = AnswerState.CORRECT_ADVANTAGE + AnswerState.CORRECT_ADVANTAGE;
    } else if (player.paperRank <= 24) {
      r2Status.points = 1;
      r2Status.answered = AnswerState.CORRECT_ADVANTAGE;
    } else {
      r2Status.points = 0;
      r2Status.answered = '';
    }
}

type Props = {
  playerList: PlayerEntity[];
}
export default defineComponent({
  props: {
    playerList: { required: true },
  },
  setup(props: Props, context: SetupContext) {
    let vbcLog = '【Round 2: 連答つき５○２×】\n';
    
    // セットごとに参加者（ペーパー勝ち抜け48人）を振り分け
    const setList: PlayerEntity[][] = [[], [], [], []];
    for(let i = 0; i < 48; i++) {
      const player = props.playerList[i];
      setAdvantageValue(player);
      setList[i % 4].push(player);
    }

    // セット実行
    for (let i = 0; i < setList.length; i++) {
      vbcLog += `（第${i + 1}セット）\n`;

      const setPlayers = setList[i];
      let nWinnedPlayer = 0;
      let nLosedPlayer = 0;
      let currentCorrectPlayerIndex = -1; // 連答権持ちプレイヤーのindex

      for (const player of setPlayers) {
        vbcLog += `[${player.name}]`;
      }
      vbcLog += '\n';
  
      while (nWinnedPlayer < 5  && nLosedPlayer < 7) {
        // クイズ実行
        const result = QuizResultUtils.operateQuiz(setPlayers);
        if (result.pushedPlayerIndex == -1) {
          // 問題スルー
          vbcLog += `（スルー）\n`;
          continue;
        } else {
          const targetPlayer = setPlayers[result.pushedPlayerIndex];
          const targetStatus = targetPlayer.r2Status;
          if (targetStatus.status != WinnedState.UNDEFINED) {
            // その解答者が既に勝ち抜け or 敗退している
            continue;
          }

          vbcLog += `${targetPlayer.name} `;
          if (result.isCorrected) {
            // 正解した
            if (result.pushedPlayerIndex == currentCorrectPlayerIndex) {
              // 連答正解
              vbcLog += `${AnswerState.CORRECT_DOUBLE} `;
              targetStatus.points = Math.min(5, targetStatus.points + 2);
              targetStatus.answered += AnswerState.CORRECT_DOUBLE;
            } else {
              // 通常正解
              vbcLog += `${AnswerState.CORRECT} `;
              targetStatus.points += 1;
              targetStatus.answered += AnswerState.CORRECT;
            }
            // 連答権セット
            currentCorrectPlayerIndex = result.pushedPlayerIndex;
  
            if (targetStatus.points == 5) {
              // 勝ち抜け
              vbcLog += `=> ${getWinState(nWinnedPlayer)}`;
              targetStatus.status = getWinState(nWinnedPlayer);
              nWinnedPlayer++;
            }
          } else {
            // 誤答した
            vbcLog += `${AnswerState.INCORRECT} `;
            targetStatus.misses += 1;
            targetStatus.answered += AnswerState.INCORRECT;
            if (result.pushedPlayerIndex == currentCorrectPlayerIndex) {
              // 連答権リセット
              currentCorrectPlayerIndex = -1;
            }
  
            if (targetStatus.misses == 2) {
              // 敗退
              vbcLog += `=> ${WinnedState.LOSED}`;
              targetStatus.status = WinnedState.LOSED;
              nLosedPlayer++;
            }
          }
          vbcLog += '\n';
        }
  
        if (nLosedPlayer == 7) {
          // トビ残り処理
          const remainedPlayers = setPlayers
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

      // 勝ち抜けプレイヤーログ出力
      const winnerPlayersName = setPlayers
        .filter((player) => (player.r2Status.status != WinnedState.UNDEFINED && player.r2Status.status != WinnedState.LOSED))
        .map((player) => player.name);
      vbcLog += '勝ち抜け ';
      for (const name of winnerPlayersName) {
        vbcLog += `[${name}]`;
      }
      vbcLog += '\n';
    }

    vbcLog += '【Round 2: 連答つき５○２× おわり】\n';
    context.emit('onFinish', vbcLog);

    return {
      setList,
      getNamePlateClass,
      convertRankNumberToText,
      getWinnedStateLabelStyle
    }
  }
})
</script>