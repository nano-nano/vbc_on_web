<template>
  <div>
    <div v-for="(setData, idx) in finalSetResultData" :key="idx">
      <h4>第{{idx + 1}}セット</h4>
      <table class="table" style="table-layout: fixed;">
        <thead>
          <tr>
            <th 
              v-for="(player, idx2) in setData"
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
            <td v-for="(player, idx2) in setData" :key="idx2" class="centering-td" style="padding: 4px;">
              <small>{{ convertRankNumberToText(player) }}</small>
            </td>
          </tr>
          <tr>
            <td v-for="(player, idx2) in setData" :key="idx2" class="centering-td">
              <small>{{ player.belonging }}</small>
            </td>
          </tr>
          <tr>
            <td v-for="(player, idx2) in setData" :key="idx2" class="centering-td">
              <small>{{ player.fStatus.set[idx].answered }}</small>
            </td>
          </tr>
          <tr>
            <td v-for="(player, idx2) in setData" :key="idx2" class="centering-td">
              <span :class="getWinnedStateLabelStyle(player.fStatus.set[idx].status)">
                {{ player.fStatus.set[idx].status }}
                <span v-if="player.fStatus.set[idx].status == WinnedState.NON_ORDER_WINNED">
                  {{ getWinnedStateAppendlabel(player) }}
                </span>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext } from "@vue/composition-api";
import { PlayerEntity, SemiFinalEntity } from '@/vbc-entity'
import { WinnedState, AnswerState } from '@/vbc-state';
import { NamePlateUtils, WinnedStateUtils, Random } from '@/logic/common-logic';
import { QuizResultUtils, ButtonPushProbabilityFunction, CorrectAnswerProbabilityFunction } from '@/logic/quiz-logic';

const calculateButtonPushProbabilityForFinal = (setIndex: number) => {
  const newFunction: ButtonPushProbabilityFunction = (players: PlayerEntity[], index: number, difficulty: number, slashPoint: number) => {
    let value = QuizResultUtils.calculateStandardButtonPushProbability(players, index, difficulty, slashPoint);
    if ((setIndex + 1) - players[index].fStatus.set[setIndex].misses >= 3) {
      value *= 1.5;
    } else if ((setIndex + 1) - players[index].fStatus.set[setIndex].misses == 1) {
      value *= 0.75;
    }
    return value;
  };
  return newFunction;
}

const calculateCorrectAnswerProbabilityForFinal = (setIndex: number) => {
  const newFunction: CorrectAnswerProbabilityFunction = (players: PlayerEntity[], index: number, difficulty: number, slashPoint: number) => {
    const nRemainedPlayers = players.filter((player) => player.fStatus.set[setIndex].status == WinnedState.UNDEFINED).length;
    let baseValue = 0.7 - Math.sqrt(setIndex) * 0.2;
    if (nRemainedPlayers == 2) {
      baseValue += 0.1
    }

    let value = QuizResultUtils.calculateCorrectAnswerProbability(
      baseValue,
      players[index].knowledge, 
      players[index].pushSpeed,
      difficulty,
      slashPoint);
    if ((setIndex + 1) - players[index].fStatus.set[setIndex].misses >= 3) {
      value /= 1.5;
    } else if ((setIndex + 1) - players[index].fStatus.set[setIndex].misses == 3) {
      value /= 0.75;
    }
    return value;
  };
  return newFunction;
}

const operateSet = (setIndex: number, players: PlayerEntity[], vbcLog: string) => {
  let nWinnedPlayer = 0;
  let nLosedPlayer = 0;

  while (nWinnedPlayer < 1  && nLosedPlayer < 2) {
    const result = QuizResultUtils.operateQuiz(
      players, 
      calculateButtonPushProbabilityForFinal(setIndex),
      calculateCorrectAnswerProbabilityForFinal(setIndex));
    if (result.pushedPlayerIndex == -1) {
      // 問題スルー
      vbcLog += `（スルー）\n`;
      continue;
    } else if (players[result.pushedPlayerIndex].fStatus.set[setIndex].status != WinnedState.UNDEFINED) {
      // その解答者が既に勝ち抜け or 敗退している
      continue;
    } else {
      // 誰かが解答権を得ている
      vbcLog += `${players[result.pushedPlayerIndex].name} `;
      if (result.isCorrected) {
        // 正解した
        vbcLog += `${AnswerState.CORRECT} `;
        players[result.pushedPlayerIndex].fStatus.set[setIndex].points++;
        players[result.pushedPlayerIndex].fStatus.set[setIndex].answered += AnswerState.CORRECT;
        if (players[result.pushedPlayerIndex].fStatus.set[setIndex].points == 7) {
          // セット勝ち抜け
          players[result.pushedPlayerIndex].fStatus.nSeven++;
          vbcLog += `=> [セット勝ち抜け: ${players[result.pushedPlayerIndex].fStatus.nSeven}]`;
          players[result.pushedPlayerIndex].fStatus.set[setIndex].status = WinnedState.NON_ORDER_WINNED;
          nWinnedPlayer++;
        }
      } else {
        // 誤答した
        vbcLog += `${AnswerState.INCORRECT} `;
        players[result.pushedPlayerIndex].fStatus.set[setIndex].misses++;
        players[result.pushedPlayerIndex].fStatus.set[setIndex].answered += AnswerState.INCORRECT;
        if (players[result.pushedPlayerIndex].fStatus.set[setIndex].misses == (setIndex + 1)) {
          // セット敗退
          vbcLog += `=> [セット敗退]`;
          players[result.pushedPlayerIndex].fStatus.set[setIndex].status = WinnedState.LOSED;
          nLosedPlayer++;
        }
      }
      vbcLog += '\n';
    }
  }

  if (nLosedPlayer == 2) {
    // トビ残り処理
    const remainPlayer = players.filter((player) => player.fStatus.set[setIndex].status != WinnedState.LOSED)[0];
    remainPlayer.fStatus.set[setIndex].status = WinnedState.NON_ORDER_WINNED;
    remainPlayer.fStatus.nSeven++;
    vbcLog += `${remainPlayer.name} => [セット勝ち抜け: ${remainPlayer.fStatus.nSeven}]`;
    vbcLog += '\n';
  }
  return vbcLog;
}

const reCreatePlayerListForDisplay = (players: PlayerEntity[]) => {
  const result = [];
  for (const player of players) {
    const newPlayer = {
      name: player.name,
      paperRank: player.paperRank,
      belonging: player.belonging,
      fStatus: {
        set: player.fStatus.set,
        nSeven: player.fStatus.nSeven
      }
    } as PlayerEntity;
    result.push(newPlayer);
  }
  return result;
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
    const getWinnedStateAppendlabel = (player: PlayerEntity) => {
      return `${player.fStatus.nSeven}★ ` + ((player.fStatus.nSeven == 3) ? ' ⇒ 優勝！' : '');
    };

    const finalSetResultData = [];

    let vbcLog = '【Final: トリプルセブン】\n';
    const finalPlayers = props.playerList.filter((player) => {
      return player.sfStatus.status != WinnedState.UNDEFINED && player.sfStatus.status != WinnedState.LOSED;
    });

    for (let i = 0; i < 7; i++) {
      vbcLog += `（第${i + 1}セット）\n`;
      vbcLog = operateSet(i, finalPlayers, vbcLog);

      const winner = finalPlayers.filter((player) => player.fStatus.nSeven == 3)[0];
      if (winner == undefined) {
        // 優勝者が決まっていない
        finalSetResultData.push(reCreatePlayerListForDisplay(finalPlayers));
      } else {
        // 優勝者が決まった
        finalSetResultData.push(reCreatePlayerListForDisplay(finalPlayers));
        winner.fStatus.isWin = true;
        vbcLog += `優勝決定！: ${winner.name}`;
        vbcLog += '\n';
        break;
      }
    }
    vbcLog += '【Final: トリプルセブン おわり】\n';
    context.emit('onFinishF', vbcLog);

    return {
      props,
      WinnedState,
      getNamePlateClass,
      convertRankNumberToText,
      getWinnedStateLabelStyle,
      getWinnedStateAppendlabel,
      finalSetResultData
    }
  }
})
</script>