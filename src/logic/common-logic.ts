export class NamePlateUtils {
    /**
     * ペーパー順位に応じたネームプレート色を返す
     * 
     * @param rank ペーパー順位
     */
    static getBgColorClass(rank: number) {
        if (rank <= 4) return 'bg-danger';
        if (rank <= 12) return 'bg-primary';
        if (rank <= 24) return 'bg-warning';
        if (rank <= 48) return 'bg-success';
        return '';
    }

    /**
     * ペーパー順位を序数テキストに変換して返します
     * 
     * @param rank ペーパー順位
     */
    static convertRankNumberToText(rank: number) {
        const rankLastTwo = rank % 100;
        if (rankLastTwo >= 11 && rankLastTwo <= 13) return `${rank}th`;
        if (rank % 10 == 1) return `${rank}st`;
        if (rank % 10 == 2) return `${rank}nd`;
        if (rank % 10 == 3) return `${rank}rd`;
        return `${rank}th`;
    }
}

export class Random {
    /**
     * 0以上1未満の浮動小数点の擬似乱数を返す
     */
    static getRandom() {
        return Math.random();
    }

    /**
     * 指定した値の間の乱数を返す
     * 戻り値は min 以上、 max 未満
     */
    static getRandomArbitrary(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    /**
     * 指定した値の間のランダムな整数を返す
     * 戻り値は min 以上（ min が整数でない場合、 min より大きい次の整数以上）、 max 未満
     */
    static getRandomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }
}