import { Random } from './common-logic';
import { PlayerEntity } from '@/vbc-entity';
import { WinnedState } from '@/vbc-state';

/** 解答権取得可能性を算出する関数。戻り値の値が大きいほど、解答権を得る可能性が上がる */
export type ButtonPushProbabilityFunction = (players: PlayerEntity[], index: number, difficulty: number, slashPoint: number) => number;
/** 正解可能性を算出する関数。戻り値の値が大きいほど、正解できる可能性が上がる */
export type CorrectAnswerProbabilityFunction = (players: PlayerEntity[], index: number, difficulty: number, slashPoint: number) => number;
/** 1問分のクイズを実行した結果 */
export type OperateQuizResult = {
    /** 解答権を得たプレイヤーの配列インデックス。問題がスルーされた場合は-1 */
    pushedPlayerIndex: number;
    /** 解答権を得たプレイヤーが正解したかどうか。true: 正解した, false: 誤答した */
    isCorrected: boolean;
};

export class QuizResultUtils {
    /**
     * 1問分のクイズを実行し、その結果を返す  
     * 解答権取得可能性を算出する関数、正解可能性を算出する関数は指定することもできる  
     * （指定しない場合は空か`undefinied`とする）
     * 
     * @param playerList クイズに参加する参加者の配列
     * @param buttonPushProbabilityFunction 解答権取得可能性を算出する関数（指定しない場合は標準関数が使用される）
     * @param correctAnswerProbabilityFunction 正解可能性を算出する関数（指定しない場合は標準関数が使用される）
     */
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

    static calculateButtonPushProbabilityFor10by10(players: PlayerEntity[], index: number, difficulty: number, slashPoint: number): number {
        let value = QuizResultUtils.calculateStandardButtonPushProbability(players, index, difficulty, slashPoint);
        if (QuizResultUtils.getRequiredCorrectLevelIncreasingFor10by10(players[index]) >= 4) {
            value *= 0.75;
        }
        return value;
    }

    static calculateCorrectAnswerProbabilityFor10by10(players: PlayerEntity[], index: number, difficulty: number, slashPoint: number): number {
        let value = QuizResultUtils.calculateStandartCorrectAnswerProbability(players, index, difficulty, slashPoint);
        if (QuizResultUtils.getRequiredCorrectLevelIncreasingFor10by10(players[index]) >= 4) {
            value /= 0.75;
        }
        return value;
    }

    /**
     * 10by10ルール時の、誤答すると仮定しても正解の欲しい度合いを返す
     * 
     * @param player 
     */
    private static getRequiredCorrectLevelIncreasingFor10by10(player: PlayerEntity) {
        const currentLevel = this.getRequiredCorrectLevelFor10by10(player.r3Status.points, player.r3Status.misses);
        const ifMissLevel = this.getRequiredCorrectLevelFor10by10(player.r3Status.points, player.r3Status.misses + 1);
        return ifMissLevel - currentLevel;
    }

    /**
     * 10by10ルール時の、正解の欲しい度合いを返す
     * 
     * @param points 
     * @param misses 
     */
    private static getRequiredCorrectLevelFor10by10(points: number, misses: number) {
        if (misses == 10) return 10000000;
        const currentScore = points * (10 - misses);
        return 100 - currentScore + (10 - misses) - 1;
    }

    static calculateCorrectAnswerProbabilityFor10UpDown(players: PlayerEntity[], index: number, difficulty: number, slashPoint: number): number {
        let nLosedPlayers = 0;
        for (const player of players) {
            if (player.r3Status.status == WinnedState.LOSED) nLosedPlayers++;
        }

        const modifiedKnowledge = () => {
            let value = players[index].knowledge;
            if (players[index].r3Status.points <= 4) {
                value += 2.5;
            } else if (players[index].r3Status.points <= 7) {
                value += 3;
            } else {
                value += 3.5;
            }
            value += nLosedPlayers;
            return value;
        };
        let value = QuizResultUtils.calculateCorrectAnswerProbability(0.45, modifiedKnowledge(), players[index].pushSpeed, difficulty, slashPoint);
        value += nLosedPlayers * 0.08;
        return value;
    }

    static calculateButtonPushProbabilityForSwedish10(players: PlayerEntity[], index: number, difficulty: number, slashPoint: number): number {
        let value = QuizResultUtils.calculateStandardButtonPushProbability(players, index, difficulty, slashPoint);
        if (QuizResultUtils.getMissAffordabilityForSwedish10(players[index]) == 1) {
            value *= 0.75;
        }
        return value;
    }

    static calculateCorrectAnswerProbabilityForSwedish10(players: PlayerEntity[], index: number, difficulty: number, slashPoint: number): number {
        let value = QuizResultUtils.calculateStandartCorrectAnswerProbability(players, index, difficulty, slashPoint);
        if (QuizResultUtils.getMissAffordabilityForSwedish10(players[index]) == 4) {
            value /= 0.75;
        }
        return value;
    }

    /**
     * Swedish 10ルール時の、正解・誤答数に応じた恐れの度合いを返す
     * 
     * @param player 
     */
    static getMissAffordabilityForSwedish10(player: PlayerEntity) {
        const missCount = () => {
            if (player.r3Status.points == 0) return 1;
            if (player.r3Status.points <= 2) return 2;
            if (player.r3Status.points <= 5) return 3;
            return 4;
        };

        const remainMisses = 10 - player.r3Status.misses;
        return (remainMisses + missCount() - 1);
    }

    // Extra Round ==

    /**
     * 敗者復活 First Round用の問題難易度を返す  
     * 返す値は問題番号（n問目）に応じて、おおよそ線形増加する
     * 
     * @param questionCount 問題番号（n問目）
     */
    static getQuestionDifficultyForExFirst(questionCount: number) {
        return (questionCount / 1.8 + Random.getRandomArbitrary(-1, 1) + 2);
    }
}