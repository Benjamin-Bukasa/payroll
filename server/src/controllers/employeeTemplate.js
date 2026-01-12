import XLSX from "xlsx";

/**
 * =========================================
 * DOWNLOAD EMPLOYEE EXCEL TEMPLATE
 * =========================================
 */
export const downloadEmployeeTemplate = (req, res) => {
  try {
    const data = [
      {
        firstname: "",
        lastname: "",
        gender: "",
        placeofbirth: "",
        dateOfBirth: "YYYY-MM-DD",
        civilStatus: "",
        children: 0,
        adress: "",
        phone: "",
        email: "",
        position: "",
        department: "",
        baseSalary: 0,
        companyName: "",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);

    // 🔹 Ajuster la largeur des colonnes
    worksheet["!cols"] = [
      { wch: 15 }, // firstname
      { wch: 15 }, // lastname
      { wch: 10 }, // gender
      { wch: 18 }, // placeofbirth
      { wch: 15 }, // dateOfBirth
      { wch: 15 }, // civilStatus
      { wch: 10 }, // children
      { wch: 20 }, // adress
      { wch: 15 }, // phone
      { wch: 25 }, // email
      { wch: 18 }, // position
      { wch: 18 }, // department
      { wch: 12 }, // baseSalary
      { wch: 25 }, // companyName
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Employees"
    );

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=employees_template.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    return res.send(buffer);
  } catch (error) {
    console.error("Employee template error:", error);
    res.status(500).json({
      message: "Unable to generate employee template",
    });
  }
};
