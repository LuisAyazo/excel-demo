'use client';

import React from 'react';

interface DocumentIconProps {
  fileName: string;
  isDirectory: boolean;
  size?: number;
  view?: 'grid' | 'list';
}

const DocumentIcon: React.FC<DocumentIconProps> = ({ 
  fileName, 
  isDirectory, 
  size = 24, 
  view = 'list' 
}) => {
  // Get file extension
  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const extension = getFileExtension(fileName);
  
  // Style adjustments based on view mode
  const iconStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };
  
  // Handle directory icon
  if (isDirectory) {
    return (
      <div style={iconStyle} className="flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fbbf24" style={iconStyle}>
          <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z" />
        </svg>
      </div>
    );
  }

  // Handle file icons based on extension
  switch (extension) {
    case 'pdf':
      return (
        <div style={iconStyle} className="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={iconStyle}>
            <path fill="#f87171" d="M7,3V21H17V3H7M9,5H15V19H9V5M11,7V9H13V7H11M11,11V13H13V11H11M11,15V17H13V15H11Z" />
          </svg>
        </div>
      );
    case 'doc':
    case 'docx':
      return (
        <div style={iconStyle} className="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={iconStyle}>
            <path fill="#60a5fa" d="M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3H19M5,5V19H19V5H5M7,7H17V9H7V7M7,11H17V13H7V11M7,15H14V17H7V15Z" />
          </svg>
        </div>
      );
    case 'xls':
    case 'xlsx':
      return (
        <div style={iconStyle} className="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={iconStyle}>
            <path fill="#4ade80" d="M21.17,3.25Q21.5,3.25 21.76,3.5Q22,3.75 22,4.08V19.92Q22,20.25 21.76,20.5Q21.5,20.75 21.17,20.75H7.83Q7.5,20.75 7.24,20.5Q7,20.25 7,19.92V4.08Q7,3.75 7.24,3.5Q7.5,3.25 7.83,3.25H21.17M2.08,3.75H6.17V11.95H2.08V3.75M2,12.75H6.17V20.25H2V12.75M7.92,4.92V19.08H21.08V4.92H7.92M9.5,6.67H13.75V8.42H9.5V6.67M14.58,6.67H19.5V9.17H14.58V6.67M9.5,9.25H13.75V11H9.5V9.25M14.58,9.75H19.5V12.25H14.58V9.75M9.5,11.83H13.75V13.58H9.5V11.83M14.58,12.83H19.5V15.33H14.58V12.83M9.5,14.42H13.75V16.17H9.5V14.42M14.58,15.92H19.5V18.42H14.58V15.92M9.5,17H13.75V18.75H9.5V17Z" />
          </svg>
        </div>
      );
    case 'ppt':
    case 'pptx':
      return (
        <div style={iconStyle} className="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={iconStyle}>
            <path fill="#f97316" d="M6,2H14L20,8V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M13,3.5V9H18.5L13,3.5M8,11V13H16V11H8M8,15V17H16V15H8Z" />
          </svg>
        </div>
      );
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
      return (
        <div style={iconStyle} className="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={iconStyle}>
            <path fill="#a855f7" d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5A2,2 0 0,0 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
          </svg>
        </div>
      );
    case 'txt':
      return (
        <div style={iconStyle} className="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={iconStyle}>
            <path fill="#9ca3af" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M8,13V15H16V13H8M8,17V19H16V17H8M8,7V9H10V7H8Z" />
          </svg>
        </div>
      );
    case 'zip':
    case 'rar':
    case '7z':
      return (
        <div style={iconStyle} className="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={iconStyle}>
            <path fill="#d97706" d="M20 6H12L10 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6M18 12H16V14H18V16H16V18H14V16H16V14H14V12H16V10H14V8H16V10H18V12Z" />
          </svg>
        </div>
      );
    default:
      // Generic file icon for any other file type
      return (
        <div style={iconStyle} className="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={iconStyle}>
            <path fill="#9ca3af" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        </div>
      );
  }
};

export default DocumentIcon;