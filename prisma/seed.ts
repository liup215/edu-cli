import prisma from '../src/lib/prisma'

async function main() {
  console.log('Start seeding...')

  // 1. Create Subject Groups
  const biologyGroup = await prisma.subjectGroup.upsert({
    where: { name: 'Biology' },
    update: {},
    create: { name: 'Biology' },
  })

  // 2. Create Teachers (Consolidated List)
  const teachers = [
    '刘鹏', 'Vincent', // Course Teachers
    '邓澄', '吴银花', '蔡卓玲', '刘天', '刘仁洁', '田艳', '徐瑞雪', '熊建媛', '晏秋', '蔡菲', '汤朕尧', '赵桂云', // G12 Tutors
    '王特', '刘杨群', '阎磊', '郝媛媛', '丁仁芳', '王茜', // G11 Tutors
    '李路航', '郭力菡', '唐秀文', '田佳玉', '蒋东烜', '张叶', '赵钐贝', '梁聪', '连佳巍', '皮春燕', '施昱兆', '唐婧怡' // G10 Tutors
  ]

  for (const name of teachers) {
    await prisma.teacher.upsert({
      where: { name },
      update: {},
      create: { 
        name,
        // Assign purely based on name for this seed script, ideally would be smarter
        subjectGroupId: (name === '刘鹏' || name === 'Vincent') ? biologyGroup.id : undefined 
      },
    })
  }

  // Helper to connect Head Teachers
  const connectHeadTeachers = async (adminClassId: number, headTeacherNamesStr: string) => {
    if (!headTeacherNamesStr) return
    const names = headTeacherNamesStr.split(/[,、"“”]/).map(s => s.trim()).filter(Boolean)
    const teachers = await prisma.teacher.findMany({
      where: { name: { in: names } }
    })
    
    await prisma.administrativeClass.update({
      where: { id: adminClassId },
      data: {
        headTeachers: {
          connect: teachers.map(t => ({ id: t.id }))
        }
      }
    })
  }

  // Helper to seed a class
  const seedClass = async (className: string, courseName: string, teacherNamesStr: string, enrollmentYear: number, studentsData: any[]) => {
    console.log(`Seeding class: ${className}`)

    // Find Teachers
    const teacherNames = teacherNamesStr.split(/[,、]/).map(s => s.trim()).filter(Boolean)
    const teachers = await prisma.teacher.findMany({
      where: { name: { in: teacherNames } }
    })

    // Create Teaching Class
    const teachingClass = await prisma.teachingClass.upsert({
      where: { name: className },
      update: {
        course: courseName,
        teachers: {
          set: [], // clears existing connections 
          connect: teachers.map(t => ({ id: t.id }))
        }
      },
      create: {
        name: className,
        course: courseName,
        teachers: {
          connect: teachers.map(t => ({ id: t.id }))
        }
      },
    })

    // Create Students
    for (const s of studentsData) {
      // Ensure Admin Class exists
      let adminClass = null
      if (s.adminClass) {
        adminClass = await prisma.administrativeClass.upsert({
          where: { name: s.adminClass },
          update: {},
          create: { name: s.adminClass },
        })

        // Connect Head Teachers to Admin Class
        if (s.headTeachers) {
          await connectHeadTeachers(adminClass.id, s.headTeachers)
        }
      }

      // Create/Update Student
      const student = await prisma.student.upsert({
        where: { studentId: s.id },
        update: {
          name: s.name,
          englishName: s.englishName,
          gender: s.gender,
          enrollmentYear: enrollmentYear,
          administrativeClassId: adminClass?.id,
          teachingClasses: {
            connect: { id: teachingClass.id }
          }
        },
        create: {
          studentId: s.id,
          name: s.name,
          englishName: s.englishName,
          gender: s.gender,
          enrollmentYear: enrollmentYear,
          administrativeClassId: adminClass?.id,
          teachingClasses: {
            connect: { id: teachingClass.id }
          }
        },
      })
    }
  }

  // --- Data for Grade 12 (高2023级生物1班) ---
  const g12Students = [
    { id: '20260104', name: '耿琬婷', englishName: 'Mirai', gender: '女', adminClass: '十二年级1班', headTeachers: '邓澄,吴银花' },
    { id: '20260126', name: '周不比', englishName: 'Bobby', gender: '男', adminClass: '十二年级1班', headTeachers: '邓澄,吴银花' },
    { id: '20260310', name: '吕星言', englishName: 'Phenix', gender: '男', adminClass: '十二年级3班', headTeachers: '蔡卓玲,刘天' },
    { id: '20260408', name: '李书安', englishName: 'Sean', gender: '男', adminClass: '十二年级4班', headTeachers: '刘仁洁,田艳' },
    { id: '20260420', name: '许津榜', englishName: 'Joseph', gender: '男', adminClass: '十二年级4班', headTeachers: '刘仁洁,田艳' },
    { id: '20260527', name: '黎籽伽', englishName: 'Liya', gender: '女', adminClass: '十二年级5班', headTeachers: '徐瑞雪,熊建媛' },
    { id: '20260607', name: '李子豪', englishName: 'Hydren', gender: '男', adminClass: '十二年级6班', headTeachers: '晏秋,蔡菲' },
    { id: '20260722', name: '余锦瑞', englishName: 'Nick', gender: '男', adminClass: '十二年级7班', headTeachers: '汤朕尧,赵桂云' },
  ]
  await seedClass('高2023级生物1班', 'A-level 生物 G12', '刘鹏', 2023, g12Students)

  // --- Data for Grade 11 (高2024级生物2班) ---
  const g11Students = [
    { id: '20270303', name: '陈姿羽', englishName: 'Rosanna', gender: '女', adminClass: '十一年级3班', headTeachers: '王特,刘杨群' },
    { id: '20270310', name: '胡誉砾', englishName: 'Ida', gender: '女', adminClass: '十一年级3班', headTeachers: '王特,刘杨群' },
    { id: '20270313', name: '李宇乔', englishName: 'Sophia', gender: '女', adminClass: '十一年级3班', headTeachers: '王特,刘杨群' },
    { id: '20270314', name: '罗予彤', englishName: 'Coco', gender: '女', adminClass: '十一年级3班', headTeachers: '王特,刘杨群' },
    { id: '20270316', name: '任诗涵', englishName: 'Hannah', gender: '女', adminClass: '十一年级3班', headTeachers: '王特,刘杨群' },
    { id: '20270319', name: '汤丝尧', englishName: 'Tammy', gender: '女', adminClass: '十一年级3班', headTeachers: '王特,刘杨群' },
    { id: '20270323', name: '肖瑾怡', englishName: 'Josie', gender: '女', adminClass: '十一年级3班', headTeachers: '王特,刘杨群' },
    { id: '20270412', name: '卢希缔', englishName: 'Xander', gender: '男', adminClass: '十一年级4班', headTeachers: '阎磊,郝媛媛' },
    { id: '20270523', name: '肖语涵', englishName: 'Lin', gender: '女', adminClass: '十一年级5班', headTeachers: '丁仁芳,刘鹏' },
    { id: '20270619', name: '温若晨', englishName: 'Amily', gender: '女', adminClass: '十一年级3班', headTeachers: '王特,刘杨群' },
    { id: '20270625', name: '杨天瑞', englishName: 'Oliver', gender: '男', adminClass: '十一年级6班', headTeachers: '王茜' },
  ]
  await seedClass('高2024级生物2班', 'A-level 生物 G11', '刘鹏', 2024, g11Students)

  // --- Data for Grade 10 (高2025级生物3班) ---
  const g10Students = [
    { id: '20280111', name: '李思冉', englishName: 'Sarah', gender: '女', adminClass: '十年级1班', headTeachers: '李路航,郭力菡' },
    { id: '20280113', name: '刘博之', englishName: 'Christina', gender: '女', adminClass: '十年级1班', headTeachers: '李路航,郭力菡' },
    { id: '20280114', name: '刘俊池', englishName: 'Jerry', gender: '男', adminClass: '十年级1班', headTeachers: '李路航,郭力菡' },
    { id: '20280117', name: '牟加艺', englishName: 'April', gender: '女', adminClass: '十年级1班', headTeachers: '李路航,郭力菡' },
    { id: '20280123', name: '谭寓丹', englishName: 'Ella', gender: '女', adminClass: '十年级1班', headTeachers: '李路航,郭力菡' },
    { id: '20280124', name: '王镁婕', englishName: 'Maggie', gender: '女', adminClass: '十年级1班', headTeachers: '李路航,郭力菡' },
    { id: '20280125', name: '王思锦', englishName: 'Nicole', gender: '女', adminClass: '十年级1班', headTeachers: '李路航,郭力菡' },
    { id: '20280126', name: '翁诚一', englishName: 'Ian', gender: '男', adminClass: '十年级1班', headTeachers: '李路航,郭力菡' },
    { id: '20280127', name: '吴一凡', englishName: 'Frank', gender: '男', adminClass: '十年级1班', headTeachers: '李路航,郭力菡' },
    { id: '20280129', name: '朱姝然', englishName: 'Amanda', gender: '女', adminClass: '十年级1班', headTeachers: '李路航,郭力菡' },
    { id: '20280309', name: '李思瑶', englishName: 'Lilith', gender: '女', adminClass: '十年级3班', headTeachers: '唐秀文,田佳玉' },
    { id: '20280318', name: '王梓轩', englishName: 'Jeffry', gender: '男', adminClass: '十年级3班', headTeachers: '唐秀文,田佳玉' },
    { id: '20280319', name: '闻瀚林', englishName: 'David', gender: '男', adminClass: '十年级3班', headTeachers: '唐秀文,田佳玉' },
    { id: '20280403', name: '邓浩文', englishName: 'Dylan', gender: '男', adminClass: '十年级4班', headTeachers: '蒋东烜,张叶' },
    { id: '20280407', name: '黄元源', englishName: 'May', gender: '女', adminClass: '十年级4班', headTeachers: '蒋东烜,张叶' },
    { id: '20280416', name: '欧洋祺', englishName: 'Oswin', gender: '男', adminClass: '十年级4班', headTeachers: '蒋东烜,张叶' },
    { id: '20280424', name: '吴歆瑶', englishName: 'Eileen', gender: '女', adminClass: '十年级4班', headTeachers: '蒋东烜,张叶' },
    { id: '20280518', name: '杨雁文', englishName: 'Wendy', gender: '女', adminClass: '十年级5班', headTeachers: '赵钐贝,梁聪' },
    { id: '20280607', name: '李依宸', englishName: 'Ruby', gender: '女', adminClass: '十年级6班', headTeachers: '连佳巍,皮春燕' },
    { id: '20280621', name: '俞文博', englishName: 'Kevin', gender: '男', adminClass: '十年级6班', headTeachers: '连佳巍,皮春燕' },
    { id: '20280725', name: '张滢涓', englishName: 'Joanna', gender: '女', adminClass: '十年级7班', headTeachers: '施昱兆,唐婧怡' },
  ]
  await seedClass('高2025级生物3班', 'A-level 生物 G10', '刘鹏、Vincent', 2025, g10Students)

  console.log('Seeding completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })