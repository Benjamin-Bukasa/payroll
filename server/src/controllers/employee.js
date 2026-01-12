import prisma from "../config/db.js";
import { createAuditLog } from "../services/audit.js";

/**
 * =========================
 * CREATE
 * =========================
 */
export const createEmployee = async (req, res) => {
  const {
    firstname,
    lastname,
    gender,
    placeofbirth,
    dateOfBirth,
    civilStatus,
    children,
    adress,
    phone,
    email,
    position,
    department,
    baseSalary,
    clientCompanyId,
    smigId,
  } = req.body;

  // 🔐 Vérifier que la clientCompany appartient à la company SaaS
  const clientCompany = await prisma.clientCompany.findUnique({
    where: { id: clientCompanyId },
  });

  if (!clientCompany || clientCompany.companyId !== req.user.companyId) {
    return res.status(403).json({ message: "Access denied" });
  }

  // 🔐 MANAGER → uniquement ses entreprises clientes
  if (
    req.user.role === "MANAGER" &&
    clientCompany.managerId !== req.user.id
  ) {
    return res.status(403).json({ message: "Access denied" });
  }

  const employee = await prisma.employee.create({
    data: {
      firstname,
      lastname,
      gender,
      placeofbirth,
      dateOfBirth: new Date(dateOfBirth),
      civilStatus,
      children,
      adress,
      phone,
      email,
      position,
      department,
      baseSalary,
      smigId,
      clientCompanyId,
    },
  });

  await createAuditLog({
    userId: req.user.id,
    action: "CREATE_EMPLOYEE",
    entity: "Employee",
    entityId: employee.id,
  });

  res.status(201).json(employee);
};

/**
 * =========================
 * LIST (CANONIQUE)
 * =========================
 */
export const listEmployees = async (req, res) => {
  const { role, id: userId, companyId } = req.user;

  const where = {
    clientCompany: {
      companyId,
    },
  };

  // 👨‍💼 MANAGER → seulement ses entreprises clientes
  if (role === "MANAGER") {
    where.clientCompany.managerId = userId;
  }

  // 👤 USER → lecture seule (ou liste vide)
  if (role === "USER") {
    return res.json([]);
  }

  const employees = await prisma.employee.findMany({
    where,
    include: {
      clientCompany: {
        select: {
          id: true,
          companyName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 🔐 Injecter les permissions UI
  const enriched = employees.map((emp) => ({
    ...emp,
    canEdit: ["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(role),
    canDelete: ["SUPER_ADMIN", "ADMIN"].includes(role),
  }));

  res.json(enriched);
};

/**
 * =========================
 * UPDATE
 * =========================
 */
export const updateEmployee = async (req, res) => {
  const { employeeId } = req.params;

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { clientCompany: true },
  });

  if (!employee || employee.clientCompany.companyId !== req.user.companyId) {
    return res.status(404).json({ message: "Employee not found" });
  }

  // 🔐 MANAGER → seulement ses entreprises clientes
  if (
    req.user.role === "MANAGER" &&
    employee.clientCompany.managerId !== req.user.id
  ) {
    return res.status(403).json({ message: "Access denied" });
  }

  const updated = await prisma.employee.update({
    where: { id: employeeId },
    data: req.body,
  });

  await createAuditLog({
    userId: req.user.id,
    action: "UPDATE_EMPLOYEE",
    entity: "Employee",
    entityId: employeeId,
  });

  res.json(updated);
};

/**
 * =========================
 * DELETE
 * =========================
 */
export const deleteEmployee = async (req, res) => {
  const { employeeId } = req.params;

  // 🔐 SEUL ADMIN / SUPER_ADMIN
  if (!["SUPER_ADMIN", "ADMIN"].includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { clientCompany: true },
  });

  if (!employee || employee.clientCompany.companyId !== req.user.companyId) {
    return res.status(404).json({ message: "Employee not found" });
  }

  await prisma.employee.delete({
    where: { id: employeeId },
  });

  await createAuditLog({
    userId: req.user.id,
    action: "DELETE_EMPLOYEE",
    entity: "Employee",
    entityId: employeeId,
  });

  res.json({ message: "Employee deleted" });
};
