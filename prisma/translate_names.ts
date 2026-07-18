import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const dictionary: Record<string, string> = {
  "तनमय पाण्डेय": "Tanmay Pandey",
  "रवि ठाकुर": "Ravi Thakur",
  "हृदय सिंह": "Harday Singh",
  "प्रदीप कुमार सिंह": "Pradeep Kumar Singh",
  "दुर्गा राम": "Durga Ram",
  "लक्ष्मण": "Laxman",
  "बबलू सिंह": "Bablu Singh",
  "छत्रपाल सिंह": "Chhatrapal Singh",
  "सुनील": "Sunil",
  "संतोष": "Santosh",
  "कोशिल्या साहू": "Koshilya Sahu",
  "संगीता साहू": "Sangita Sahu",
  "आरती": "Aarti",
  "सूरजलाल साहू": "Surajlal Sahu",
  "मनोज कुमार सिंह": "Manoj Kumar Singh",
  "दिनेश कुमार साहू": "Dinesh Kumar Sahu",
  "राजा बाबू": "Raja Babu",
  "परम देव सिंह गोंड": "Param Dev Singh Gond",
  "धर्मेन्द्र कुजूर": "Dharmendra Kujur",
  "कुमारी अमृता": "Kumari Amrita",
  "रामगोपाल": "Ramgopal",
  "राजेन्द्र बसवार": "Rajendra Baswar",
  "सुन्दर कुजूर": "Sundar Kujur",
  "चरण": "Charan",
  "सहेलाल बघेल": "Sahelal Baghel",
  "अशोक कुजूर": "Ashok Kujur",
  "हीरा सिंह": "Heera Singh",
  "मंगलाल": "Manglal",
  "अमन श्रीवास्तव": "Aman Srivastava",
  "श्रीकांत पैंकरा": "Shrikant Paikra",
  "बालक": "Balak",
  "संतोष कुमार": "Santosh Kumar",
  "जगत प्रसाद": "Jagat Prasad",
  "चरण सिंह": "Charan Singh",
  "प्यार सिंह": "Pyar Singh",
  "भुवेश प्रताप सिंह": "Bhuvesh Pratap Singh",
  "साधु चरण": "Sadhu Charan",
  "रामप्रसाद सिंह": "Ramprasad Singh",
  "सामेलिया": "Sameliya",
  "जयवीर": "Jaiveer",
  "सपना राम": "Sapna Ram",
  "पबुके राम": "Pabuke Ram",
  "मान सिंह": "Maan Singh",
  "प्रभात राजवाड़े": "Prabhat Rajwade",
  "रामकुमार": "Ramkumar",
  "रणजीत कुमार": "Ranjeet Kumar",
  "मानवती": "Manwati",
  "ओमप्रकाश": "Omprakash",
  "श्यामलाल": "Shyamlal"
}

async function run() {
  const customers = await prisma.customer.findMany()
  
  let updatedCount = 0
  for (const c of customers) {
    if (dictionary[c.name]) {
      const englishName = dictionary[c.name]
      // Format as "English Name (Hindi Name)"
      const newName = `${englishName} (${c.name})`
      
      await prisma.customer.update({
        where: { id: c.id },
        data: { name: newName }
      })
      console.log(`Updated: ${c.name} -> ${newName}`)
      updatedCount++
    }
  }
  console.log(`Successfully translated ${updatedCount} customers!`)
}

run().catch(console.error).finally(() => prisma.$disconnect())
