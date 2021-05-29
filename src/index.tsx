import * as React from 'react'
import { render } from 'react-dom'
import { App } from '../components/App'
import { Helmet } from 'react-helmet'

// @ts-expect-error
import manifest from '../resources/manifest.webmanifest'

import swruntime from 'serviceworker-webpack-plugin/lib/runtime'

import 'style-loader!../styles/global.css'
import 'style-loader!../styles/colors.css'
import 'style-loader!../styles/animation.css'
import 'style-loader!../styles/app.css'
import 'style-loader!../styles/main-view.css'
import 'style-loader!../styles/main-view-throbber.css'
import 'style-loader!../styles/main-view-math.css'
import 'style-loader!../styles/main-view-roundup.css'
import 'style-loader!../styles/shadowbox.css'
import 'style-loader!../styles/item-cards.css'
import 'style-loader!../styles/info-view.css'
import 'style-loader!../styles/prefs-view.css'
import 'style-loader!../styles/weight-calc-view.css'

const jsx = (
	<React.Fragment>
		<Helmet>
			<link rel="manifest" href={manifest} />
		</Helmet>
		<App />
	</React.Fragment>
)

const reactroot = document.querySelector('#reactroot')
const preloadroot = document.querySelector('#preloadroot')

render(jsx, reactroot, () => {
	reactroot?.classList.add('reactstarted')
	if (preloadroot)
		document.body.removeChild(preloadroot)
})

const sw = swruntime.register()

if (module['hot']) {
	module['hot'].accept()
}
