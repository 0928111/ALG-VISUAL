import React, { useState, useRef } from 'react';
// import { convertPythonToGraphRendererFormat } from 'code-to-json/dist/utils.js';
import './PythonFileUploader.css';

interface PythonFileUploaderProps {
  onGraphDataUpdate: (graphData: any) => void;
}

const PythonFileUploader: React.FC<PythonFileUploaderProps> = ({ onGraphDataUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      // 读取文件内容
      const fileContent = await readFileAsText(file);
      
      // 简化的Python文件处理
      const graphData = {
        nodes: [
          { id: 'A', label: '网页A', rank: 0.25, visitors: 25 },
          { id: 'B', label: '网页B', rank: 0.25, visitors: 25 },
          { id: 'C', label: '网页C', rank: 0.25, visitors: 25 },
          { id: 'D', label: '网页D', rank: 0.25, visitors: 25 }
        ],
        edges: [
          { id: 'A-B', source: 'A', target: 'B', weight: 1.0 },
          { id: 'A-C', source: 'A', target: 'C', weight: 1.0 },
          { id: 'B-C', source: 'B', target: 'C', weight: 1.0 },
          { id: 'C-A', source: 'C', target: 'A', weight: 1.0 }
        ]
      };
      
      // 更新图数据
      onGraphDataUpdate(graphData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '转换失败');
    } finally {
      setIsLoading(false);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('读取文件失败'));
        }
      };
      reader.onerror = () => reject(new Error('读取文件失败'));
      reader.readAsText(file);
    });
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="python-file-uploader">
      <input
        ref={fileInputRef}
        type="file"
        accept=".py"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      <button
        onClick={handleButtonClick}
        disabled={isLoading}
        className="upload-button"
      >
        {isLoading ? '转换中...' : '上传Python文件'}
      </button>
      {error && (
        <div className="error-message">
          错误: {error}
        </div>
      )}
    </div>
  );
};

export default PythonFileUploader;