// 定义 Pyodide 相关的类型接口

export interface PyodideInterface {
    runPython: (code: string) => any;
    runPythonAsync: (code: string) => Promise<any>;
    loadPackage: (names: string | string[]) => Promise<void>;
    setStdout: (options: { batched: (msg: string) => void }) => void;
    setStderr: (options: { batched: (msg: string) => void }) => void;
    globals: any;
  }
  
  export interface PyodideConfig {
    indexURL: string;
    stdout?: (text: string) => void;
    stderr?: (text: string) => void;
  }
  
  declare global {
    interface Window {
      loadPyodide: (config: PyodideConfig) => Promise<PyodideInterface>;
      pyodideInstance?: PyodideInterface;
    }
  }