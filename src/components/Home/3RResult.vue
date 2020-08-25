<template>
  <div>
  </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext } from "@vue/composition-api";
import { PlayerEntity } from '@/vbc-entity'
import { WinnedState, WinnedStateOrder, Round3CourseArray, Round3Course } from '@/vbc-state';
import { Random, NamePlateUtils } from '@/logic/common-logic';
// import { QuizResultUtils } from '@/logic/quiz-logic';

const getCourseOrder = () => {
  const courseArray = Round3CourseArray;
  const length = Round3CourseArray.length;
  // シャッフル
  for(let i = length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = courseArray[i];
      courseArray[i] = courseArray[j];
      courseArray[j] = tmp;
  }
  return courseArray;
}

const getRequestCourseArray = (player: PlayerEntity) => {
  // コース希望値を算出
  const requestCourses = [
    { course: Round3Course.OX, value: Random.getRandomArbitrary(0, player.request10o10x)},
    { course: Round3Course.BY, value: Random.getRandomArbitrary(0, player.request10by10)},
    { course: Round3Course.SWEDISH, value: Random.getRandomArbitrary(0, player.requestSwedish10)},
    { course: Round3Course.UP_DOWN, value: Random.getRandomArbitrary(0, player.request10updown)}
  ];
  // 希望値の昇順でソートしてコース情報だけ返す
  return requestCourses
    .sort((courseA, courseB) => (courseA.value - courseB.value))
    .map((item) => item.course)
}

// const getWinState = (nWinner: number) => {
//   switch (nWinner) {
//     case 0:
//       return WinnedState.FIRST_WINNED;
//     case 1:
//       return WinnedState.SECOND_WINNED;
//     default:
//       return '';
//   }
// }

type Props = {
  playerList: PlayerEntity[];
}
  
export default defineComponent({
  props: {
    playerList: {},
  },
  setup(props: Props) {
    let vbcLog = '【Round 3: Number 10】\n';

    // Round3参加者のコース希望値算出 -> 優先順にソート
    const priorityedPlayerList = props.playerList
      .filter((player) => (player.r2Status.status != WinnedState.UNDEFINED && player.r2Status.status != WinnedState.LOSED))
      .map((player) => {
        player.r3Status.requestCourseArray = getRequestCourseArray(player);
        return player;
      })
      .sort((playerA, playerB) => {
        // 優先順は2R勝ち抜け順＞ペーパー順位
        if (WinnedStateOrder.indexOf(playerA.r2Status.status as any) < WinnedStateOrder.indexOf(playerB.r2Status.status as any)) return -1;
        if (WinnedStateOrder.indexOf(playerA.r2Status.status as any) > WinnedStateOrder.indexOf(playerB.r2Status.status as any)) return 1;
        return playerA.paperRank - playerB.paperRank;
      });
    
    console.log(priorityedPlayerList);

    // TODO: コース抽選、挙手シミュレート、参加コース決定

    // TODO: クイズ実行

    vbcLog += '【Round 3: Number 10 おわり】\n';
    // context.emit('onFinish3r', vbcLog);

    const getNamePlateClass = (player: PlayerEntity) => NamePlateUtils.getBgColorClass(player.paperRank)
    const convertRankNumberToText = (player: PlayerEntity) => NamePlateUtils.convertRankNumberToText(player.paperRank);

    return {
      props,
      getNamePlateClass,
      convertRankNumberToText
    }
  }
})
</script>


<style scoped>

</style>