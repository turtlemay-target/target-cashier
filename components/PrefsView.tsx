import * as React from 'react'
import * as lodash from 'lodash'
import c from 'classnames'
import { AppStateContext } from './AppStateProvider'
import { PrefsOption } from './PrefsOptions'
import { DelayedTextInput } from './DelayedTextInput'

export function PrefsView() {
	const context = React.useContext(AppStateContext)
	const [showThrobber, setThrobber] = React.useState(false)
	const [itemsPerPage, setItemsPerPage] = React.useState(String(context.itemsPerPage))

	return (
		<div className="prefsView__root">

			<div className={c('prefsView__throbber', { 'active': showThrobber })} />

			<div className="prefsView__optionsList">

				<section>
					<PrefsOption>{{
						label: "🔗 Database URL", description: "Must match our JSON schema and serve over HTTPS. Defaults to Turtlemay's store database.",
						controlNode: <DelayedTextInput
							className="prefsView__optionTextInput"
							initialValue={context.dbUrl}
							commitDelay={500}
							onCommit={v => context.provider.setState({ dbUrl: v })}
							onStartInput={() => setThrobber(true)}
							onStopInput={() => setThrobber(false)}
							passProps={{ onClick: e => e?.target?.select?.() }} />,
						stateInfo: Function.call.call(() => {
							if (context.dbInfo)
								return `Loaded remote database "${context.dbInfo.name}" ${context.dbInfo.version}.`
							return "No database found."
						}),
					}}</PrefsOption>
				</section>

				<section>
					<PrefsOption>{{
						label: "➕ Additional items", description: <>
							<p>Append temporary items to your device-local database, one entry per line using the following format:<br />
								{"{item name}: {item code}"}</p>
							<p>Contact your database maintainer to report changes.</p>
						</>,
						controlNode: <DelayedTextInput textarea
							className="prefsView__optionTextInput"
							initialValue={context.userItems}
							placeholder={"Example item: 1234\nExample item: 5678"}
							onStartInput={() => setThrobber(true)}
							onStopInput={() => setThrobber(false)}
							onCommit={v => context.provider.setState({ userItems: v })}
							commitDelay={300} />,
					}}</PrefsOption>
				</section>

				<section>
					<PrefsOption>{{
						label: "#️⃣ Items per page", description: "Number of query results to load at a time.",
						controlNode: <input type="number"
							className="prefsView__optionTextInput"
							value={itemsPerPage}
							onClick={e => { (e.target as HTMLInputElement).select() }}
							onChange={e => {
								setItemsPerPage(e.target.value)
								const n = lodash.clamp(Number(e.target.value), 1, 20)
								context.provider.setState({ itemsPerPage: n })
							}} />,
					}}</PrefsOption>
				</section>

				<section>
					<PrefsOption>{{
						label: "Default query",
						controlNode: <input type="text"
							className="prefsView__optionTextInput"
							value={context.defaultQuery}
							onChange={e => context.provider.setState({ defaultQuery: e.target.value })} />,
					}}</PrefsOption>
				</section>

				<section>
					<div className="prefsView__optionsListSectionInfo">
						<h2>Key Bindings</h2>
						<p>JavaScript event key names or keycodes. (No modifiers.)</p>
					</div>

					<PrefsOption>{{
						label: "Reset query key",
						controlNode: <input type="text"
							className="prefsView__optionTextInput"
							value={context.resetQueryKey}
							onChange={e => context.provider.setState({ resetQueryKey: e.target.value })} />,
					}}</PrefsOption>

					<PrefsOption>{{
						label: "Nav left key",
						controlNode: <input type="text"
							className="prefsView__optionTextInput"
							value={context.appNavViewLeftKey}
							onChange={e => context.provider.setState({ appNavViewLeftKey: e.target.value })} />,
					}}</PrefsOption>

					<PrefsOption>{{
						label: "Nav right key",
						controlNode: <input type="text"
							className="prefsView__optionTextInput"
							value={context.appNavViewRightKey}
							onChange={e => context.provider.setState({ appNavViewRightKey: e.target.value })} />,
					}}</PrefsOption>
				</section>

				<section>
					<div className="prefsView__optionsListSectionInfo">
						<h2>Experimental</h2>
					</div>

					<PrefsOption>{{
						label: "🔎 Tokenize search", description: "Use alternate search algorithm which compares individual terms instead of the full string.",
						controlNode: <input
							className="prefsView__optionCheckbox"
							type="checkbox"
							checked={context.tokenizeSearch}
							onChange={e => context.provider.setState({ tokenizeSearch: e.target.checked })} />,
					}}</PrefsOption>
				</section>

			</div>

			<div className="prefsView__resetButtonContainer">
				<input type="button" className="prefsView__resetButton" value="Reset all"
					onClick={() => {
						setItemsPerPage(String(context.defaultPrefs.itemsPerPage))
						context.provider.resetAll()
					}}
				/>
			</div>

		</div>
	)
}
