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

const handsUp = (player: PlayerEntity, course: string, endCourses: string[]) => {
  // 既にコースが確定している人は手を挙げない
  if (player.r3Status.fixedCourse != Round3Course.UNDEFINED) return false; 

  for (const hopeCourse of player.r3Status.requestCourseArray) {
    if (!endCourses.includes(hopeCourse)) {
      return hopeCourse == course;
    }
  }
  // 本来ここまで到達することはないが、もし到達してしまった場合はとりあえず挙手する（出られなくなってしまうので）
  return true;
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
    
    // コース抽選
    const playerFixedCourseList: string[] = []; // 参加者決定済みコース
    const runningCourseOrder = getCourseOrder();
    vbcLog += `（コース実施順）${runningCourseOrder[0]} ＞ ${runningCourseOrder[1]} ＞ ${runningCourseOrder[2]} ＞ ${runningCourseOrder[3]}\n`;

    // 4コース分のコース組み分け
    const fixedPlayerIndexList: number[] = [];
    for (const course of runningCourseOrder) {
      const coursePlayers: PlayerEntity[] = [];
      const handsUpPlayerIndexList: number[] = [];

      // 挙手シミュレート
      for (let i = 0; i < priorityedPlayerList.length; i++) {
        if (handsUp(priorityedPlayerList[i], course, playerFixedCourseList)) {
          handsUpPlayerIndexList.push(i);
        }
      }
      
      let playerCount = 0;
      // 優先度上位から抽出
      for (let i = 0; i < priorityedPlayerList.length; i++) {
        if (!fixedPlayerIndexList.includes(i) && handsUpPlayerIndexList.includes(i) && playerCount < 5) {
          coursePlayers.push(priorityedPlayerList[i]);
          playerCount++;
          fixedPlayerIndexList.push(i);
        }
      }
      // 優先度下位から補充
      for (let i = priorityedPlayerList.length - 1; i >= 0; i--) {
        if (!fixedPlayerIndexList.includes(i) && !handsUpPlayerIndexList.includes(i) && playerCount < 5) {
          coursePlayers.push(priorityedPlayerList[i]);
          playerCount++;
          fixedPlayerIndexList.push(i);
        }
      }

      // コース確定
      for (const player of coursePlayers) {
        player.r3Status.fixedCourse = course;
      }
      playerFixedCourseList.push(course);
    }

    // priorityedPlayerList.forEach((player) => {
    //   console.log(`player: ${player.name} - ${player.r3Status.fixedCourse}`);
    // })

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