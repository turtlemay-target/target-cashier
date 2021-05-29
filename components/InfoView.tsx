import * as React from 'react'
import packageJson from '../package.json'
import { Link } from 'react-router-dom'

export const InfoView = () => (
	<div className="infoView__root">
		<div className="infoView__mainContainer">
			<section>
				<p>This app assists cashiers in scanning produce, looking up item codes, and performing calculations.</p>
				<h2>✨ Features</h2>
				<ul>
					<li>Enter search text into the query box to display a list of items found in the database.</li>
					<li>Enter a UPC or PLU code to generate a data bar.</li>
					<li>Multiple queries can be chained with semicolon (default <Link to="/prefs">user setting</Link>).</li>
					<li>Mathematical expressions entered in the query box will be automatically evaluated.</li>
					<li>Enter a two digit number to calculate round-up amount.</li>
				</ul>
			</section>
			<section>
				<h2>📅 Recent Changes</h2>
				<ul>
					<li>Now supporting multiple organizations. Set your database in settings.</li>
					<li>Initial build (May 2021).</li>
				</ul>
			</section>
			<section>
				<h2>🧰 Other Tools</h2>
				<ul>
					<li><Link to="/wcalc">Weight Calculator</Link></li>
				</ul>
			</section>
			<section>
				<p>Software version <strong>{packageJson.version}</strong>. See source code <a href="https://github.com/turtlemay/turtlemay-cashier">here</a>.</p>
				<p>We use the latest browser APIs so ensure your OS, browser and/or WebView is up to date. An Android device with peripheral keyboard is recommended.</p>
				<p>Created and maintained by <a target="_blank" href="http://turtlemay.us">Turtlemay</a>.</p>
			</section>
		</div>
	</div>
)
