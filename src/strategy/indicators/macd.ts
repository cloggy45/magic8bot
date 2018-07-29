
import { EMA } from './ema';

export class MACD {
    public static calculate(
        prevEmaShort: number, prevEmaLong: number, prevEmaMacd: number,
        periods: Record<string, number>[], emaShortPeriod: number, emaLongPeriod: number, signalPeriod: number,
        sourceKey = 'close'
    ) {

        const short = EMA.calculate(prevEmaShort, periods, emaShortPeriod, sourceKey)
        const long = EMA.calculate(prevEmaLong, periods, emaLongPeriod, sourceKey)
        const macd = short - long

        // filter for valid macd values
        const macdValues = [
            macd,
            ...periods.slice(1, signalPeriod + 1)
                .filter((period) => typeof period.macd === 'number')
                .map((period) => period.macd),
        ]

        let emaMacd: number = null;
        let history: number = null;
        if (macdValues.length > signalPeriod) {
            emaMacd = EMA.calculateValue(prevEmaMacd, macdValues, signalPeriod)
            history = macd - emaMacd
        }

        return {
            ema_short: short,
            ema_long: long,
            ema_macd: emaMacd,
            macd,
            history,
        }
    }
}
