/**
 * ========================================================================
 * SEED FILTER OPTIONS
 * ========================================================================
 * Populates the filter_options table with Naukri.com filter data
 *
 * Usage: node server/db/seedFilterOptions.js
 * ========================================================================
 */

import FilterOption from '../models/FilterOption.js';
import sequelize from './config.js';

// Filter data from Naukri API
const filterData = {
    salaryRange: [
        { id: "0to3", count: 7789, label: "0-3 Lakhs" },
        { id: "3to6", count: 38767, label: "3-6 Lakhs" },
        { id: "6to10", count: 45916, label: "6-10 Lakhs" },
        { id: "10to15", count: 22046, label: "10-15 Lakhs" },
        { id: "15to25", count: 10895, label: "15-25 Lakhs" },
        { id: "25to50", count: 6635, label: "25-50 Lakhs" },
        { id: "50to75", count: 594, label: "50-75 Lakhs" },
        { id: "75to100", count: 118, label: "75-100 Lakhs" },
        { id: "100to500", count: 37, label: "1-5 Cr" },
        { id: "501", count: 2, label: "5+ Cr" }
    ],
    wfhType: [
        { id: "0", count: 66389, label: "Work from office" },
        { id: "3", count: 2647, label: "Hybrid" },
        { id: "2", count: 2176, label: "Remote" },
        { id: "1", count: 3, label: "Temp. WFH due to covid" }
    ],
    topGroupId: [
        { id: "10476", count: 11216, label: "Accenture" },
        { id: "41608", count: 797, label: "Wipro" },
        { id: "13832", count: 740, label: "Infosys" },
        { id: "19288", count: 626, label: "IBM" },
        { id: "223346", count: 566, label: "Tata Consultancy Services" },
        { id: "1186200", count: 476, label: "Virtusa" },
        { id: "4619011", count: 406, label: "Photon" },
        { id: "1288", count: 355, label: "Capgemini" },
        { id: "243080", count: 275, label: "EY" },
        { id: "224154", count: 264, label: "Deloitte Consulting" },
        { id: "468918", count: 236, label: "Deutsche Bank" },
        { id: "2978732", count: 190, label: "Altimetrik" },
        { id: "18850", count: 174, label: "Oracle" },
        { id: "12466", count: 165, label: "Hexaware Technologies" },
        { id: "4156", count: 151, label: "Cognizant" }
    ],
    stipend: [
        { id: "unpaid", count: 710, label: "Unpaid" },
        { id: "0To10", count: 37, label: "0-10k" },
        { id: "10To20", count: 24, label: "10k-20k" },
        { id: "20To30", count: 9, label: "20k-30k" },
        { id: "50To1", count: 1, label: "50k and above" }
    ],
    employement: [
        { id: "1", count: 64878, label: "Company Jobs" },
        { id: "2", count: 6337, label: "Consultant Jobs" }
    ],
    featuredCompanies: [
        { id: "29679", count: 1, label: "Fiserv", url: "/job-listings-lead-java-developer-fiserv-chennai-bengaluru-9-to-14-years-151225016776" },
        { id: "479215", count: 12, label: "Opentext", url: "/opentext-jobs-careers-479215?keyword=java+developer&src=fcc&companyId=479215" },
        { id: "100007", count: 25, label: "Tech Mahindra", url: "/tech-mahindra-jobs-careers-1066?keyword=java+developer&src=fcc&companyId=100007" },
        { id: "6762", count: 57, label: "Conduent", url: "/conduent-jobs-careers-6762?keyword=java+developer&src=fcc&companyId=6762" },
        { id: "1354", count: 384, label: "Virtusa", url: "/virtusa-jobs-careers-1354?keyword=java+developer&src=fcc&companyId=1354" },
        { id: "7053", count: 236, label: "Capgemini", url: "/capgemini-jobs-careers-649?keyword=java+developer&src=fcc&companyId=7053" },
        { id: "6344014", count: 2, label: "Kyndryl", url: "/kyndryl-jobs-careers-6344014?keyword=java+developer&src=fcc&companyId=6344014" }
    ],
    business_size: [
        { id: "213", count: 20822, label: "Foreign MNC" },
        { id: "211", count: 10417, label: "Corporate" },
        { id: "217", count: 4495, label: "Indian MNC" },
        { id: "62", count: 1709, label: "Startup" },
        { id: "63", count: 73, label: "Others" },
        { id: "215", count: 19, label: "Govt/PSU" },
        { id: "60", count: 17, label: "MNC" }
    ],
    citiesGid: [
        { id: "139", count: 9053, label: "Pune" },
        { id: "97", count: 20217, label: "Bengaluru" },
        { id: "17", count: 10856, label: "Hyderabad" },
        { id: "9508", count: 10440, label: "Delhi / NCR" },
        { id: "183", count: 7050, label: "Chennai" },
        { id: "9509", count: 6893, label: "Mumbai (All Areas)" },
        { id: "134", count: 5667, label: "Mumbai" },
        { id: "6", count: 3478, label: "New Delhi" },
        { id: "73", count: 3331, label: "Gurugram" },
        { id: "220", count: 3225, label: "Noida" },
        { id: "51", count: 2581, label: "Ahmedabad" },
        { id: "232", count: 2487, label: "Kolkata" },
        { id: "184", count: 1009, label: "Coimbatore" },
        { id: "173", count: 947, label: "Jaipur" },
        { id: "110", count: 910, label: "Kochi" },
        { id: "125", count: 888, label: "Indore" },
        { id: "138", count: 794, label: "Navi Mumbai" },
        { id: "64", count: 794, label: "Surat" },
        { id: "4", count: 748, label: "Chandigarh" },
        { id: "167", count: 682, label: "Mohali" },
        { id: "120", count: 468, label: "Thiruvananthapuram" },
        { id: "65", count: 457, label: "Vadodara" },
        { id: "136", count: 440, label: "Nagpur" },
        { id: "155", count: 372, label: "Bhubaneswar" },
        { id: "323", count: 340, label: "Thane" }
    ],
    functionalAreaGid: [
        { id: "5", count: 56706, label: "Engineering - Software & QA" },
        { id: "15", count: 3100, label: "UX, Design & Architecture" },
        { id: "8", count: 1516, label: "IT & Information Security" },
        { id: "9", count: 1294, label: "Marketing & Communication" },
        { id: "3", count: 1081, label: "Data Science & Analytics" },
        { id: "14", count: 882, label: "Sales & Business Development" },
        { id: "4", count: 712, label: "Engineering - Hardware & Networks" },
        { id: "37", count: 697, label: "Other" },
        { id: "19", count: 684, label: "Consulting" },
        { id: "2", count: 514, label: "Customer Success, Service & Operations" },
        { id: "11", count: 514, label: "Production, Manufacturing & Engineering" },
        { id: "12", count: 506, label: "Project & Program Management" },
        { id: "36", count: 464, label: "Teaching & Training" },
        { id: "6", count: 442, label: "Finance & Accounting" },
        { id: "20", count: 420, label: "Content, Editorial & Journalism" }
    ],
    internshipDuration: [
        { id: "1", count: 1, label: "1 Month" },
        { id: "2", count: 6, label: "2 Months" },
        { id: "3", count: 237, label: "3 Months" },
        { id: "4", count: 6, label: "4 Months" },
        { id: "5", count: 3, label: "5 Months" },
        { id: "6", count: 91, label: "6 Months" },
        { id: "-1", count: 437, label: "Flexible" }
    ],
    ugCourseGid: [
        { id: "4", count: 2106, label: "BCA" },
        { id: "9502", count: 44438, label: "Any Graduate" },
        { id: "12", count: 26601, label: "B.Tech/B.E." },
        { id: "11", count: 1947, label: "B.Sc" },
        { id: "15", count: 595, label: "Diploma" },
        { id: "5", count: 259, label: "B.B.A/ B.M.S" },
        { id: "9501", count: 251, label: "Graduation Not Required" },
        { id: "6", count: 214, label: "B.Com" },
        { id: "2", count: 131, label: "B.A" },
        { id: "13", count: 35, label: "LLB" },
        { id: "7", count: 27, label: "B.Ed" },
        { id: "8", count: 27, label: "BDS" },
        { id: "14", count: 23, label: "MBBS" }
    ],
    glbl_RoleCat: [
        { id: "1028", count: 50578, label: "Software Development" },
        { id: "1027", count: 3266, label: "Quality Assurance and Testing" },
        { id: "1072", count: 2223, label: "Other Design" },
        { id: "1025", count: 2109, label: "DBA / Data warehousing" },
        { id: "1048", count: 816, label: "Digital Marketing" },
        { id: "1071", count: 757, label: "UI / UX" },
        { id: "1026", count: 753, label: "DevOps" },
        { id: "1167", count: 697, label: "Other" },
        { id: "1045", count: 614, label: "IT & Information Security - Other" },
        { id: "1019", count: 485, label: "Data Science & Machine Learning" }
    ],
    pgCourseGid: [
        { id: "9511", count: 52777, label: "Any Postgraduate" },
        { id: "12", count: 4408, label: "M.Tech" },
        { id: "14", count: 3902, label: "MCA" },
        { id: "9510", count: 3791, label: "Post Graduation Not Required" },
        { id: "11", count: 1379, label: "MS/M.Sc(Science)" },
        { id: "13", count: 864, label: "MBA/PGDM" },
        { id: "1", count: 313, label: "CA" },
        { id: "5", count: 199, label: "LLM" },
        { id: "16", count: 118, label: "PG Diploma" },
        { id: "15", count: 90, label: "Medical-MS/MD" },
        { id: "8", count: 76, label: "M.Com" },
        { id: "18", count: 44, label: "MCM" }
    ],
    industryTypeGid: [
        { id: "183", count: 162, label: "Miscellaneous" },
        { id: "109", count: 47464, label: "IT Services & Consulting" },
        { id: "127", count: 3524, label: "Recruitment / Staffing" },
        { id: "110", count: 2950, label: "Software Product" },
        { id: "172", count: 1555, label: "Advertising & Marketing" },
        { id: "112", count: 1440, label: "Banking" },
        { id: "126", count: 1160, label: "Management Consulting" },
        { id: "133", count: 960, label: "Education / Training" },
        { id: "113", count: 951, label: "Financial Services" },
        { id: "108", count: 920, label: "Internet" },
        { id: "119", count: 716, label: "Accounting / Auditing" },
        { id: "102", count: 707, label: "BPM / BPO" },
        { id: "131", count: 652, label: "Medical Services / Hospital" },
        { id: "175", count: 451, label: "Film / Music / Entertainment" },
        { id: "156", count: 396, label: "Industrial Equipment / Machinery" }
    ]
};

async function seedFilterOptions() {
    console.log('\n========================================================================');
    console.log('                    SEEDING FILTER OPTIONS                             ');
    console.log('========================================================================\n');

    try {
        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Database connection established\n');

        let totalInserted = 0;
        let totalSkipped = 0;

        // Process each filter type
        for (const [filterType, options] of Object.entries(filterData)) {
            console.log(`📂 Processing ${filterType}...`);

            let sortOrder = 0;
            for (const option of options) {
                sortOrder++;

                try {
                    // Use upsert to handle existing records
                    const [record, created] = await FilterOption.findOrCreate({
                        where: {
                            filterType: filterType,
                            optionId: option.id
                        },
                        defaults: {
                            filterType: filterType,
                            optionId: option.id,
                            label: option.label,
                            count: option.count || 0,
                            url: option.url || null,
                            sortOrder: sortOrder,
                            isActive: true
                        }
                    });

                    if (created) {
                        totalInserted++;
                    } else {
                        // Update existing record
                        await record.update({
                            label: option.label,
                            count: option.count || 0,
                            url: option.url || null,
                            sortOrder: sortOrder
                        });
                        totalSkipped++;
                    }
                } catch (error) {
                    console.error(`   ❌ Failed to insert ${option.label}: ${error.message}`);
                }
            }

            console.log(`   ✅ Processed ${options.length} options\n`);
        }

        console.log('========================================================================');
        console.log(`✅ SEEDING COMPLETE`);
        console.log(`   Total inserted: ${totalInserted}`);
        console.log(`   Total updated: ${totalSkipped}`);
        console.log('========================================================================\n');

    } catch (error) {
        console.error('\n❌ SEEDING FAILED');
        console.error(`Error: ${error.message}\n`);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

// Run the seeder
seedFilterOptions();
