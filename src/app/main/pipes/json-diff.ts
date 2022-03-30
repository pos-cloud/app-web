import { Pipe, PipeTransform } from '@angular/core';
import { SequenceMatcher } from './sequenceMatcher';

@Pipe({
    name: 'jsonDiff'
})
export class JsonDiffPipe implements PipeTransform {

	transform(obj1: any, obj2: any):any {
		return this.diff(obj1, obj2);
	}

	diff = function (obj1, obj2) {
		let change, ref, score;
		ref = this.diffWithScore(obj1, obj2), score = ref[0], change = ref[1];
		return change;
	};
	
	diffWithScore = function (obj1, obj2) {
		let type1, type2;
		type1 = this.extendedTypeOf(obj1);
		type2 = this.extendedTypeOf(obj2);
		if (type1 === type2) {
			switch (type1) {
				case 'object':
					return this.objectDiff(obj1, obj2);
				case 'array':
					return this.arrayDiff(obj1, obj2);
			}
		}
		if (obj1 !== obj2) {
			return [
				0, {
					__old: obj1,
					__new: obj2
				}
			];
		} else {
			return [100, void 0];
		}
	};
	
	extendedTypeOf = function (obj) {
		let result;
		result = typeof obj;
		if (obj == null) {
			return 'null';
		} else if (result === 'object' && obj.constructor === Array) {
			return 'array';
		} else {
			return result;
		}
	};
	
	objectDiff = function (obj1, obj2) {
		let change, key, ref, ref1, result, score, subscore, value1, value2;
		result = {};
		score = 0;
		for (key in obj1) {
			if (!obj1.hasOwnProperty(key)) continue;
			value1 = obj1[key];
			if (!(!(key in obj2))) {
				continue;
			}
			result[key + "__deleted"] = value1;
			score -= 30;
		}
		for (key in obj2) {
			if (!obj2.hasOwnProperty(key)) continue;
			value2 = obj2[key];
			if (!(!(key in obj1))) {
				continue;
			}
			result[key + "__added"] = value2;
			score -= 30;
		}
		for (key in obj1) {
			if (!obj1.hasOwnProperty(key)) continue;
			value1 = obj1[key];
			if (!(key in obj2)) {
				continue;
			}
			score += 20;
			value2 = obj2[key];
			ref = this.diffWithScore(value1, value2), subscore = ref[0], change = ref[1];
			if (change) {
				result[key] = change;
			}
			score += Math.min(20, Math.max(-10, subscore / 5));
		}
		if (Object.keys(result).length === 0) {
			ref1 = [100 * Math.max(Object.keys(obj1).length, 0.5), void 0], score = ref1[0], result = ref1[1];
		} else {
			score = Math.max(0, score);
		}
		return [score, result];
	};
	
	arrayDiff = function (obj1, obj2) {
		let allEqual, change, i, i1, i2, item, item1, item2, j, j1, j2, k, l, len, m, n, o, op, opcodes, originals1, originals2, p, q, ref, ref1, ref10, ref11, ref12, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, result, score, seq1, seq2;
		originals1 = {
			__next: 1
		};
		seq1 = this.scalarize(obj1, originals1);
		originals2 = {
			__next: originals1.__next
		};
		seq2 = this.scalarize(obj2, originals2, originals1);
		opcodes = new SequenceMatcher(null, seq1, seq2).getOpcodes();
		result = [];
		score = 0;
		allEqual = true;
		for (k = 0, len = opcodes.length; k < len; k++) {
			ref = opcodes[k], op = ref[0], i1 = ref[1], i2 = ref[2], j1 = ref[3], j2 = ref[4];
			if (!(op === 'equal')) {
				allEqual = false;
			}
			switch (op) {
				case 'equal':
					for (i = l = ref1 = i1, ref2 = i2; ref1 <= ref2 ? l < ref2 : l > ref2; i = ref1 <= ref2 ? ++l : --l) {
						item = seq1[i];
						if (this.isScalarized(item, originals1)) {
							item1 = this.descalarize(item, originals1);
							item2 = this.descalarize(item, originals2);
							change = this.diff(item1, item2);
							if (change) {
								result.push(['~', change]);
								allEqual = false;
							} else {
								result.push([' ']);
							}
						} else {
							result.push([' ', item]);
						}
						score += 10;
					}
					break;
				case 'delete':
					for (i = m = ref3 = i1, ref4 = i2; ref3 <= ref4 ? m < ref4 : m > ref4; i = ref3 <= ref4 ? ++m : --m) {
						result.push(['-', this.descalarize(seq1[i], originals1)]);
						score -= 5;
					}
					break;
				case 'insert':
					for (j = n = ref5 = j1, ref6 = j2; ref5 <= ref6 ? n < ref6 : n > ref6; j = ref5 <= ref6 ? ++n : --n) {
						result.push(['+', this.descalarize(seq2[j], originals2)]);
						score -= 5;
					}
					break;
				case 'replace':
					for (i = o = ref7 = i1, ref8 = i2; ref7 <= ref8 ? o < ref8 : o > ref8; i = ref7 <= ref8 ? ++o : --o) {
						result.push(['-', this.descalarize(seq1[i], originals1)]);
						score -= 5;
					}
					for (j = p = ref9 = j1, ref10 = j2; ref9 <= ref10 ? p < ref10 : p > ref10; j = ref9 <= ref10 ? ++p : --p) {
						result.push(['+', this.descalarize(seq2[j], originals2)]);
						score -= 5;
					}
			}
		}
		if (allEqual || (opcodes.length === 0)) {
			result = void 0;
			score = 100;
		} else {
			score = Math.max(0, score);
		}
		return [score, result];
	};
	
	scalarize = function (array, originals, fuzzyOriginals) {
		let bestMatch, index, item, k, len, proxy, results;
		results = [];
		for (index = k = 0, len = array.length; k < len; index = ++k) {
			item = array[index];
			if (this.isScalar(item)) {
				results.push(item);
			} else if (fuzzyOriginals && (bestMatch = this.findMatchingObject(item, index, fuzzyOriginals)) && bestMatch.score > 40 && (originals[bestMatch.key] == null)) {
				originals[bestMatch.key] = item;
				results.push(bestMatch.key);
			} else {
				proxy = "__$!SCALAR" + originals.__next++;
				originals[proxy] = item;
				results.push(proxy);
			}
		}
		return results;
	};
	
	isScalar = function (obj) {
		return typeof obj !== 'object' || obj === null;
	};
	
	isScalarized = function (item, originals) {
		return (typeof item === 'string') && (item in originals);
	};
	
	descalarize = function (item, originals) {
		if (this.isScalarized(item, originals)) {
			return originals[item];
		} else {
			return item;
		}
	};
	
	findMatchingObject = function (item, index, fuzzyOriginals) {
		let bestMatch, candidate, indexDistance, key, matchIndex, score;
		bestMatch = null;
		matchIndex = 0;
		for (key in fuzzyOriginals) {
			if (!fuzzyOriginals.hasOwnProperty(key)) continue;
			candidate = fuzzyOriginals[key];
			if (!(key !== '__next')) {
				continue;
			}
			indexDistance = Math.abs(matchIndex - index);
			if (this.extendedTypeOf(item) === this.extendedTypeOf(candidate)) {
				score = this.diffScore(item, candidate);
				if (!bestMatch || score > bestMatch.score || (score === bestMatch.score && indexDistance < bestMatch.indexDistance)) {
					bestMatch = {
						score: score,
						key: key,
						indexDistance: indexDistance
					};
				}
			}
			matchIndex++;
		}
		return bestMatch;
	};
	
	diffScore = function (obj1, obj2) {
		let change, ref, score;
		ref = this.diffWithScore(obj1, obj2), score = ref[0], change = ref[1];
		return score;
	};
}