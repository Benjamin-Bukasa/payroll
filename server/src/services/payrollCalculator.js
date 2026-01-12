export const calculatePayroll = ({
  employee,
  smig,
  payrollSetting,
  daysWorked,
  employeeCount,
  advanceSalary = 0,
  unionFee = 0,
  isExpatriate = false,
  yearsInMining = null,
}) => {
  /* =========================
     SALAIRE DE BASE
  ========================= */
  const baseSalary = smig.dailyRate * daysWorked;

  /* =========================
     ALLOCATIONS
  ========================= */
  const housingLegal =
    baseSalary * payrollSetting.housingRate;

  const transport =
    payrollSetting.taxiFare *
    payrollSetting.taxiCoursesPerDay *
    daysWorked;

  const children =
    Math.min(
      employee.children,
      payrollSetting.maxChildrenAllowance
    );

  const familyAllowance =
    (smig.dailyRate /
      payrollSetting.familyAllowanceDivider) *
    children;

  const medicalAllowance =
    payrollSetting.medicalAllowance;

  /* =========================
     REMUNERATION BRUTE
  ========================= */
  const grossSalary =
    baseSalary +
    housingLegal +
    transport +
    familyAllowance +
    medicalAllowance;

  /* =========================
     BASE IMPOSABLE IPR
     (logement, transport, soins EXCLUS)
  ========================= */
  const taxableGross =
    baseSalary + familyAllowance;

  /* =========================
     CNSS QPO (EMPLOYE)
  ========================= */
  const cnssQPO =
    grossSalary * payrollSetting.cnssQPORate;

  /* =========================
     BASE IPR
  ========================= */
  const iprBase = taxableGross - cnssQPO;

  /* =========================
     IPR BRUTE (BAREME RDC)
  ========================= */
  let iprBrute = 0;

  if (iprBase <= 162000) {
    iprBrute = iprBase * 0.03;
  } else if (iprBase <= 432000) {
    iprBrute = iprBase * 0.15;
  } else if (iprBase <= 864000) {
    iprBrute = iprBase * 0.30;
  } else {
    iprBrute = iprBase * 0.40;
  }

  /* =========================
     REDUCTION IPR (ENFANTS)
  ========================= */
  const iprReduction =
    iprBrute *
    payrollSetting.iprReductionRate *
    children;

  const iprNet =
    Math.max(0, iprBrute - iprReduction);

  /* =========================
     IERE (EXPATRIE)
  ========================= */
  let iere = 0;
  if (isExpatriate) {
    if (
      payrollSetting.isMiningSector &&
      yearsInMining !== null &&
      yearsInMining < payrollSetting.miningSectorMaxYears
    ) {
      iere =
        grossSalary *
        payrollSetting.iereMiningRate;
    } else {
      iere =
        grossSalary *
        payrollSetting.iereRate;
    }
  }

  /* =========================
     AUTRES DEDUCTIONS
  ========================= */
  const totalDeductions =
    cnssQPO +
    iprNet +
    iere +
    advanceSalary +
    unionFee;

  /* =========================
     NET A PAYER
  ========================= */
  const netSalary =
    grossSalary - totalDeductions;

  /* =========================
     CHARGES EMPLOYEUR
  ========================= */
  const cnssRiskEmployer =
    grossSalary *
    payrollSetting.cnssRiskEmployerRate;

  const cnssRetirement =
    grossSalary *
    payrollSetting.cnssRetirementRate;

  const cnssFamily =
    grossSalary *
    payrollSetting.cnssFamilyRate;

  const onem =
    grossSalary * payrollSetting.onemRate;

  let inppRate =
    employeeCount <= 50
      ? payrollSetting.inppRateSmall
      : employeeCount <= 300
      ? payrollSetting.inppRateMedium
      : payrollSetting.inppRateLarge;

  const inpp =
    grossSalary * inppRate;

  const totalEmployerCost =
    grossSalary +
    cnssRiskEmployer +
    cnssRetirement +
    cnssFamily +
    onem +
    inpp;

  return {
    baseSalary,
    housingLegal,
    transport,
    familyAllowance,
    medicalAllowance,
    grossSalary,
    taxableGross,
    cnssQPO,
    iprBase,
    iprBrute,
    iprReduction,
    iprNet,
    iere,
    totalDeductions,
    netSalary,
    cnssRiskEmployer,
    cnssRetirement,
    cnssFamily,
    onem,
    inpp,
    totalEmployerCost,
  };
};
