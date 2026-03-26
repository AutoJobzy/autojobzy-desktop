/**
 * ======================== SKILLS ROUTES ========================
 * Manage user skills with ratings and experience
 */

import express from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import Skill from '../models/Skill.js';
import { authenticateToken } from '../middleware/auth.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

/**
 * GET /api/skills
 * Get all skills for the logged-in user
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const skills = await Skill.findAll({
            where: { userId: req.userId },
            order: [['createdAt', 'ASC']],
        });

        res.json({ skills });
    } catch (error) {
        console.error('Fetch skills error:', error);
        res.status(500).json({ error: 'Failed to fetch skills' });
    }
});

/**
 * POST /api/skills
 * Create or update a skill for the logged-in user
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { skillName, displayName, rating, outOf, experience } = req.body;

        if (!skillName) {
            return res.status(400).json({ error: 'Skill name is required' });
        }

        // Find or create skill
        const [skill, created] = await Skill.findOrCreate({
            where: {
                userId: req.userId,
                skillName: skillName.toLowerCase(),
            },
            defaults: {
                userId: req.userId,
                skillName: skillName.toLowerCase(),
                displayName: displayName || skillName,
                rating: rating || 0,
                outOf: outOf || 5,
                experience: experience || '0 years',
            },
        });

        // If not created, update existing
        if (!created) {
            await skill.update({
                displayName: displayName || skill.displayName,
                rating: rating !== undefined ? rating : skill.rating,
                outOf: outOf !== undefined ? outOf : skill.outOf,
                experience: experience || skill.experience,
            });
        }

        res.json({
            message: created ? 'Skill created successfully' : 'Skill updated successfully',
            skill,
        });
    } catch (error) {
        console.error('Create/Update skill error:', error);
        res.status(500).json({ error: 'Failed to save skill' });
    }
});

/**
 * POST /api/skills/bulk
 * Create or update multiple skills at once
 */
router.post('/bulk', authenticateToken, async (req, res) => {
    try {
        const { skills } = req.body;

        if (!Array.isArray(skills)) {
            return res.status(400).json({ error: 'Skills must be an array' });
        }

        const records = skills
            .filter(s => s.skillName)
            .map(s => ({
                userId: req.userId,
                skillName: s.skillName.toLowerCase(),
                displayName: s.displayName || s.skillName,
                rating: s.rating || 0,
                outOf: s.outOf || 5,
                experience: s.experience || '0 years',
            }));

        if (records.length === 0) {
            return res.json({ message: '0 skills saved', skills: [] });
        }

        // 1 DB call — INSERT ... ON DUPLICATE KEY UPDATE
        await Skill.bulkCreate(records, {
            updateOnDuplicate: ['displayName', 'rating', 'outOf', 'experience'],
        });

        // 1 DB call — fetch saved list to return
        const savedSkills = await Skill.findAll({ where: { userId: req.userId } });

        res.json({
            message: `${records.length} skills saved successfully`,
            skills: savedSkills,
        });
    } catch (error) {
        console.error('Bulk save skills error:', error);
        res.status(500).json({ error: 'Failed to save skills' });
    }
});

/**
 * GET /api/skills/template
 * Download XLSX template with 223 demo skills
 * Columns: Sr No | Skill Name | Rating | Out Of | Experience
 */
router.get('/template', authenticateToken, (req, res) => {
    const demoSkills = [
        // Programming Languages
        'Java', 'Python', 'JavaScript', 'TypeScript', 'C', 'C++', 'C#', 'Go', 'Rust', 'Kotlin',
        'Swift', 'Ruby', 'PHP', 'Scala', 'R', 'MATLAB', 'Perl', 'Dart', 'Elixir', 'Haskell',
        'Lua', 'Julia', 'Groovy', 'Objective-C', 'Shell Scripting', 'Bash', 'PowerShell',

        // Web Frontend
        'React', 'Angular', 'Vue.js', 'Next.js', 'Nuxt.js', 'Svelte', 'HTML5', 'CSS3',
        'SASS/SCSS', 'Tailwind CSS', 'Bootstrap', 'Material UI', 'jQuery', 'Redux', 'Webpack',
        'Vite', 'Babel', 'GraphQL', 'REST API', 'WebSockets',

        // Web Backend
        'Node.js', 'Express.js', 'Spring Boot', 'Spring MVC', 'Django', 'Flask', 'FastAPI',
        'Laravel', 'Ruby on Rails', 'ASP.NET Core', 'NestJS', 'Gin', 'Fiber', 'Hibernate',
        'JPA', 'MyBatis', 'Sequelize', 'Prisma', 'Mongoose',

        // Databases
        'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle DB', 'Microsoft SQL Server',
        'Cassandra', 'DynamoDB', 'Elasticsearch', 'CouchDB', 'Neo4j', 'InfluxDB', 'MariaDB',
        'Supabase', 'Firebase Firestore',

        // Cloud & DevOps
        'AWS', 'Azure', 'Google Cloud Platform', 'Docker', 'Kubernetes', 'Terraform', 'Ansible',
        'Jenkins', 'GitHub Actions', 'GitLab CI/CD', 'CircleCI', 'Helm', 'Prometheus', 'Grafana',
        'Nginx', 'Apache', 'Linux', 'Ubuntu', 'CentOS', 'CloudFormation', 'Pulumi',

        // Version Control & Collaboration
        'Git', 'GitHub', 'GitLab', 'Bitbucket', 'JIRA', 'Confluence', 'Trello', 'Slack',
        'Postman', 'Swagger', 'OpenAPI',

        // Testing
        'JUnit', 'TestNG', 'Mockito', 'Jest', 'Mocha', 'Chai', 'Cypress', 'Selenium',
        'Playwright', 'Pytest', 'Cucumber', 'Appium', 'K6', 'JMeter', 'SonarQube',

        // Mobile
        'Android Development', 'iOS Development', 'React Native', 'Flutter', 'Ionic',
        'Xamarin', 'Expo', 'Swift UI', 'Jetpack Compose', 'Kotlin Multiplatform',

        // AI / ML / Data
        'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Keras',
        'Pandas', 'NumPy', 'Matplotlib', 'OpenCV', 'NLP', 'LangChain', 'Hugging Face',
        'Data Analysis', 'Data Visualization', 'Power BI', 'Tableau', 'Apache Spark',
        'Apache Kafka', 'Airflow', 'dbt', 'Snowflake', 'BigQuery',

        // Security
        'OAuth2', 'JWT', 'SSL/TLS', 'OWASP', 'Penetration Testing', 'Network Security',
        'Cryptography', 'SIEM', 'IAM', 'Zero Trust Architecture',

        // Architecture & Patterns
        'Microservices', 'Monolithic Architecture', 'Event-Driven Architecture', 'CQRS',
        'Domain-Driven Design', 'Design Patterns', 'SOLID Principles', 'Clean Architecture',
        'System Design', 'API Gateway', 'Service Mesh', 'gRPC', 'Message Queue',
        'RabbitMQ', 'Apache ActiveMQ',

        // ERP / CRM / Enterprise
        'SAP', 'Salesforce', 'ServiceNow', 'Workday', 'Oracle ERP', 'Microsoft Dynamics',
        'HubSpot', 'Zoho CRM',

        // Other Tools & Platforms
        'Figma', 'Adobe XD', 'Photoshop', 'Linux Administration', 'Vim', 'VS Code',
        'IntelliJ IDEA', 'Eclipse', 'Xcode', 'Android Studio', 'Jupyter Notebook',
        'Databricks', 'Vercel', 'Netlify', 'Heroku', 'Cloudflare',

        // Agile / Management
        'Agile', 'Scrum', 'Kanban', 'SAFe', 'DevOps', 'SRE', 'Technical Documentation',
        'Code Review', 'Mentoring', 'Problem Solving', 'Technical Writing', 'CI/CD Pipelines',
    ];

    const ratings = [3.0, 3.5, 4.0, 4.5, 5.0];
    const experiences = ['6 months', '1 year', '1.5 years', '2 years', '2.5 years', '3 years', '3.5 years', '4 years', '5 years'];

    const templateData = demoSkills.map((skill, i) => ({
        'Sr No': i + 1,
        'Skill Name': skill,
        'Rating': ratings[i % ratings.length],
        'Out Of': 5,
        'Experience': experiences[i % experiences.length],
    }));

    const ws = XLSX.utils.json_to_sheet(templateData);
    ws['!cols'] = [{ wch: 8 }, { wch: 30 }, { wch: 10 }, { wch: 8 }, { wch: 15 }];

    // Bold header row styling
    const headerRange = XLSX.utils.decode_range(ws['!ref']);
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddr = XLSX.utils.encode_cell({ r: 0, c: col });
        if (ws[cellAddr]) {
            ws[cellAddr].s = { font: { bold: true } };
        }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Skills');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=skills_template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
});

/**
 * POST /api/skills/import
 * Import skills from uploaded XLSX file
 */
router.post('/import', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        if (rows.length === 0) {
            return res.status(400).json({ error: 'XLSX file is empty or has no data rows' });
        }

        const records = rows
            .map(row => ({
                skillName: (row['Skill Name'] || '').toString().trim().toLowerCase(),
                displayName: (row['Skill Name'] || '').toString().trim(),
                rating: parseFloat(row['Rating']) || 0,
                outOf: parseInt(row['Out Of']) || 5,
                experience: (row['Experience'] || '0 years').toString().trim(),
            }))
            .filter(r => r.skillName)
            .map(r => ({ ...r, userId: req.userId }));

        if (records.length === 0) {
            return res.status(400).json({ error: 'No valid skill rows found in file' });
        }

        // 1 DB call — INSERT ... ON DUPLICATE KEY UPDATE
        await Skill.bulkCreate(records, {
            updateOnDuplicate: ['displayName', 'rating', 'outOf', 'experience'],
        });

        // 1 DB call — fetch saved list to return
        const savedSkills = await Skill.findAll({ where: { userId: req.userId } });

        res.json({
            message: `${records.length} skills imported successfully`,
            skills: savedSkills,
        });
    } catch (error) {
        console.error('Import skills error:', error);
        res.status(500).json({ error: 'Failed to import skills' });
    }
});

/**
 * PUT /api/skills/:skillId
 * Update an existing skill
 */
router.put('/:skillId', authenticateToken, async (req, res) => {
    try {
        const { skillId } = req.params;
        const { skillName, displayName, rating, outOf, experience } = req.body;

        // Find skill and verify ownership
        const skill = await Skill.findOne({
            where: {
                id: skillId,
                userId: req.userId,
            },
        });

        if (!skill) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        // Update skill
        await skill.update({
            skillName: skillName ? skillName.toLowerCase() : skill.skillName,
            displayName: displayName || skill.displayName,
            rating: rating !== undefined ? parseFloat(rating) : skill.rating,
            outOf: outOf !== undefined ? parseInt(outOf) : skill.outOf,
            experience: experience !== undefined ? experience : skill.experience,
        });

        res.json({
            message: 'Skill updated successfully',
            skill,
        });
    } catch (error) {
        console.error('Update skill error:', error);
        res.status(500).json({ error: 'Failed to update skill' });
    }
});

/**
 * DELETE /api/skills/:skillId
 * Delete a specific skill
 */
router.delete('/:skillId', authenticateToken, async (req, res) => {
    try {
        const { skillId } = req.params;

        const skill = await Skill.findOne({
            where: {
                id: skillId,
                userId: req.userId,
            },
        });

        if (!skill) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        await skill.destroy();

        res.json({ message: 'Skill deleted successfully' });
    } catch (error) {
        console.error('Delete skill error:', error);
        res.status(500).json({ error: 'Failed to delete skill' });
    }
});

/**
 * DELETE /api/skills
 * Delete all skills for the user
 */
router.delete('/', authenticateToken, async (req, res) => {
    try {
        await Skill.destroy({
            where: { userId: req.userId },
        });

        res.json({ message: 'All skills deleted successfully' });
    } catch (error) {
        console.error('Delete all skills error:', error);
        res.status(500).json({ error: 'Failed to delete skills' });
    }
});

export default router;
