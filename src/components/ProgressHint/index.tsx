import { observer } from "mobx-react-lite";
import style from "./index.module.scss";
import { Flex } from "antd";
import { gstate } from "@/global";
import { homeState } from "@/states/home";
import { formatSize } from "@/functions";
import { useResponse } from "@/media";

/** 机械计数器风格的状态栏 */
export const ProgressHint = observer(() => {
  const info = homeState.getProgressHintInfo();
  const { isMobile } = useResponse();

  const good = info.originSize > info.outputSize;

  return (
    <Flex vertical className={style.container} gap={7}>
      <Flex align="center" className={style.stats}>
        {/* 计数器 */}
        <span className={style.counter}>
          <b>{String(info.loadedNum).padStart(2, "0")}</b>/
          {String(info.totalNum).padStart(2, "0")}
        </span>
        <span className={style.sep} />
        {!isMobile && (
          <>
            <span className={style.item}>
              <label>{gstate.locale?.progress.before}</label>
              <span>{formatSize(info.originSize)}</span>
            </span>
            <span className={style.sep} />
            <span className={style.item}>
              <label>{gstate.locale?.progress.after}</label>
              <span>{formatSize(info.outputSize)}</span>
            </span>
            <span className={style.sep} />
          </>
        )}
        <span className={style.item}>
          <label>{gstate.locale?.progress.rate}</label>
          <span className={good ? style.good : style.bad}>
            {good ? "−" : "+"}
            {info.rate}%
          </span>
        </span>
      </Flex>
      {/* 仪器进度线 */}
      <div className={style.track}>
        <div
          className={style.fill}
          style={{ width: `${info.percent}%` }}
          data-done={info.percent === 100 || undefined}
        />
      </div>
    </Flex>
  );
});
