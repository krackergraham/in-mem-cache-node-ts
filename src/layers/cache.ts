export class CacheOptions {
  public ttl:number;
  public maxSize:number;
  public minAge:number;

  /**
   *
   * @param {number} maxSize - maximum number of addresses to cache
   * @param {number} minAge - min age in minutes before item may be removed from cache if over capacity
   * @param {number} ttl - time to live in minutes - If set to 0 no TTL is computed
   */
  constructor(maxSize:number = 50000, minAge:number = 10, ttl:number = 0) {
    this.maxSize = maxSize;
    this.ttl = this.minToMilli(ttl);
    this.minAge = this.minToMilli(minAge);
  }

  private minToMilli(min:number) {
    return min * 60 * 1000;
  }
}


class CacheItem {
  public key:string;
  public value:string;
  public expires:number;
  public hits:number;
  public lastAccess:number;
}


export default class Cache {

  private options:CacheOptions;
  private data:Object;

  constructor(options?:CacheOptions) {
    this.init(options);
  }

  public getByKey(key:string):string {
    this.checkIsExpired(key);

    const cacheItem:CacheItem = this.data[key];

    if (cacheItem == null) return null;

    cacheItem.hits++;
    cacheItem.lastAccess = this.timeNow();

    return cacheItem.value;
  }


  public setByKey(key:string, value:string):void {
    // Clear any existing values
    this.deleteByKey(key);

    const timeNow = this.timeNow();

    let expires = 0;
    if (this.options.ttl != null && this.options.ttl > 0) {
      expires = timeNow + this.options.ttl;
    }

    const cacheItem:CacheItem = {
      key: key,
      value: value,
      expires: expires,
      hits: 0,
      lastAccess: this.timeNow(),
    };

    this.data[key] = cacheItem;

    this.checkCacheSize();
  }

  private init(options:CacheOptions) {
    if (options)
      this.options = options;
    else
      this.options = new CacheOptions();

    this.data = {};
  }

  private checkIsExpired(key:string):void {
    if (this.isExpired(key)) {
      this.deleteByKey(key);
    }
  }

  private isExpired(key:string):boolean {
    const dataObj = this.data[key];

    return dataObj != null && dataObj.expires > 0 && dataObj.expires < this.timeNow();
  }

  private deleteByKey(key:string):void {
    delete this.data[key];
  }

  private timeNow():number {
    return new Date().getTime();
  }

  // Sort hits in descending order so we can pop the stack instead of shift
  private sortByHitsDescending(a:CacheItem, b:CacheItem):number {
    if (a.hits > b.hits)
      return -1;
    else if (a.hits < b.hits)
      return 1;
    else
      return 0;
  }

  private checkCacheSize() {
    const keys = Object.keys(this.data);

    if (keys.length < this.options.maxSize) return;

    // Don't remove objects that are less than the minimum "age"
    // For high through put systems this should be monitored and configured accordingly
    const minTimeAlive = this.timeNow() - this.options.minAge;

    const sorted =
      keys
        .map((key:string) => { return this.data[key]; })
        .filter((c:CacheItem) => { return c.lastAccess < minTimeAlive;})
        .sort(this.sortByHitsDescending);

    while (sorted.length > this.options.maxSize) {
      const toRemove = sorted.pop();

      this.deleteByKey(toRemove.key);
    }
  }

}
