import { Random } from './common-logic';
import { PlayerEntity } from '@/vbc-entity';
import { WinnedState } from '@/vbc-state';

export type ButtonPushProbabilityFunction = (players: PlayerEntity[], index: number, difficulty: number, slashPoint: number) => number;
export type CorrectAnswerProbabilityFunction = (players: PlayerEntity[], index: number, difficulty: number, slashPoint: number) => number;
export type OperateQuizResult = {
    pushedPlayerIndex: number;
    isCorrected: boolean;
};

export class QuizResultUtils {

    static operateQuiz(
        playerList: PlayerEntity[],
        buttonPushProbabilityFunction: ButtonPushProbabilityFunction = this.calculateStandardButtonPushProbability,
        correctAnswerProbabilityFunction: CorrectAnswerProbabilityFunction = this.calculateStandartCorrectAnswerProbability) {
        // 問題難易度とスラッシュポイントを決定する
        const difficulty = Random.getRandomArbitrary(0, 10);
        const slashPoint = Random.getRandomArbitrary(0, 10);

        // 解答権取得可能性を算出し、解答権取得プレイヤーを決定する
        const buttonProbabilityList = [];
        for (let i = 0; i < playerList.length; i++) {
            buttonProbabilityList.push(buttonPushProbabilityFunction(playerList, i, difficulty, slashPoint));
        }
        const pushedPlayerIndex = this.culculatePushedPlayer(buttonProbabilityList);
        // 問題はスルーになった
        if (pushedPlayerIndex == -1) return { pushedPlayerIndex: pushedPlayerIndex, isCorrected: true } as OperateQuizResult;

        // 正解可能性を算出し、正誤を決定する
        const correctProbability = correctAnswerProbabilityFunction(playerList, pushedPlayerIndex, difficulty, slashPoint);
        const answerValue = Random.getRandom()
        if (answerValue <= correctProbability) {
            // 正解判定
            return { pushedPlayerIndex: pushedPlayerIndex, isCorrected: true } as OperateQuizResult;
        } else {
            // 誤答判定
            return { pushedPlayerIndex: pushedPlayerIndex, isCorrected: false } as OperateQuizResult;
        }
    }

    /**
     * 指定されたプレイヤーの解答権取得可能性を算出する
     * （標準算出ルール: 早押し力算出値に2倍の重み付け付）
     * 
     * @param players クイズを解答しているプレイヤーの配列
     * @param index 対象プレイヤーを特定するindex
     * @param difficulty 問題の難易度値
     * @param slashPoint 問題のスラッシュポイント値
     */
    static calculateStandardButtonPushProbability(players: PlayerEntity[], index: number, difficulty: number, slashPoint: number): number {
        return Math.max(0, (players[index].knowledge - difficulty)) + Math.max(0, (players[index].pushSpeed - slashPoint)) * 2;
    }

    /**
     * 指定されたプレイヤーの正解可能性を算出する
     * （標準算出ルール: 知識力算出値に0.1倍の、早押し力算出値に0.05倍の重み付け付）
     * 
     * @param baseValue 算出基礎値（ルール等により変動）
     * @param pKnowledge 対象プレイヤーの知識力
     * @param pPushSpeed 対象プレイヤーの早押し力
     * @param difficulty 問題の難易度値
     * @param slashPoint 問題のスラッシュポイント値
     */
    static calculateCorrectAnswerProbability(baseValue: number, pKnowledge: number, pPushSpeed: number, difficulty: number, slashPoint: number): number {
        return baseValue + (pKnowledge - difficulty) * 0.1 + (pPushSpeed - slashPoint) * 0.05;
    }

    /**
     * 指定されたプレイヤーの正解可能性を算出する
     * （標準算出ルール & 算出基礎値 = 0.5）
     * 
     * @param players クイズを解答しているプレイヤーの配列
     * @param index 対象プレイヤーを特定するindex
     * @param difficulty 問題の難易度値
     * @param slashPoint 問題のスラッシュポイント値
     */
    static calculateStandartCorrectAnswerProbability(players: PlayerEntity[], index: number, difficulty: number, slashPoint: number): number {
        return QuizResultUtils.calculateCorrectAnswerProbability(0.5, players[index].knowledge, players[index].pushSpeed, difficulty, slashPoint);
    }

    /**
     * 解答権を取得したプレイヤーのindexを返す  
     * 解答権を取得したプレイヤーがいない場合（スルー）、-1を返す
     * 
     * ```
     * 【理論】
     * 解答権取得可能性数値を一列の数直線上に並べ、その全体を範囲とする乱数を生成、
     * 乱数値が数直線上のどこにあるかで解答権を取得したプレイヤーを決定する
     * |----player1----|--p2--|---p3---|
     *      ^乱数値
     * この場合、解答権はplayer1が得たことになる
     * ```
     * 
     * @param buttonProbabilityList 解答権取得可能性のリスト
     */
    private static culculatePushedPlayer(buttonProbabilityList: number[]) {
        // 解答権取得可能性数値を整列
        const probabilitySumList: number[] = [];
        for (const buttonProbability of buttonProbabilityList) {
            if (probabilitySumList.length == 0) {
                probabilitySumList.push(buttonProbability);
            } else {
                probabilitySumList.push(buttonProbability + Math.max(...probabilitySumList));
            }
        }
        
        // 解答権取得プレイヤーを決定
        const lamp = Random.getRandomArbitrary(0, Math.max(...probabilitySumList));
        for (let i = 0; i < probabilitySumList.length; i++) {
            if (lamp < probabilitySumList[i]) return i;
        }
        return -1; // -1は問題スルーを示す
    }

    // Round3 ===

    static calculateCorrectAnswerProbabilityFor10o10x(players: PlayerEntity[], index: number, difficulty: number, slashPoint: number): number {
        let nWinnedPlayers = 0;
        for (const player of players) {
            if (player.r3Status.status == WinnedState.FIRST_WINNED || player.r3Status.status == WinnedState.SECOND_WINNED) nWinnedPlayers++;
        } 
        const modifiedKnowledge = (nWinnedPlayers == 1) ? players[index].knowledge - 2 : players[index].knowledge - 1;
        let value = QuizResultUtils.calculateCorrectAnswerProbability(0.45, modifiedKnowledge, players[index].pushSpeed, difficulty, slashPoint);
        if (10 - players[index].r3Status.misses >= 5) {
            value /= 1.2;
        } else if (10 - players[index].r3Status.misses == 1) {
            value /= 0.75;
        }
        return value;
    }
}