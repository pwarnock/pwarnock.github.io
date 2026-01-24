#!/bin/bash

# Cody Framework Backup Script
# Creates timestamped backup of .cody directory for emergency access protocol

set -e

BACKUP_DIR=".cody.backup.$(date +%Y%m%d_%H%M%S)"
LOG_FILE="cody-backup.log"

echo "$(date): Starting .cody backup to $BACKUP_DIR" | tee -a "$LOG_FILE"

if [ ! -d ".cody" ]; then
    echo "ERROR: .cody directory not found!" | tee -a "$LOG_FILE"
    exit 1
fi

# Create backup
cp -r .cody "$BACKUP_DIR"

# Verify backup
if [ -d "$BACKUP_DIR" ] && [ "$(ls -A .cody)" = "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
    echo "$(date): Backup successful - $BACKUP_DIR created" | tee -a "$LOG_FILE"
    echo "Backup location: $BACKUP_DIR" | tee -a "$LOG_FILE"
    echo "Log saved to: $LOG_FILE" | tee -a "$LOG_FILE"
else
    echo "ERROR: Backup verification failed!" | tee -a "$LOG_FILE"
    exit 1
fi

echo "Remember: This backup is for emergency access only. Do not modify .cody files directly."
