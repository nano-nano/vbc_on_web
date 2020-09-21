<template>
  <div>
    <h4>First Step: 読み上げ筆記クイズ</h4>
    <table class="table table-sm" v-for="(progress, idx) in firstStepProgressList" :key="idx">
      <tbody>
        <tr>
          <td class="centering-td" style="width: 10%;">
            第 {{ progress.questionCount }} 問
          </td>
          <td class="centering-td">
            <small>{{ progress.answered }}</small>
          </td>
          <td class="centering-td" style="width: 20%;">
            残り {{ progress.remainedCount }} 人
            {{ isFirstStepFinishedForTemplate(progress.remainedCount) ? '⇒ 決定！' : '' }}
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="isNeedSecondStep">
      <h4>Second Step: ５○１×クイズ</h4>
      <table class="table table-sm" style="table-layout: fixed;">
        <tbody>
          <tr>
            <td v-for="(player, idx) in remainedPlayers" :key="idx" class="centering-td" style="padding: 4px;">
              <small>{{ convertRankNumberToText(player) }}</small>
            </td>
          </tr>
          <tr>
            <td v-for="(player, idx) in remainedPlayers" :key="idx" class="centering-td">
              <small>{{ player.belonging }}</small>
            </td>
          </tr>
          <tr>
            <th 
              v-for="(player, idx) in remainedPlayers"
              :key="idx"
              class="tate-th"
              :class="getNamePlateClass(player)"
            >
              <span class="tate-span">{{ player.name }}</span>
            </th>
          </tr>
          <tr>
            <td v-for="(player, idx) in remainedPlayers" :key="idx" class="centering-td">
              <small>{{ player.exStatus.secondStepAnswerd }}</small>
            </td>
          </tr>
          <tr>
            <td v-for="(player, idx) in remainedPlayers" :key="idx" class="centering-td">
              <span :class="getWinnedStateLabelStyle(player.exStatus.secondStepStatus)">{{ player.exStatus.secondStepStatus }}</span>
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
import { NamePlateUtils, WinnedStateUtils, Random } from '@/logic/common-logic';
import { QuizResultUtils, CorrectAnswerProbabilityFunction } from '@/logic/quiz-logic';

const getFirstStepPlayers = (players: PlayerEntity[]) => {
  return players.filter((player) => {
    return (player.r2Status.status == WinnedState.UNDEFINED || player.r2Status.status == WinnedState.LOSED) || 
      (player.r3Status.status == WinnedState.UNDEFINED || player.r3Status.status == WinnedState.LOSED)
  }).filter((player) => player.paperRank != 49); // ペーパー次点は対象外
}

const calculateCorrectAnswerProbabilityFor2ndStep: CorrectAnswerProbabilityFunction = (players: PlayerEntity[], index: number, difficulty: number, slashPoint: number) => {
  const modifiedPlayerKnowledge = (player: PlayerEntity) => {
    let knowledge = player.knowledge;
    if (player.exStatus.secondStepPoints <= 2) {
      knowledge += 2.5;
    } else {
      knowledge += 3;
    }
    return knowledge;
  }
  
  let value = QuizResultUtils.calculateCorrectAnswerProbability(
      0.5, 
      modifiedPlayerKnowledge(players[index]),
      players[index].pushSpeed,
      difficulty,
      slashPoint);
  
  const nRemainedPlayers = players.filter((player) => player.exStatus.secondStepStatus == WinnedState.UNDEFINED).length;
  if (nRemainedPlayers == 2) {
    value += 0.2;
  }
  return value;
}

const set2ndStepWinnedData = (player: PlayerEntity) => {
  player.exStatus.secondStepStatus = WinnedState.FIRST_WINNED;
  player.sfStatus.seatIndex = 4; // 準決勝の座席indexは固定
}

type Props = {
  playerList: PlayerEntity[];
}
type FirstStepProgress = {
  questionCount: number;
  answered: string;
  remainedCount: number;
}
  
export default defineComponent({
  props: {
    playerList: {},
  },
  setup(props: Props, context: SetupContext) {
    const getNamePlateClass = (player: PlayerEntity) => NamePlateUtils.getBgColorClass(player.paperRank);
    const convertRankNumberToText = (player: PlayerEntity) => NamePlateUtils.convertRankNumberToText(player.paperRank);
    const getWinnedStateLabelStyle = (state: string) => WinnedStateUtils.getWinnedStateLabelStyle(state);
    const isFirstStepFinishedForTemplate = (nRemainedPlayers: number) => nRemainedPlayers <= 12;
    const isNeedSecondStep = (nRemainedPlayers: number) => {
      // First Step勝ち抜けが1名以下ならSecond Stepを実施する必要は無い
      return props.playerList.filter((player) => player.exStatus.firstStepStatus != WinnedState.LOSED).length > 1;
    };

    let vbcLog = '【Extra Round: 敗者復活】\n';

    // First Step
    vbcLog += '（First Step）\n';
    const firstStepPlayers = getFirstStepPlayers(props.playerList);
    let remainedPlayers = firstStepPlayers;
    let questionCount = 0;
    const firstStepProgressList: FirstStepProgress[] = [];
    while (remainedPlayers.length >= 13) {
      questionCount++;
      const progress = { 
        questionCount: questionCount,
        answered: '',
        remainedCount: 0
      } as FirstStepProgress
      const difficulty = QuizResultUtils.getQuestionDifficultyForExFirst(questionCount);
      for (const player of remainedPlayers) {
        // 敗者復活 First Stepは早押しルールではないため、知識力で回答可能性を算出する
        const isIncorrect = ((player.knowledge - difficulty + Random.getRandomArbitrary(-2, 2)) < 0);
        if (isIncorrect) {
          player.exStatus.firstStepStatus = WinnedState.LOSED;
        }
        progress.answered += (isIncorrect ? AnswerState.INCORRECT : AnswerState.CORRECT);
      }

      // 敗者をremainedPlayersから取り除く
      remainedPlayers = remainedPlayers.filter((player) => player.exStatus.firstStepStatus != WinnedState.LOSED);
      progress.remainedCount = remainedPlayers.length;
      firstStepProgressList.push(progress);
      vbcLog += `${ progress.questionCount } 問目: 残り ${ progress.remainedCount } 人\n`;
    }
    vbcLog += '（First Step おわり）\n';

    // Second Step
    if (remainedPlayers.length == 0) {
      vbcLog += '（First Step 勝ち抜け0名 ⇒ 敗者復活なし）\n';
    } else if (remainedPlayers.length == 1) {
      const player = remainedPlayers[0];
      set2ndStepWinnedData(player);
      vbcLog += `（First Step 勝ち抜け1名 ⇒ 敗者復活決定！: ${player.name}）\n`;
    } else {
      vbcLog += '（Second Step）\n';
      let nWinnedPlayer = 0;
      let nLosedPlayer = 0;
      for (const player of remainedPlayers) {
        vbcLog += `[${player.name}]`;
      }
      vbcLog += '\n';

      const nSecondStepPlayers = remainedPlayers.length;
      while (nWinnedPlayer < 1  && nLosedPlayer < (nSecondStepPlayers - 1)) {
        // クイズ実行
        const result = QuizResultUtils.operateQuiz(remainedPlayers, undefined, calculateCorrectAnswerProbabilityFor2ndStep);
        if (result.pushedPlayerIndex == -1) {
          // 問題スルー
          vbcLog += `（スルー）\n`;
          continue;
        } else if (remainedPlayers[result.pushedPlayerIndex].exStatus.secondStepStatus != WinnedState.UNDEFINED) {
          // その解答者が既に勝ち抜け or 敗退している
          continue;
        } else {
          // 誰かが解答権を得ている
          vbcLog += `${remainedPlayers[result.pushedPlayerIndex].name} `;
          if (result.isCorrected) {
            // 正解した
            vbcLog += `${AnswerState.CORRECT} `;
            remainedPlayers[result.pushedPlayerIndex].exStatus.secondStepPoints += 1;
            remainedPlayers[result.pushedPlayerIndex].exStatus.secondStepAnswerd += AnswerState.CORRECT;

            if (remainedPlayers[result.pushedPlayerIndex].exStatus.secondStepPoints == 5) {
              // 勝ち抜け
              vbcLog += `=> [勝ち抜け]`;
              set2ndStepWinnedData(remainedPlayers[result.pushedPlayerIndex]);
              nWinnedPlayer++;
            }
          } else {
            // 誤答した
            vbcLog += `${AnswerState.INCORRECT} => [失格]`;
            remainedPlayers[result.pushedPlayerIndex].exStatus.secondStepPoints += 1;
            remainedPlayers[result.pushedPlayerIndex].exStatus.secondStepAnswerd += AnswerState.INCORRECT;
            // 誤答は即失格
            remainedPlayers[result.pushedPlayerIndex].exStatus.secondStepStatus = WinnedState.LOSED;
            nLosedPlayer++;
          }
          vbcLog += '\n';
        }
      }

      if (nWinnedPlayer == 0) {
        // トビ残り処理
        const remainedLastPlayer = remainedPlayers.filter((player) => player.exStatus.secondStepStatus == WinnedState.UNDEFINED)[0];
        set2ndStepWinnedData(remainedLastPlayer);
        vbcLog += `敗者復活決定！: ${remainedLastPlayer.name}）\n`;
      }
    }
    vbcLog += '（Second Step おわり）\n';
    
    vbcLog += '【Extra Round: 敗者復活 おわり】\n';
    context.emit('onFinishExr', vbcLog);

    return {
      props,
      getNamePlateClass,
      convertRankNumberToText,
      getWinnedStateLabelStyle,
      isFirstStepFinishedForTemplate,
      isNeedSecondStep,
      firstStepProgressList,
      remainedPlayers
    }
  }
})
</script>