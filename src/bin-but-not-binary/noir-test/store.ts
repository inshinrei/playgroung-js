import { action, makeObservable, observable, reaction } from 'mobx'

const storage = {
  get: (key) => {
    return localStorage.getItem(key)
  },
  set: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value))
  },
  delete: (key) => {
    localStorage.deleteItem(key)
  },
}
// want to be
const config = {
  key: 'string',
  version: 0,
  storage: storage,
  // migration: createMigration(migrations),
}

const migrations = {
  0: (store: Store) => {
    return {}
  },
  1: (store: Store) => {},
}

class BaseModel {
  storageWhitelist: Array<string> = []
  private version: number
  private key: string
  private storage: Storage
  private migration: Migration

  constructor(config) {
    this.version = config.version
    this.key = config.key
    this.storage = config.storage
    this.migration = config.migration
    this.storageWhitelist = config.whitelist
  }

  onStart() {
    // check if storage have changed, storage migration
    // check the version, migration may be needed
  }

  // pass whitelist as arg
  sub() {
    this.storageWhitelist.forEach((item) => {
      reaction(
        () => this[item],
        (d) => {
          this.storage.set(this.key + item, d)
        },
      )
    })
  }
}

export class Store extends BaseModel {
  state1 = 1
  state2 = 'string'

  public storageWhitelist = ['state1', 'state2']

  constructor() {
    super({ ...config, whitelist: ['state1', 'state2'] })
    makeObservable(this, {
      state1: observable,
      state2: observable,
      setState1: action.bound,
    })

    this.sub()
  }

  setState1(v) {
    this.state1 = v
  }

  setState2(v) {
    this.state2 = v
  }
}

export const store = new Store()

interface MigrationFunc {
  to: number
  run: () => void | never
}

interface Migration {}

interface Storage {
  get: (key: string) => any
  set: (key: string, value: any) => void
  delete: (key: string) => void
}

interface StorageData {
  data: any
  version: number
  storageKey: ''
}
