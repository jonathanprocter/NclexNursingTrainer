#!/bin/bash
set -e

echo "Removing files created by the setup script..."

# Remove the practice questions data file
if [ -f server/data/practice-questions.ts ]; then
  rm server/data/practice-questions.ts
  echo "Removed server/data/practice-questions.ts"
else
  echo "server/data/practice-questions.ts not found."
fi

# Remove the questions route file
if [ -f server/routes/questions.ts ]; then
  rm server/routes/questions.ts
  echo "Removed server/routes/questions.ts"
else
  echo "server/routes/questions.ts not found."
fi

# Remove the QuestionBank page file
if [ -f client/src/pages/QuestionBank.tsx ]; then
  rm client/src/pages/QuestionBank.tsx
  echo "Removed client/src/pages/QuestionBank.tsx"
else
  echo "client/src/pages/QuestionBank.tsx not found."
fi

echo "Undo process complete. Please restore any previous versions from your version control if needed."
