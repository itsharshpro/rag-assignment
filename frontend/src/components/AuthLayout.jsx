import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="flex justify-center w-screen h-screen md:w-1/2 px-12 pt-8 pb-12">
            {children}
        </div>
    </div>
  );
};

export default AuthLayout;
