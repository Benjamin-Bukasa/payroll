import prisma from "../config/db.js";

/* ======================================================
   CREATE SMIG
====================================================== */
export const createSmig = async (req, res) => {
  try {
    const {
      categorie,
      echelon,
      tension,
      colonne,
      dailyRate,
    } = req.body;

    if (
      !categorie ||
      !echelon ||
      !tension ||
      !colonne ||
      !dailyRate
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const smig = await prisma.smig.create({
      data: {
        categorie,
        echelon,
        tension,
        colonne,
        dailyRate: Number(dailyRate),
      },
    });

    res.status(201).json(smig);
  } catch (error) {
    console.error("Create SMIG error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        message:
          "SMIG with same categorie, echelon, tension and colonne already exists",
      });
    }

    res.status(500).json({
      message: "Unable to create SMIG",
    });
  }
};

/* ======================================================
   LIST SMIG
====================================================== */
export const listSmig = async (req, res) => {
  try {
    const smigs = await prisma.smig.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(smigs);
  } catch (error) {
    console.error("List SMIG error:", error);
    res.status(500).json({
      message: "Unable to fetch SMIG list",
    });
  }
};

/* ======================================================
   GET ONE SMIG
====================================================== */
export const getSmigById = async (req, res) => {
  try {
    const { smigId } = req.params;

    const smig = await prisma.smig.findUnique({
      where: { id: smigId },
    });

    if (!smig) {
      return res.status(404).json({
        message: "SMIG not found",
      });
    }

    res.json(smig);
  } catch (error) {
    console.error("Get SMIG error:", error);
    res.status(500).json({
      message: "Unable to fetch SMIG",
    });
  }
};

/* ======================================================
   UPDATE SMIG
====================================================== */
export const updateSmig = async (req, res) => {
  try {
    const { smigId } = req.params;
    const {
      categorie,
      echelon,
      tension,
      colonne,
      dailyRate,
      isActive,
    } = req.body;

    const smig = await prisma.smig.findUnique({
      where: { id: smigId },
    });

    if (!smig) {
      return res.status(404).json({
        message: "SMIG not found",
      });
    }

    const updated = await prisma.smig.update({
      where: { id: smigId },
      data: {
        categorie,
        echelon,
        tension,
        colonne,
        dailyRate:
          dailyRate !== undefined
            ? Number(dailyRate)
            : undefined,
        isActive,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Update SMIG error:", error);
    res.status(500).json({
      message: "Unable to update SMIG",
    });
  }
};

/* ======================================================
   DELETE SMIG
====================================================== */
export const deleteSmig = async (req, res) => {
  try {
    const { smigId } = req.params;

    const smig = await prisma.smig.findUnique({
      where: { id: smigId },
    });

    if (!smig) {
      return res.status(404).json({
        message: "SMIG not found",
      });
    }

    await prisma.smig.delete({
      where: { id: smigId },
    });

    res.json({
      message: "SMIG deleted successfully",
    });
  } catch (error) {
    console.error("Delete SMIG error:", error);
    res.status(500).json({
      message: "Unable to delete SMIG",
    });
  }
};
