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
      vConsole = new result.default({ theme: "light" });
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
        algorithm: theme.defaultAlgorithm,
        token: {
          borderRadius: 3,
          colorPrimary: "#bf3a2b",
          colorLink: "#1c1b18",
          colorSuccess: "#bf3a2b",
          colorWarning: "#a56a1f",
          colorError: "#4a6b8a",
          colorInfo: "#1c1b18",
          colorBgBase: "#f5f3ee",
          colorBgContainer: "#fbfaf7",
          colorBgElevated: "#ffffff",
          colorBgLayout: "#f5f3ee",
          colorBorder: "#d5d1c6",
          colorBorderSecondary: "#e3e0d8",
          colorText: "#1c1b18",
          colorTextSecondary: "#6f6c64",
          colorTextTertiary: "#a8a49a",
          colorSplit: "#e3e0d8",
          fontSize: 14,
          fontFamily:
            "-apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Segoe UI', sans-serif",
        },
        components: {
          Layout: {
            headerBg: "#f5f3ee",
            bodyBg: "#f5f3ee",
            footerBg: "#f5f3ee",
          },
          Button: {
            primaryShadow: "none",
            defaultShadow: "none",
            defaultBorderColor: "#1c1b18",
            defaultBg: "#fbfaf7",
            defaultHoverBg: "#1c1b18",
            defaultHoverColor: "#fbfaf7",
            defaultHoverBorderColor: "#1c1b18",
            fontWeight: 500,
          },
          Drawer: {
            colorBgElevated: "#fbfaf7",
          },
          Popover: {
            colorBgElevated: "#ffffff",
          },
          Slider: {
            trackBg: "#1c1b18",
            trackHoverBg: "#bf3a2b",
            railBg: "#e3e0d8",
            railHoverBg: "#d5d1c6",
            handleColor: "#1c1b18",
            handleActiveColor: "#bf3a2b",
          },
          Tooltip: {
            colorBgSpotlight: "#1c1b18",
          },
          Divider: {
            colorSplit: "#e3e0d8",
          },
          Select: {
            optionSelectedBg: "#f0ede6",
          },
          Checkbox: {
            colorPrimary: "#1c1b18",
            colorPrimaryHover: "#bf3a2b",
          },
          ColorPicker: {
            colorPrimary: "#bf3a2b",
          },
          InputNumber: {
            activeBorderColor: "#1c1b18",
            hoverBorderColor: "#a8a49a",
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
