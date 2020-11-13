import * as React from 'react'
import * as lodash from 'lodash'
import * as mathjs from 'mathjs'
import c from 'classnames'
import { focusInputAtEnd } from '../lib/dom'
import { AppStateContext } from './AppStateProvider'
import { DelayedTextInput } from './DelayedTextInput'
import { ConditionalRenderer } from './ConditionalRenderer'
import { Shadowbox } from './Shadowbox'
import { useHistory, useLocation } from 'react-router-dom'
import { MainViewQueryResults } from './MainViewQueryResults'

export const MainView = (props: {
	className?: string
	active: boolean
}) => {
	const context = React.useContext(AppStateContext)
	const history = useHistory()
	const location = useLocation()
	const [query, setQuery] = React.useState(context.defaultQuery)
	const [splitQueries, setSplitQueries] = React.useState([query])
	const [activeQueryIndex, setActiveQueryIndex] = React.useState(0)
	const [showThrobber, setThrobber] = React.useState(false)
	const [mathResult, setMathResult] = React.useState(0)
	const [showMathResult, setShowMathResult] = React.useState(false)
	const [roundUpResult, setRoundUpResult] = React.useState(0)
	const [showRoundUpResult, setShowRoundUpResult] = React.useState(false)
	const [shadowBoxElem, setShadowBoxElem] = React.useState<React.ReactNode>(null)
	const [showShadowbox, setShowShadowbox] = React.useState(false)
	const [useNumInput, setUseNumInput] = React.useState(false)
	const [onResetQueryDelegate] = React.useState(new Set<VoidFunction>())
	const inputElemRef = React.useRef<HTMLInputElement>()

	React.useEffect(initSelectInput, [])
	React.useEffect(updateKeyListener)
	React.useEffect(updateQueryParams)
	React.useEffect(onChangedQuery, [query])
	React.useEffect(onChangeSplitQueries, [splitQueries])
	React.useEffect(onChangedActiveView, [props.active])

	function initSelectInput() {
		inputElemRef.current?.select()
	}

	function updateKeyListener() {
		addEventListener('keydown', handleKeyDown)

		return function cleanup() {
			removeEventListener('keydown', handleKeyDown)
		}

		function handleKeyDown(e: KeyboardEvent) {
			if (!props.active)
				return

			if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey)
				return

			if (e.key === 'Enter') {
				e.preventDefault()
				focusInputField()
				clearInputField()
				return
			}

			if ([e.key, e.code].includes(context.resetQueryKey)) {
				e.preventDefault()
				resetQuery()
				return
			}

			if (!showShadowbox) {
				if (splitQueries.length > 1) {
					if ([e.key, e.code].includes(context.appNavViewLeftKey)) {
						e.preventDefault()
						setActiveQueryLeft()
						return
					}
					if ([e.key, e.code].includes(context.appNavViewRightKey)) {
						e.preventDefault()
						setActiveQueryRight()
						return
					}
				}
			}

			if (inputElemRef && inputElemRef.current !== document.activeElement) {
				if (!e.ctrlKey && !e.metaKey && !e.altKey && String.fromCharCode(e.keyCode).match(/(\w|\s)/g))
					focusInputField()
			}
		}
	}

	function updateQueryParams() {
		const queryParams = new URLSearchParams(location.search)
		setShowShadowbox(queryParams.has('sb'))
	}

	function onChangedActiveView() {
		if (props.active)
			inputElemRef.current?.select()
	}

	function onChangedQuery() {
		if (query.length === 0)
			return

		setSplitQueries(splitQuery(query))

		const queryParams = new URLSearchParams(location.search)
		if (queryParams.has('sb')) {
			queryParams.delete('sb')
			history.push(`?${queryParams.toString()}`)
		}

		const gotMathResult = tryMath(query)
		if (gotMathResult) {
			setMathResult(gotMathResult)
			setShowMathResult(true)
		} else {
			setShowMathResult(false)
		}

		const gotRoundUpResult = tryRoundUp(query)
		if (gotRoundUpResult) {
			setRoundUpResult(gotRoundUpResult)
			setShowRoundUpResult(true)
		} else {
			setShowRoundUpResult(false)
		}

		if (query === context.defaultQuery)
			inputElemRef.current?.select()
	}

	function onChangeSplitQueries() {
		setActiveQueryIndex(0)
	}

	function resetQuery() {
		onResetQueryDelegate.forEach(fn => fn?.())
		inputElemRef.current?.select()
		setActiveQueryIndex(0)
		setQuery(context.defaultQuery)
		setUseNumInput(false)
		const queryParams = new URLSearchParams(location.search)
		if (queryParams.has('sb')) {
			queryParams.delete('sb')
			history.push(`?${queryParams.toString()}`)
		}
	}

	function splitQuery(str: string): string[] {
		const arr = str.split(context.querySeparator)
		return arr.filter(v => v.length > 0)
	}

	function tryMath(query: string): number | null {
		let result: unknown
		if (query.match(/^\d+$/))
			return null
		try { result = mathjs.evaluate(query) } catch { }
		if (typeof result === 'number')
			return result
		return null
	}

	function tryRoundUp(query: string): number | null {
		if (query.match(/^\d{1,2}$/)) {
			const n = Number(query)
			return lodash.inRange(n, 1, 100) ? 100 - n : 0
		}
		return null
	}

	function focusInputField() {
		const elem = inputElemRef.current
		if (elem && elem !== document.activeElement)
			focusInputAtEnd(elem)
	}

	function clearInputField() {
		const elem = inputElemRef.current
		if (elem) elem.value = ''
	}

	function onClickToggleKbButton() {
		setUseNumInput(!useNumInput)
		setQuery('')
	}

	function onClickResetButton() {
		resetQuery()
		setUseNumInput(false)
	}

	function onPickShadowBoxElem(jsx: JSX.Element) {
		setShadowBoxElem(React.cloneElement(jsx))
		history.push('?sb')
	}

	function setActiveQueryLeft() {
		setActiveQueryIndex(lodash.clamp(activeQueryIndex - 1, 0, splitQueries.length - 1))
	}

	function setActiveQueryRight() {
		setActiveQueryIndex(lodash.clamp(activeQueryIndex + 1, 0, splitQueries.length - 1))
	}

	return (
		<div className={c('mainView__root mainView__mainLayout', props.className)}>
			<div className="mainView__mainLayoutTop mainView__mainInputContainer">
				<div className="mainView__queryNumInputToggleButton">
					<div className="mainView__queryNumInputToggleButtonText" onClick={onClickToggleKbButton}>
						<ConditionalRenderer condition={useNumInput} children="⌨️" />
						<ConditionalRenderer condition={!useNumInput} children="🔢" />
					</div>
				</div>
				<DelayedTextInput className={c('mainView__mainInput', { 'mainView__mainInput--numType': useNumInput })}
					type={useNumInput ? 'number' : 'text'}
					elemRef={inputElemRef}
					placeholder={useNumInput ? "Enter UPC or PLU code" : "Enter query"}
					committedValue={query}
					onStartInput={() => setThrobber(true)}
					onStopInput={() => setThrobber(false)}
					onCommit={v => { if (v.length > 0) setQuery(v) }}
					commitDelay={300}
					disabled={!props.active}
					passProps={{ spellCheck: false }} />
				<div className="mainView__queryResetButton" onClick={onClickResetButton}>
					<span className="mainView__queryResetButtonText">↶</span>
				</div>
			</div>

			<div className={c(
				'mainView__mainLayoutBottom',
				'mainView__throbberPositioner',
				'mainView__mathResultPositioner',
				'mainView__roundUpResultPositioner',
				'mainView__viewNavContainerPositionRoot',
				'mainView__shadowboxPositionroot',
			)}>

				<div className="mainView__queryResultListViewContainer">
					{splitQueries.map((q, i) => (
						<MainViewQueryResults key={i} query={q}
							className={c('mainView__queryResultListView', {
								'active': i === activeQueryIndex,
								'hideToLeft': i < activeQueryIndex,
								'hideToRight': i > activeQueryIndex,
							})}
							onPickShadowBoxElem={onPickShadowBoxElem}
							onResetQueryDelegate={onResetQueryDelegate} />
					))}
				</div>

				<div className={c('mainView__roundUpResult', { 'active': showRoundUpResult })}>
					<div className="mainView__roundUpText">Round up:</div>
					<span>{roundUpResult}</span>
					<span className="mainView__roundUpCentSign">¢</span>
				</div>

				<div className={c('mainView__mathResult', { 'active': showMathResult })}>
					<span className="mainView__mathResultEqualSign">=</span>{mathResult}
				</div>

				<div className={c('mainView__throbberBackdrop', { 'active': showThrobber })}>
					<div className="mainView__throbber" />
				</div>

				<div className="mainView__viewNavContainer">
					<div className="mainView__viewNavButtonLeftContainer">
						<div className={c('mainView__viewNavButtonLeft', { 'active': activeQueryIndex > 0 })} onClick={setActiveQueryLeft}>
							<span>‹</span>
						</div>
					</div>
					<div className="mainView__viewNavButtonRightContainer">
						<div className={c('mainView__viewNavButtonRight', { 'active': activeQueryIndex < splitQueries.length - 1 })} onClick={setActiveQueryRight}>
							<span>›</span>
						</div>
					</div>
				</div>

				<Shadowbox className="mainView__shadowbox" active={showShadowbox} item={shadowBoxElem} />

			</div>

		</div>
	)
}
