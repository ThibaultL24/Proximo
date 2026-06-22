// src/components/admin/admin-panel-card.tsx
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Card } from "../ui/card";

interface AdminPanelCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  action?: { label: string; to: string };
  actions?: { label: string; to: string }[];
}

export function AdminPanelCard({ title, icon, children, action, actions }: AdminPanelCardProps) {
  const links = actions || (action ? [action] : []);

  return (
    <Card className="flex h-full flex-col p-0">
      <div className="flex items-center gap-3 border-b border-sand-dark/40 px-6 py-4">
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-petrol/8 text-petrol">
            {icon}
          </div>
        )}
        <h2 className="font-serif text-lg font-semibold text-petrol">{title}</h2>
      </div>
      <div className="flex-1 px-6 py-5">{children}</div>
      {links.length > 0 && (
        <div className="flex flex-wrap gap-4 border-t border-sand-dark/40 px-6 py-4">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="text-sm font-medium text-brass hover:text-petrol">
              {link.label} →
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
