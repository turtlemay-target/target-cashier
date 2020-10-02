declare module 'jsbarcode'
declare module 'fuse.js'

type IItemDbInfo = Pick<IItemDb, 'name' | 'version'>

interface IItemDb {
  name: string
  version: string
  items: IItemData[]
}

interface IItemData {
  'priority-keywords'?: string[]
  alwaysShowBarcode?: boolean
  duplicate?: boolean
  ignore?: boolean
  keywords?: string[]
  name: string
  tags?: string[]
  uiColor?: string
  value: number | string
}
