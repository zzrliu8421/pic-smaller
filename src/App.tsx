import { ConfigProvider, App as AntApp, theme } from "antd";
import { observer } from "mobx-react-lite";
import { gstate } from "./global";
import { ContextAction } from "./ContextAction";
import { Analytics } from "@vercel/analytics/react";
import { Loading } from "./components/Loading";
import { useResponse } from "./media";
import { useEffect } from "react";

function useMobileVConsole() {
  const { isMobile } = useResponse();
  useEffect(() => {
    if (!isMobile || !import.meta.env.DEV) return;
    let vConsole: any = null;
    import("vconsole").then((result) => {
      vConsole = new result.default({ theme: "dark" });
    });
    return () => vConsole?.destroy();
  }, [isMobile]);
}

export const App = observer(() => {
  useMobileVConsole();

  return (
    <ConfigProvider
      locale={gstate.locale?.antLocale}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          borderRadius: 8,
          colorPrimary: "#10b981",
          colorLink: "#10b981",
          colorSuccess: "#10b981",
          colorBgBase: "#0a0a0b",
          colorBgContainer: "#18181b",
          colorBgElevated: "#1f1f23",
          colorBgLayout: "#0a0a0b",
          colorBorder: "rgba(255, 255, 255, 0.1)",
          colorBorderSecondary: "rgba(255, 255, 255, 0.06)",
          colorText: "#fafafa",
          colorTextSecondary: "#a1a1aa",
          colorSplit: "rgba(255, 255, 255, 0.08)",
          fontSize: 14,
        },
        components: {
          Layout: {
            headerBg: "#18181b",
            bodyBg: "#0a0a0b",
            footerBg: "#18181b",
          },
          Table: {
            headerBg: "#1f1f23",
            headerColor: "#a1a1aa",
            rowHoverBg: "rgba(16, 185, 129, 0.08)",
            borderColor: "rgba(255, 255, 255, 0.06)",
            headerSplitColor: "rgba(255, 255, 255, 0.06)",
          },
          Button: {
            primaryShadow: "none",
            defaultBorderColor: "rgba(255, 255, 255, 0.15)",
            defaultBg: "#27272a",
          },
          Drawer: {
            colorBgElevated: "#18181b",
          },
          Popover: {
            colorBgElevated: "#1f1f23",
          },
          Slider: {
            trackBg: "#10b981",
            railBg: "rgba(255, 255, 255, 0.1)",
            handleColor: "#10b981",
          },
          Tooltip: {
            colorBgSpotlight: "#27272a",
          },
          Divider: {
            colorSplit: "rgba(255, 255, 255, 0.08)",
          },
        },
      }}
    >
      <AntApp>
        <ContextAction />
      </AntApp>
      {import.meta.env.MODE === "production" && <Analytics />}
      {gstate.page}
      {gstate.loading && <Loading />}
    </ConfigProvider>
  );
});
