#!/bin/bash

# PM2 Agent Integration Script
# Handles PM2 process management with agent awareness

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PIDS_DIR="$PROJECT_ROOT/.pids"

# Ensure .pids directory exists
mkdir -p "$PIDS_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" >&2
}

# Check if PM2 is installed
check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        error "PM2 is not installed. Please install it with: npm install -g pm2"
        exit 1
    fi
}

# Start Hugo dev server with PM2
start_dev_server() {
    log "Starting Hugo dev server with PM2..."
    cd "$PROJECT_ROOT"

    # Stop any existing process
    pm2 stop hugo-dev 2>/dev/null || true
    pm2 delete hugo-dev 2>/dev/null || true

    # Start new process
    pm2 start ecosystem.config.cjs

    # Save PM2 list
    pm2 save

    log "Hugo dev server started successfully"
    log "PM2 process list:"
    pm2 list
}

# Stop Hugo dev server
stop_dev_server() {
    log "Stopping Hugo dev server..."
    cd "$PROJECT_ROOT"

    pm2 stop hugo-dev 2>/dev/null || warn "No hugo-dev process found"
    pm2 delete hugo-dev 2>/dev/null || warn "No hugo-dev process to delete"
    pm2 save

    log "Hugo dev server stopped"
}

# Restart Hugo dev server
restart_dev_server() {
    log "Restarting Hugo dev server..."
    stop_dev_server
    sleep 2
    start_dev_server
}

# Show status
show_status() {
    log "PM2 Process Status:"
    cd "$PROJECT_ROOT"
    pm2 list

    if [ -f "$PIDS_DIR/hugo-dev-0.pid" ]; then
        log "PID file exists: $(cat "$PIDS_DIR/hugo-dev-0.pid")"
    else
        warn "No PID file found"
    fi
}

# Show logs
show_logs() {
    log "Showing PM2 logs (press Ctrl+C to exit):"
    cd "$PROJECT_ROOT"
    pm2 logs hugo-dev
}

# Agent awareness - signal that agent is working
agent_signal() {
    local message="$1"
    log "AGENT_SIGNAL: $message"
    echo "$(date +'%Y-%m-%d %H:%M:%S') - AGENT_SIGNAL: $message" >> "$PIDS_DIR/agent-aware.log"
}

# Main script logic
case "${1:-}" in
    "start")
        check_pm2
        agent_signal "Starting development server"
        start_dev_server
        ;;
    "stop")
        check_pm2
        agent_signal "Stopping development server"
        stop_dev_server
        ;;
    "restart")
        check_pm2
        agent_signal "Restarting development server"
        restart_dev_server
        ;;
    "status")
        check_pm2
        show_status
        ;;
    "logs")
        check_pm2
        show_logs
        ;;
    "agent-signal")
        agent_signal "${2:-Agent working}"
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|agent-signal [message]}"
        echo ""
        echo "Commands:"
        echo "  start           Start Hugo dev server with PM2"
        echo "  stop            Stop Hugo dev server"
        echo "  restart         Restart Hugo dev server"
        echo "  status          Show PM2 process status"
        echo "  logs            Show PM2 logs"
        echo "  agent-signal    Signal agent activity (with optional message)"
        exit 1
        ;;
esac
