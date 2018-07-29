export class SMA {
  public static calculate(periods: Record<string, number>[], length: number, source = 'close') {
    return SMA.calculateValue(periods.map((period) => period[source]), length)
  }

  public static calculateValue(sourceValues: number[], length: number) {
    const sma = sourceValues.slice(0, length).reduce((sum, curr) => {
      return sum + curr
    }, 0) / length
    return sma
  }
}
