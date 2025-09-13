import React, { useState } from 'react';

const AuthInput = ({
    value,
    onChange,
    label,
    placeholder,
    type,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div>
            <label className="text-[15px] text-black">{label}</label>
            <div className="input-box">
                <input
                    type={type === 'password' ? (showPassword ? "text" : 'password') : type}
                    placeholder={placeholder}
                    className="text-[14px] w-full bg-transparent outline-none"
                    value={value}
                    onChange={onChange}
                    {...props}
                />
                {type === 'password' && (
                    <button
                        type="button"
                        onClick={toggleShowPassword}
                        className="text-black cursor-pointer text-xs"
                    >
                        {showPassword ? 'Hide' : 'Show'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default AuthInput;
