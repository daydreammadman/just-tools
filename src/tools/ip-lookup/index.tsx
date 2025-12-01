import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { MapPin, Network, Server, Globe2, Copy, ShieldCheck, RotateCw, Map, Settings, Save } from 'lucide-react';
import { validateIp, formatCoordinates } from './utils';

// 地图提供商类型
type MapProvider = 'osm' | 'bing' | 'amap';

// 地图提供商配置
const MAP_PROVIDERS: Record<MapProvider, { name: string; needsKey: boolean }> = {
  osm: { name: 'OpenStreetMap', needsKey: false },
  bing: { name: '必应地图', needsKey: false },
  amap: { name: '高德地图', needsKey: true },
};

// localStorage key
const AMAP_KEY_STORAGE = 'just-tools-amap-key';
const MAP_PROVIDER_STORAGE = 'just-tools-map-provider';

// 统一的内部数据格式
interface IpData {
  query: string;      // IP 地址
  country: string;    // 国家
  regionName: string; // 省/州
  city: string;       // 城市
  lat: number;        // 纬度
  lon: number;        // 经度
  isp: string;        // 运营商
  org: string;        // 组织
  as?: string;        // AS 号
  source: string;     // 数据来源名称
}

// API 提供商定义
interface ApiProvider {
  name: string;
  url: (ip: string) => string;
  // 将不同 API 的返回格式统一映射为 IpData
  transform: (data: Record<string, any>) => IpData;
}

// 超时时间配置（毫秒）
const REQUEST_TIMEOUT = 2000;

// 带超时的 fetch 封装
const fetchWithTimeout = async (url: string, timeout: number): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`请求超时 (${timeout / 1000}s)`);
    }
    throw error;
  }
};

const API_PROVIDERS: ApiProvider[] = [
  {
    name: 'ip-api.com',
    // 注意: ip-api 免费版不支持 HTTPS，在 HTTPS 网站调用会失败，从而触发 Fallback
    url: (ip) => `http://ip-api.com/json/${ip || ''}?lang=zh-CN`,
    transform: (data) => {
      if (data.status === 'fail') throw new Error(data.message);
      return {
        query: data.query,
        country: data.country,
        regionName: data.regionName,
        city: data.city,
        lat: data.lat,
        lon: data.lon,
        isp: data.isp,
        org: data.org,
        as: data.as,
        source: 'ip-api.com'
      };
    }
  },
  {
    name: 'ipwhois.app',
    // 支持 HTTPS，支持中文，作为首选备用
    url: (ip) => `https://ipwhois.app/json/${ip || ''}?lang=zh-CN`,
    transform: (data) => {
      if (data.success === false) throw new Error(data.message);
      return {
        query: data.ip,
        country: data.country,
        regionName: data.region,
        city: data.city,
        lat: data.latitude,
        lon: data.longitude,
        isp: data.isp,
        org: data.org,
        as: data.asn, // ipwhois 叫 asn
        source: 'ipwhois.app'
      };
    }
  },
  {
    name: 'geojs.io',
    // 极其稳定，无限制，HTTPS，但主要是英文且信息较少，作为兜底
    // 注意：查本机时不需要传 IP，直接请求 /v1/ip/geo.json
    url: (ip) => ip
      ? `https://get.geojs.io/v1/ip/geo/${ip}.json`
      : `https://get.geojs.io/v1/ip/geo.json`,
    transform: (data) => ({
      query: data.ip,
      country: data.country,
      regionName: data.region || '未知',
      city: data.city || '未知',
      lat: parseFloat(data.latitude),
      lon: parseFloat(data.longitude),
      isp: data.organization_name || '未知', // geojs 只有 organization
      org: data.organization || '未知',
      as: 'N/A',
      source: 'geojs.io'
    })
  }
];

export const IpLookupTool: FC = () => {
  const [inputIp, setInputIp] = useState('');
  const [result, setResult] = useState<IpData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<string>('');
  const [showMap, setShowMap] = useState(true);

  // 地图相关状态
  const [mapProvider, setMapProvider] = useState<MapProvider>('osm');
  const [amapKey, setAmapKey] = useState('');
  const [amapKeyInput, setAmapKeyInput] = useState('');
  const [showMapSettings, setShowMapSettings] = useState(false);

  // 初始化时从 localStorage 读取配置
  useEffect(() => {
    const savedMapProvider = localStorage.getItem(MAP_PROVIDER_STORAGE) as MapProvider | null;
    const savedAmapKey = localStorage.getItem(AMAP_KEY_STORAGE);

    if (savedMapProvider && MAP_PROVIDERS[savedMapProvider]) {
      setMapProvider(savedMapProvider);
    }
    if (savedAmapKey) {
      setAmapKey(savedAmapKey);
      setAmapKeyInput(savedAmapKey);
    }
  }, []);

  // 核心查询逻辑 (支持多源重试 + 超时切换)
  const fetchIpInfo = async (ip: string = '') => {
    setIsLoading(true);
    setResult(null);
    setCurrentProvider('');

    let lastError: Error | null = null;
    const startTime = Date.now();

    // 遍历所有提供商进行尝试
    for (const provider of API_PROVIDERS) {
      try {
        // 如果是 HTTPS 环境且 API 是 HTTP，直接跳过 (避免浏览器控制台报错)
        if (window.location.protocol === 'https:' && provider.url('').startsWith('http:')) {
          console.warn(`[${provider.name}] 跳过 - HTTPS 环境不支持 HTTP 接口`);
          continue;
        }

        const url = provider.url(ip);
        const providerStartTime = Date.now();
        setCurrentProvider(`正在尝试 ${provider.name}...`);

        const response = await fetchWithTimeout(url, REQUEST_TIMEOUT);

        const elapsed = Date.now() - providerStartTime;

        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

        const rawData = await response.json();
        const standardizedData = provider.transform(rawData);

        setResult(standardizedData);
        setCurrentProvider(provider.name);

        // 成功后回填输入框 (如果是查本机)
        if (!ip) {
          setInputIp(standardizedData.query);
          toast.success(`已识别本机 IP (源: ${provider.name}，耗时 ${elapsed}ms)`);
        } else {
          toast.success(`查询成功 (耗时 ${elapsed}ms)`);
        }

        // 成功获取后直接退出循环，不再尝试后续接口
        setIsLoading(false);
        return;

      } catch (error) {
        const elapsed = Date.now() - startTime;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`[${provider.name}] 失败: ${errorMsg}，已耗时 ${elapsed}ms`);
        lastError = error instanceof Error ? error : new Error('Unknown error');
        // 继续尝试下一个循环
      }
    }

    // 如果所有循环都跑完了还没 return，说明全挂了
    const totalTime = Date.now() - startTime;
    console.error(`所有接口均失败，总耗时 ${totalTime}ms`);
    setIsLoading(false);
    setCurrentProvider('');
    toast.error(lastError?.message || '所有接口查询均失败，请检查网络');
  };

  const handleSearch = () => {
    const trimmedIp = inputIp.trim();
    if (!trimmedIp) return toast.error('请输入 IP 地址');
    if (!validateIp(trimmedIp)) return toast.error('IP 格式不正确');
    fetchIpInfo(trimmedIp);
  };

  const handleMyIp = () => {
    setInputIp('');
    fetchIpInfo('');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success('已复制'));
  };

  // 切换地图提供商
  const handleMapProviderChange = (provider: MapProvider) => {
    if (provider === 'amap' && !amapKey) {
      setShowMapSettings(true);
      toast.info('请先配置高德地图 API Key');
      return;
    }
    setMapProvider(provider);
    localStorage.setItem(MAP_PROVIDER_STORAGE, provider);
  };

  // 保存高德 API Key
  const handleSaveAmapKey = () => {
    const key = amapKeyInput.trim();
    if (!key) {
      toast.error('请输入 API Key');
      return;
    }
    setAmapKey(key);
    localStorage.setItem(AMAP_KEY_STORAGE, key);
    toast.success('高德地图 API Key 已保存');
    setShowMapSettings(false);
    // 自动切换到高德地图
    setMapProvider('amap');
    localStorage.setItem(MAP_PROVIDER_STORAGE, 'amap');
  };

  // 清除高德 API Key
  const handleClearAmapKey = () => {
    setAmapKey('');
    setAmapKeyInput('');
    localStorage.removeItem(AMAP_KEY_STORAGE);
    // 如果当前是高德，切换回 OSM
    if (mapProvider === 'amap') {
      setMapProvider('osm');
      localStorage.setItem(MAP_PROVIDER_STORAGE, 'osm');
    }
    toast.success('已清除高德地图 API Key');
  };

  // 生成地图嵌入 URL
  const getMapUrl = (lat: number, lon: number): string => {
    switch (mapProvider) {
      case 'bing':
        // 必应地图嵌入 - 使用静态地图或嵌入式地图
        return `https://www.bing.com/maps/embed?h=400&w=600&cp=${lat}~${lon}&lvl=12&typ=d&sty=r&src=SHELL&FORM=MBEDV8`;
      case 'amap':
        // 高德地图（在渲染时单独处理）
        return '';
      case 'osm':
      default:
        // OpenStreetMap 嵌入
        return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.5}%2C${lat - 0.3}%2C${lon + 0.5}%2C${lat + 0.3}&layer=mapnik&marker=${lat}%2C${lon}`;
    }
  };

  // 生成地图外部链接
  const getMapExternalUrl = (lat: number, lon: number): string => {
    switch (mapProvider) {
      case 'bing':
        return `https://www.bing.com/maps?cp=${lat}~${lon}&lvl=12&style=r`;
      case 'amap':
        return `https://uri.amap.com/marker?position=${lon},${lat}&name=IP位置&coordinate=wgs84`;
      case 'osm':
      default:
        return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=12/${lat}/${lon}`;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe2 className="h-6 w-6" />
            IP 归属地查询
          </CardTitle>
          <CardDescription>
            聚合多个免费 IP 数据库，自动切换可用节点（超时 {REQUEST_TIMEOUT / 1000}s 自动切换下一个源）
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="grid gap-2 w-full md:flex-1">
              <Label htmlFor="ip-input">IP 地址</Label>
              <Input
                id="ip-input"
                placeholder="例如: 8.8.8.8 (留空查询本机)"
                value={inputIp}
                onChange={(e) => setInputIp(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="font-mono"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button onClick={handleSearch} disabled={isLoading} className="flex-1 md:flex-none">
                {isLoading && <RotateCw className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? '查询中...' : '查询'}
              </Button>
              <Button variant="outline" onClick={handleMyIp} disabled={isLoading} className="flex-1 md:flex-none">
                本机 IP
              </Button>
            </div>
          </div>

          {/* 加载状态显示当前尝试的源 */}
          {isLoading && currentProvider && (
            <div className="text-sm text-muted-foreground text-center animate-pulse">
              {currentProvider}
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
              <div className="grid gap-4 md:grid-cols-2">
                {/* 地理位置卡片 */}
                <Card className="bg-muted/50 border-none shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> 地理位置
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-foreground">
                        {result.country} {result.regionName}
                      </div>
                      <div className="text-lg text-muted-foreground">{result.city}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-2 bg-background/50 p-1 rounded inline-block">
                        {formatCoordinates(result.lat, result.lon)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 网络信息卡片 */}
                <Card className="bg-muted/50 border-none shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Network className="h-4 w-4" /> 网络信息
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">运营商 (ISP)</div>
                        <div className="font-semibold">{result.isp}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                          <Server className="h-3 w-3" /> AS 编号 / 组织
                        </div>
                        <div className="text-sm font-mono truncate" title={result.as || result.org}>
                          {result.as || result.org}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 底部信息栏 */}
                <div className="md:col-span-2 bg-primary/5 rounded-lg p-4 flex items-center justify-between border border-primary/10">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        当前查询 IP (数据源: <span className="font-semibold text-primary">{result.source}</span>)
                      </div>
                      <div className="text-lg font-bold font-mono tracking-wide text-primary">
                        {result.query}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleCopy(result.query)}>
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              {/* 地图可视化 */}
              {result.lat && result.lon && (
                <Card className="overflow-hidden select-none">
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Map className="h-4 w-4" /> 地图位置
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {/* 地图源选择 */}
                        <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
                          {(Object.keys(MAP_PROVIDERS) as MapProvider[]).map((provider) => (
                            <button
                              key={provider}
                              onClick={() => handleMapProviderChange(provider)}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                mapProvider === provider
                                  ? 'bg-background text-foreground shadow-sm'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {MAP_PROVIDERS[provider].name}
                            </button>
                          ))}
                        </div>
                        {/* 设置按钮 */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setShowMapSettings(!showMapSettings)}
                          title="地图设置"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowMap(!showMap)}
                          className="text-xs"
                        >
                          {showMap ? '收起' : '展开'}
                        </Button>
                      </div>
                    </div>

                    {/* 地图设置面板 */}
                    {showMapSettings && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-3">
                        <div className="text-sm font-medium">高德地图 API Key 设置</div>
                        <p className="text-xs text-muted-foreground">
                          使用高德地图需要 API Key，可在
                          <a
                            href="https://console.amap.com/dev/key/app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline mx-1"
                          >
                            高德开放平台
                          </a>
                          免费申请（选择 Web端(JS API)）
                        </p>
                        <div className="flex gap-2">
                          <Input
                            placeholder="输入高德地图 API Key"
                            value={amapKeyInput}
                            onChange={(e) => setAmapKeyInput(e.target.value)}
                            className="flex-1 h-8 text-sm"
                          />
                          <Button size="sm" onClick={handleSaveAmapKey} className="h-8">
                            <Save className="h-4 w-4 mr-1" />
                            保存
                          </Button>
                          {amapKey && (
                            <Button size="sm" variant="outline" onClick={handleClearAmapKey} className="h-8">
                              清除
                            </Button>
                          )}
                        </div>
                        {amapKey && (
                          <div className="text-xs text-green-600 dark:text-green-400">
                            已配置 API Key: {amapKey.slice(0, 8)}...
                          </div>
                        )}
                      </div>
                    )}
                  </CardHeader>
                  {showMap && (
                    <CardContent className="p-0">
                      {mapProvider === 'amap' ? (
                        // 高德地图
                        <div className="relative w-full h-64 md:h-80 bg-muted">
                          {amapKey ? (
                            <iframe
                              title="IP 位置地图"
                              src={`https://m.amap.com/navi/?dest=${result.lon},${result.lat}&destName=IP位置&key=${amapKey}`}
                              className="absolute inset-0 w-full h-full border-0"
                              loading="lazy"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                              请先配置高德地图 API Key
                            </div>
                          )}
                        </div>
                      ) : mapProvider === 'bing' ? (
                        // 必应地图 - 使用 iframe 嵌入
                        <div className="relative w-full h-64 md:h-80 bg-muted">
                          <iframe
                            title="IP 位置地图"
                            src={`https://www.bing.com/maps/embed?h=400&w=800&cp=${result.lat}~${result.lon}&lvl=11&typ=d&sty=r&src=SHELL&FORM=MBEDV8`}
                            className="absolute inset-0 w-full h-full border-0"
                            loading="lazy"
                            scrolling="no"
                          />
                        </div>
                      ) : (
                        // OpenStreetMap
                        <div className="relative w-full h-64 md:h-80 bg-muted">
                          <iframe
                            title="IP 位置地图"
                            src={getMapUrl(result.lat, result.lon)}
                            className="absolute inset-0 w-full h-full border-0"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <div className="p-3 bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
                        <span>位置: {result.city}, {result.regionName}, {result.country}</span>
                        <a
                          href={getMapExternalUrl(result.lat, result.lon)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          在 {MAP_PROVIDERS[mapProvider].name} 中打开
                        </a>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>已启用多源容灾模式：优先使用中文数据，超时或失败自动切换至下一个接口。</p>
      </div>
    </div>
  );
};