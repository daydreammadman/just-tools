/**
 * Hex Viewer 组件 - 经典十六进制查看器（带虚拟滚动优化）
 */

import React, { memo, useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { formatOffset, byteToHex, byteToASCII } from '../utils';
import type { GhostCharacter } from '../types';

interface HexViewerProps {
  buffer: ArrayBuffer;
  selectedByte: number | null;
  onByteClick: (offset: number) => void;
  ghostCharacters: GhostCharacter[];
  highlightGhosts: boolean;
}

const BYTES_PER_ROW = 16;
const ROW_HEIGHT = 28;
const OVERSCAN = 10;

export const HexViewer = memo(({
  buffer,
  selectedByte,
  onByteClick,
  ghostCharacters,
  highlightGhosts,
}: HexViewerProps) => {
  const bytes = useMemo(() => new Uint8Array(buffer), [buffer]);
  const totalRows = Math.ceil(bytes.length / BYTES_PER_ROW);
  const totalHeight = totalRows * ROW_HEIGHT;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(400);

  // 初始化时和容器尺寸变化时更新高度
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateHeight = () => {
      const height = container.clientHeight;
      if (height > 0) {
        setContainerHeight(height);
      }
    };

    // 初始化
    updateHeight();

    // 监听尺寸变化
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // 预处理幽灵字符位置为 Set
  const ghostPositions = useMemo(() => {
    if (!highlightGhosts) return new Set<number>();
    return new Set(ghostCharacters.map(g => g.position));
  }, [ghostCharacters, highlightGhosts]);

  // 计算可见行范围
  const visibleRange = useMemo(() => {
    const startRow = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    const endRow = Math.min(
      totalRows,
      Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + OVERSCAN
    );
    return { startRow, endRow };
  }, [scrollTop, totalRows, containerHeight]);

  // 处理滚动事件
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // 渲染单个字节（Hex）
  const renderHexByte = useCallback((offset: number) => {
    const byte = bytes[offset];
    const isSelected = selectedByte === offset;
    const isGhost = ghostPositions.has(offset);

    return (
      <button
        key={offset}
        onClick={() => onByteClick(offset)}
        className={`
          w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded text-[10px] md:text-xs font-mono
          ${isSelected ? 'bg-primary text-primary-foreground ring-2 ring-primary' : ''}
          ${isGhost && !isSelected ? 'bg-destructive/50 text-destructive-foreground ring-1 ring-destructive' : ''}
          ${!isSelected && !isGhost ? 'hover:bg-muted' : ''}
        `}
      >
        {byteToHex(byte)}
      </button>
    );
  }, [bytes, selectedByte, ghostPositions, onByteClick]);

  // 渲染单个字节（ASCII）
  const renderAsciiByte = useCallback((offset: number) => {
    const byte = bytes[offset];
    const isSelected = selectedByte === offset;
    const isGhost = ghostPositions.has(offset);

    return (
      <span
        key={offset}
        onClick={() => onByteClick(offset)}
        className={`
          cursor-pointer font-mono
          ${isSelected ? 'bg-primary text-primary-foreground' : ''}
          ${isGhost && !isSelected ? 'bg-destructive/50 text-destructive-foreground' : ''}
        `}
      >
        {byteToASCII(byte)}
      </span>
    );
  }, [bytes, selectedByte, ghostPositions, onByteClick]);

  // 渲染一行（表头或数据行）
  const renderRow = useCallback((rowStart: number, isHeader: boolean = false) => {
    const bytesInRow = isHeader ? BYTES_PER_ROW : Math.min(BYTES_PER_ROW, bytes.length - rowStart);

    return (
      <>
        {/* 偏移量列 */}
        <div className="w-16 md:w-20 text-muted-foreground text-[10px] md:text-xs shrink-0 font-mono">
          {isHeader ? 'Offset' : formatOffset(rowStart)}
        </div>

        {/* 十六进制列 */}
        <div className="flex gap-0.5 md:gap-1 shrink-0">
          {isHeader
            ? Array.from({ length: BYTES_PER_ROW }, (_, i) => (
                <div
                  key={i}
                  className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-muted-foreground text-[10px] md:text-xs font-mono"
                >
                  {i.toString(16).toUpperCase().padStart(2, '0')}
                </div>
              ))
            : Array.from({ length: bytesInRow }, (_, i) => renderHexByte(rowStart + i))
          }
        </div>

        {/* ASCII 列 - 移动端隐藏 */}
        <div className="hidden md:flex text-muted-foreground text-xs shrink-0 font-mono">
          {isHeader
            ? 'Decoded text'
            : Array.from({ length: bytesInRow }, (_, i) => renderAsciiByte(rowStart + i))
          }
        </div>
      </>
    );
  }, [bytes, renderHexByte, renderAsciiByte]);

  // 生成可见行数据
  const visibleRows = useMemo(() => {
    const rows: React.ReactElement[] = [];
    for (let rowIndex = visibleRange.startRow; rowIndex < visibleRange.endRow; rowIndex++) {
      const rowStart = rowIndex * BYTES_PER_ROW;

      rows.push(
        <div
          key={rowStart}
          className="flex gap-2 md:gap-4 items-center px-2 md:px-4 hover:bg-muted/50"
          style={{
            position: 'absolute',
            top: rowIndex * ROW_HEIGHT,
            left: 0,
            right: 0,
            height: ROW_HEIGHT,
          }}
        >
          {renderRow(rowStart)}
        </div>
      );
    }
    return rows;
  }, [visibleRange, renderRow]);

  return (
    <div
      className="bg-card text-card-foreground rounded-lg border overflow-hidden"
      style={{
        height: '100%',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
      }}
    >
      {/* 表头 */}
      <div className="flex gap-2 md:gap-4 py-2 px-2 md:px-4 items-center border-b bg-muted/30">
        {renderRow(0, true)}
      </div>

      {/* 虚拟滚动容器 */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{ overflow: 'auto', minHeight: 0 }}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleRows}
        </div>
      </div>

      {/* 统计信息 */}
      <div className="flex justify-between items-center py-1.5 px-2 md:px-4 border-t text-[10px] md:text-xs text-muted-foreground bg-muted/30">
        <span>
          {bytes.length.toLocaleString()} bytes
        </span>
        <span>
          行 {visibleRange.startRow + 1} - {Math.min(visibleRange.endRow, totalRows)} / {totalRows.toLocaleString()}
        </span>
      </div>
    </div>
  );
});

HexViewer.displayName = 'HexViewer';
