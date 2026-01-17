import { Navigate, Route, Routes } from "react-router-dom";
import { useLocalSettings } from "./components/core/LocalSettingsProvider";

import { AppShell } from "./components/core/AppShell";
import { EntryPage } from "./pages/EntryPage";
import { AggregatePage } from "./pages/AggregatePage";
import { SettingsPage } from "./pages/SettingsPage";
import { OnboardingPage } from "./pages/OnboardingPage";

export default function App() {
	const { settings } = useLocalSettings();

	if (!settings.user.fullName.trim()) {
		return <OnboardingPage />;
	}

	return (
		<Routes>
			<Route element={<AppShell />}>
				<Route index element={<Navigate to="/entry" replace />} />
				<Route path="/entry" element={<EntryPage />} />
				<Route path="/aggregate" element={<AggregatePage />} />
				<Route path="/settings" element={<SettingsPage />} />
				<Route path="*" element={<Navigate to="/entry" replace />} />
			</Route>
		</Routes>
	);
}
