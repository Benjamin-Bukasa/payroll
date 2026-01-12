import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

/**
 * =====================================================
 * BULLETIN DE PAIE PDF A4 – RDC
 * =====================================================
 * - Disposition manuelle (X / Y)
 * - Logo + sceau optionnels
 * - Tableau gains / retenues
 * - Totaux & Net à payer
 */

export const generatePayrollPDF = ({
  payroll,
  employee,
  clientCompany,
  company,        // company hôte (optionnel)
  logoType = "CLIENT", // CLIENT | HOST
}) => {
  /* =========================
     PAGE CONFIG
  ========================= */
  const PAGE = {
    width: 595,
    height: 842,
    margin: 40,
  };

  const doc = new PDFDocument({
    size: "A4",
    margin: PAGE.margin,
  });

  const outputDir = path.join(
    process.cwd(),
    "uploads",
    "payrolls"
  );

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(
    outputDir,
    `bulletin_${employee.id}_${payroll.periodMonth}_${payroll.periodYear}.pdf`
  );

  doc.pipe(fs.createWriteStream(filePath));

  /* =========================
     HELPERS
  ========================= */
  const drawLine = (x1, y1, x2, y2) => {
    doc.moveTo(x1, y1).lineTo(x2, y2).stroke();
  };

  const drawLabelValue = (label, value, x, y, width = 120) => {
    doc.fontSize(9).text(label, x, y);
    doc.text(
      `${Number(value).toLocaleString()} FC`,
      x + width,
      y,
      { align: "right", width: 100 }
    );
  };

  /* =========================
     LOGO + EN-TÊTE
  ========================= */
  const logoPath =
    logoType === "CLIENT"
      ? clientCompany.logo
      : company?.logo;

  if (logoPath && fs.existsSync(logoPath)) {
    doc.image(logoPath, 40, 40, { width: 80 });
  }

  doc
    .fontSize(14)
    .text(clientCompany.companyName, 140, 45)
    .fontSize(10)
    .text("BULLETIN DE PAIE", 140, 65);

  drawLine(40, 90, 555, 90);

  /* =========================
     INFOS ENTREPRISE / EMPLOYÉ
  ========================= */
  let y = 105;
  doc.fontSize(9);

  // Colonne gauche
  doc.text(`Entreprise : ${clientCompany.companyName}`, 40, y);
  doc.text(`Adresse : ${clientCompany.address}`, 40, y + 15);
  doc.text(`Période : ${payroll.periodMonth}/${payroll.periodYear}`, 40, y + 30);

  // Colonne droite
  doc.text(`Employé : ${employee.firstname} ${employee.lastname}`, 320, y);
  doc.text(`Fonction : ${employee.position}`, 320, y + 15);
  doc.text(`Jours prestés : ${payroll.daysWorked}`, 320, y + 30);

  y += 55;
  drawLine(40, y, 555, y);

  /* =========================
     TABLEAU GAINS / RETENUES
  ========================= */
  y += 15;

  const COL = {
    gainsX: 40,
    retenuesX: 320,
    labelWidth: 160,
  };

  doc.fontSize(10).text("GAINS", COL.gainsX, y);
  doc.text("RETENUES", COL.retenuesX, y);

  y += 15;
  drawLine(40, y, 555, y);
  y += 10;

  // LIGNES
  drawLabelValue("Salaire de base", payroll.baseSalary, COL.gainsX, y);
  drawLabelValue("CNSS QPO", payroll.cnssQPO, COL.retenuesX, y);

  y += 15;
  drawLabelValue("Logement", payroll.housingLegal, COL.gainsX, y);
  drawLabelValue("IPR", payroll.iprNet, COL.retenuesX, y);

  y += 15;
  drawLabelValue("Transport", payroll.transport, COL.gainsX, y);
  drawLabelValue("IERE", payroll.iere || 0, COL.retenuesX, y);

  y += 15;
  drawLabelValue("Allocation familiale", payroll.familyAllowance, COL.gainsX, y);
  drawLabelValue("Autres retenues", payroll.otherDeductions || 0, COL.retenuesX, y);

  /* =========================
     TOTAUX
  ========================= */
  y += 25;
  drawLine(40, y, 555, y);

  y += 10;
  doc
    .fontSize(10)
    .text(`Salaire brut : ${payroll.grossSalary.toLocaleString()} FC`, 40, y);

  doc
    .text(
      `Total retenues : ${payroll.totalDeductions.toLocaleString()} FC`,
      320,
      y
    );

  /* =========================
     NET À PAYER
  ========================= */
  y += 30;

  doc.rect(40, y, 515, 35).stroke();

  doc
    .fontSize(12)
    .text(
      `NET À PAYER : ${payroll.netSalary.toLocaleString()} FC`,
      40,
      y + 10,
      { width: 515, align: "center" }
    );

  /* =========================
     SIGNATURE + SCEAU
  ========================= */
  y += 60;

  doc.fontSize(9);
  doc.text("Signature employeur", 40, y);
  doc.text("Cachet", 320, y);

  if (clientCompany.seal && fs.existsSync(clientCompany.seal)) {
    doc.image(clientCompany.seal, 320, y + 15, { width: 80 });
  }

  /* =========================
     PIED DE PAGE
  ========================= */
  doc
    .fontSize(8)
    .text(
      "Bulletin généré automatiquement – conforme à la législation du travail en RDC",
      40,
      PAGE.height - 35,
      { width: 515, align: "center" }
    );

  doc.end();

  return filePath;
};
