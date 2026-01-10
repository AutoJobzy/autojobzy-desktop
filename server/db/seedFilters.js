/**
 * ======================== SEED FILTERS ========================
 * Run this script to populate filter_options table with all Naukri filters
 * Usage: node server/db/seedFilters.js
 */

import sequelize from './config.js';
import FilterOption from '../models/FilterOption.js';

const filterData = {
    salaryRange: [
        { id: "0to3", label: "0-3 Lakhs", count: 1998 },
        { id: "3to6", label: "3-6 Lakhs", count: 5805 },
        { id: "6to10", label: "6-10 Lakhs", count: 4185 },
        { id: "10to15", label: "10-15 Lakhs", count: 631 },
        { id: "15to25", label: "15-25 Lakhs", count: 237 },
        { id: "25to50", label: "25-50 Lakhs", count: 127 },
        { id: "50to75", label: "50-75 Lakhs", count: 8 },
        { id: "75to100", label: "75-100 Lakhs", count: 1 },
        { id: "100to500", label: "1-5 Cr", count: 1 },
    ],

    wfhType: [
        { id: "0", label: "Work from office", count: 6577 },
        { id: "2", label: "Remote", count: 185 },
        { id: "3", label: "Hybrid", count: 37 },
    ],

    topGroupId: [
        { id: "10476", label: "Accenture", count: 876 },
        { id: "41608", label: "Wipro", count: 36 },
        { id: "18850", label: "Oracle", count: 33 },
        { id: "1186200", label: "Virtusa", count: 18 },
        { id: "320980", label: "Sodexo", count: 17 },
        { id: "530892", label: "Goldman Sachs", count: 13 },
        { id: "869714", label: "Marriott", count: 13 },
        { id: "231614", label: "Zensar", count: 11 },
        { id: "82242", label: "AMERICAN EXPRESS", count: 11 },
        { id: "1595582", label: "ZS", count: 10 },
        { id: "8483159", label: "PwC Service Delivery Center", count: 10 },
        { id: "115024", label: "Metlife", count: 8 },
        { id: "445608", label: "Apple", count: 8 },
        { id: "9558", label: "Nagarro", count: 8 },
        { id: "224154", label: "Deloitte Consulting", count: 7 },
    ],

    employement: [
        { id: "1", label: "Company Jobs", count: 6437 },
        { id: "2", label: "Consultant Jobs", count: 362 },
    ],

    featuredCompanies: [
        { id: "6762", label: "Conduent", count: 4, url: "/conduent-jobs-careers-6762?keyword=java&src=fcc&experience=1&companyId=6762" },
        { id: "93084", label: "The Hackett Group", count: 2, url: "/the-hackett-group-jobs-careers-93084?keyword=java&src=fcc&experience=1&companyId=93084" },
        { id: "1354", label: "Virtusa", count: 7, url: "/virtusa-jobs-careers-1354?keyword=java&src=fcc&experience=1&companyId=1354" },
        { id: "7053", label: "Capgemini", count: 3, url: "/capgemini-jobs-careers-649?keyword=java&src=fcc&experience=1&companyId=7053" },
    ],

    business_size: [
        { id: "213", label: "Foreign MNC", count: 1443 },
        { id: "211", label: "Corporate", count: 828 },
        { id: "62", label: "Startup", count: 171 },
        { id: "217", label: "Indian MNC", count: 128 },
        { id: "63", label: "Others", count: 3 },
        { id: "60", label: "MNC", count: 1 },
        { id: "215", label: "Govt/PSU", count: 1 },
    ],

    citiesGid: [
        { id: "97", label: "Bengaluru", count: 1871 },
        { id: "17", label: "Hyderabad", count: 1087 },
        { id: "9508", label: "Delhi / NCR", count: 972 },
        { id: "183", label: "Chennai", count: 784 },
        { id: "139", label: "Pune", count: 672 },
        { id: "9509", label: "Mumbai (All Areas)", count: 553 },
        { id: "134", label: "Mumbai", count: 506 },
        { id: "6", label: "New Delhi", count: 322 },
        { id: "220", label: "Noida", count: 298 },
        { id: "73", label: "Gurugram", count: 287 },
        { id: "51", label: "Ahmedabad", count: 260 },
        { id: "232", label: "Kolkata", count: 213 },
        { id: "125", label: "Indore", count: 137 },
        { id: "173", label: "Jaipur", count: 132 },
        { id: "64", label: "Surat", count: 114 },
        { id: "184", label: "Coimbatore", count: 92 },
        { id: "167", label: "Mohali", count: 86 },
        { id: "110", label: "Kochi", count: 75 },
        { id: "4", label: "Chandigarh", count: 70 },
        { id: "65", label: "Vadodara", count: 51 },
        { id: "136", label: "Nagpur", count: 44 },
        { id: "216", label: "Lucknow", count: 44 },
        { id: "63", label: "Rajkot", count: 41 },
        { id: "138", label: "Navi Mumbai", count: 40 },
        { id: "323", label: "Thane", count: 33 },
    ],

    functionalAreaGid: [
        { id: "5", label: "Engineering - Software & QA", count: 5449 },
        { id: "36", label: "Teaching & Training", count: 218 },
        { id: "3", label: "Data Science & Analytics", count: 145 },
        { id: "8", label: "IT & Information Security", count: 142 },
        { id: "24", label: "Food, Beverage & Hospitality", count: 109 },
        { id: "15", label: "UX, Design & Architecture", count: 101 },
        { id: "4", label: "Engineering - Hardware & Networks", count: 90 },
        { id: "2", label: "Customer Success, Service & Operations", count: 74 },
        { id: "37", label: "Other", count: 57 },
        { id: "7", label: "Human Resources", count: 55 },
        { id: "14", label: "Sales & Business Development", count: 47 },
        { id: "11", label: "Production, Manufacturing & Engineering", count: 42 },
        { id: "19", label: "Consulting", count: 40 },
        { id: "25", label: "Healthcare & Life Sciences", count: 38 },
        { id: "9", label: "Marketing & Communication", count: 34 },
    ],

    ugCourseGid: [
        { id: "9502", label: "Any Graduate", count: 4740 },
        { id: "12", label: "B.Tech/B.E.", count: 2039 },
        { id: "4", label: "BCA", count: 204 },
        { id: "11", label: "B.Sc", count: 182 },
        { id: "15", label: "Diploma", count: 56 },
        { id: "6", label: "B.Com", count: 24 },
        { id: "9501", label: "Graduation Not Required", count: 18 },
        { id: "5", label: "B.B.A/ B.M.S", count: 16 },
        { id: "2", label: "B.A", count: 12 },
        { id: "7", label: "B.Ed", count: 7 },
        { id: "3", label: "B.Arch", count: 6 },
        { id: "13", label: "LLB", count: 6 },
        { id: "52", label: "Bachelor of Science (B.Sc.) in Business Economics", count: 5 },
    ],

    glbl_RoleCat: [
        { id: "1028", label: "Software Development", count: 4516 },
        { id: "1027", label: "Quality Assurance and Testing", count: 634 },
        { id: "1025", label: "DBA / Data warehousing", count: 248 },
        { id: "1072", label: "Other Design", count: 89 },
        { id: "1019", label: "Data Science & Machine Learning", count: 87 },
        { id: "1044", label: "IT Support", count: 76 },
        { id: "1164", label: "Subject / Specialization Teacher", count: 72 },
        { id: "1022", label: "IT Network", count: 66 },
        { id: "1167", label: "Other", count: 57 },
        { id: "1026", label: "DevOps", count: 51 },
    ],

    pgCourseGid: [
        { id: "9511", label: "Any Postgraduate", count: 5128 },
        { id: "9510", label: "Post Graduation Not Required", count: 395 },
        { id: "12", label: "M.Tech", count: 384 },
        { id: "14", label: "MCA", count: 380 },
        { id: "11", label: "MS/M.Sc(Science)", count: 117 },
        { id: "5", label: "LLM", count: 32 },
        { id: "13", label: "MBA/PGDM", count: 31 },
        { id: "1", label: "CA", count: 12 },
        { id: "16", label: "PG Diploma", count: 11 },
        { id: "15", label: "Medical-MS/MD", count: 8 },
        { id: "8", label: "M.Com", count: 3 },
        { id: "10", label: "M.Pharma", count: 3 },
    ],

    industryTypeGid: [
        { id: "109", label: "IT Services & Consulting", count: 4402 },
        { id: "110", label: "Software Product", count: 296 },
        { id: "133", label: "Education / Training", count: 289 },
        { id: "127", label: "Recruitment / Staffing", count: 228 },
        { id: "108", label: "Internet", count: 137 },
        { id: "113", label: "Financial Services", count: 134 },
        { id: "172", label: "Advertising & Marketing", count: 130 },
        { id: "126", label: "Management Consulting", count: 116 },
        { id: "143", label: "Hotels & Restaurants", count: 106 },
        { id: "131", label: "Medical Services / Hospital", count: 73 },
        { id: "112", label: "Banking", count: 69 },
        { id: "134", label: "E-Learning / EdTech", count: 53 },
        { id: "102", label: "BPM / BPO", count: 52 },
        { id: "115", label: "Insurance", count: 36 },
        { id: "175", label: "Film / Music / Entertainment", count: 35 },
    ],
};

async function seedFilters() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connected!\n');

        // Sync the model (create table if not exists)
        await FilterOption.sync({ alter: true });
        console.log('FilterOption table ready.\n');

        let totalSeeded = 0;

        for (const [filterType, options] of Object.entries(filterData)) {
            console.log(`Seeding ${filterType}...`);

            for (let i = 0; i < options.length; i++) {
                const opt = options[i];
                await FilterOption.upsert({
                    filterType,
                    optionId: opt.id,
                    label: opt.label,
                    count: opt.count || 0,
                    url: opt.url || null,
                    sortOrder: i,
                    isActive: true,
                });
                totalSeeded++;
            }

            console.log(`  ✓ ${options.length} options added`);
        }

        console.log(`\n✅ Successfully seeded ${totalSeeded} filter options!`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding filters:', error);
        process.exit(1);
    }
}

seedFilters();
