import * as React from 'react'

export function ConditionalRenderer(props: React.PropsWithChildren<{
	condition: boolean
}>) {
	return (
		<React.Fragment>
			{props.condition ? props.children : null}
		</React.Fragment>
	)
}