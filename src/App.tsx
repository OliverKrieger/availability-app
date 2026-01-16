import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "./components/core/AppShell";
import { EntryPage } from "./pages/EntryPage";
import { AggregatePage } from "./pages/AggregatePage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
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
