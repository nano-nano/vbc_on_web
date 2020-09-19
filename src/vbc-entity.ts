/**
 * 参加者の情報を定義するエンティティ
 */
export interface PlayerEntity {
    /** ペーパー順位 */
    paperRank: number;
    /** 名前 */
    name: string;
    /** 知識力 */
    knowledge: number;
    /** 早押し力 */
    pushSpeed: number;
    /** 3Rコース希望（10o10x） */
    request10o10x: number;
    /** 3Rコース希望（Swedish10） */
    requestSwedish10: number;
    /** 3Rコース希望（10by10） */
    request10by10: number;
    /** 3Rコース希望（10updown） */
    request10updown: number;
    /** (option)所属 */
    belonging?: string;

    /** Round2ステータス */
    r2Status: Round2Entity;
    /** Round3ステータス */
    r3Status: Round3Entity;
    /** 敗者復活ステータス */
    exStatus: ExRoundEntity;
    /** 準決勝ステータス */
    sfStatus: SemiFinalEntity;
    /** 決勝ステータス */
    fStatus: FinalEntity;
}

/**
 * Round2のステータスを定義するエンティティ
 */
export interface Round2Entity {
    /** 正解数 */
    points: number;
    /** 誤答数 */
    misses: number;
    /** 正誤履歴文字列 */
    answered: string;
    /** 解答者ステータス */
    status: string;
}

/**
 * Round3のステータスを定義するエンティティ
 */
export interface Round3Entity {
    /** コース希望配列 */
    requestCourseArray: string[];
    /** 確定コース */
    fixedCourse: string;
    /** 正解数 */
    points: number;
    /** 誤答数 */
    misses: number;
    /** 正誤履歴文字列 */
    answered: string;
    /** 解答者ステータス */
    status: string;
}

/**
 * 敗者復活のステータスを定義するエンティティ
 */
export interface ExRoundEntity {
    /** First Step: 解答者ステータス */
    firstStepStatus: string;
    /** Second Step: 正解数 */
    secondStepPoints: number;
    /** Second Step: 誤答数 */
    secondStepMisses: number;
    /** Second Step: 正誤履歴文字列 */
    secondStepAnswerd: string;
    /** Second Step: 解答者ステータス */
    secondStepStatus: string;
}

/**
 * 準決勝のステータスを定義するエンティティ
 */
export interface SemiFinalEntity {
    /** 座席インデックス */
    seatIndex: number;
    /** 正解数 */
    points: number;
    /** 誤答数 */
    misses: number;
    /** 正誤履歴文字列（セットごとの配列） */
    answered: string[];
    /** 解答者ステータス */
    status: string;
}

/**
 * 決勝のステータスを定義するエンティティ
 */
export interface FinalEntity {
    /** セットごとの結果 */
    set: FinalSetEntity[];
    /** セット獲得数（nセブン） */
    nSeven: number;
    /** 優勝フラグ */
    isWin: boolean;
}

/**
 * 決勝のセットごとのステータスを定義するエンティティ
 */
export interface FinalSetEntity {
    /** 正解数 */
    points: number;
    /** 誤答数 */
    misses: number;
    /** 正誤履歴文字列 */
    answered: string;
    /** 解答者ステータス */
    status: string;
}