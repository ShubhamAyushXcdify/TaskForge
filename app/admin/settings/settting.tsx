"use client";

import { useState } from "react";

import CategoriesSection from "./categoriesSection";
import ProvidersSection from "./providersSection";
import EmailTemplatesSection from "./email";

type Tab = "categories" | "providers" | "emailTemplates";

const TABS = [
  { key: "categories", label: "Categories", icon: "⊞" },
  { key: "providers", label: "Providers", icon: "🏢" },
  { key: "emailTemplates", label: "Email Templates", icon: "✉" },
];

export default function Settings() {
  const [activeTab, setActiveTab] =
    useState<Tab>("categories");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1 bg-slate-800/50 rounded-2xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as Tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === tab.key
                ? "bg-slate-900 text-white shadow"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "categories" && <CategoriesSection />}
      {activeTab === "providers" && <ProvidersSection />}
      {activeTab === "emailTemplates" && <EmailTemplatesSection />}
    </div>
  );
}