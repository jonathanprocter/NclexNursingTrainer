#!/usr/bin/env bash
# ---------------------------------------------------------
# fix_schema_backup.sh
#
# A simpler script to fix common Drizzle syntax mistakes in
# server/db/schema_backup.ts, especially if older 'sed'
# versions cause "Unmatched ( or \(" errors.
#
# Usage:
#   bash fix_schema_backup.sh
# ---------------------------------------------------------

set -e

FILE="server/db/schema_backup.ts"
if [ ! -f "$FILE" ]; then
  echo "Error: $FILE not found. Exiting."
  exit 1
fi

# 1. Backup the original file
timestamp=$(date +%s)
backup="schema_backup_${timestamp}.bak"
cp "$FILE" "$backup"
echo "Backup created: $backup"

# Fix json type assertions
sed -i 's/json(\([^)]*\));/json(\1)/g' "$FILE"

# Fix timestamp defaults
sed -i 's/timestamp(\([^)]*\));/timestamp(\1)/g' "$FILE"

# Fix type assertions
sed -i 's/\$type</as </g' "$FILE"

# Fix table definitions
sed -i 's/}$/});/g' "$FILE"

# Fix missing parentheses
sed -i 's/createInsertSchema(\([^)]*\)$/createInsertSchema(\1)/g' "$FILE"
sed -i 's/createSelectSchema(\([^)]*\)$/createSelectSchema(\1)/g' "$FILE"

echo
echo "----------------------------------------------------------"
echo "Fixes applied to $FILE."
echo "Please review the code carefully and test your build again."
echo "A backup of the original file is saved to $backup."
echo "----------------------------------------------------------"