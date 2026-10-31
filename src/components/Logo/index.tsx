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
      {/* 朱文印章「缩」 */}
      <span className={style.seal}>缩</span>
      <span className={style.text}>
        <Typography.Text className={style.title}>{title}</Typography.Text>
        <span className={style.sub}>PIC · SMALLER</span>
      </span>
    </div>
  );
});
