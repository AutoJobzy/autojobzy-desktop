# Filter Options Guide

## Overview

The `filter_options` table stores all available filter options from Naukri.com API. These filters are used to build the job search interface and allow users to refine their job searches.

## Database Schema

```sql
CREATE TABLE filter_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filter_type ENUM(...) NOT NULL,
    option_id VARCHAR(50) NOT NULL,
    label VARCHAR(255) NOT NULL,
    count INT DEFAULT 0,
    url VARCHAR(500) NULL,
    sort_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    UNIQUE KEY (filter_type, option_id),
    INDEX (filter_type)
);
```

## Filter Types

| Filter Type | Description | Example Values |
|------------|-------------|----------------|
| `salaryRange` | Salary range options | 0-3 Lakhs, 3-6 Lakhs, 10-15 Lakhs |
| `wfhType` | Work from home type | Work from office, Hybrid, Remote |
| `topGroupId` | Top company groups | Accenture, Wipro, Infosys, IBM |
| `stipend` | Internship stipend ranges | Unpaid, 0-10k, 10k-20k |
| `employement` | Employment type | Company Jobs, Consultant Jobs |
| `featuredCompanies` | Featured companies with URLs | Fiserv, Opentext, Tech Mahindra |
| `business_size` | Company size category | Foreign MNC, Corporate, Startup |
| `citiesGid` | City options | Pune, Bengaluru, Hyderabad, Delhi |
| `functionalAreaGid` | Functional areas | Engineering - Software & QA, IT Security |
| `internshipDuration` | Internship duration | 1 Month, 3 Months, 6 Months |
| `ugCourseGid` | Undergraduate courses | BCA, B.Tech/B.E., B.Sc |
| `glbl_RoleCat` | Global role categories | Software Development, DevOps, QA |
| `pgCourseGid` | Postgraduate courses | MCA, M.Tech, MBA/PGDM |
| `industryTypeGid` | Industry types | IT Services, Banking, Healthcare |

## Seeding Filter Options

### Initial Seed

Run the seeder script to populate the filter_options table:

```bash
node server/db/seedFilterOptions.js
```

This will insert all 147 filter options across 14 different filter types.

### Output

```
========================================================================
                    SEEDING FILTER OPTIONS
========================================================================

✅ Database connection established

📂 Processing salaryRange...
   ✅ Processed 10 options

📂 Processing wfhType...
   ✅ Processed 4 options

... (continues for all filter types)

========================================================================
✅ SEEDING COMPLETE
   Total inserted: 147
   Total updated: 0
========================================================================
```

## Updating Filter Options

The seeder script uses `findOrCreate` which makes it safe to run multiple times:
- **First run**: Inserts new records
- **Subsequent runs**: Updates existing records with latest counts and labels

To update filter options with fresh data from Naukri API:

1. Update the `filterData` object in [seedFilterOptions.js](seedFilterOptions.js)
2. Run the seeder script again: `node server/db/seedFilterOptions.js`

## Database Queries

### Get all options for a specific filter type

```sql
SELECT option_id, label, count
FROM filter_options
WHERE filter_type = 'salaryRange'
  AND is_active = 1
ORDER BY sort_order;
```

### Get top 10 cities by job count

```sql
SELECT option_id, label, count
FROM filter_options
WHERE filter_type = 'citiesGid'
  AND is_active = 1
ORDER BY count DESC
LIMIT 10;
```

### Get all featured companies with URLs

```sql
SELECT option_id, label, url
FROM filter_options
WHERE filter_type = 'featuredCompanies'
  AND url IS NOT NULL
ORDER BY count DESC;
```

## API Integration

### Fetching Filters for Frontend

Create an API endpoint to fetch filters by type:

```javascript
// GET /api/filters/:filterType
router.get('/filters/:filterType', async (req, res) => {
    const { filterType } = req.params;

    const options = await FilterOption.findAll({
        where: {
            filterType: filterType,
            isActive: true
        },
        order: [['sortOrder', 'ASC']],
        attributes: ['optionId', 'label', 'count', 'url']
    });

    res.json(options);
});
```

### Response Format

```json
{
  "salaryRange": [
    { "optionId": "0to3", "label": "0-3 Lakhs", "count": 7789 },
    { "optionId": "3to6", "label": "3-6 Lakhs", "count": 38767 },
    ...
  ]
}
```

## Maintenance

### Adding New Filter Types

1. **Update Migration**: Add new ENUM value to `004_add_filter_types.sql`
2. **Update Model**: Add ENUM value to [FilterOption.js](../models/FilterOption.js)
3. **Update Seeder**: Add filter data to `filterData` object in [seedFilterOptions.js](seedFilterOptions.js)
4. **Run Migration**: `mysql -u root -p < 004_add_filter_types.sql`
5. **Run Seeder**: `node server/db/seedFilterOptions.js`

### Deactivating Options

Instead of deleting, mark options as inactive:

```sql
UPDATE filter_options
SET is_active = 0
WHERE filter_type = 'citiesGid' AND option_id = '323';
```

### Cleanup Old Data

To remove all filters and reseed fresh data:

```sql
TRUNCATE TABLE filter_options;
```

Then run the seeder script again.

## Statistics

Current filter options count:

| Filter Type | Count |
|------------|-------|
| salaryRange | 10 |
| wfhType | 4 |
| topGroupId | 15 |
| stipend | 5 |
| employement | 2 |
| featuredCompanies | 7 |
| business_size | 7 |
| citiesGid | 25 |
| functionalAreaGid | 15 |
| internshipDuration | 7 |
| ugCourseGid | 13 |
| glbl_RoleCat | 10 |
| pgCourseGid | 12 |
| industryTypeGid | 15 |
| **Total** | **147** |

## Related Files

- Migration: [004_add_filter_types.sql](migrations/004_add_filter_types.sql)
- Model: [FilterOption.js](../models/FilterOption.js)
- Seeder: [seedFilterOptions.js](seedFilterOptions.js)
- Main README: [migrations/README.md](migrations/README.md)
