import React from 'react';
import LoginLeft from '../../components/blocs/LoginLeft';
import LoginRight from '../../components/blocs/LoginRight';

const Login = () => {
  return (
    <div className="w-full sm:h-screen flex bg-white">
      <LoginLeft/>
      <LoginRight/>
    </div>
  );
}

export default Login;
