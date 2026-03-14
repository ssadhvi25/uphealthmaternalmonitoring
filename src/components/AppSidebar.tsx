import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Newspaper, Activity, Settings, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", to: "/",         icon: LayoutDashboard },
  { label: "Articles", to: "/articles", icon: Newspaper },
  { label: "Run Logs", to: "/runs",     icon: Activity },
  { label: "Settings", to: "/settings", icon: Settings },
];

const AppSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside
      className="hidden md:flex flex-col w-60 min-h-screen bg-sidebar border-r border-sidebar-border shrink-0"
      style={{ boxShadow: "var(--shadow-sidebar)" }}
    >
      {/* Logo / Brand */}
      <div className="flex items-start gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary shrink-0 mt-0.5">
          <AlertTriangle className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <div className="text-xs font-bold text-sidebar-foreground leading-tight">
            UP Maternal<br />Mortality Watch
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
            State Transformation Commission
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {navItems.map(({ label, to, icon: Icon }) => {
          const isActive =
            to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "nav-link",
                isActive && "active"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-sidebar-border">
        <div className="text-[10px] text-muted-foreground leading-relaxed">
          Scheduler: 07:00 IST daily<br />
          Archive: Mar 2026 onwards<br />
          v1.0.0-mvp
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
