import { eventBus, EVENT, EventBusEmitter, PeriodItem } from '@lib'
import { EMA, RSI } from '../../indicators'
import { BaseStrategy } from '../base-strategy'
import { MACD } from '../../indicators/macd';

export interface MacdOptions {
  period: string
  minPeriods: number
  emaShortPeriod: number
  emaLongPeriod: number
  signalPeriod: number
  upTrendThreshold: number
  downTrendThreshold: number
  overboughtRsiPeriods: number
  overboughtRsi: number
}

export class Macd extends BaseStrategy<MacdOptions> {
  public options: MacdOptions = {
    period: '1h',
    minPeriods: 52,
    emaShortPeriod: 12,
    emaLongPeriod: 26,
    signalPeriod: 9,
    upTrendThreshold: 0,
    downTrendThreshold: 0,
    overboughtRsiPeriods: 25,
    overboughtRsi: 70,
  }

  public readonly name: string = 'MACD'

  private isPreroll = true

  private rsi = 0
  private avgGain = 0
  private avgLoss = 0

  private emaShort: number = null
  private emaLong: number = null
  private emaMacd: number = null

  private signalEmitter: EventBusEmitter
  private calcEmitter: EventBusEmitter

  private periods: {
    macd: number
    history: number
  }[] = [{ macd: null, history: null }]

  private overbought = false

  constructor(exchange: string, symbol: string, options?: Partial<MacdOptions>) {
    super()

    this.options = { ...this.options, ...options }

    const eventBusEvent = { exchange, symbol, strategy: this.name }

    eventBus.subscribe({ event: EVENT.PERIOD_UPDATE, ...eventBusEvent }, (periods: PeriodItem[]) =>
      this.calculate(periods)
    )
    eventBus.subscribe({ event: EVENT.PERIOD_NEW, ...eventBusEvent }, () => this.onPeriod())

    this.signalEmitter = eventBus.register({ event: EVENT.STRAT_SIGNAL, ...eventBusEvent })
    this.calcEmitter = eventBus.register({ event: EVENT.STRAT_CALC, ...eventBusEvent })
  }

  public calculate(periods: PeriodItem[]) {
    this.checkOverbought(periods)

    const macdCalc = MACD.calculate(
      this.emaShort, this.emaLong, this.emaMacd, this.periods,
      this.options.emaShortPeriod, this.options.emaLongPeriod, this.options.signalPeriod
    )

    this.periods[0].macd = macdCalc.macd
    this.periods[0].history = macdCalc.history

    // prettier-ignore
    const { rsi, periods: [{ history }] } = this

    this.calcEmitter({ rsi, history })
  }

  public checkOverbought(periods: PeriodItem[]) {
    const { rsi, avgGain, avgLoss } = RSI.calculate(
      this.avgGain,
      this.avgLoss,
      periods,
      this.options.overboughtRsiPeriods
    )

    this.rsi = rsi
    this.avgGain = avgGain
    this.avgLoss = avgLoss
    this.overbought = !this.isPreroll && rsi >= this.options.overboughtRsi && !this.overbought
  }

  public onPeriod() {
    let signal = null

    if (!this.isPreroll && this.rsi && this.overbought) {
      this.overbought = false
      signal = 'sell'
    }

    if (!signal) {
      const [{ history }, { history: lastHistory }] = this.periods

      if (history && lastHistory) {
        const { upTrendThreshold } = this.options
        if (history - upTrendThreshold > 0 && lastHistory - upTrendThreshold <= 0) signal = 'buy'

        const { downTrendThreshold } = this.options
        if (history + downTrendThreshold < 0 && lastHistory + downTrendThreshold >= 0) signal = 'sell'
      }
    }

    this.signalEmitter({ signal })
    this.newPeriod()

    return signal
  }

  public newPeriod() {
    this.periods.push({ macd: null, history: null })
  }

  public prerollDone() {
    this.isPreroll = false
  }
}
