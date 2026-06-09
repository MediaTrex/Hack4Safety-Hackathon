function TableFilters({ placeholder }) {
  return (
    <div className="flex gap-3 mb-5">
      <input placeholder={placeholder} className="border p-2 rounded-lg w-64" />

      <select className="border p-2 rounded-lg">
        <option>All Types</option>
      </select>

      <select className="border p-2 rounded-lg">
        <option>All Status</option>
      </select>

      <input type="date" className="border p-2 rounded-lg" />
    </div>
  );
}

export default TableFilters;
