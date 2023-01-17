'use strict'

/**
 * Capitalize the first letter of the string.
 * 
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
	if (str.length < 1) return ''
	return str[0].toUpperCase() + str.substring(1)
}

/**
 * Capitalize the first letter of every word in a string. Hyphenated words are counted as separate words.
 * 
 * @param {string} str
 */
export function humanize(str) {
	const segs = str.split(/[ -]/)
	return segs.reduce((acc, cur) => acc + ' ' + capitalize(cur), '').substring(1)
}