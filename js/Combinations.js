class Combinations {
    // Коды комбинаций для универсального использования
    static ROYAL_FLUSH = 'ROYAL_FLUSH';
    static STRAIGHT_FLUSH = 'STRAIGHT_FLUSH';
    static FOUR_OF_A_KIND = 'FOUR_OF_A_KIND';
    static FULL_HOUSE = 'FULL_HOUSE';
    static FLUSH = 'FLUSH';
    static STRAIGHT = 'STRAIGHT';
    static THREE_OF_A_KIND = 'THREE_OF_A_KIND';
    static TWO_PAIR = 'TWO_PAIR';
    static PAIR = 'PAIR';

    // Ассоциативный массив комбинаций
    static combos = {
        [Combinations.ROYAL_FLUSH]: { code: Combinations.ROYAL_FLUSH, name: 'Royal Flush', points: 1000, check: Combinations.isRoyalFlush.bind(Combinations) },
        [Combinations.STRAIGHT_FLUSH]: { code: Combinations.STRAIGHT_FLUSH, name: 'Straight Flush', points: 500, check: Combinations.isStraightFlush.bind(Combinations) },
        [Combinations.FOUR_OF_A_KIND]: { code: Combinations.FOUR_OF_A_KIND, name: 'Four of a Kind', points: 200, check: Combinations.isFourOfAKind.bind(Combinations) },
        [Combinations.FULL_HOUSE]: { code: Combinations.FULL_HOUSE, name: 'Full House', points: 100, check: Combinations.isFullHouse.bind(Combinations) },
        [Combinations.FLUSH]: { code: Combinations.FLUSH, name: 'Flush', points: 80, check: Combinations.isFlush.bind(Combinations) },
        [Combinations.STRAIGHT]: { code: Combinations.STRAIGHT, name: 'Straight', points: 60, check: Combinations.isStraight.bind(Combinations) },
        [Combinations.THREE_OF_A_KIND]: { code: Combinations.THREE_OF_A_KIND, name: 'Three of a Kind', points: 40, check: Combinations.isThreeOfAKind.bind(Combinations) },
        [Combinations.TWO_PAIR]: { code: Combinations.TWO_PAIR, name: 'Two Pair', points: 30, check: Combinations.isTwoPair.bind(Combinations) },
        [Combinations.PAIR]: { code: Combinations.PAIR, name: 'Pair', points: 10, check: Combinations.isPair.bind(Combinations) }
    };

    static checkPokerHand(cards) {
        // Проверяем комбинации в порядке убывания очков
        const comboOrder = [
            this.ROYAL_FLUSH,
            this.STRAIGHT_FLUSH,
            this.FOUR_OF_A_KIND,
            this.FULL_HOUSE,
            this.FLUSH,
            this.STRAIGHT,
            this.THREE_OF_A_KIND,
            this.TWO_PAIR,
            this.PAIR
        ];

        for (let comboCode of comboOrder) {
            const combo = this.combos[comboCode];
            const winningIndices = combo.check(cards);
            if (winningIndices && winningIndices.length > 0) {
                return {
                    combo: combo,
                    winningCardIndices: winningIndices
                };
            }
        }
        return null;
    }

    static getRankValue(rank) {
        if (rank === 'A') return 1;
        if (rank === 'J') return 11;
        if (rank === 'Q') return 12;
        if (rank === 'K') return 13;
        return parseInt(rank);
    }

    static getRankCounts(cards) {
        const counts = {};
        cards.forEach(cardData => {
            const rank = cardData.card.rank;
            if (!counts[rank]) counts[rank] = [];
            counts[rank].push(cardData.index);
        });
        return counts;
    }

    static isRoyalFlush(cards) {
        if (cards.length !== 5) return false;
        const royalRanks = ['10', 'J', 'Q', 'K', 'A'];
        const ranks = cards.map(c => c.card.rank);
        const suits = [...new Set(cards.map(c => c.card.suit))];

        if (suits.length === 1 &&
            JSON.stringify(ranks.sort()) === JSON.stringify(royalRanks.sort())) {
            return cards.map(c => c.index);
        }
        return false;
    }

    static isStraightFlush(cards) {
        if (cards.length !== 5) return false;
        const flushIndices = this.isFlush(cards);
        const straightIndices = this.isStraight(cards);
        if (flushIndices && straightIndices && flushIndices.length === 5 && straightIndices.length === 5) {
            return cards.map(c => c.index);
        }
        return false;
    }

    static isFourOfAKind(cards) {
        if (cards.length < 4) return false;
        const counts = this.getRankCounts(cards);
        for (let rank in counts) {
            if (counts[rank].length >= 4) {
                return counts[rank].slice(0, 4);
            }
        }
        return false;
    }

    static isFullHouse(cards) {
        if (cards.length !== 5) return false;
        const counts = this.getRankCounts(cards);
        const ranks = Object.keys(counts);
        let threeIndices = null;
        let pairIndices = null;

        for (let rank of ranks) {
            if (counts[rank].length === 3) {
                threeIndices = counts[rank];
            } else if (counts[rank].length === 2) {
                pairIndices = counts[rank];
            }
        }

        if (threeIndices && pairIndices) {
            return [...threeIndices, ...pairIndices];
        }
        return false;
    }

    static isFlush(cards) {
        if (cards.length < 5) return false;
        const suits = [...new Set(cards.map(c => c.card.suit))];
        if (suits.length === 1) {
            return cards.map(c => c.index);
        }
        return false;
    }

    static isStraight(cards) {
        if (cards.length < 5) return false;
        const sortedCards = cards.sort((a, b) => this.getRankValue(a.card.rank) - this.getRankValue(b.card.rank));
        const values = sortedCards.map(c => this.getRankValue(c.card.rank));

        // Проверяем обычный стрит
        let isStraight = true;
        for (let i = 1; i < values.length; i++) {
            if (values[i] !== values[i-1] + 1) {
                // Проверяем стрит с тузом в конце (10, J, Q, K, A)
                if (JSON.stringify(values) === JSON.stringify([1, 10, 11, 12, 13])) {
                    return sortedCards.map(c => c.index);
                }
                isStraight = false;
                break;
            }
        }

        if (isStraight) {
            return sortedCards.map(c => c.index);
        }
        return false;
    }

    static isThreeOfAKind(cards) {
        if (cards.length < 3) return false;
        const counts = this.getRankCounts(cards);
        for (let rank in counts) {
            if (counts[rank].length >= 3) {
                return counts[rank].slice(0, 3);
            }
        }
        return false;
    }

    static isTwoPair(cards) {
        if (cards.length < 4) return false;
        const counts = this.getRankCounts(cards);
        const pairs = [];
        for (let rank in counts) {
            if (counts[rank].length >= 2) {
                pairs.push(...counts[rank].slice(0, 2));
            }
        }
        if (pairs.length >= 4) {
            return pairs.slice(0, 4);
        }
        return false;
    }

    static isPair(cards) {
        if (cards.length < 2) return false;
        const counts = this.getRankCounts(cards);
        for (let rank in counts) {
            if (counts[rank].length >= 2) {
                return counts[rank].slice(0, 2);
            }
        }
        return false;
    }
} 