import { WinnedState } from './vbc-state';

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
}

export interface Round2Entity {
    points: number;    // 正解数
    misses: number;    // 誤答数
    answered: string;  // 正誤履歴文字列
    status: string;    // 解答者ステータス
}