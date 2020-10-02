import * as React from 'react'
import * as QRCode from 'qrcode'
import jsbarcode from 'jsbarcode'

const PLU_REGEX = /^\d{4,5}$/
const UPC_REGEX = /^\d{11,12}$/

export function Barcode(props: {
	className?: string
	value: string
	onClickBarcode?: VoidFunction
}) {
	const canvasElemRef = React.createRef<HTMLCanvasElement>()

	const jsBarcodeOpts = {
		lineColor: 'black',
		background: 'transparent',
		width: 2,
		height: 80,
		displayValue: false,
		margin: 0,
		flat: true,
	}

	React.useEffect(() => {
		if (canvasElemRef.current)
			renderBarcode(canvasElemRef.current, props.value, jsBarcodeOpts)
	})

	return React.createElement('canvas', {
		className: props.className,
		ref: canvasElemRef,
		onClick: props.onClickBarcode,
		key: props.value,
	})
}

function renderBarcode(elem: HTMLElement, value: string, jsBarcodeOpts = {}) {
	if (value.match(PLU_REGEX)) {
		QRCode.toCanvas(elem, value, err => {
			if (err) console.error(err)
		})
		return
	}

	let barcodeFormat: string
	let renderValue: string
	if (value.match(UPC_REGEX)) {
		barcodeFormat = 'upc'
		renderValue = value.padStart(11, '0')
	} else {
		barcodeFormat = 'CODE128'
		renderValue = value
	}

	try {
		const barcodeOpts = Object.assign({}, jsBarcodeOpts, { format: barcodeFormat })
		jsbarcode(elem, renderValue, barcodeOpts)
	} catch (error) {
		console.error(error)
	}
}
