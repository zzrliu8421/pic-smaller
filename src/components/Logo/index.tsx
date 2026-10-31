import { Typography } from "antd";
import style from "./index.module.scss";
import { observer } from "mobx-react-lite";

interface LogoProps {
  iconSize?: number;
  title?: string;
}

export const Logo = observer(({ title = "Pic Smaller" }: LogoProps) => {
  return (
    <div className={style.container}>
      <svg className={style.mark} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9.2" />
        <g className={style.blades}>
          <line x1="14.31" y1="8" x2="20.05" y2="17.94" />
          <line x1="9.69" y1="8" x2="21.17" y2="8" />
          <line x1="7.38" y1="12" x2="13.12" y2="2.06" />
          <line x1="9.69" y1="16" x2="3.95" y2="6.06" />
          <line x1="14.31" y1="16" x2="2.83" y2="16" />
          <line x1="16.62" y1="12" x2="10.88" y2="21.94" />
        </g>
      </svg>
      <Typography.Text className={style.title}>{title}</Typography.Text>
    </div>
  );
});
