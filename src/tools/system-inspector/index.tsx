import type { SystemInfo, NetworkInfo, HardwareInfo, BrowserInfo, StorageInfo } from './types';
import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import {
  Globe,
  Cpu,
  Monitor,
  Database,
  Info,
  Copy,
  RefreshCw,
  Check,
  X,
  Battery,
  BatteryCharging,
  Wifi,
  HardDrive,
} from 'lucide-react';
import {
  parseBrowserInfo,
  getHardwareInfo,
  getBatteryInfo,
  getStorageInfo,
  formatBytes,
  formatTime,
  exportSystemInfo,
  PRIVACY_TIPS,
} from './utils';

// API 端点配置
const API_ENDPOINT = '/api/system-info';

/**
 * 信息项组件
 */
interface InfoItemProps {
  label: string;
  value: string | number | boolean | null;
  highlight?: boolean;
  mono?: boolean;
}

const InfoItem = ({ label, value, highlight = false, mono = false }: InfoItemProps) => {
  const displayValue = (): string => {
    if (value === null || value === undefined) return '不支持';
    if (typeof value === 'boolean') return value ? '是' : '否';
    return String(value);
  };

  const isSupported = value !== null && value !== false;

  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`text-sm ${mono ? 'font-mono' : ''} ${
          highlight ? 'text-primary font-semibold' : 'text-foreground'
        } ${!isSupported ? 'text-muted-foreground/60' : ''} max-w-[60%] text-right break-all`}
      >
        {typeof value === 'boolean' ? (
          <span className="flex items-center gap-1">
            {value ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-red-500" />
            )}
            {displayValue()}
          </span>
        ) : (
          displayValue()
        )}
      </span>
    </div>
  );
};

/**
 * 隐私提示图标组件
 */
interface PrivacyTipIconProps {
  tipKey: string;
}

const PrivacyTipIcon = ({ tipKey }: PrivacyTipIconProps) => {
  const tip = PRIVACY_TIPS[tipKey];
  if (!tip) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <Info className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="left"
        className="max-w-xs bg-popover border-2 border-border shadow-xl"
      >
        <div className="space-y-1">
          <p className="font-semibold text-sm text-popover-foreground">{tip.title}</p>
          <p className="text-xs text-popover-foreground/90 leading-relaxed whitespace-pre-line">{tip.description}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

/**
 * 网络信息卡片
 */
interface NetworkCardProps {
  data: NetworkInfo | null;
  isLoading: boolean;
}

const NetworkCard = ({ data, isLoading }: NetworkCardProps) => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          网络信息
        </CardTitle>
        <PrivacyTipIcon tipKey="network" />
      </div>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : data ? (
        <div className="space-y-0">
          <InfoItem label="公网 IP" value={data.ip} highlight mono />
          <InfoItem label="地理位置" value={data.location} />
          <InfoItem label="ISP 运营商" value={data.isp} />
          <div className="pt-3 mt-3 border-t border-border">
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              HTTP Request Headers
            </p>
            <div className="bg-muted/50 rounded-md p-3 overflow-y-auto md:max-h-none max-h-48">
              {Object.entries(data.headers).map(([key, value]) => (
                <div key={key} className="text-xs font-mono py-1 border-b border-border/30 last:border-0">
                  <span className="text-primary">{key}</span>
                  <span className="text-muted-foreground">: </span>
                  <span className="text-foreground break-all">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>无法获取网络信息</p>
          <p className="text-xs mt-1">请确保后端服务正常运行</p>
        </div>
      )}
    </CardContent>
  </Card>
);

/**
 * 硬件信息卡片
 */
interface HardwareCardProps {
  data: HardwareInfo;
}

const HardwareCard = ({ data }: HardwareCardProps) => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Cpu className="h-5 w-5 text-primary" />
          设备硬件
        </CardTitle>
        <PrivacyTipIcon tipKey="hardware" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-0">
        <InfoItem label="操作系统" value={`${data.os} ${data.osVersion}`} />
        <div className="py-2 border-b border-border/50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-muted-foreground">屏幕分辨率</span>
            <PrivacyTipIcon tipKey="resolution" />
          </div>
          <div className="text-sm space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">逻辑像素 (CSS)</span>
              <span className="font-mono text-foreground">{data.screenResolution}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">物理像素 (估算)</span>
              <span className="font-mono text-muted-foreground">{data.physicalResolution}</span>
            </div>
          </div>
        </div>
        <InfoItem label="设备像素比 (DPR)" value={data.devicePixelRatio.toFixed(2)} mono />
        <div className="py-2 border-b border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">CPU 核心数</span>
            <div className="text-right">
              <div className="text-sm text-foreground">{data.cpuCores} 核</div>
              <div className="text-xs text-muted-foreground">逻辑线程数</div>
            </div>
          </div>
        </div>
        <div className="py-2 border-b border-border/50 last:border-0">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">设备内存</span>
            <div className="text-right">
              {data.deviceMemory ? (
                <>
                  <div className="text-sm text-foreground">≈ {data.deviceMemory} GB</div>
                  <div className="text-xs text-muted-foreground">粗略分级</div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground/60">不支持</div>
              )}
            </div>
          </div>
        </div>
        {data.gpu && (
          <div className="pt-3 mt-3 border-t border-border">
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              GPU 信息
            </p>
            <div className="bg-muted/50 rounded-md p-3">
              <p className="text-sm font-mono break-all text-foreground">{data.gpu}</p>
              <p className="text-xs text-muted-foreground mt-1">通过 WebGL 获取，较准确</p>
            </div>
          </div>
        )}
        {data.battery && (
          <div className="pt-3 mt-3 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium flex items-center gap-2">
                {data.battery.charging ? (
                  <BatteryCharging className="h-4 w-4 text-green-500" />
                ) : (
                  <Battery className="h-4 w-4" />
                )}
                电池状态
              </p>
              <PrivacyTipIcon tipKey="battery" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <InfoItem label="电量" value={`${data.battery.level}%`} highlight />
              <InfoItem label="充电中" value={data.battery.charging} />
              {data.battery.charging && data.battery.chargingTime !== null && (
                <InfoItem label="充满预计" value={formatTime(data.battery.chargingTime)} />
              )}
              {!data.battery.charging && data.battery.dischargingTime !== null && (
                <InfoItem label="剩余时间" value={formatTime(data.battery.dischargingTime)} />
              )}
            </div>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

/**
 * 浏览器环境卡片
 */
interface BrowserCardProps {
  data: BrowserInfo;
}

const BrowserCard = ({ data }: BrowserCardProps) => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Monitor className="h-5 w-5 text-primary" />
          浏览器环境
        </CardTitle>
        <PrivacyTipIcon tipKey="browser" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-0">
        <InfoItem
          label="浏览器"
          value={`${data.browserName} ${data.browserVersion}`}
          highlight
        />
        <InfoItem label="渲染引擎" value={`${data.engine} ${data.engineVersion}`} />
        <InfoItem label="平台" value={data.platform} />
        <InfoItem label="系统语言" value={data.language} />
        <InfoItem
          label="语言偏好"
          value={data.languages.join(', ')}
        />
        <div className="pt-3 mt-3 border-t border-border">
          <p className="text-sm font-medium mb-2">功能支持</p>
          <div className="grid grid-cols-2 gap-x-4">
            <InfoItem label="触控支持" value={data.touchSupported} />
            <InfoItem label="Cookies" value={data.cookiesEnabled} />
            <InfoItem label="LocalStorage" value={data.localStorageSupported} />
            <InfoItem label="SessionStorage" value={data.sessionStorageSupported} />
            <InfoItem label="Do Not Track" value={data.doNotTrack} />
          </div>
        </div>
        <div className="pt-3 mt-3 border-t border-border">
          <p className="text-sm font-medium mb-2">User Agent</p>
          <div className="bg-muted/50 rounded-md p-3">
            <p className="text-xs font-mono break-all text-muted-foreground">
              {data.userAgent}
            </p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

/**
 * 存储项标签组件（带 Tooltip）
 */
interface StorageKeyBadgeProps {
  storageKey: string;
  value: string;
  storageType: string;
}

const StorageKeyBadge = ({ storageKey, value, storageType }: StorageKeyBadgeProps) => {
  // 截断过长的值
  const truncateValue = (val: string, maxLength: number = 100): string => {
    if (val.length <= maxLength) return val;
    return val.substring(0, maxLength) + '...';
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="text-xs bg-background px-2 py-0.5 rounded border border-border cursor-help hover:border-primary/50 transition-colors">
          {storageKey}
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-md bg-popover border-2 border-border shadow-xl"
      >
        <div className="space-y-1.5">
          <p className="font-semibold text-sm text-popover-foreground">{storageType}</p>
          <div className="text-xs space-y-1.5">
            <div>
              <span className="text-popover-foreground/70">键: </span>
              <span className="font-mono text-popover-foreground">{storageKey}</span>
            </div>
            <div>
              <span className="text-popover-foreground/70">值: </span>
              <span className="font-mono break-all text-popover-foreground">{truncateValue(value)}</span>
            </div>
            <div className="text-popover-foreground/70 text-[10px] pt-1 border-t border-border/50">
              大小: {new Blob([storageKey + value]).size} 字节
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

/**
 * 存储检查卡片
 */
interface StorageCardProps {
  data: StorageInfo;
}

const StorageCard = ({ data }: StorageCardProps) => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          存储检查
        </CardTitle>
        <PrivacyTipIcon tipKey="storage" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {/* Cookies */}
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Cookies
            </span>
            <span className="text-xs text-muted-foreground">
              {data.cookies.count} 项 · {formatBytes(data.cookies.size)}
            </span>
          </div>
          {data.cookies.keys.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {data.cookies.keys.slice(0, 10).map((key) => (
                <StorageKeyBadge
                  key={key}
                  storageKey={key}
                  value={data.cookies.items[key] || ''}
                  storageType="Cookie"
                />
              ))}
              {data.cookies.keys.length > 10 && (
                <span className="text-xs text-muted-foreground px-2 py-0.5">
                  +{data.cookies.keys.length - 10} 更多
                </span>
              )}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">无 Cookie 数据</div>
          )}
        </div>

        {/* LocalStorage */}
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              LocalStorage
            </span>
            <span className="text-xs text-muted-foreground">
              {data.localStorage.count} 项 · {formatBytes(data.localStorage.size)}
            </span>
          </div>
          {data.localStorage.keys.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {data.localStorage.keys.slice(0, 10).map((key) => (
                <StorageKeyBadge
                  key={key}
                  storageKey={key}
                  value={data.localStorage.items[key] || ''}
                  storageType="LocalStorage"
                />
              ))}
              {data.localStorage.keys.length > 10 && (
                <span className="text-xs text-muted-foreground px-2 py-0.5">
                  +{data.localStorage.keys.length - 10} 更多
                </span>
              )}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">无 LocalStorage 数据</div>
          )}
        </div>

        {/* SessionStorage */}
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              SessionStorage
            </span>
            <span className="text-xs text-muted-foreground">
              {data.sessionStorage.count} 项 · {formatBytes(data.sessionStorage.size)}
            </span>
          </div>
          {data.sessionStorage.keys.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {data.sessionStorage.keys.slice(0, 10).map((key) => (
                <StorageKeyBadge
                  key={key}
                  storageKey={key}
                  value={data.sessionStorage.items[key] || ''}
                  storageType="SessionStorage"
                />
              ))}
              {data.sessionStorage.keys.length > 10 && (
                <span className="text-xs text-muted-foreground px-2 py-0.5">
                  +{data.sessionStorage.keys.length - 10} 更多
                </span>
              )}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">无 SessionStorage 数据</div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

/**
 * 系统环境探针主组件
 */
export const SystemInspector = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [networkLoading, setNetworkLoading] = useState(true);

  /**
   * 获取网络信息
   */
  const fetchNetworkInfo = useCallback(async (): Promise<NetworkInfo | null> => {
    try {
      const response = await fetch(API_ENDPOINT);
      if (!response.ok) {
        throw new Error('API 请求失败');
      }
      const data = await response.json();
      return {
        ip: data.ip,
        location: data.location,
        isp: data.isp,
        headers: data.headers,
      };
    } catch (error) {
      console.error('获取网络信息失败:', error);
      return null;
    }
  }, []);

  /**
   * 收集所有系统信息
   */
  const collectSystemInfo = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setNetworkLoading(true);

    // 先收集本地信息（同步）
    const browser = parseBrowserInfo();
    const hardware = getHardwareInfo();
    const storage = getStorageInfo();

    // 初始设置本地信息
    setSystemInfo({
      network: null,
      hardware,
      browser,
      storage,
      timestamp: Date.now(),
    });
    setIsLoading(false);

    // 异步获取电池信息
    const battery = await getBatteryInfo();
    if (battery) {
      setSystemInfo((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          hardware: { ...prev.hardware, battery },
        };
      });
    }

    // 异步获取网络信息
    const network = await fetchNetworkInfo();
    setSystemInfo((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        network,
        timestamp: Date.now(),
      };
    });
    setNetworkLoading(false);
  }, [fetchNetworkInfo]);

  /**
   * 复制全部信息为 JSON
   */
  const handleCopyAll = async (): Promise<void> => {
    if (!systemInfo) {
      toast.error('暂无数据可复制');
      return;
    }

    try {
      const json = exportSystemInfo(systemInfo);
      await navigator.clipboard.writeText(json);
      toast.success('已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      toast.error('复制失败');
    }
  };

  /**
   * 刷新数据
   */
  const handleRefresh = (): void => {
    toast.info('正在刷新数据...');
    collectSystemInfo();
  };

  // 初始化时收集信息
  useEffect(() => {
    collectSystemInfo();
  }, [collectSystemInfo]);

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* 页面标题 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-xl">浏览器指纹检测</CardTitle>
                <CardDescription>
                  查看浏览器能获取的客户端信息（仅限 Web API），了解指纹追踪原理及隐私保护
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  刷新
                </Button>
                <Button onClick={handleCopyAll} disabled={!systemInfo}>
                  <Copy className="h-4 w-4 mr-2" />
                  复制全部 JSON
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 信息卡片网格 */}
        {systemInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NetworkCard data={systemInfo.network} isLoading={networkLoading} />
            <HardwareCard data={systemInfo.hardware} />
            <BrowserCard data={systemInfo.browser} />
            <StorageCard data={systemInfo.storage} />
          </div>
        )}

        {/* 加载状态 */}
        {isLoading && !systemInfo && (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* 底部说明 */}
        <div className="mt-6 space-y-4">
          {/* 重要提示 */}
          <Card className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="pt-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-orange-900 dark:text-orange-100">
                    ⚠️ 重要说明：这不是硬件检测工具
                  </p>
                  <p className="text-orange-800 dark:text-orange-200">
                    本工具展示的是<strong>浏览器 API 能获取的信息</strong>，而非真实硬件规格：
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-orange-700 dark:text-orange-300">
                    <li>
                      <strong>操作系统</strong>：基于 User-Agent 推测，可被伪造或简化（如 Windows 11 可能显示为 Windows 10）
                    </li>
                    <li>
                      <strong>屏幕分辨率</strong>：显示的是 CSS 逻辑像素，受系统缩放影响
                    </li>
                    <li>
                      <strong>CPU 核心数</strong>：是逻辑线程数，超线程会翻倍（如 4核8线程显示为 8 核）
                    </li>
                    <li>
                      <strong>内存</strong>：只能返回固定分级值 (0.25/0.5/1/2/4/8 GB)，即使您有 32GB 也只显示 8GB
                    </li>
                    <li>
                      <strong>GPU</strong>：通过 WebGL 获取，是较准确的信息，但部分浏览器可能屏蔽
                    </li>
                  </ul>
                  <p className="text-orange-800 dark:text-orange-200 pt-2">
                    这些限制是浏览器为了<strong>保护用户隐私、防止指纹追踪</strong>而设计的。
                    本工具的目的：帮助理解"浏览器指纹识别"的原理，以及隐私保护措施的重要性。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 数据采集时间 */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              数据采集时间:{' '}
              {systemInfo
                ? new Date(systemInfo.timestamp).toLocaleString('zh-CN')
                : '采集中...'}
            </p>
            <p className="mt-1">
              点击每个卡片右上角的 <Info className="h-3 w-3 inline" /> 图标了解详细的隐私说明
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
