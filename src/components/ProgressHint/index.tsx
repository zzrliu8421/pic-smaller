import { observer } from "mobx-react-lite";
import style from "./index.module.scss";
import { Flex, Typography } from "antd";
import { gstate } from "@/global";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { homeState } from "@/states/home";
import { formatSize } from "@/functions";
import { useResponse } from "@/media";

export const ProgressHint = observer(() => {
  const info = homeState.getProgressHintInfo();
  const { isMobile } = useResponse();

  let rate: React.ReactNode = null;
  if (info.originSize > info.outputSize) {
    rate = (
      <Typography.Text className={style.rateGood} strong>
        {info.rate}%
        <ArrowDownOutlined />
      </Typography.Text>
    );
  } else {
    rate = (
      <Typography.Text className={style.rateBad} strong>
        {info.rate}%
        <ArrowUpOutlined />
      </Typography.Text>
    );
  }

  return (
    <Flex vertical className={style.container}>
      <Flex align="center" className={style.stats}>
        {/* 显影进度计数器 */}
        <span className={style.counter}>
          <Typography.Text strong className={style.loaded}>
            {info.loadedNum}
          </Typography.Text>
          <Typography.Text type="secondary">
            &nbsp;/&nbsp;{info.totalNum}
          </Typography.Text>
        </span>
        <span className={style.dot} />
        {!isMobile && (
          <>
            <span className={style.item}>
              <label>{gstate.locale?.progress.before}</label>
              <Typography.Text>{formatSize(info.originSize)}</Typography.Text>
            </span>
            <span className={style.dot} />
            <span className={style.item}>
              <label>{gstate.locale?.progress.after}</label>
              <Typography.Text>{formatSize(info.outputSize)}</Typography.Text>
            </span>
            <span className={style.dot} />
          </>
        )}
        <span className={style.item}>
          <label>{gstate.locale?.progress.rate}</label>
          {rate}
        </span>
      </Flex>
      {/* 显影条：琥珀渐变进度 */}
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
