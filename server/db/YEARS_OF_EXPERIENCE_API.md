# Years of Experience API Documentation

## Overview

The "Search Years of Experience" feature allows users to specify their years of experience for job search filtering, match score calculation, and automation logic. This value is stored persistently in the database and used across the system.

## Database Schema

### Column Details

```sql
years_of_experience TINYINT UNSIGNED NOT NULL DEFAULT 0
COMMENT 'Years of experience for job search filtering'
```

**Properties:**
- **Type**: `TINYINT UNSIGNED` (0-255)
- **Nullable**: NO
- **Default**: 0
- **Validation**: 0-50 (enforced at model and API level)
- **Purpose**: Job filtering, match calculation, automation

### Migration

**File**: [005_update_years_of_experience.sql](migrations/005_update_years_of_experience.sql)

**Changes**:
1. Converts existing VARCHAR(255) to TINYINT UNSIGNED
2. Cleans up invalid/non-numeric data
3. Sets NOT NULL with DEFAULT 0
4. Adds column comment

**Run Migration**:
```bash
mysql -u root -p jobautomate < server/db/migrations/005_update_years_of_experience.sql
```

## API Endpoints

### 1. Update Job Settings (Save Experience)

**Endpoint**: `POST /api/job-settings`

**Authentication**: Required (JWT token)

**Request Body**:
```json
{
  "yearsOfExperience": 5
}
```

**Validation Rules**:
- Must be an integer
- Range: 0-50
- No decimals allowed
- Cannot be negative

**Success Response** (200 OK):
```json
{
  "message": "Job settings updated successfully",
  "jobSettings": {
    "id": "uuid-here",
    "userId": "user-uuid",
    "yearsOfExperience": 5,
    "targetRole": "Software Engineer",
    "location": "Bengaluru",
    ...
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "Invalid years of experience",
  "message": "Years of experience must be a positive integer between 0 and 50"
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "error": "Failed to update job settings"
}
```

### 2. Get Job Settings (Load Experience)

**Endpoint**: `GET /api/job-settings`

**Authentication**: Required (JWT token)

**Success Response** (200 OK):
```json
{
  "id": "uuid-here",
  "userId": "user-uuid",
  "naukriEmail": "user@example.com",
  "targetRole": "Software Engineer",
  "location": "Bengaluru",
  "yearsOfExperience": 5,
  "maxPages": 5,
  "createdAt": "2025-12-20T10:00:00.000Z",
  "updatedAt": "2025-12-20T10:30:00.000Z"
}
```

**Error Response** (401 Unauthorized):
```json
{
  "error": "User session invalid. Please log out and log in again.",
  "code": "USER_NOT_FOUND"
}
```

## Frontend Integration

### State Management

**Initial State**:
```typescript
const [configForm, setConfigForm] = useState({
  yearsOfExperience: 0, // Default value
  // ... other fields
});
```

### UI Component

**Location**: Dashboard → Job Profile Settings → Automation Settings

```tsx
<div className="space-y-2">
  <label className="text-xs text-gray-400 uppercase font-bold">
    Search Years of Experience
  </label>
  <input
    type="number"
    min="0"
    max="50"
    step="1"
    value={configForm.yearsOfExperience ?? 0}
    onChange={(e) => {
      const value = parseInt(e.target.value);
      if (!isNaN(value) && value >= 0 && value <= 50) {
        setConfigForm({ ...configForm, yearsOfExperience: value });
      }
    }}
    className="w-full bg-dark-900 border border-gray-700 rounded-lg py-2.5 px-4 text-white text-sm focus:border-neon-blue outline-none"
    placeholder="0"
  />
  <p className="text-[10px] text-gray-500">
    Used for job filtering and match calculation
  </p>
</div>
```

### Loading Data (useEffect)

```typescript
useEffect(() => {
  loadJobSettings();
}, []);

const loadJobSettings = async () => {
  const result = await getJobSettings();
  if (result) {
    setConfigForm({
      ...configForm,
      yearsOfExperience: result.yearsOfExperience ?? 0
    });
  }
};
```

### Saving Data (Form Submit)

```typescript
const handleSaveConfig = async (e: React.FormEvent) => {
  e.preventDefault();

  const settingsData = {
    yearsOfExperience: configForm.yearsOfExperience ?? 0,
    // ... other fields
  };

  const result = await updateJobSettings(settingsData);

  if (result.success) {
    setSuccess('✅ Configuration saved!');
  } else {
    setError(result.error || 'Failed to save configuration');
  }
};
```

## Validation

### Frontend Validation

```typescript
// Input validation on change
const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = parseInt(e.target.value);

  // Validate: must be integer, 0-50
  if (!isNaN(value) && value >= 0 && value <= 50) {
    setConfigForm({ ...configForm, yearsOfExperience: value });
  } else {
    setError('Years of experience must be between 0 and 50');
  }
};
```

### Backend Validation

```javascript
// API route validation
if (yearsOfExperience !== undefined) {
  const experience = parseInt(yearsOfExperience);

  if (
    isNaN(experience) ||
    experience < 0 ||
    experience > 50 ||
    !Number.isInteger(parseFloat(yearsOfExperience))
  ) {
    return res.status(400).json({
      error: 'Invalid years of experience',
      message: 'Years of experience must be a positive integer between 0 and 50'
    });
  }
}
```

### Database Validation

```javascript
// Sequelize model validation
yearsOfExperience: {
  type: DataTypes.TINYINT.UNSIGNED,
  allowNull: false,
  defaultValue: 0,
  validate: {
    min: 0,
    max: 50,
    isInt: true,
  },
}
```

## Usage in Automation

### Job Filtering

The `yearsOfExperience` value is used to:
1. **Filter job listings** based on experience requirements
2. **Calculate match scores** (experience match = 1/0)
3. **Auto-select checkboxes** for experience-related filters

### Example Usage

```javascript
// In automation script
const jobSettings = await JobSettings.findOne({ where: { userId } });
const userExperience = jobSettings.yearsOfExperience; // e.g., 5

// Filter jobs
if (jobRequiredExperience <= userExperience) {
  // Apply to this job
  matchScore += 1;
}

// Calculate experience match
const experienceMatch = jobRequiredExperience <= userExperience ? 1 : 0;

// Auto-select filter
if (userExperience >= 3) {
  await page.click('input[value="3-5 years"]');
}
```

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 400 Bad Request | Invalid value (negative, decimal, >50) | Validate input on frontend |
| 401 Unauthorized | Invalid/expired token | Re-login required |
| 500 Internal Server Error | Database connection issue | Check server logs |

### Error Display

```typescript
// Display errors in UI
{error && (
  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
    <AlertCircle className="w-5 h-5" />
    {error}
  </div>
)}
```

## Testing

### Manual Testing

1. **Save Valid Value**:
   - Input: 5
   - Expected: Success message, value saved to DB

2. **Save Boundary Values**:
   - Input: 0 → Success
   - Input: 50 → Success
   - Input: 51 → Error (exceeds max)

3. **Save Invalid Values**:
   - Input: -1 → Error (negative)
   - Input: 5.5 → Error (decimal)
   - Input: "abc" → Error (not a number)

4. **Load After Save**:
   - Save value → Reload page → Verify pre-filled

### API Testing (cURL)

```bash
# Update years of experience
curl -X POST https://api.autojobzy.com/api/job-settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"yearsOfExperience": 5}'

# Get job settings
curl -X GET https://api.autojobzy.com/api/job-settings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Related Files

- **Migration**: [005_update_years_of_experience.sql](migrations/005_update_years_of_experience.sql)
- **Model**: [JobSettings.js](../models/JobSettings.js#L91-L101)
- **API Route**: [jobSettings.js](../routes/jobSettings.js#L169-L230)
- **Frontend**: [Dashboard.tsx](../../pages/Dashboard.tsx#L1277-L1295)

## Future Enhancements

1. **Experience Range**: Allow "3-5 years" instead of single value
2. **Auto-detect**: Parse from resume during upload
3. **Industry-specific**: Different experience for different industries
4. **Verification**: LinkedIn integration for verified experience
