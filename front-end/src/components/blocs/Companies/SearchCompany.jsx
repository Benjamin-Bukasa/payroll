import { Search } from "lucide-react";

const SearchClientCompany = ({ value, onChange }) => {
  return (
    <div className="relative w-full sm:w-64">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
      />
      <input
        type="text"
        placeholder="Rechercher une entreprise…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    </div>
  );
};

export default SearchClientCompany;
