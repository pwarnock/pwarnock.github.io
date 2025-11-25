#!/bin/bash

# Parallel Worktrees Development Script
# Enables previewing and testing on different ports for multiple worktrees

set -euo pipefail

# Configuration
MAIN_REPO_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKTREES_DIR="$MAIN_REPO_PATH/.worktrees"
DEFAULT_BASE_PORT=3000

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# Help function
show_help() {
    cat << EOF
Parallel Worktrees Development Script

USAGE:
    $0 [COMMAND] [OPTIONS]

COMMANDS:
    start [worktree] [port]    Start development server for specific worktree
    stop [worktree]             Stop development server for specific worktree  
    status                       Show status of all worktree servers
    stop-all                     Stop all running worktree servers
    list                         List available worktrees
    help                         Show this help message

EXAMPLES:
    $0 start opencode-dev 1313   Start opencode-dev on port 1313
    $0 start letta-dev 1314      Start letta-dev on port 1314
    $0 status                    Show all running servers
    $0 stop-all                  Stop all servers

PORT ALLOCATION:
    - opencode-dev: 1313 (default)
    - letta-dev: 1314
    - letta-dev-2: 1315
    - main: 1316
    - staging: 1317
    - production: 1318

EOF
}

# List available worktrees
list_worktrees() {
    echo -e "${BLUE}Available worktrees:${NC}"
    if [[ -d "$WORKTREES_DIR" ]]; then
        for worktree in "$WORKTREES_DIR"/*; do
            if [[ -d "$worktree" ]]; then
                name=$(basename "$worktree")
                echo -e "  ${GREEN}$name${NC}"
            fi
        done
    else
        echo -e "${YELLOW}No worktrees directory found${NC}"
    fi
}

# Get port for worktree (with defaults)
get_port_for_worktree() {
    local worktree="$1"
    local custom_port="${2:-}"
    
    if [[ -n "$custom_port" ]]; then
        echo "$custom_port"
        return
    fi
    
    case "$worktree" in
        "opencode-dev") echo "1313" ;;
        "letta-dev") echo "1314" ;;
        "letta-dev-2") echo "1315" ;;
        "main") echo "1316" ;;
        "staging") echo "1317" ;;
        "production") echo "1318" ;;
        *) echo "$DEFAULT_BASE_PORT" ;;
    esac
}

# Get PM2 app name for worktree
get_pm2_app_name() {
    local worktree=$1
    echo "hugo-${worktree}"
}

# Start development server for worktree
start_worktree() {
    local worktree="$1"
    local port="$2"
    
    if [[ -z "$worktree" ]]; then
        echo -e "${RED}Error: Worktree name required${NC}"
        show_help
        exit 1
    fi
    
    local worktree_path="$WORKTREES_DIR/$worktree"
    if [[ ! -d "$worktree_path" ]]; then
        echo -e "${RED}Error: Worktree '$worktree' not found at $worktree_path${NC}"
        exit 1
    fi
    
    local app_port=$(get_port_for_worktree "$worktree" "$port")
    local app_name=$(get_pm2_app_name "$worktree")
    
    echo -e "${BLUE}Starting development server for '$worktree' on port $app_port${NC}"
    
    # Create temporary ecosystem config for this worktree
    local temp_ecosystem="$worktree_path/ecosystem-temp.cjs"
    cat > "$temp_ecosystem" << EOF
module.exports = {
  apps: [
    {
      name: '$app_name',
      script: 'hugo',
      args: [
        'server',
        '--buildDrafts',
        '--buildFuture', 
        '--disableFastRender',
        '--port', '$app_port',
        '--config', 'config/development/hugo.toml,hugo.toml',
      ],
      cwd: '$worktree_path',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        HUGO_ENV: 'development',
      },
      error_file: '$worktree_path/.pids/$app_name-error-0.log',
      out_file: '$worktree_path/.pids/$app_name-out-0.log',
      log_file: '$worktree_path/.pids/$app_name.log',
      time: true,
    },
  ],
};
EOF
    
    # Ensure .pids directory exists
    mkdir -p "$worktree_path/.pids"
    
    # Start the server
    cd "$worktree_path"
    pm2 start "$temp_ecosystem"
    
    echo -e "${GREEN}✓ Development server started for '$worktree'${NC}"
    echo -e "${BLUE}📍 URL: http://localhost:$app_port${NC}"
    echo -e "${BLUE}📊 PM2 status: pm2 status $app_name${NC}"
    echo -e "${BLUE}📋 Logs: pm2 logs $app_name${NC}"
}

# Stop development server for worktree
stop_worktree() {
    local worktree="$1"
    
    if [[ -z "$worktree" ]]; then
        echo -e "${RED}Error: Worktree name required${NC}"
        show_help
        exit 1
    fi
    
    local app_name=$(get_pm2_app_name "$worktree")
    local worktree_path="$WORKTREES_DIR/$worktree"
    local temp_ecosystem="$worktree_path/ecosystem-temp.cjs"
    
    echo -e "${YELLOW}Stopping development server for '$worktree'${NC}"
    
    # Stop the PM2 app
    pm2 stop "$app_name" 2>/dev/null || true
    pm2 delete "$app_name" 2>/dev/null || true
    
    # Clean up temporary ecosystem file
    rm -f "$temp_ecosystem"
    
    echo -e "${GREEN}✓ Development server stopped for '$worktree'${NC}"
}

# Show status of all worktree servers
show_status() {
    echo -e "${BLUE}Worktree Development Servers Status:${NC}"
    echo ""
    
    # Get all PM2 processes
    local pm2_list
    pm2_list=$(pm2 list 2>/dev/null || echo "")
    
    if [[ -d "$WORKTREES_DIR" ]]; then
        for worktree in "$WORKTREES_DIR"/*; do
            if [[ -d "$worktree" ]]; then
                local name=$(basename "$worktree")
                local app_name=$(get_pm2_app_name "$name")
                
                # Check if PM2 app is running
                if echo "$pm2_list" | grep -q "hugo-$name"; then
                    local status=$(echo "$pm2_list" | grep "hugo-$name" | grep -o "online\|stopped\|errored" | head -1)
                    local status=$(echo "$pm2_list" | grep "$app_name" | grep -o "online\|stopped\|errored" | head -1)
                    local port=$(get_port_for_worktree "$name")
                    
                    case "$status" in
                        "online")
                            echo -e "  ${GREEN}●${NC} $name - Running on http://localhost:$port"
                            ;;
                        "stopped")
                            echo -e "  ${YELLOW}○${NC} $name - Stopped (port $port)"
                            ;;
                        "errored")
                            echo -e "  ${RED}✗${NC} $name - Error (port $port)"
                            ;;
                        *)
                            echo -e "  ${YELLOW}?${NC} $name - Unknown status (port $port)"
                            ;;
                    esac
                else
                    local port=$(get_port_for_worktree "$name")
                    echo -e "  ${GRAY}○${NC} $name - Not running (port $port)"
                fi
            fi
        done
    else
        echo -e "${YELLOW}No worktrees directory found${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}PM2 Dashboard:${NC} pm2 monit"
    echo -e "${BLUE}All PM2 processes:${NC} pm2 list"
}

# Stop all worktree servers
stop_all() {
    echo -e "${YELLOW}Stopping all worktree development servers...${NC}"
    
    if [[ -d "$WORKTREES_DIR" ]]; then
        for worktree in "$WORKTREES_DIR"/*; do
            if [[ -d "$worktree" ]]; then
                local name=$(basename "$worktree")
                local app_name=$(get_pm2_app_name "$name")
                
                # Stop and delete PM2 app
                pm2 stop "$app_name" 2>/dev/null || true
                pm2 delete "$app_name" 2>/dev/null || true
                
                # Clean up temporary ecosystem file
                local worktree_path="$WORKTREES_DIR/$name"
                local temp_ecosystem="$worktree_path/ecosystem-temp.cjs"
                rm -f "$temp_ecosystem"
                
                echo -e "${GREEN}✓ Stopped $name${NC}"
            fi
        done
    fi
    
    echo -e "${GREEN}✓ All worktree servers stopped${NC}"
}

# Main command handling
case "${1:-}" in
    "start")
        start_worktree "${2:-}" "${3:-}"
        ;;
    "stop")
        stop_worktree "${2:-}"
        ;;
    "status")
        show_status
        ;;
    "stop-all")
        stop_all
        ;;
    "list")
        list_worktrees
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    "")
        echo -e "${RED}Error: Command required${NC}"
        show_help
        exit 1
        ;;
    *)
        echo -e "${RED}Error: Unknown command '$1'${NC}"
        show_help
        exit 1
        ;;
esac