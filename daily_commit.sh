#!/bin/bash

LOGFILE="/Users/Hp/Desktop/capstoneApp/FaunaAPP/daily_commit.log"

{
  echo "Script started at $(date)"

  # List of directories and files to commit day by day
  FILES=(
    "App/assets"
    "App/components"
    "App/config"
    "App/constants"
    "App/helper"
    "App/hooks"
    "App/screens"
    "App/util"
    "axios.js"
    "index.js"
  )

  # Calculate the index for today based on the date
  TODAY_INDEX=$(($(date +%d) % ${#FILES[@]}))

  # Get the file or directory to add and commit today
  FILE_TO_ADD=${FILES[$TODAY_INDEX]}

  cd /Users/Hp/Desktop/capstoneApp/FaunaAPP || { echo "Failed to change directory"; exit 1; }

  # Add the specific file or directory
  git add "$FILE_TO_ADD" && echo "Added $FILE_TO_ADD"
  
  # Ensure all changes are staged including untracked files
  git add -A && echo "Added all changes"

  # Commit the changes if any
  git commit -m "Daily commit for $FILE_TO_ADD" && echo "Committed $FILE_TO_ADD"

  # Push the changes to the repository
  git push -u origin dev && echo "Pushed to origin dev"

  echo "Script ended at $(date)"
} >> "$LOGFILE" 2>&1
