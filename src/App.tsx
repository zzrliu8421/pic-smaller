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
          borderRadius: 2,
          colorPrimary: "#ff4400",
          colorLink: "#141414",
          colorSuccess: "#ff4400",
          colorWarning: "#e08700",
          colorError: "#0d5bd8",
          colorInfo: "#141414",
          colorBgBase: "#f2f0ea",
          colorBgContainer: "#faf9f5",
          colorBgElevated: "#ffffff",
          colorBgLayout: "#f2f0ea",
          colorBorder: "#c9c5ba",
          colorBorderSecondary: "#dcd9d0",
          colorText: "#141414",
          colorTextSecondary: "#6b6b64",
          colorTextTertiary: "#a3a099",
          colorSplit: "#dcd9d0",
          fontSize: 14,
          fontFamily:
            "-apple-system, 'Helvetica Neue', 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
        },
        components: {
          Layout: {
            headerBg: "#f2f0ea",
            bodyBg: "#f2f0ea",
            footerBg: "#f2f0ea",
          },
          Button: {
            primaryShadow: "none",
            defaultShadow: "none",
            defaultBorderColor: "#141414",
            defaultBg: "#faf9f5",
            defaultHoverBg: "#141414",
            defaultHoverColor: "#ffffff",
            defaultHoverBorderColor: "#141414",
            fontWeight: 600,
          },
          Drawer: {
            colorBgElevated: "#faf9f5",
          },
          Popover: {
            colorBgElevated: "#ffffff",
          },
          Slider: {
            trackBg: "#ff4400",
            trackHoverBg: "#e03a00",
            railBg: "#dcd9d0",
            railHoverBg: "#c9c5ba",
            handleColor: "#141414",
            handleActiveColor: "#ff4400",
          },
          Tooltip: {
            colorBgSpotlight: "#141414",
          },
          Divider: {
            colorSplit: "#dcd9d0",
          },
          Select: {
            optionSelectedBg: "#fff4ef",
          },
          Checkbox: {
            colorPrimary: "#ff4400",
            colorPrimaryHover: "#e03a00",
          },
          ColorPicker: {
            colorPrimary: "#ff4400",
          },
          InputNumber: {
            activeBorderColor: "#141414",
            hoverBorderColor: "#6b6b64",
          },
          Progress: {
            defaultColor: "#ff4400",
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
