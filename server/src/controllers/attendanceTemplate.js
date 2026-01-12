import XLSX from "xlsx";

/**
 * =========================================
 * DOWNLOAD ATTENDANCE EXCEL TEMPLATE
 * =========================================
 */
export const downloadAttendanceTemplate = (req, res) => {
  try {
    const data = [
      {
        firstname: "",
        lastname: "",
        startedDay: "MONDAY",
        endedDay: "MONDAY",
        date: "YYYY-MM-DD",
        startTime: "08:00",
        endTime: "16:00",
        companyName: "",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);

    worksheet["!cols"] = [
      { wch: 15 }, // firstname
      { wch: 15 }, // lastname
      { wch: 15 }, // startedDay
      { wch: 15 }, // endedDay
      { wch: 15 }, // date
      { wch: 10 }, // startTime
      { wch: 10 }, // endTime
      { wch: 25 }, // companyName
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Attendance"
    );

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=attendance_template.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);
  } catch (error) {
    console.error("Attendance template error:", error);
    res.status(500).json({
      message: "Unable to generate attendance template",
    });
  }
};
