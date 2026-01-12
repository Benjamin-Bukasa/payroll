import prisma from "../config/db.js";

export const checkClientCompanyAccess = async (req, res, next) => {
  const { clientCompanyId } = req.body || req.params;

  if (!clientCompanyId) {
    return res.status(400).json({
      message: "clientCompanyId is required",
    });
  }

  const clientCompany = await prisma.clientCompany.findUnique({
    where: { id: clientCompanyId },
  });

  if (!clientCompany) {
    return res.status(404).json({
      message: "Client company not found",
    });
  }

  if (clientCompany.companyId !== req.user.companyId) {
    return res.status(403).json({
      message: "Access denied",
    });
  }

  req.clientCompany = clientCompany;
  next();
};
