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
          borderRadius: 10,
          colorPrimary: "#f5a524",
          colorLink: "#f5a524",
          colorSuccess: "#f5a524",
          colorWarning: "#ffbe4d",
          colorError: "#ef6a5a",
          colorInfo: "#f5a524",
          colorBgBase: "#15110c",
          colorBgContainer: "#1e1811",
          colorBgElevated: "#2d2418",
          colorBgLayout: "#15110c",
          colorBorder: "rgba(242, 234, 217, 0.14)",
          colorBorderSecondary: "rgba(242, 234, 217, 0.07)",
          colorText: "#f2ead9",
          colorTextSecondary: "#a89a83",
          colorTextTertiary: "#6e6450",
          colorSplit: "rgba(242, 234, 217, 0.09)",
          fontSize: 14,
          fontFamily:
            "'PingFang SC', 'HarmonyOS Sans SC', 'Segoe UI', 'Noto Sans SC', sans-serif",
        },
        components: {
          Layout: {
            headerBg: "#1e1811",
            bodyBg: "#15110c",
            footerBg: "#1e1811",
          },
          Button: {
            primaryShadow: "0 0 18px rgba(245, 165, 36, 0.25)",
            defaultBorderColor: "rgba(242, 234, 217, 0.18)",
            defaultBg: "#2d2418",
            defaultHoverBg: "#3a2f1e",
          },
          Drawer: {
            colorBgElevated: "#1e1811",
          },
          Popover: {
            colorBgElevated: "#2d2418",
          },
          Slider: {
            trackBg: "#f5a524",
            trackHoverBg: "#ffbe4d",
            railBg: "rgba(242, 234, 217, 0.12)",
            railHoverBg: "rgba(242, 234, 217, 0.18)",
            handleColor: "#f5a524",
          },
          Tooltip: {
            colorBgSpotlight: "#2d2418",
          },
          Divider: {
            colorSplit: "rgba(242, 234, 217, 0.09)",
          },
          Select: {
            optionSelectedBg: "rgba(245, 165, 36, 0.14)",
          },
          Checkbox: {
            colorPrimary: "#f5a524",
            colorPrimaryHover: "#ffbe4d",
          },
          ColorPicker: {
            colorPrimary: "#f5a524",
          },
          Progress: {
            defaultColor: "#f5a524",
          },
          InputNumber: {
            activeBorderColor: "#f5a524",
            hoverBorderColor: "rgba(245, 165, 36, 0.5)",
          },
          Table: {
            headerBg: "#251e15",
            headerColor: "#a89a83",
            rowHoverBg: "rgba(245, 165, 36, 0.07)",
            borderColor: "rgba(242, 234, 217, 0.07)",
            headerSplitColor: "rgba(242, 234, 217, 0.07)",
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
