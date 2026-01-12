import prisma from "../config/db";


const EntryWorkedTime = async(req, res)=>{

    const {companyId, employeeId, employeeSchedule,period, startedTime, endedTime } = req.body
    
    const employeeCompany = await prisma.schedule.findUnique({where:{employeeId}})
}