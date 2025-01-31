#!/bin/bash

# Add shadcn components one by one
components=(
  "button"
  "dialog"
  "alert"
  "select"
  "navigation-menu"
  "progress"
  "radio-group"
  "label"
  "card"
  "input"
  "textarea"
  "tabs"
  "badge"
  "scroll-area"
  "accordion"
  "tooltip"
  "toggle"
)

for component in "${components[@]}"; do
  echo "Installing $component..."
  echo 'y' | npx shadcn-ui@latest add "$component"
done