import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from './App.tsx'
import { LocalSettingsProvider } from "./components/core/LocalSettingsProvider.tsx";

import './assets/css/index.css'

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<LocalSettingsProvider>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</LocalSettingsProvider>
	</React.StrictMode>
);