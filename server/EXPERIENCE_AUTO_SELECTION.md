# Automatic Experience Selection in Naukri Search

## Overview

The automation now automatically selects the appropriate experience range in the Naukri.com search bar based on the `years_of_experience` value stored in the database. This eliminates the need for manual user input during the automation process.

## How It Works

### 1. **Database Integration**

After successful login, the automation fetches the user's `years_of_experience` from the `job_settings` table:

```javascript
const [jobSettings] = await sequelize.query(
    'SELECT years_of_experience FROM job_settings WHERE user_id = ? LIMIT 1',
    { replacements: [userId] }
);

yearsOfExperience = jobSettings[0].years_of_experience || 0;
```

### 2. **Experience Mapping**

The numeric value is automatically mapped to Naukri's dropdown options:

| Database Value | Dropdown Selection |
|---------------|-------------------|
| 0 years | 0-1 Yrs |
| 1-2 years | 1-3 Yrs |
| 3-4 years | 3-5 Yrs |
| 5-6 years | 5-7 Yrs |
| 7-9 years | 7-10 Yrs |
| 10-14 years | 10-15 Yrs |
| 15-19 years | 15-20 Yrs |
| 20+ years | 20+ Yrs |

**Mapping Function:**
```javascript
function mapExperienceToOption(years) {
    if (years === 0) return '0-1 Yrs';
    if (years >= 1 && years < 3) return '1-3 Yrs';
    if (years >= 3 && years < 5) return '3-5 Yrs';
    if (years >= 5 && years < 7) return '5-7 Yrs';
    if (years >= 7 && years < 10) return '7-10 Yrs';
    if (years >= 10 && years < 15) return '10-15 Yrs';
    if (years >= 15 && years < 20) return '15-20 Yrs';
    if (years >= 20) return '20+ Yrs';
    return null;
}
```

### 3. **Automatic Selection**

On the first job search page, the automation:

1. ✅ Waits for the experience dropdown (`#experienceDD`)
2. ✅ Clicks to open the dropdown
3. ✅ Retrieves all available options
4. ✅ Finds and clicks the matching option
5. ✅ Waits for the page to refresh with the filter applied

**Code Implementation:**
```javascript
async function selectExperienceSearchBox(page, yearsOfExperience) {
    const experienceText = mapExperienceToOption(yearsOfExperience);

    if (!experienceText) {
        addLog(`Skipping experience selection (invalid value)`, 'warning');
        return;
    }

    // Open dropdown
    await page.waitForSelector("#experienceDD", { timeout: 5000 });
    await page.click("#experienceDD");
    await delay(1500);

    // Get options
    const options = await page.$$eval(
        ".dropdownPrimary li",
        lis => lis.map(li => li.innerText.trim())
    );

    // Select matching option
    await page.evaluate(text => {
        const li = Array.from(document.querySelectorAll(".dropdownPrimary li"))
            .find(el => el.innerText.trim() === text);
        if (li) li.click();
    }, experienceText);

    addLog(`Experience '${experienceText}' selected successfully`, 'success');
}
```

### 4. **Automation Flow**

```
┌─────────────────────┐
│   Login to Naukri   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────┐
│ Fetch years_of_experience   │
│ from job_settings table     │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Navigate to job search page │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Auto-select experience      │
│ in search bar dropdown      │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Wait for page refresh       │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Process job listings        │
└─────────────────────────────┘
```

## Automation Logs

The feature provides detailed logging at each step:

```
[10:30:15] INFO: Fetched years of experience from database: 5
[10:30:18] INFO: Opening Page 1/10: https://www.naukri.com/...
[10:30:21] INFO: Attempting to select experience in search bar...
[10:30:22] INFO: Opening Experience dropdown in search bar...
[10:30:23] INFO: Available experience options: 0-1 Yrs, 1-3 Yrs, 3-5 Yrs, 5-7 Yrs, ...
[10:30:24] SUCCESS: Auto-selecting experience: 5-7 Yrs (5 years)
[10:30:25] SUCCESS: Experience '5-7 Yrs' selected successfully
```

## Error Handling

### Scenario 1: Dropdown Not Found
```
WARNING: Experience selection failed: Timeout waiting for #experienceDD
```
**Cause**: Search page layout changed or dropdown not present
**Impact**: Automation continues without experience filter

### Scenario 2: Invalid Experience Value
```
WARNING: Skipping experience selection (invalid value: -1)
```
**Cause**: Negative or null value in database
**Impact**: No experience filter applied

### Scenario 3: Option Not Found
```
WARNING: Experience option '25+ Yrs' not found in dropdown
```
**Cause**: Requested option doesn't exist in Naukri's dropdown
**Impact**: No experience filter applied

## Configuration

### Set Years of Experience

1. **Via UI** (Dashboard → Job Profile → Automation Settings):
   - Field: "Search Years of Experience"
   - Range: 0-50
   - Saved to `job_settings.years_of_experience`

2. **Via API**:
   ```bash
   curl -X POST https://api.autojobzy.com/api/job-settings \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"yearsOfExperience": 5}'
   ```

3. **Via Database**:
   ```sql
   UPDATE job_settings
   SET years_of_experience = 5
   WHERE user_id = 'user-uuid';
   ```

## Timing

The experience selection occurs **only on the first page** of the job search:

```javascript
if (currentPage === 1 && yearsOfExperience >= 0) {
    await selectExperienceSearchBox(page, yearsOfExperience);
    await delay(2000); // Wait for page to refresh
}
```

**Why only on the first page?**
- Once selected, the filter persists in the URL
- Subsequent pages inherit the filter automatically
- Reduces automation time and page load overhead

## Benefits

✅ **No User Interaction** - Fully automated, no prompts or manual input
✅ **Database-Driven** - Uses persistent user preference
✅ **Intelligent Mapping** - Automatically maps numeric value to ranges
✅ **Error Resilient** - Continues automation even if selection fails
✅ **Detailed Logging** - Clear visibility into selection process
✅ **Efficient** - Only runs once on first page

## Implementation Files

| File | Description |
|------|-------------|
| [autoApply.js:87-101](../autoApply.js#L87-L101) | Experience mapping function |
| [autoApply.js:108-159](../autoApply.js#L108-L159) | Auto-selection function |
| [autoApply.js:722-740](../autoApply.js#L722-L740) | Database fetch logic |
| [autoApply.js:761-766](../autoApply.js#L761-L766) | Function call in automation flow |

## Testing

### Manual Test
1. Set `years_of_experience = 5` in job_settings
2. Run automation
3. Verify "5-7 Yrs" is auto-selected in search bar
4. Verify logs show successful selection

### Expected Behavior
```
Database: years_of_experience = 5
↓
Mapping: 5 years → "5-7 Yrs"
↓
Selection: Dropdown opens → "5-7 Yrs" clicked
↓
Result: Jobs filtered by 5-7 years experience
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Experience not selected | Check if `#experienceDD` selector is correct |
| Wrong range selected | Verify mapping logic in `mapExperienceToOption()` |
| Dropdown empty | Naukri page structure may have changed |
| Timeout error | Increase wait time in `waitForSelector()` |

## Future Enhancements

1. **Custom Range Input** - Allow "3-5 years" instead of single value
2. **Multiple Experience Filters** - Different experience for different roles
3. **Smart Retry** - Retry selection if initial attempt fails
4. **Dropdown Detection** - Auto-detect available options and adapt
