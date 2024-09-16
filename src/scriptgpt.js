// Utility functions
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

function only(word, rack) {
    let rackCount = {};
    for (let char of rack) {
        rackCount[char] = (rackCount[char] || 0) + 1;
    }
    for (let char of word) {
        if (!rackCount[char] || rackCount[char]-- <= 0) return false;
    }
    return true;
}

function count(str, char) {
    let count = 0;
    for (let c of str) {
        if (c == char) count++ 
    }

    return count;
}

function find_prob(rack, words) {
    for (let word of words.filter(e => e.length == 7)) {
        if (only(word, rack)) return 1;
    }
    return 0;
}

function find_all_nl_draws(n, bag) {
    let all_combos = iter(bag, n);
    let combo_probs = {};

    for (let combo of all_combos) {
        let new_bag = bag;
        let prob = 1;
        for (let char of combo) {
            let charCount = count(new_bag, char);
            if (charCount === 0) {
                prob = 0;
                break;
            }
            prob *= charCount / new_bag.length;
            new_bag = new_bag.replace(char, "", 1);
        }
        if (prob > 0) {
            let sortedCombo = Array.from(combo).sort().join("");
            combo_probs[sortedCombo] = (combo_probs[sortedCombo] || 0) + prob;
        }
    }
    return combo_probs;
}

function find_bingo_chance(partial_rack, bag, words) {
    let score = 0;
    let draws = find_all_nl_draws(7 - partial_rack.length, bag);
    for (let [draw, prob] of Object.entries(draws)) {
        score += find_prob(partial_rack + draw, words) * prob;
    }
    return score;
}

function find_nl_combos(rack, length) {
    let all_combos = iter(rack, length);
    let unique_combos = new Set(all_combos.filter(e => only(e, rack)).map(e => Array.from(e).sort().join("")));
    return [...unique_combos];
}

async function main() {
    let file = await fetch("/csw19.txt");
    let text = await file.text();
    let words = text.split("\n");

    let bag = prompt("Current bag state").replaceAll(" ", "");
    let rack = prompt("Current rack");

    if (find_prob(rack, words)) {
        document.write("You have a bingo dummy");
    } else {
        let best_chance = 0;
        for (let i = 1; i < 8; i++) {
            let combos = find_nl_combos(rack, i);
            document.write(`Found all ${i}s (${combos.length})<br/>`);
            await sleep(10);
            for (let combo of combos) {
                let new_rack = rack;
                for (let char of combo) {
                    new_rack = new_rack.replace(char, "", 1);
                }

                let chance = find_bingo_chance(new_rack, bag, words);
                if (chance > best_chance) {
                    best_chance = chance;
                    document.write(`Trading ${combo}: ${Math.round(chance * 100) / 100}% chance of a bingo<br/>`);
                }
            }
        }
    }
}

main();