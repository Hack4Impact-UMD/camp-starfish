import React from "react";
interface ToastProps {
  id: number;
  message: string;
  onClose: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, onClose }) => {
  return (
    <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'black', color: 'white', padding: '10px', borderRadius: '5px' }}>
      {message}
      <button onClick={() => onClose(id)} style={{ marginLeft: '10px', background: 'transparent', border: 'none', color: 'white' }}>×</button>
    </div>
  );
};

export default Toast;
