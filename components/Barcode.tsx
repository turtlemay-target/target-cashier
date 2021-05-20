import * as React from 'react'
import * as QRCode from 'qrcode'
import jsbarcode from 'jsbarcode'

const PLU_REGEX = /^\d{4,5}$/
const UPC_REGEX = /^\d{11,12}$/
const SKU_REGEX = /^\d{14}$/

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
		// Don't use QR format because Giant Eagle does not support it for PLUs.
		if (false) {
			QRCode.toCanvas(elem, value, err => {
				if (err) console.error(err)
			})
			return
		}

		// Use UPC format for PLU codes.
		try {
			const barcodeOpts = Object.assign({}, jsBarcodeOpts, { format: 'upc' })
			jsbarcode(elem, value.padStart(11, '0'), barcodeOpts)
			return
		} catch (err) {
			console.error(err)
		}
	}

	if (value.match(UPC_REGEX)) {
		try {
			const barcodeOpts = Object.assign({}, jsBarcodeOpts, { format: 'upc' })
			jsbarcode(elem, value.padStart(11, '0'), barcodeOpts)
			return
		} catch (err) {
			console.error(err)
		}
	}

	// Take UPC from SKU format.
	if (value.match(SKU_REGEX)) {
		const upc = value.substring(2)
		try {
			const barcodeOpts = Object.assign({}, jsBarcodeOpts, { format: 'upc' })
			jsbarcode(elem, upc, barcodeOpts)
			return
		} catch (err) {
			console.error(err)
		}
	}

	const barcodeOpts = Object.assign({}, jsBarcodeOpts, { format: 'CODE128' })
	jsbarcode(elem, value, barcodeOpts)
}
