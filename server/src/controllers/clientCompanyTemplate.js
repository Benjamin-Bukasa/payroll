import XLSX from "xlsx";

/**
 * =========================================
 * DOWNLOAD CLIENT COMPANY EXCEL TEMPLATE
 * =========================================
 */
export const downloadClientCompanyTemplate = (req, res) => {
  try {
    // 🔹 Colonnes du template
    const data = [
      {
        companyName: "",
        email: "",
        phone: "",
        address: "",
        idNat: "",
        rccm: "",
        numImpot: "",
      },
    ];

    // Créer la feuille Excel
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Créer le workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "ClientCompanies"
    );

    // Générer le buffer
    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // Headers HTTP
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=client_companies_template.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    return res.send(buffer);
  } catch (error) {
    console.error("Download template error:", error);
    res.status(500).json({
      message: "Unable to generate template",
    });
  }
};
