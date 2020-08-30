/**
 * 参加者の情報を定義するエンティティ
 */
export interface PlayerEntity {
    paperRank: number;          // ペーパー順位
    name: string;               // 名前
    knowledge: number;          // 知識力
    pushSpeed: number;          // 早押し力
    request10o10x: number;      // 3Rコース希望（10o10x）
    requestSwedish10: number;   // 3Rコース希望（Swedish10）
    request10by10: number;      // 3Rコース希望（10by10）
    request10updown: number;    // 3Rコース希望（10updown）
    belonging?: string;         // (option)所属

    r2Status: Round2Entity;
    r3Status: Round3Entity;
    exStatus: ExRoundEntity;
    sfStatus: SemiFinalEntity;
}

export interface Round2Entity {
    points: number;    // 正解数
    misses: number;    // 誤答数
    answered: string;  // 正誤履歴文字列
    status: string;    // 解答者ステータス
}

export interface Round3Entity {
    requestCourseArray: string[];   // コース希望配列
    fixedCourse: string;            // 確定コース
    points: number;                 // 正解数
    misses: number;                 // 誤答数
    answered: string;               // 正誤履歴文字列
    status: string;                 // 解答者ステータス
}

export interface ExRoundEntity {
    firstStepStatus: string;    // First Step: 解答者ステータス
    secondStepPoints: number;   // Second Step: 正解数
    secondStepMisses: number;   // Second Step: 誤答数
    secondStepAnswerd: string;  // Second Step: 正誤履歴文字列
    secondStepStatus: string;   // Second Step: 解答者ステータス
}

export interface SemiFinalEntity {
    seatIndex: number;  // 座席インデックス
    points: number;     // 正解数
    misses: number;     // 誤答数
    answered: string[]; // 正誤履歴文字列（セットごとの配列）
    status: string;     // 解答者ステータス
}