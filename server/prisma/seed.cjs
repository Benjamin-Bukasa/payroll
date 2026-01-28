const { PrismaClient } = require("@prisma/client");

console.log("🔥 SEED SCRIPT STARTED");

const prisma = new PrismaClient();
const COMPANY_ID = "fa9f3238-c1cd-436f-b7fc-c8953c17f113";

async function main() {
  console.log("🌱 Seeding data for company:", COMPANY_ID);

  // 1️⃣ Company
  const company = await prisma.company.findUnique({
    where: { id: COMPANY_ID },
  });

  if (!company) {
    throw new Error(`❌ Company not found with id ${COMPANY_ID}`);
  }

  console.log("✅ Company found:", company.name);

  // 2️⃣ ClientCompany
  let clientCompany = await prisma.clientCompany.findFirst({
    where: { companyId: COMPANY_ID },
  });

  if (!clientCompany) {
    clientCompany = await prisma.clientCompany.create({
      data: {
        companyName: "Client Démo RDC SARL",
        email: "contact@clientdemo.cd",
        address: "Kinshasa – Gombe",
        activitySector: "GENERAL",
        companyId: COMPANY_ID,
      },
    });
    console.log("✅ ClientCompany created");
  }

  // 3️⃣ Schedule
  await prisma.clientCompanySchedule.upsert({
    where: { clientCompanyId: clientCompany.id },
    update: {},
    create: {
      clientCompanyId: clientCompany.id,
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
  });

  // 4️⃣ HR Settings
  await prisma.hRSettings.upsert({
    where: { clientCompanyId: clientCompany.id },
    update: {},
    create: {
      clientCompanyId: clientCompany.id,
      lateToleranceMinutes: 15,
      absenceAfterMinutes: 120,
    },
  });

  // 5️⃣ SMIG
  let smig = await prisma.smig.findFirst({
    where: { isActive: true },
  });

  if (!smig) {
    smig = await prisma.smig.create({
      data: {
        categorie: "A",
        echelon: "1",
        tension: "Normal",
        colonne: "I",
        dailyRate: 7500,
        isActive: true,
      },
    });
    console.log("✅ SMIG created");
  }

  // 6️⃣ Employees
  const employees = [
   {
    firstname: "Luc",
    lastname: "Kabasele",
    gender: "M",
    placeofbirth: "Kinshasa",
    dateOfBirth: new Date("1992-02-14"),
    civilStatus: "Single",
    children: 0,
    position: "Agent administratif",
    department: "Administration",
    baseSalary: 240000,
  },
  {
    firstname: "Sarah",
    lastname: "Mbuyi",
    gender: "F",
    placeofbirth: "Mbuji-Mayi",
    dateOfBirth: new Date("1995-06-21"),
    civilStatus: "Single",
    children: 0,
    position: "Secrétaire",
    department: "Administration",
    baseSalary: 230000,
  },
  {
    firstname: "Joseph",
    lastname: "Katumba",
    gender: "M",
    placeofbirth: "Lubumbashi",
    dateOfBirth: new Date("1987-04-10"),
    civilStatus: "Married",
    children: 4,
    position: "Chef d’équipe",
    department: "Technique",
    baseSalary: 320000,
  },
  {
    firstname: "Aline",
    lastname: "Kabongo",
    gender: "F",
    placeofbirth: "Kananga",
    dateOfBirth: new Date("1993-09-03"),
    civilStatus: "Married",
    children: 1,
    position: "Assistante RH",
    department: "RH",
    baseSalary: 260000,
  },
  {
    firstname: "Blaise",
    lastname: "Mutombo",
    gender: "M",
    placeofbirth: "Matadi",
    dateOfBirth: new Date("1989-12-18"),
    civilStatus: "Single",
    children: 0,
    position: "Magasinier",
    department: "Logistique",
    baseSalary: 250000,
  },
  {
    firstname: "Nadine",
    lastname: "Kasongo",
    gender: "F",
    placeofbirth: "Kinshasa",
    dateOfBirth: new Date("1996-08-27"),
    civilStatus: "Single",
    children: 0,
    position: "Caissière",
    department: "Finance",
    baseSalary: 240000,
  },
  {
    firstname: "Daniel",
    lastname: "Lukusa",
    gender: "M",
    placeofbirth: "Kikwit",
    dateOfBirth: new Date("1986-01-05"),
    civilStatus: "Married",
    children: 5,
    position: "Responsable Logistique",
    department: "Logistique",
    baseSalary: 340000,
  },
  {
    firstname: "Chantal",
    lastname: "Ngandu",
    gender: "F",
    placeofbirth: "Bandundu",
    dateOfBirth: new Date("1994-11-11"),
    civilStatus: "Single",
    children: 0,
    position: "Chargée d’accueil",
    department: "Administration",
    baseSalary: 220000,
  },
  {
    firstname: "Eric",
    lastname: "Makiese",
    gender: "M",
    placeofbirth: "Kinshasa",
    dateOfBirth: new Date("1991-07-19"),
    civilStatus: "Married",
    children: 2,
    position: "Informaticien",
    department: "IT",
    baseSalary: 360000,
  },
  {
    firstname: "Grace",
    lastname: "Ilunga",
    gender: "F",
    placeofbirth: "Lubumbashi",
    dateOfBirth: new Date("1997-03-30"),
    civilStatus: "Single",
    children: 0,
    position: "Archiviste",
    department: "Administration",
    baseSalary: 210000,
  },
  ];

  for (const emp of employees) {
    const exists = await prisma.employee.findFirst({
      where: {
        firstname: emp.firstname,
        lastname: emp.lastname,
        clientCompanyId: clientCompany.id,
      },
    });

    if (!exists) {
      await prisma.employee.create({
        data: {
          ...emp,
          smigId: smig.id,
          clientCompanyId: clientCompany.id,
        },
      });
      console.log(`👤 Employee created: ${emp.firstname} ${emp.lastname}`);
    }
  }

  console.log("🎉 SEED COMPLETED SUCCESSFULLY");
}

main()
  .catch((e) => {
    console.error("❌ SEED ERROR:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
