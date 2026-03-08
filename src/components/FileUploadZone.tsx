// 文件上传组件 - 支持拖拽和点击上传
'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, FileText, X } from 'lucide-react';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  selectedFile?: File | null;
  isProcessing?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export function FileUploadZone({
  onFileSelect,
  onFileRemove,
  selectedFile,
  isProcessing = false,
  accept = '.csv',
  maxSize = 16,
  className = '',
}: FileUploadZoneProps) {
  const t = useTranslations('FileUpload');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');

  const validateFile = useCallback((file: File): string | null => {
    // 检查文件类型
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return t('errors.onlyCSV') || '仅支持CSV文件 / Only CSV files are supported';
    }

    // 检查文件大小
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      return t('errors.fileTooLarge', { size: maxSize }) ||
             `文件过大，最大支持${maxSize}MB / File too large, max ${maxSize}MB`;
    }

    return null;
  }, [maxSize, t]);

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    onFileSelect(file);
  }, [onFileSelect, validateFile]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (isProcessing) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile, isProcessing]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isProcessing) {
      setIsDragging(true);
    }
  }, [isProcessing]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setError('');
    onFileRemove?.();
  }, [onFileRemove]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // 渲染已选择的文件
  if (selectedFile) {
    return (
      <div className={`relative bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-300 dark:border-emerald-700 rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <FileText className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatFileSize(selectedFile.size)}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                CSV 文件已就绪，可直接开始分析
              </p>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={handleRemove}
              className="flex-shrink-0 p-2 hover:bg-emerald-100 dark:hover:bg-emerald-800 rounded-lg transition-colors"
              aria-label="Remove file"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // 渲染上传区域
  return (
    <div className={className}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
            : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-900/10'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${error ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : ''}
        `}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileInput}
          disabled={isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          aria-label="Upload file"
        />

        <div className="flex flex-col items-center gap-4">
          <div className={`
            p-4 rounded-full transition-colors
            ${isDragging
              ? 'bg-blue-100 dark:bg-blue-900/40'
              : 'bg-gray-100 dark:bg-gray-800'
            }
          `}>
            <Upload className={`
              w-8 h-8 transition-colors
              ${isDragging
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400'
              }
            `} />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              {isDragging
                ? (t('dropFile') || '释放文件以上传 / Drop file to upload')
                : (t('dragDrop') || '拖拽文件到此处，或点击选择 / Drag & drop file here, or click to browse')
              }
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('fileInfo', { maxSize, accept: 'CSV' }) ||
               `最大 ${maxSize}MB，仅支持 CSV 文件 / Max ${maxSize}MB, CSV only`}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              建议 UTF-8 编码，避免中文乱码
            </p>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FileUploadZone;
