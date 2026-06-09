function QuickActions() {
  return (
    <div className="bg-white p-5 rounded-xl shadow mt-5">
      <h2 className="font-bold text-lg mb-4">Quick Actions</h2>

      <div className="space-y-3">
        <button className="w-full bg-blue-600 text-white py-3 rounded-lg">
          Add Incident
        </button>

        <button className="w-full bg-red-500 text-white py-3 rounded-lg">
          Broadcast Alert
        </button>

        <button className="w-full bg-green-500 text-white py-3 rounded-lg">
          Assign Rescue Team
        </button>
      </div>
    </div>
  );
}

export default QuickActions;
