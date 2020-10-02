import * as React from 'react'
import { Barcode } from './Barcode'
import { AppStateContext } from './AppStateProvider'

export function StoreItemCard(props: {
	data: IItemData
	onPick?: (jsx: JSX.Element) => void
}) {
	const context = React.useContext(AppStateContext)
	const jsx = (
		<div className="itemCards__storeItemCard" data-name={props.data.name} data-color={props.data.uiColor}>
			<div className="itemCards__storeItemName">{props.data.name}</div>
			<Barcode className="itemCards__storeItemBarcode"
				value={`${props.data.value}`}
				onClickBarcode={() => props.onPick?.(jsx)} />
			<div className="itemCards__storeItemId">{props.data.value}</div>
		</div>
	)
	return jsx
}

export function GeneratedItemCard(props: {
	value: string
	onPick?: (jsx: JSX.Element) => void
}) {
	const jsx = (
		<div className="itemCards__generatedBarcodeCard">
			<Barcode className="itemCards__generatedBarcode"
				value={props.value}
				onClickBarcode={() => props.onPick?.(jsx)} />
			<div className="itemCards__generatedBarcodeText">⇪ User Entered Code ⇪</div>
		</div>
	)
	return jsx
}
