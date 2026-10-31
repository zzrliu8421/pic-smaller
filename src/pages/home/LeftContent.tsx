import { Button, Flex, Space, Tooltip, Typography } from "antd";
import style from "./LeftContent.module.scss";
import { observer } from "mobx-react-lite";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  FolderAddOutlined,
  PlusOutlined,
  ReloadOutlined,
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

  const sortTabs: Array<{ key: SortKey; label: string }> = [
    { key: "default", label: gstate.locale?.sort?.default ?? "" },
    { key: "name", label: gstate.locale?.sort?.name ?? "" },
    { key: "size", label: gstate.locale?.sort?.size ?? "" },
    { key: "rate", label: gstate.locale?.sort?.rate ?? "" },
  ];

  return (
    <Flex align="stretch" vertical className={style.content}>
      {/* 主操作条 */}
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
        </Space>
        <Space size={8}>
          <Button
            disabled={disabled}
            icon={<ClearIcon />}
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

      {/* 排序条 */}
      {!isMobile && (
        <Flex align="center" justify="space-between" className={style.subbar}>
          <Flex align="center" className={style.tabs}>
            <span className={style.tabsLabel}>SORT</span>
            {sortTabs.map((tab) => (
              <button
                key={tab.key}
                className={classNames(style.tab, sortKey === tab.key && style.tabActive)}
                onClick={() => setSortKey(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </Flex>
          <span className={style.count}>
            {String(homeState.list.size).padStart(2, "0")} ITEMS
          </span>
        </Flex>
      )}

      {/* 规格单行 */}
      <div className={style.scrollBox}>
        <div className={style.rows}>
          {items.map((row, index) => (
            <SpecRow
              key={row.key}
              row={row}
              index={index + 1}
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

function ClearIcon() {
  return (
    <svg viewBox="0 0 1024 1024" width="14" height="14" fill="currentColor">
      <path d="M912 239.2H112a5.333333 5.333333 0 0 0-5.333333 5.333333v64a5.333333 5.333333 0 0 0 5.333333 5.333334h88.32a5.333333 5.333333 0 0 1 5.333333 5.333333V912a5.333333 5.333333 0 0 0 5.333334 5.333333h601.973333a5.333333 5.333333 0 0 0 5.333333-5.333333V319.2a5.333333 5.333333 0 0 1 5.333334-5.333333H912a5.333333 5.333333 0 0 0 5.333333-5.333334v-64a5.333333 5.333333 0 0 0-5.333333-5.333333z m-470.24 486.506667a5.333333 5.333333 0 0 1-5.333333 5.333333h-64a5.333333 5.333333 0 0 1-5.333334-5.333333V430.826667a5.333333 5.333333 0 0 1 5.333334-5.333334h64a5.333333 5.333333 0 0 1 5.333333 5.333334z m215.146667 0a5.333333 5.333333 0 0 1-5.333334 5.333333h-64a5.333333 5.333333 0 0 1-5.333333-5.333333V430.826667a5.333333 5.333333 0 0 1 5.333334-5.333334h64a5.333333 5.333333 0 0 1 5.333333 5.333334z" />
    </svg>
  );
}

function SpecRow({
  row,
  index,
  disabled,
  isMobile,
}: {
  row: ImageItem;
  index: number;
  disabled: boolean;
  isMobile: boolean;
}) {
  const compressing = !row.compress || !row.preview;
  const done = !compressing && !!row.compress;

  const lower = row.compress ? row.blob.size > row.compress.blob.size : false;
  // decrease > 0 表示变小
  const decrease =
    row.compress && row.blob.size > 0
      ? ((row.blob.size - row.compress.blob.size) / row.blob.size) * 100
      : 0;
  const rateText =
    (decrease > 0 ? "−" : "+") + Math.abs(decrease).toFixed(1) + "%";

  const onCompare = () => {
    if (homeState.isCropMode()) return;
    if (row.compress) {
      homeState.compareId = row.key;
    }
  };

  const canCompare = done && !homeState.isCropMode();

  return (
    <div
      className={classNames(
        style.row,
        compressing && style.compressing,
        canCompare && style.done,
      )}
    >
      <span className={style.idx}>{String(index).padStart(2, "0")}</span>

      {/* 缩略图 */}
      <div
        className={classNames(style.thumb, "ip-checker")}
        onClick={canCompare ? onCompare : undefined}
        style={{ cursor: canCompare ? "pointer" : "default" }}
      >
        {row.preview && <img src={row.preview.src} draggable={false} />}
        {compressing && <div className={style.scanline} />}
      </div>

      {/* 名称 + 尺寸 */}
      <div className={style.nameCol}>
        <Typography.Text className={style.name} title={row.name}>
          {row.name}
        </Typography.Text>
        <span className={style.dims}>
          {row.width && row.height ? `${row.width}×${row.height}` : "—"}
          {row.compress?.width && row.compress?.height
            ? ` → ${row.compress.width}×${row.compress.height}`
            : ""}
        </span>
      </div>

      {/* 引导线 */}
      <span className={style.leader} />

      {/* 大小：移动端仅显示压缩后大小 */}
      <span className={style.sizeCol}>
        {!isMobile && formatSize(row.blob.size)}
        {row.compress && (
          <>
            {!isMobile && <span className={style.sizeArrow}> → </span>}
            <b className={lower ? style.sizeGood : style.sizeBad}>
              {formatSize(row.compress.blob.size)}
            </b>
          </>
        )}
      </span>

      {/* 压缩率 */}
      <span className={style.rateCol}>
        {row.compress && (
          <Tooltip title={lower ? undefined : gstate.locale?.optionPannel.failTip}>
            <span className={classNames(style.rate, lower ? style.rateGood : style.rateBad)}>
              {!isMobile && (lower ? <ArrowDownOutlined /> : <ArrowUpOutlined />)}
              {rateText}
            </span>
          </Tooltip>
        )}
      </span>

      {/* 操作 */}
      <Space size={0} className={style.actions}>
        {canCompare && (
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
