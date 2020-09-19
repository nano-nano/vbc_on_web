/**
 * 勝ち抜け状態
 */
export const WinnedState = {
    /** 未確定 */
    UNDEFINED: '',
    /** 順序指定無し勝ち抜け */
    NON_ORDER_WINNED: '[Win]',
    /** 1抜け */
    FIRST_WINNED: '[1st]',
    /** 2抜け */
    SECOND_WINNED: '[2nd]',
    /** 3抜け */
    THIRD_WINNED: '[3rd]',
    /** 4抜け */
    FOURTH_WINNED: '[4th]',
    /** 5抜け */
    FIFTH_WINNED: '[5th]',
    /** 敗退 */
    LOSED: '[LOSE]',
} as const;
type WinnedState = typeof WinnedState[keyof typeof WinnedState];

/**
 * 勝ち抜け順配列
 */
export const WinnedStateOrder = [
    WinnedState.UNDEFINED,
    WinnedState.FIRST_WINNED,
    WinnedState.SECOND_WINNED,
    WinnedState.THIRD_WINNED,
    WinnedState.FOURTH_WINNED,
    WinnedState.FIFTH_WINNED,
    WinnedState.LOSED
];

/** 正誤状態 */
export const AnswerState = {
    /** 正解 */
    CORRECT: '○',
    /** 不正解 */
    INCORRECT: '✕',
    /** 連答正解 */
    CORRECT_DOUBLE: '◎◎',
    /** アドバンテージ正解 */
    CORRECT_ADVANTAGE: '●',
} as const;
type AnswerState = typeof AnswerState[keyof typeof AnswerState];

/** Round3コース */
export const Round3Course = {
    /** コース未定義 */
    UNDEFINED: 'undefined',
    /** 10○10✕ */
    OX: '10○10✕',
    /** 10 by 10 */
    BY: '10 by 10',
    /** Swedish 10 */
    SWEDISH: 'Swedish 10',
    /** 10 up-down */
    UP_DOWN: '10 up-down',
} as const;
type Round3Course = typeof Round3Course[keyof typeof Round3Course];
export const Round3CourseArray = [ Round3Course.OX, Round3Course.BY, Round3Course.SWEDISH, Round3Course.UP_DOWN ];