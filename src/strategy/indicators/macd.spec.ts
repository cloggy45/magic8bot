import { MACD } from './macd'
import { candles } from './spec.helper';

describe('MACD', () => {
    it('should calculate the correct initial values', () => {
        const macd = MACD.calculate(null, null, null, candles.slice(0, 27), 12, 26, 9)
        expect(macd.ema_long).toEqual(16.87307692307692)
        expect(macd.ema_short).toEqual(17.605)
        expect(macd.ema_macd).toBeNull()
        expect(macd.history).toBeNull()
        expect(macd.macd).toEqual(0.7319230769230813)
    })

    it('should calculate the correct first ema_macd and history', () => {

        const availableCandles = candles.slice(27)
        const usedCandles = candles.slice(0, 27)
        let prevEmaShort = null
        let prevEmaLong = null
        let prevEmaMacd = null
        let macd = null
        for (let i = 0; i < 10; i++) {
            macd = MACD.calculate(prevEmaShort, prevEmaLong, prevEmaMacd, usedCandles, 12, 26, 9)
            prevEmaShort = macd.ema_short
            prevEmaLong = macd.ema_long
            prevEmaMacd = macd.ema_macd
            expect(prevEmaShort).not.toBeNull()
            expect(prevEmaLong).not.toBeNull()
            if (i < 9) {
                expect(prevEmaMacd).toBeNull()
            } else {
                expect(prevEmaMacd).not.toBeNull()
            }
            usedCandles[0].macd = macd.macd
            usedCandles.pop()
            usedCandles.unshift(availableCandles.shift())
        }
        expect(macd.ema_long).toEqual(17.81432386391224)
        expect(macd.ema_short).toEqual(18.58301409255362)
        expect(macd.ema_macd).toEqual(0.7096121390440753)
        expect(macd.history).toEqual(0.05907808959730376)
        expect(macd.macd).toEqual(0.768690228641379)
    })
})
