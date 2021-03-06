import { SessionStore } from '@store'
import { Conf, ExchangeConf } from '@m8bTypes'
import { ExchangeProvider } from '@exchange'
import { ExchangeCore } from './exchange'

export class Core {
  constructor(private readonly conf: Conf) {}

  public async init() {
    const { exchanges, resetSession } = this.conf

    // @todo(notVitaliy): Fix this shit... eventually
    if (resetSession) {
      await SessionStore.instance.newSession()
    } else {
      await SessionStore.instance.loadSession()
    }

    const exchangeProvider = new ExchangeProvider(exchanges)

    exchanges.forEach((exchangeConf) => {
      const engine = new ExchangeCore(exchangeProvider, this.mergeConfig(exchangeConf), this.conf.mode !== 'live')
      engine.init()
    })
  }

  private mergeConfig(exchangeConf: ExchangeConf): ExchangeConf {
    const { mode, session_id, exchanges, ...baseConf } = this.conf
    return {
      ...exchangeConf,
      options: {
        base: { ...baseConf, ...exchangeConf.options.base },
        strategies: exchangeConf.options.strategies,
      },
    }
  }
}
