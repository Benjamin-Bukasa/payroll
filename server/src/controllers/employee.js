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
    // ❌ smigId supprimé du body
  } = req.body;

  try {
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

    // ✅ RÉCUPÉRER LE SMIG ACTIF
    const activeSmig = await prisma.smig.findFirst({
      where: { isActive: true },
    });

    if (!activeSmig) {
      return res.status(400).json({
        message: "Aucun SMIG actif trouvé. Veuillez en créer un.",
      });
    }

    // ✅ CRÉATION EMPLOYÉ AVEC SMIG PAR DÉFAUT
    const employee = await prisma.employee.create({
      data: {
        firstname,
        lastname,
        gender,
        placeofbirth,
        dateOfBirth: new Date(dateOfBirth),
        civilStatus,
        children: Number(children || 0),
        adress,
        phone,
        email,
        position,
        department,
        baseSalary: Number(baseSalary),
        smigId: activeSmig.id, // 👈 AUTO
        clientCompanyId,
      },
      include: {
        smig: true,
        clientCompany: true,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: "CREATE_EMPLOYEE",
      entity: "Employee",
      entityId: employee.id,
      newValue: {
        smig: activeSmig.id,
        baseSalary,
      },
    });

    res.status(201).json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la création de l’employé",
    });
  }
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


//Get employee by ID
export const getEmployeeById = async (req, res) => {
  const { employeeId } = req.params;

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      clientCompany: {
        select: {
          id: true,
          companyName: true,
        },
      },
      smig: true,
    },
  });

  if (!employee || employee.clientCompany.companyId !== req.user.companyId) {
    return res.status(404).json({ message: "Employee not found" });
  }

  res.json(employee);
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

  if (
    req.user.role === "MANAGER" &&
    employee.clientCompany.managerId !== req.user.id
  ) {
    return res.status(403).json({ message: "Access denied" });
  }

  // ✅ LISTE BLANCHE DES CHAMPS MODIFIABLES
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
    status,
    smigId, // optionnel
    clientCompanyId,
  } = req.body;

  const data = {
    firstname,
    lastname,
    gender,
    placeofbirth,
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    civilStatus,
    children,
    adress,
    phone,
    email,
    position,
    department,
    baseSalary,
    status,
  };

  // ✅ SI on change le SMIG → relation
  if (smigId) {
    data.smig = {
      connect: { id: smigId },
    };
  }

  // ✅ CHANGER L'ENTREPRISE CLIENTE
  if (
    clientCompanyId &&
    clientCompanyId !== employee.clientCompanyId
  ) {
    const targetCompany = await prisma.clientCompany.findUnique({
      where: { id: clientCompanyId },
      select: {
        id: true,
        companyId: true,
        managerId: true,
      },
    });

    if (!targetCompany) {
      return res.status(404).json({
        message: "Client company not found",
      });
    }

    if (targetCompany.companyId !== req.user.companyId) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    if (
      req.user.role === "MANAGER" &&
      targetCompany.managerId !== req.user.id
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    data.clientCompany = {
      connect: { id: clientCompanyId },
    };
  }

  const updated = await prisma.employee.update({
    where: { id: employeeId },
    data,
    include: {
      smig: true,
      clientCompany: true,
    },
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

/**
 * =========================
 * GET EMPLOYEE AVATAR
 * =========================
 */
export const getEmployeeAvatar = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { clientCompany: true },
    });

    if (
      !employee ||
      employee.clientCompany.companyId !== req.user.companyId
    ) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    if (
      req.user.role === "MANAGER" &&
      employee.clientCompany.managerId !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ avatar: employee.avatar });
  } catch (error) {
    console.error("Get employee avatar error:", error);
    res.status(500).json({
      message: "Unable to fetch employee avatar",
    });
  }
};

/**
 * =========================
 * UPDATE EMPLOYEE AVATAR
 * =========================
 */
export const updateEmployeeAvatar = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { clientCompany: true },
    });

    if (
      !employee ||
      employee.clientCompany.companyId !== req.user.companyId
    ) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    if (
      req.user.role === "MANAGER" &&
      employee.clientCompany.managerId !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!req.file?.path) {
      return res.status(400).json({
        message: "Avatar file is required",
      });
    }

    const updated = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        avatar: req.file.path,
      },
      select: {
        id: true,
        avatar: true,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: "UPDATE_EMPLOYEE_AVATAR",
      entity: "Employee",
      entityId: employeeId,
    });

    res.json({
      message: "Avatar updated",
      avatar: updated.avatar,
    });
  } catch (error) {
    console.error("Update employee avatar error:", error);
    res.status(500).json({
      message: "Unable to update avatar",
    });
  }
};

/**
 * =========================
 * DELETE EMPLOYEE AVATAR
 * =========================
 */
export const deleteEmployeeAvatar = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { clientCompany: true },
    });

    if (
      !employee ||
      employee.clientCompany.companyId !== req.user.companyId
    ) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    if (
      req.user.role === "MANAGER" &&
      employee.clientCompany.managerId !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updated = await prisma.employee.update({
      where: { id: employeeId },
      data: { avatar: null },
      select: { id: true, avatar: true },
    });

    await createAuditLog({
      userId: req.user.id,
      action: "DELETE_EMPLOYEE_AVATAR",
      entity: "Employee",
      entityId: employeeId,
    });

    res.json({
      message: "Avatar deleted",
      avatar: updated.avatar,
    });
  } catch (error) {
    console.error("Delete employee avatar error:", error);
    res.status(500).json({
      message: "Unable to delete avatar",
    });
  }
};
