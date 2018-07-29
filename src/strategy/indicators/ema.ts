import { SMA } from './sma'

export class EMA {
  public static calculate(prevEma: number, periods: Record<string, number>[], length: number, source = 'close') {
    return EMA.calculateValue(prevEma, periods.map((period) => period[source]), length)
  }

  public static calculateValue(prevEma: number, sourceValues: number[], length: number) {
    const [sourceValue] = sourceValues
    if (sourceValues.length <= length) return null

    if (!prevEma) return SMA.calculateValue(sourceValues, length)

    const smoothing = 2 / (length + 1)
    return smoothing * (sourceValue - prevEma) + prevEma
  }
}
