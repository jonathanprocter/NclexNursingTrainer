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

###############################################################################
# 2. FIX: Drizzle 'json("..."); as <Type>' => 'json("...").$type<Type>()'
#    We use '@' as a sed delimiter to avoid conflicts with '/'.
#    We'll look for:
#       json("some_col"); as <...>
#    and change it to:
#       json("some_col").$type<...>()
#
#    This pass won't handle trailing commas or parentheses. We'll do that later.
###############################################################################
# Step 2A: Remove the semicolon between json(...) and 'as'
#          Then convert "as <Type>" => ".$type<Type>()"
sed -i \
  -e 's@\(\<json("[-A-Za-z0-9_]\+")\);[[:space:]]*as[[:space:]]*<@\1.$type<@g' \
  "$FILE"

# Step 2B: If there's a closing `>` with no `()` after it, add "()"
#          i.e., ".$type<SomeType>" => ".$type<SomeType>()"
sed -i \
  -e 's@\(\.\$type<[^>]*\)>\([^()]\)@\1>()\2@g' \
  "$FILE"

###############################################################################
# 3. FIX MISSING PARENTHESIS IN timestamp("...")
#    Some lines are missing the closing parenthesis, e.g.:
#      timestamp("some_column"
#    We'll just ensure there's a `)` before a period or comma or brace.
###############################################################################
sed -i \
  -e 's@\(\<timestamp("[-A-Za-z0-9_]\+"\)\)\([^)]\)@\1)\2@g' \
  "$FILE"

###############################################################################
# 4. FIX INDEX() CALLS
#    If we see .on(columnName) but should be .on(table.columnName),
#    we do a naive replacement:
#       .on(columnName) => .on(table.columnName)
###############################################################################
# Single-column usage
sed -i \
  -e 's@\.on(\([a-zA-Z_]\+\))@.on(table.\1)@g' \
  "$FILE"

# Two-column usage (like .on(type, table.orderIndex))
# which might need .on(table.type, table.orderIndex)
sed -i \
  -e 's@\.on(\([a-zA-Z_]\+\),[[:space:]]*table\.\([a-zA-Z_]\+\))@.on(table.\1, table.\2)@g' \
  "$FILE"

###############################################################################
# 5. REMOVE STRAY SEMICOLONS INSIDE OBJECT LITERALS
#    e.g. "aiGeneratedContent: json("xyz");.default(...)" => fix to "json("xyz").default(...)"
###############################################################################
sed -i \
  -e 's@\(\<json("[-A-Za-z0-9_]\+"\)\);\.\([a-zA-Z]\)@\1.\2@g' \
  -e 's@\(\<boolean("[-A-Za-z0-9_]\+"\)\);\.\([a-zA-Z]\)@\1.\2@g' \
  -e 's@\(\<integer("[-A-Za-z0-9_]\+"\)\);\.\([a-zA-Z]\)@\1.\2@g' \
  -e 's@\(\<text("[-A-Za-z0-9_]\+"\)\);\.\([a-zA-Z]\)@\1.\2@g' \
  "$FILE"

###############################################################################
# 6. TRY to ensure Drizzle table definitions close with a brace + parenthesis
#    If a line is just `}`, we might insert `);` after it. This is naive.
###############################################################################
# If we find a line that is exactly '}' then next line is not ');', we add it.
# We'll do it in two steps for safety.
# (A) Mark lines of just '}' with a placeholder
sed -i \
  -e '/^}[[:space:]]*$/ { s/^}$/}__CLOSE__/ }' \
  "$FILE"

# (B) Replace that placeholder with `});`
sed -i \
  -e 's/}__CLOSE__/}\n);/g' \
  "$FILE"

###############################################################################
# 7. FIX createInsertSchema(...) or createSelectSchema(...) if missing a `)`
###############################################################################
sed -i \
  -e 's@\(\<createInsertSchema\|createSelectSchema\)(\([a-zA-Z_]\+\)$@\1(\2)@g' \
  "$FILE"

###############################################################################
# DONE
###############################################################################
echo
echo "----------------------------------------------------------"
echo "Fixes applied to $FILE."
echo "Please review the code carefully and test your build again."
echo "A backup of the original file is saved to $backup."
echo "----------------------------------------------------------"