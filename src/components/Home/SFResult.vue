<template>
  <div>
    <div v-for="(setData, idx) in sfSetResultData" :key="idx">
      <h4>第{{idx + 1}}セット</h4>
      <table class="table table-sm" style="table-layout: fixed;">
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
            <th 
              v-for="(player, idx2) in setData"
              :key="idx2"
              class="tate-th"
              :class="getNamePlateClass(player)"
            >
              <span class="tate-span">{{ player.name }}</span>
            </th>
          </tr>
          <tr>
            <td v-for="(player, idx2) in setData" :key="idx2" class="centering-td">
              <small>{{ player.sfStatus.answered[idx] }}（{{ (player.sfStatus.points - player.sfStatus.misses) }}pts.）</small>
            </td>
          </tr>
          <tr>
            <td v-for="(player, idx2) in setData" :key="idx2" class="centering-td">
              <span :class="getWinnedStateLabelStyle(player.sfStatus.status)">{{ player.sfStatus.status }}</span>
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
import { QuizResultUtils } from '@/logic/quiz-logic';

const operatePlayOff = (playerA: PlayerEntity, playerB: PlayerEntity) => {
  const result = QuizResultUtils.operateQuiz([playerA, playerB]);
  if (result.pushedPlayerIndex == -1) operatePlayOff(playerA, playerB); // スルーの場合は再帰実行
  if (result.isCorrected) {
    // どちらかが正解 -> 正解した方が先になるようにする
    return (result.pushedPlayerIndex == 0) ? -1 : 1;
  } else {
    // どちらかが誤答 -> 誤答した方が後になるようにする
    return (result.pushedPlayerIndex == 0) ? 1 : -1;
  }
}

const operateSet = (setNo: number, players: PlayerEntity[], vbcLog: string) => {
  let time = 0; // 経過時間（秒）
  while (time < 5 * 60) { // 5分
    const result = QuizResultUtils.operateQuiz(players);
    if (result.pushedPlayerIndex == -1) {
      // 問題スルー
      time += Random.getRandomArbitrary(7.5 - 4, 7.5 + 4);
      vbcLog += `（スルー）\n`;
      continue;
    } else if (players[result.pushedPlayerIndex].sfStatus.status != WinnedState.UNDEFINED) {
      // その解答者が既に勝ち抜け or 敗退している
      continue;
    } else {
      // 誰かが解答権を得ている
      time += Random.getRandomArbitrary(7.5 - 4, 7.5 + 4);
      vbcLog += `${players[result.pushedPlayerIndex].name} `;
      if (setNo == 1) {
        // 第1セット: 正解で+1, 誤答で-1
        if (result.isCorrected) {
          // 正解した
          vbcLog += `${AnswerState.CORRECT} `;
          players[result.pushedPlayerIndex].sfStatus.points += 1;
          players[result.pushedPlayerIndex].sfStatus.answered[0] += AnswerState.CORRECT;
        } else {
          // 誤答した
          vbcLog += `${AnswerState.INCORRECT} `;
          players[result.pushedPlayerIndex].sfStatus.misses += 1;
          players[result.pushedPlayerIndex].sfStatus.answered[0] += AnswerState.INCORRECT;
        }
      } else if (setNo == 2) {
        // 第2セット: 正解で+1, 誤答で-2
        if (result.isCorrected) {
          // 正解した
          vbcLog += `${AnswerState.CORRECT} `;
          players[result.pushedPlayerIndex].sfStatus.points += 1;
          players[result.pushedPlayerIndex].sfStatus.answered[1] += AnswerState.CORRECT;
        } else {
          // 誤答した
          vbcLog += `${AnswerState.INCORRECT} `;
          players[result.pushedPlayerIndex].sfStatus.misses += 2;
          players[result.pushedPlayerIndex].sfStatus.answered[1]+= AnswerState.INCORRECT;
        }
      } else {
        // 第2セット: 正解で+2, 誤答で-2
        if (result.isCorrected) {
          // 正解した
          vbcLog += `${AnswerState.CORRECT} `;
          players[result.pushedPlayerIndex].sfStatus.points += 2;
          players[result.pushedPlayerIndex].sfStatus.answered[2] += AnswerState.CORRECT;
        } else {
          // 誤答した
          vbcLog += `${AnswerState.INCORRECT} `;
          players[result.pushedPlayerIndex].sfStatus.misses += 2;
          players[result.pushedPlayerIndex].sfStatus.answered[2] += AnswerState.INCORRECT;
        }
      }
      vbcLog += '\n';
    }
  }
  vbcLog += `（制限時間終了）\n`;

  const sortedPlayersInSet = players
    .filter((player) => player.sfStatus.status == WinnedState.UNDEFINED)
    .sort((playerA, playerB) => {
      const playerAscore = playerA.sfStatus.points - playerA.sfStatus.misses;
      const playerBscore = playerB.sfStatus.points - playerB.sfStatus.misses;
        if (playerAscore != playerBscore) return (playerBscore - playerAscore); // （正解ポイント - 誤答ポイント）多い順
        return operatePlayOff(playerA, playerB); // プレーオフ
    });

  // 上位1人が勝ち抜け
  if (setNo == 1) {
    sortedPlayersInSet[0].sfStatus.status = WinnedState.FIRST_WINNED;
  } else if (setNo == 2) {
    sortedPlayersInSet[0].sfStatus.status = WinnedState.SECOND_WINNED;
  } else {
    sortedPlayersInSet[0].sfStatus.status = WinnedState.THIRD_WINNED;
  }
  vbcLog += `${sortedPlayersInSet[0].name} => ${sortedPlayersInSet[0].sfStatus.status}\n`;

  // 下位2人が敗退
  sortedPlayersInSet[sortedPlayersInSet.length - 1].sfStatus.status = WinnedState.LOSED;
  if (sortedPlayersInSet.length != 8) {
    // 参加人数が8人の場合は2人目を決めない
    sortedPlayersInSet[sortedPlayersInSet.length - 2].sfStatus.status = WinnedState.LOSED;
  }
  vbcLog += `${sortedPlayersInSet[sortedPlayersInSet.length - 1].name}, ${sortedPlayersInSet[sortedPlayersInSet.length - 2].name} => ${WinnedState.LOSED}\n`;

  return vbcLog;
}

const reCreatePlayerListForDisplay = (players: PlayerEntity[]) => {
  const result = [];
  for (const player of players) {
    const newPlayer = {
      name: player.name,
      paperRank: player.paperRank,
      belonging: player.belonging,
      sfStatus: {
        points: player.sfStatus.points,
        misses: player.sfStatus.misses,
        answered: player.sfStatus.answered,
        status: player.sfStatus.status
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

    const sfSetResultData = [];

    let vbcLog = '【Semi Final: 3セット制タイムレース Nine Hundred】\n';
    const semiFinalPlayers = props.playerList.filter((player) => {
      return player.sfStatus.seatIndex != -1;
    }).sort((playerA, playerB) => {
      return playerB.sfStatus.seatIndex - playerA.sfStatus.seatIndex;
    });

    for (let i = 0; i < 3; i++) {
      vbcLog += `（第${i + 1}セット）\n`;
      for (const player of semiFinalPlayers) {
        if (player.sfStatus.status == WinnedState.UNDEFINED) {
          vbcLog += `[${player.name}]`;
        }
      }
      vbcLog += '\n';

      // クイズ実行
      vbcLog = operateSet(i + 1, semiFinalPlayers, vbcLog);
      // 正誤履歴文字列がそのセットに設定されているプレイヤー＝セット参加者なので、結果用配列に抽出する
      const extractedList = semiFinalPlayers.filter((player) => player.sfStatus.answered[i] != '');
      sfSetResultData.push(reCreatePlayerListForDisplay(extractedList.slice()));
    }
    
    vbcLog += '【Semi Final: 3セット制タイムレース Nine Hundred おわり】\n';
    context.emit('onFinishSf', vbcLog);

    return {
      props,
      getNamePlateClass,
      convertRankNumberToText,
      getWinnedStateLabelStyle,
      sfSetResultData
    }
  }
})
</script>