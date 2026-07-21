import React from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>

        <h2 className="text-3xl font-bold mt-2">
          {value}
        </h2>
      </div>

      <div
        className={`${color} w-14 h-14 rounded-xl flex items-center justify-center text-white`}
      >
        {icon}
      </div>
    </div>
  );
};

export default StatCard;