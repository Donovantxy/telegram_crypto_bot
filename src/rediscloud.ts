import { RedisClientType, createClient } from 'redis';
import { AlertPool } from './models';

export class RedisDb {

  get client(): RedisClientType {
    return this._client;
  }

  private _client!: RedisClientType;
  private _ALERT_POOL = 'alert_pool';
  
  constructor(public pw: string, public host: string, public port: number) {}

  public connect = async () => {
    this._client = createClient({
      username: 'default',
      password: this.pw,
      socket: {
        host: this.host,
        port: this.port
      }
    });
    this._client.on('error', err => console.log('Redis Client Error', err));
    await this._client.connect().then(res => { console.log('Redis client connected') });
  };

  public async getAlertPool(): Promise<AlertPool> {
    const alertPool = {priceAlerts: {}};
    try {
      const pool = await this.client.get(this._ALERT_POOL);
      if ( pool ) {
        return JSON.parse(pool);
      }
      await this.client.set(this._ALERT_POOL, JSON.stringify(alertPool));
      return alertPool;
    } catch (error) {
      console.error('Client not connected');
      return alertPool;
    }
  }

  public async storeAlert(alertPool: AlertPool) {
    this.client.set(this._ALERT_POOL, JSON.stringify(alertPool));
  }

}



