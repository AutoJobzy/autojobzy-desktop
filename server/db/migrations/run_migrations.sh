#!/bin/bash
# ========================================================================
# RUN ALL DATABASE MIGRATIONS
# ========================================================================
# Purpose: Execute all migration files in order
# Usage: ./run_migrations.sh [mysql_password]
# ========================================================================

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
DB_USER="root"
DB_PASSWORD="${1:-root@123}"  # Use provided password or default
MIGRATIONS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}========================================================================${NC}"
echo -e "${BLUE}                    DATABASE MIGRATION RUNNER                           ${NC}"
echo -e "${BLUE}========================================================================${NC}"
echo ""
echo -e "${YELLOW}Database User:${NC} $DB_USER"
echo -e "${YELLOW}Migrations Directory:${NC} $MIGRATIONS_DIR"
echo ""

# Check if MySQL is accessible
if ! mysql -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" &>/dev/null; then
    echo -e "${RED}❌ ERROR: Cannot connect to MySQL with provided credentials${NC}"
    echo -e "${YELLOW}Usage: ./run_migrations.sh [mysql_password]${NC}"
    exit 1
fi

echo -e "${GREEN}✅ MySQL connection successful${NC}"
echo ""

# Get all SQL migration files in order
MIGRATION_FILES=$(ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null | sort)

if [ -z "$MIGRATION_FILES" ]; then
    echo -e "${RED}❌ No migration files found in $MIGRATIONS_DIR${NC}"
    exit 1
fi

# Count migrations
TOTAL_MIGRATIONS=$(echo "$MIGRATION_FILES" | wc -l | tr -d ' ')
CURRENT=0

echo -e "${BLUE}Found $TOTAL_MIGRATIONS migration file(s) to execute${NC}"
echo ""

# Run each migration
for migration_file in $MIGRATION_FILES; do
    CURRENT=$((CURRENT + 1))
    FILENAME=$(basename "$migration_file")

    echo -e "${YELLOW}[$CURRENT/$TOTAL_MIGRATIONS] Running: $FILENAME${NC}"

    # Execute migration
    if mysql -u"$DB_USER" -p"$DB_PASSWORD" < "$migration_file"; then
        echo -e "${GREEN}  ✅ Success${NC}"
    else
        echo -e "${RED}  ❌ Failed to execute $FILENAME${NC}"
        echo -e "${RED}  Migration process stopped.${NC}"
        exit 1
    fi

    echo ""
done

echo -e "${BLUE}========================================================================${NC}"
echo -e "${GREEN}✅ ALL MIGRATIONS COMPLETED SUCCESSFULLY${NC}"
echo -e "${BLUE}========================================================================${NC}"
echo ""
echo -e "${YELLOW}Verification Commands:${NC}"
echo -e "  • Show all tables: ${GREEN}mysql -u$DB_USER -p$DB_PASSWORD jobautomate -e 'SHOW TABLES;'${NC}"
echo -e "  • Check constraints: ${GREEN}mysql -u$DB_USER -p$DB_PASSWORD jobautomate -e 'SELECT TABLE_NAME, CONSTRAINT_NAME FROM information_schema.table_constraints WHERE table_schema=\"jobautomate\";'${NC}"
echo ""
