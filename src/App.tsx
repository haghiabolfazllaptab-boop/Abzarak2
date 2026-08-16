import { useEffect, useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Layout, { type ViewKey } from "./components/Layout";
import Home from "./components/Home";
import Favorites from "./components/Favorites";
import SettingsPage from "./components/Settings";
import ToolShell from "./components/ToolShell";
import { getToolById } from "./lib/toolsData";
import { CalculatorTool, DiscountTool, BmiTool, PercentageTool, InstallmentTool, AverageTool } from "./tools/CalcTools";
import { AgeTool, DateDiffTool, TimerTool, StopwatchTool } from "./tools/DateTools";
import { UnitConverterTool } from "./tools/ConvertTools";
import { ColorTool, TextCounterTool, DownloadTimeTool, PasswordGeneratorTool } from "./tools/MiscTools";

const toolComponents: Record<string, React.ComponentType> = {
  calculator: CalculatorTool,
  discount: DiscountTool,
  age: AgeTool,
  dateDiff: DateDiffTool,
  unitConverter: UnitConverterTool,
  bmi: BmiTool,
  percentage: PercentageTool,
  installment: InstallmentTool,
  average: AverageTool,
  colorTool: ColorTool,
  textCounter: TextCounterTool,
  timer: TimerTool,
  stopwatch: StopwatchTool,
  downloadTime: DownloadTimeTool,
  passwordGenerator: PasswordGeneratorTool,
};

function AppContent() {
  const [view, setView] = useState<ViewKey>("home");
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const { addRecentTool } = useApp();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch(() => {});
      });
    }
  }, []);

  const openTool = (id: string) => {
    setActiveTool(id);
    addRecentTool(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeTool = () => {
    setActiveTool(null);
  };

  const navigate = (v: ViewKey) => {
    setActiveTool(null);
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (activeTool) {
    const meta = getToolById(activeTool);
    const Component = toolComponents[activeTool];
    if (!meta || !Component) {
      return (
        <Layout view={view} onNavigate={navigate}>
          <div className="empty-state">
            <p>ابزاری پیدا نشد.</p>
          </div>
        </Layout>
      );
    }
    return (
      <Layout view={view} onNavigate={navigate}>
        <ToolShell tool={meta} onBack={closeTool}>
          <Component />
        </ToolShell>
      </Layout>
    );
  }

  return (
    <Layout view={view} onNavigate={navigate}>
      {view === "home" && <Home onOpenTool={openTool} />}
      {view === "favorites" && <Favorites onOpenTool={openTool} />}
      {view === "settings" && <SettingsPage />}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
