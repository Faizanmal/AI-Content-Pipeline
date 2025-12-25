import React from 'react';
import './Loading.css';

interface LoadingProps {
  message?: string;
}

const Loading = ({ message = 'Loading...' }: LoadingProps) => {
  return (
    <div className="loading">
      <div className="loading__spinner"></div>
      <p className="loading__message">{message}</p>
    </div>
  );
};

export default Loading;
