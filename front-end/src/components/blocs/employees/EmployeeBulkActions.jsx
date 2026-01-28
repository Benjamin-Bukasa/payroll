import React from "react";
import Button from "../../ui/button";

const EmployeeBulkActions = ({
  selectedCount,
  onDelete,
  onChangeStatus,
  onChangeCompany,
  onChangeSector,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
      <p className="text-sm font-medium">
        {selectedCount} sélectionné(s)
      </p>

      <Button buttonStyle={false}
        className={"px-4 py-2 rounded-lg"}
      onClick={onDelete}>
        Supprimer
      </Button>

      <Button buttonStyle={false}
        className={"px-4 py-2 rounded-lg"}
      onClick={onChangeStatus}>
        Changer statut
      </Button>

      <Button buttonStyle={false}
        className={"px-4 py-2 rounded-lg"}
      onClick={onChangeCompany}>
        Changer entreprise
      </Button>

      <Button buttonStyle={false}
        className={"px-4 py-2 rounded-lg"}
      onClick={onChangeSector}>
        Changer secteur
      </Button>
    </div>
  );
};

export default EmployeeBulkActions;
