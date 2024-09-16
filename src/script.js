let static = {
    "A": 8,
    "B": 4,
    "C": 3,
    "D": 8,
    "E": 10,
    "F": 6,
    "G": 8,
    "H": 5,
    "I": 8,
    "J": 2,
    "K": 2,
    "L": 6,
    "M": 5,
    "N": 9,
    "O": 7,
    "P": 5,
    "Q": 1,
    "R": 10,
    "S": 10,
    "T": 10,
    "U": 6,
    "V": 2,
    "W": 3,
    "X": 1,
    "Y": 3,
    "Z": 1,
    "?": 15
} // Used for ordering combos

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function iter(bag, n) {
    if (n === 0) return [''];
    let combos = [];
    let previousCombos = iter(bag, n - 1);
    for (let char of bag) {
        for (let combo of previousCombos) {
            combos.push(char + combo);
        }
    }
    return combos;
}

function find_prob(rack, slwords) {
    // return Math.min(1, words.filter(e => e.length == 7 && only(e, rack)).length);
    for (let word of slwords) { // .filter(e => e.length == 7)
        if (only(word, rack)) return 1;
    }

    return 0;
}

function find_all_nl_draws(n, bag) {
    let all_combos = iter(bag, n);
    let combos = all_combos.filter(e => only(e, bag, true));
    combos = [... new Set(combos)];
    let combo_probs = {}

    for (let combo of combos) {
        let new_bag = bag;
        let prob = 1;
        for (let char of combo) {
            prob *= count(new_bag, char) / new_bag.length;
            new_bag = new_bag.replace(char, "", 1);
        }

        combo_probs[combo] = prob;
    }

    return combo_probs;
}

function find_bingo_chance(partial_rack, slwords, draws) {
    let keys = Object.keys(draws);
    let sorted = keys.map(e => Array.from(e).sort().join(""));
    let duplicates = {};
    for (let key of sorted) {
        duplicates[key] = (duplicates[key] || 0) + 1;
    }

    let score = 0;
    for (let [draw, mult] of Object.entries(duplicates)) {
        score += find_prob(partial_rack + draw, slwords) * draws[draw] * 100 * mult;
    }

    return score
}

function find_nl_combos(rack, length) {
    let all_combos = iter(rack, length);
    let combos = all_combos.filter(e => only(e, rack)).map(e => Array.from(e).sort().join(""));
    combos = [... new Set(combos)];
    return combos
}

async function main() {
    let file = await fetch("/csw19.txt");
    let text = await file.text();
    let words = text.split("\n");

    let bag = prompt("Current bag state").replaceAll(" ", "");
    let rack = prompt("Current rack");

    let slwords = words.filter(e => e.length === 7);

    if (find_prob(rack, slwords)) document.write("You have a bingo dummy");
    else {
        let best_chance = 0;
        for (let i = 1; i < 8; i++) {
            let combos = find_nl_combos(rack, i);
            let scores = {};
            for (let combo of combos) {
                score = 0
                let idx = 0;
                for (let char of combo) {
                    score += static[char] - 8 * count(combo.slice(0, idx), char);
                    idx++;
                }
                scores[combo] = score;
            }

            combos = combos.sort((a, b) => scores[a] - scores[b]);
            console.log(combos);
            document.write(`Found all ${i}s (${combos.length})<br/>`);
            await sleep(10);
            let draws = find_all_nl_draws(i, bag);
            for (let combo of combos) {
                await sleep(10);
                let new_rack = rack;
                for (let char of combo) {
                    new_rack = new_rack.replace(char, "", 1);
                }

                let chance = find_bingo_chance(new_rack, slwords, draws);
                if (chance > best_chance) {
                    best_chance = chance;
                    document.write("<b>");
                }
                document.write(`Trading ${combo}: ${Math.round(chance * 100) / 100}% chance of a bingo${best_chance == chance ? '</b>' : ''}<br/>`)
            }
        }
    }
}

main();