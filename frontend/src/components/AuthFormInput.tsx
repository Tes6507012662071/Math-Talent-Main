import React from "react";

interface Props {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AuthFormInput: React.FC<Props> = ({ label, type, name, value, onChange }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
        required
      />
    </div>
  );
};

export default AuthFormInput;
