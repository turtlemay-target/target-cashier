import * as React from 'react'
import * as lodash from 'lodash'
import * as yaml from 'js-yaml'
import FuseJs from 'fuse.js'
import { loadCacheDb, validateDb, saveCacheDb, getRemoteDb, clearCacheDb } from '../src/db'

const LOCAL_STORAGE_KEY = 'user-prefs'

const DEFAULT_PREFS = {
	dbUrl: 'https://db.gianteagle.turtlemay.us/',
	userItems: '',
	itemsPerPage: 4,
	itemTagPrefix: '#',
	organicModifier: '!',
	querySeparator: ';',
	defaultQuery: '',
	tokenizeSearch: false,
	resetQueryKey: '`',
	appNavBackKey: 'Escape',
	appNavViewLeftKey: '[',
	appNavViewRightKey: ']',
	noCheat: false,
}

type IPrefs = typeof DEFAULT_PREFS

type IState = IPrefs & {
	provider: AppStateProvider
	defaultPrefs: IPrefs,
	dbInfo?: IItemDbInfo
	remoteItemData: IItemData[]
	userItemData: IItemData[]
	compiledItemData: IItemData[]
	search: Function,
}

// @ts-expect-error
export const AppStateContext = React.createContext<IState>(undefined)

export class AppStateProvider extends React.Component<{}, IState> {
	_fuse: { search: Function }

	constructor(props: AppStateProvider['props']) {
		super(props)

		const loadedCacheDb = loadCacheDb()
		let cachedDbState: Partial<IState> = {}
		if (loadedCacheDb && validateDb(loadedCacheDb)) {
			const validDb = loadedCacheDb as IItemDb
			cachedDbState = {
				dbInfo: { name: validDb.name, version: validDb.version, organization: validDb.organization },
				remoteItemData: validDb.items,
			}
		}

		const localPrefs = this._getLocalPrefs()
		const userItemData = this._buildUserItemsData(localPrefs?.userItems ?? '')
		const remoteItemData = cachedDbState.remoteItemData ?? []
		const compiledItemData = this._buildItemData(remoteItemData, userItemData)

		const initialState: Partial<IState> = {
			provider: this,
			defaultPrefs: DEFAULT_PREFS,
			userItemData: userItemData,
			compiledItemData: compiledItemData,
			search: this.search,
		}

		this.state = Object.assign({}, DEFAULT_PREFS, localPrefs, cachedDbState, initialState)

		this._fuse = this._createFuse(compiledItemData)
	}

	render() {
		return React.createElement(AppStateContext.Provider, {
			value: this.state,
			children: this.props.children,
		})
	}

	componentDidMount() {
		this._updateRemoteItemDataState()
	}

	componentDidUpdate(prevProps: AppStateProvider['props'], prevState: AppStateProvider['state']) {
		const prefs = lodash.pick(this.state, lodash.keys(DEFAULT_PREFS)) as IPrefs
		this._saveLocalPrefs(prefs)

		if (this.state.dbUrl !== prevState.dbUrl)
			this._updateRemoteItemDataState()

		if (this.state.userItems !== prevState.userItems)
			this.setState({ userItemData: this._buildUserItemsData(this.state.userItems) })

		if (this.state.userItemData !== prevState.userItemData ||
			this.state.remoteItemData !== prevState.remoteItemData)
			this.setState({ compiledItemData: this._buildItemData(this.state.remoteItemData, this.state.userItemData) })

		if (this.state.compiledItemData !== prevState.compiledItemData)
			this._fuse = this._createFuse(this.state.compiledItemData)

		if (this.state.tokenizeSearch !== prevState.tokenizeSearch)
			this._fuse = this._createFuse(this.state.compiledItemData)
	}

	search = (query: string): IItemData[] => {
		return this._fuse.search(query).map(v => v.item)
	}

	resetAll = () => {
		this.setState(DEFAULT_PREFS)
	}

	_getLocalPrefs(): Partial<IPrefs> | null {
		const loadedString = localStorage.getItem(LOCAL_STORAGE_KEY)
		if (!loadedString)
			return null
		let result: IPrefs | null = null
		try {
			result = JSON.parse(loadedString)
		} catch (err) {
			console.error(err)
		}
		return result
	}

	_saveLocalPrefs(prefs: IPrefs) {
		const saveString = JSON.stringify(prefs)
		localStorage.setItem(LOCAL_STORAGE_KEY, saveString)
	}

	_buildItemData(remoteData: IItemData[], userData: IItemData[]): IItemData[] {
		let arr = [...remoteData, ...userData]
		arr = lodash.reject(arr, v => (v.duplicate || v.ignore)) as IItemData[]
		return arr
	}

	_buildUserItemsData(userInput: string): IItemData[] {
		let userData: IUserItemData
		try {
			userData = yaml.safeLoad(userInput) as {}
		} catch (error) {
			console.error(error)
			return []
		}
		return lodash.toPairs(userData).map(([name, value]): IItemData => {
			return { name, value, tags: ['user'] }
		})
	}

	_updateRemoteItemDataState = async () => {
		const db = await getRemoteDb(this.state.dbUrl)
		if (db) {
			this.setState({
				dbInfo: { name: db.name, version: db.version, organization: db.organization },
				remoteItemData: db.items,
			})
			saveCacheDb(db)
		} else {
			clearCacheDb()
			this.setState({
				dbInfo: undefined,
				remoteItemData: [],
			})
		}
	}

	_createFuse(data: IItemData[]) {
		return new FuseJs(data, {
			shouldSort: true,
			tokenize: this.state.tokenizeSearch,
			findAllMatches: true,
			maxPatternLength: 32,
			keys: [
				{ name: 'priority-keywords', weight: 0.4 },
				{ name: 'keywords', weight: 0.3 },
				{ name: 'name', weight: 0.2 },
				{ name: 'value', weight: 0.1 },
			],
		})
	}
}

interface IUserItemData {
	[k: string]: number
}
