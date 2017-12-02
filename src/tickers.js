const snekfetch = require('snekfetch');

module.exports = {
	/**
     * Gets the coinmarketcap tickers for one coin
     * @param {string} tickerURL URL to the coinmarketcap ticker api for a specific coin
     * @returns {Promise<Object | Error>}
     */
	getTicker(tickerURL) {
		return new Promise(async (resolve, reject) => {
			const ticker = await snekfetch.get(tickerURL)
				.then(resp => JSON.parse(resp.text))
				.catch(reject);
			if (ticker) {
				resolve(ticker);
			} else {
				reject(new Error(`Ticker response was empty ${tickerURL}`));
			}
		});
	},
	/**
     * Gets the coinmarketcap tickers for a list of coins
     * @param {string[]} tickerURLs List of URLs to the coinmarketcap ticker api for specific coins
     * @returns {Promise<Object[] | Error>}
     */
	getTickers(tickerURLs) {
		return new Promise(async (resolve, reject) => {
			let tickers = [];

			for (let url of tickerURLs) {
				const ticker = await snekfetch.get(url) // eslint-disable-line no-await-in-loop
					.then(resp => JSON.parse(resp.text))
					.catch(reject);

				if (ticker) {
					tickers.push(ticker);
				} else {
					reject(new Error(`Ticker response was empty ${url}`));
				}
			}

			resolve(tickers);
		});
	},
	/**
     * Gets all coinmarketcap tickers
     * @returns {Promise<Object[] | Error>}
     */
	getAllTickers() {
		return new Promise(async (resolve, reject) => {
			const tickers = await snekfetch.get('https://api.coinmarketcap.com/v1/ticker/?limit=0')
				.then(resp => JSON.parse(resp.text))
				.catch(reject);
			if (tickers) {
				resolve(tickers);
			} else {
				reject(new Error(`Ticker response was empty https://api.coinmarketcap.com/v1/ticker/?limit=0`));
			}
		});
	},
	/**
	 * Puts tickers in a Map object, keyed by the coin symbol
	 * @param {Map} tickerMap a Map to hold the tickers
	 * @param {Object | Object[]} _tickers a ticker object or an array of ticker objects
	 */
	mapTickers(tickerMap, _tickers) {
		let tickers = [];
		if (!_tickers) throw new Error('No tickers provided');
		if (!tickerMap || !(tickerMap instanceof Map)) throw new Error('Map object paramater invalid or not provided');
		if (Array.isArray(tickers)) {
			tickers = _tickers;
		} else {
			tickers.push(_tickers);
		}

		for (let ticker of tickers) {
			tickerMap.set(ticker.symbol, ticker);
		}
	}
};
