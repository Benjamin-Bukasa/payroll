import prisma from "../config/db.js"


export const createUser = async (req,res)=>{
    const {firstname,lastname, username, gender,dateBirth, role, department, email, password,} = req.body
    
    const emailExist = await prisma.user.findUnique({where:{email}})
    if (emailExist) return res.status(400).json({ message: "Email already used" });

    const hash = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    await prisma.user.create({
            data: { 
                firstname,
                lastname, 
                username, 
                phone, 
                gender, 
                dateBirth,
                role,
                department,
                email, 
                password: hash, 
                verificationToken }
        });

    await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true, verificationToken: null }
      });
}


export const getAllUsers = (req, res)=>{
    res.send("Get all users")
}

export const getUniqueUser = (req, res)=>{
    const {user} = req.params.id
    res.send(`user n°${user} get sucessfully`)
}

export const updateUser = (req, res)=>{
    const {user} = req.params.id
    res.send(`user n°${user} updated sucessfully`)
}

export const deleteUniqueUser = (req, res)=>{
    const {user} = req.params.id
    res.send(`user n°${user} deleted sucessfully`)
}



