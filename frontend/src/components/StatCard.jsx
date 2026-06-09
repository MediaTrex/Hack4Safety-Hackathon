function StatCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="text-gray-500 text-sm">{title}</h3>

      <h2 className={`text-4xl font-bold mt-3 ${color}`}>{value}</h2>

      <p className="text-green-500 text-sm mt-2">↑ 12% from yesterday</p>
    </div>
  );
}

export default StatCard;
