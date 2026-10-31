import { Button, Dropdown, Flex, Space, Tooltip, Typography } from "antd";
import style from "./LeftContent.module.scss";
import { observer } from "mobx-react-lite";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  ClearOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  FolderAddOutlined,
  PlusOutlined,
  ReloadOutlined,
  SortAscendingOutlined,
} from "@ant-design/icons";
import { useRef, useState } from "react";
import { ImageInput } from "@/components/ImageInput";
import { gstate } from "@/global";
import { ImageItem, homeState } from "@/states/home";
import {
  createDownload,
  formatSize,
  getFilesFromHandle,
  getOutputFileName,
  getUniqNameOnNames,
} from "@/functions";
import { ProgressHint } from "@/components/ProgressHint";
import { createImageList } from "@/engines/transform";
import { useResponse } from "@/media";
import classNames from "classnames";

type SortKey = "default" | "name" | "size" | "rate";

export const LeftContent = observer(() => {
  const { isMobile } = useResponse();
  const disabled = homeState.hasTaskRunning();
  const fileRef = useRef<HTMLInputElement>(null);
  const [sortKey, setSortKey] = useState<SortKey>("default");

  // 直接在渲染期排序：observer 会追踪列表与压缩结果的变更
  const items = (() => {
    const list = Array.from(homeState.list.values());
    const rate = (row: ImageItem) => {
      if (!row.compress) return 0;
      return (row.blob.size - row.compress.blob.size) / row.blob.size;
    };
    switch (sortKey) {
      case "name":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "size":
        return list.sort((a, b) => b.blob.size - a.blob.size);
      case "rate":
        return list.sort((a, b) => rate(b) - rate(a));
      default:
        return list.sort((a, b) => a.key - b.key);
    }
  })();

  const sortMenu = {
    items: [
      { key: "default", label: gstate.locale?.sort?.default },
      { key: "name", label: gstate.locale?.sort?.name },
      { key: "size", label: gstate.locale?.sort?.size },
      { key: "rate", label: gstate.locale?.sort?.rate },
    ],
    selectedKeys: [sortKey],
    onClick({ key }: { key: string }) {
      setSortKey(key as SortKey);
    },
  };

  return (
    <Flex align="stretch" vertical className={style.content}>
      <Flex align="center" justify="space-between" className={style.menu}>
        <Space size={8}>
          <Button
            disabled={disabled}
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => {
              fileRef.current?.click();
            }}
          >
            {!isMobile && gstate.locale?.listAction.batchAppend}
          </Button>
          {window.showDirectoryPicker && (
            <Button
              disabled={disabled}
              icon={<FolderAddOutlined />}
              onClick={async () => {
                const handle = await window.showDirectoryPicker!();
                const result = await getFilesFromHandle(handle);
                await createImageList(result);
              }}
            >
              {!isMobile && gstate.locale?.listAction.addFolder}
            </Button>
          )}
          {!isMobile && (
            <Dropdown menu={sortMenu}>
              <Button disabled={disabled} icon={<SortAscendingOutlined />}>
                {gstate.locale?.sort?.placeholder}
              </Button>
            </Dropdown>
          )}
        </Space>
        <Space size={8}>
          <Button
            disabled={disabled}
            icon={<ClearOutlined />}
            danger
            onClick={() => {
              homeState.clear();
            }}
          >
            {!isMobile && gstate.locale?.listAction.clear}
          </Button>
          <Button
            disabled={disabled}
            icon={<ReloadOutlined />}
            onClick={async () => {
              homeState.reCompress();
            }}
          >
            {gstate.locale?.listAction.reCompress}
          </Button>
          <Button
            icon={<DownloadOutlined />}
            type="primary"
            disabled={disabled}
            onClick={async () => {
              gstate.loading = true;
              const jszip = await import("jszip");
              const zip = new jszip.default();
              const names: Set<string> = new Set();
              /* eslint-disable @typescript-eslint/no-unused-vars */
              for (const [_, info] of homeState.list) {
                const fileName = getOutputFileName(info, homeState.option);
                const uniqName = getUniqNameOnNames(names, fileName);
                names.add(uniqName);
                if (info.compress?.blob) {
                  zip.file(uniqName, info.compress.blob);
                }
              }
              const result = await zip.generateAsync({
                type: "blob",
                compression: "DEFLATE",
                compressionOptions: {
                  level: 6,
                },
              });
              createDownload("picsmaller.zip", result);
              gstate.loading = false;
            }}
          >
            {!isMobile && gstate.locale?.listAction.downloadAll}
          </Button>
        </Space>
        <ImageInput ref={fileRef} />
      </Flex>

      <div className={style.scrollBox}>
        <div className={style.cards}>
          {items.map((row) => (
            <FilmCard
              key={row.key}
              row={row}
              disabled={disabled}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>

      <Flex align="center" className={style.footer}>
        <ProgressHint />
      </Flex>
    </Flex>
  );
});

function FilmCard({
  row,
  disabled,
  isMobile,
}: {
  row: ImageItem;
  disabled: boolean;
  isMobile: boolean;
}) {
  const compressing = !row.compress || !row.preview;
  const done = !compressing && !!row.compress;

  const lower = row.compress ? row.blob.size > row.compress.blob.size : false;
  const rate =
    row.compress && row.blob.size > 0
      ? ((row.compress.blob.size - row.blob.size) / row.blob.size) * 100
      : 0;
  const rateText = Math.abs(rate).toFixed(1) + "%";

  const onCompare = () => {
    if (homeState.isCropMode()) return;
    if (row.compress) {
      homeState.compareId = row.key;
    }
  };

  return (
    <div
      className={classNames(
        style.card,
        compressing && style.compressing,
        done && lower && style.better,
      )}
    >
      {/* 胶片齿孔边 */}
      <div className={style.sprockets} />

      {/* 缩略图：棋盘格底 + 显影扫描线 */}
      <div
        className={classNames(style.thumb, "dk-checker")}
        onClick={done && row.compress ? onCompare : undefined}
        style={{ cursor: done && row.compress ? "zoom-in" : "default" }}
      >
        {row.preview && <img src={row.preview.src} draggable={false} />}
        {compressing && <div className={style.scanline} />}
        {done && !homeState.isCropMode() && (
          <div className={style.compareHint}>
            <EyeOutlined />
          </div>
        )}
      </div>

      {/* 信息区 */}
      <div className={style.info}>
        <Typography.Text className={style.name} title={row.name}>
          {row.name}
        </Typography.Text>
        <div className={style.meta}>
          <span className={style.metaItem}>
            {row.width && row.height ? `${row.width}×${row.height}` : "-"}
          </span>
          {row.compress?.width && row.compress?.height && !isMobile && (
            <>
              <span className={style.metaArrow}>→</span>
              <span className={style.metaItem}>
                {row.compress.width}×{row.compress.height}
              </span>
            </>
          )}
          <span className={style.metaDivider} />
          <span className={style.metaItem}>{formatSize(row.blob.size)}</span>
          {row.compress && !isMobile && (
            <>
              <span className={style.metaArrow}>→</span>
              <span
                className={classNames(
                  style.metaSize,
                  lower ? style.good : style.bad,
                )}
              >
                {formatSize(row.compress.blob.size)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* 压缩率徽章 */}
      {row.compress && (
        <Tooltip title={lower ? undefined : gstate.locale?.optionPannel.failTip}>
          <div
            className={classNames(
              style.badge,
              lower ? style.badgeGood : style.badgeBad,
            )}
          >
            {lower ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
            <span>{rateText}</span>
          </div>
        </Tooltip>
      )}

      {/* 操作区 */}
      <Space size={2} className={style.actions}>
        {row.compress && !homeState.isCropMode() && (
          <Tooltip title={gstate.locale?.columnTitle.preview}>
            <Button
              size="small"
              type="text"
              icon={<EyeOutlined />}
              disabled={disabled}
              onClick={onCompare}
            />
          </Tooltip>
        )}
        <Tooltip title={gstate.locale?.listAction.downloadOne}>
          <Button
            size="small"
            type="text"
            icon={<DownloadOutlined />}
            disabled={disabled || !row.compress}
            onClick={() => {
              if (row.compress?.blob) {
                const fileName = getOutputFileName(row, homeState.option);
                createDownload(fileName, row.compress.blob);
              }
            }}
          />
        </Tooltip>
        <Tooltip title={gstate.locale?.listAction.removeOne}>
          <Button
            size="small"
            type="text"
            className={style.removeBtn}
            icon={<DeleteOutlined />}
            disabled={disabled}
            onClick={() => {
              homeState.list.delete(row.key);
            }}
          />
        </Tooltip>
      </Space>
    </div>
  );
}
