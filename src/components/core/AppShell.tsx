import { NavLink, Outlet } from "react-router-dom";
import { AlertStack } from "../ui/AlertStack";
import { ConfirmModal } from "../ui/ConfirmModal";

type NavItem = {
    to: string;
    label: string;
    description?: string;
};

const NAV: NavItem[] = [
    { to: "/entry", label: "My Availability", description: "Mark your free times" },
    { to: "/aggregate", label: "Aggregate", description: "Import & compare people" },
    { to: "/settings", label: "Settings", description: "Defaults & preferences" },
];

function classNames(...xs: Array<string | false | null | undefined>) {
    return xs.filter(Boolean).join(" ");
}

export function AppShell() {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            <div className="mx-auto flex min-h-screen max-w-480">
                {/* Sidebar */}
                <aside className="w-72 border-r border-zinc-800 bg-zinc-950 px-4 py-6">
                    <div className="mb-6">
                        <div className="text-lg font-semibold tracking-tight">Availability</div>
                        <div className="text-sm text-zinc-400">Local-first planner</div>
                    </div>

                    <nav className="space-y-2">
                        {NAV.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    classNames(
                                        "block rounded-xl border px-3 py-3 transition",
                                        isActive
                                            ? "border-zinc-700 bg-zinc-900"
                                            : "border-transparent hover:border-zinc-800 hover:bg-zinc-900/60"
                                    )
                                }
                                end
                            >
                                <div className="text-sm font-medium">{item.label}</div>
                                {item.description ? (
                                    <div className="mt-1 text-xs text-zinc-400">{item.description}</div>
                                ) : null}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/30 p-3 text-xs text-zinc-400">
                        Tip: default is <span className="text-zinc-200">Busy</span>. Mark exceptions as{" "}
                        <span className="text-zinc-200">Free</span>.
                    </div>
                </aside>

                {/* Main */}
                <main className="flex-1 px-6 py-6">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-sm">
                        <AlertStack />
                        <Outlet />
                    </div>
                </main>
                <ConfirmModal />
            </div>
        </div>
    );
}
