const ClientCompanyFilters = ({
  sector,
  setSector,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}) => {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* SECTEUR */}
      <select
        value={sector}
        onChange={(e) => setSector(e.target.value)}
        className="border rounded-md px-3 py-2 text-sm"
      >
        <option value="">Tous les secteurs</option>
        <option value="GENERAL">Général</option>
        <option value="MINING">Minier</option>
        <option value="BANKING">Banque</option>
        <option value="NGO">ONG</option>
        <option value="TRANSPORT">Transport</option>
      </select>

      {/* DATE DEBUT */}
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="border rounded-md px-3 py-2 text-sm"
      />

      {/* DATE FIN */}
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="border rounded-md px-3 py-2 text-sm"
      />
    </div>
  );
};

export default ClientCompanyFilters;
