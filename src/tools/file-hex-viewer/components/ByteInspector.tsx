/**
 * Byte Inspector 组件 - 字节数据检查器
 */

import type { FC } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { ByteInfo } from '../types';

interface ByteInspectorProps {
  byteInfo: ByteInfo | null;
}

export const ByteInspector: FC<ByteInspectorProps> = ({ byteInfo }) => {
  if (!byteInfo) {
    return (
      <div className="text-muted-foreground text-center py-8 text-sm">
        点击任意字节查看详细信息
      </div>
    );
  }

  // 将二进制字符串转换为位数组
  const bits = byteInfo.binary.split('').map((bit) => bit === '1');

  return (
    <div className="space-y-4 ">
      {/* 各种进制表示 - 紧凑两列布局 */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <div className="flex flex-col">
          <span className="text-muted-foreground">Hex</span>
          <span className="font-mono font-medium">0x{byteInfo.hex}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground">Dec</span>
          <span className="font-mono font-medium">{byteInfo.decimal}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground">Oct</span>
          <span className="font-mono font-medium">0o{byteInfo.octal}</span>
        </div>
        <div className="flex flex-col">
        <span className="text-muted-foreground">ASCII</span>
          <span className="font-mono font-medium">
            {byteInfo.ascii === '·' ? '(不可打印)' : `"${byteInfo.ascii}"`}
          </span>

        </div>
      </div>

      {/* 分隔线 */}
      <div className="border-t" />

      {/* 位视图 - 更紧凑 */}
      <div className="space-y-2">
        <Label className="text-x font-medium">位视图</Label>
        <div className="grid grid-cols-8 gap-1.5">
          {bits.map((bit, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <div className="text-[10px] text-muted-foreground">
                {7 - index}
              </div>
              <Checkbox
                checked={bit}
                disabled
                className="h-4 w-4"
              />
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground text-center">
          MSB ← → LSB
        </p>
      </div>

      {/* 分隔线 */}
      <div className="border-t" />

      {/* 字符分类 - 更紧凑 */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">字符分类</Label>
        <div className="flex flex-row gap-4  justify-around">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-muted-foreground">可打印</span>
            <span className={byteInfo.value >= 32 && byteInfo.value <= 126 ? 'text-green-600 font-medium' : ''}>
              {byteInfo.value >= 32 && byteInfo.value <= 126 ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-muted-foreground">控制字符</span>
            <span className={byteInfo.value < 32 || byteInfo.value === 127 ? 'text-yellow-600 font-medium' : ''}>
              {byteInfo.value < 32 || byteInfo.value === 127 ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-muted-foreground">扩展 ASCII</span>
            <span className={byteInfo.value > 127 ? 'text-blue-600 font-medium' : ''}>
              {byteInfo.value > 127 ? '✓' : '✗'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
