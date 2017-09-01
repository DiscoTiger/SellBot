/**
 * A map that keeps track of the last time it was modified on a global and per key/value pair basis
 * @extends Map
 */
class TimestampedMap extends Map {
	/**
	 * Creates a new TimestampedMap
	 * @param {*} iterable Optional: iterable to generate Map from | blank
	 */
	constructor(iterable) {
		super(iterable);
		/* eslint-disable max-len */
		Object.defineProperty(this, '_timestamps', { value: new Map(), writable: true, configurable: false, enumerable: false });
		Object.defineProperty(this, '_lastEdit', { value: Date.now(), writable: true, configurable: false, enumerable: false });
		/* eslint-enable max-len */
	}

	/**
	 * Sets a value in the map
	 * @param {*} key key
	 * @param {*} value value
	 * @override
	 */
	set(key, value) {
		this._timestamps.set(key, Date.now());
		this._lastEdit = Date.now();
		return super.set(key, value);
	}
	/**
	 * Removes value from the map
	 * @param {*} key index to remove
	 * @override
	 */
	delete(key) {
		this._timestamps.delete(key);
		this._lastEdit = Date.now();
		return super.delete(key);
	}
	/**
	 * Empties the map
	 * @override
	 */
	clear() {
		this._lastEdit = Date.now();
		return super.clear();
	}
	/**
	 * Gets the time elapsed in ms since the last change to this key
	 * @param {string} key key to fetch timestamp from
	 * @returns {number} time in ms since last change to this key
	 */
	getTimeDifference(key) {
		return Date.now() - this._timestamps.get(key);
	}
	/**
	 * Gets the time elapsed in ms since the last change to any key in this Map
	 * @returns {number} time in ms since change to any key in this Map
	 */
	getLastEdit() {
		return Date.now() - this._lastEdit;
	}
}

module.exports = TimestampedMap;
