import React from 'react';

const UserCount = ({ count }) => {
  return (
    <div className="text-center p-3 bg-blue-100 rounded-lg">
      <div className="text-sm text-blue-800 font-medium">Online Users</div>
      <div className="text-2xl font-bold text-blue-900">{count}</div>
    </div>
  );
};

export default UserCount;