import React from 'react'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string | number | undefined;
}

const CommonButton: React.FC<Props> = ({ label, ...props }) => {
  return (
    <button
      {...props}
      className="rounded-xl border-2 border-blue-100/20 bg-blue-500/20 px-4 py-2 shadow-md hover:bg-blue-500"
    >
      {label}
    </button>

  )
}

export default CommonButton; 
