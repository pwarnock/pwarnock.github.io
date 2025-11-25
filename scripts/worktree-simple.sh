#!/bin/bash

# Simple Parallel Worktrees Development Script
# Fixed version that works with current PM2 setup

set -euo pipefail

# Configuration
MAIN_REPO_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKTREES_DIR="$MAIN_REPO_PATH/.worktrees"

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
Simple Parallel Worktrees Development Script

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

# Get port for worktree
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
        *) echo "3000" ;;
    esac
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
    
    echo -e "${BLUE}Starting development server for '$worktree' on port $app_port${NC}"
    
    # Change to worktree directory and start Hugo server
    cd "$worktree_path"
    hugo server --buildDrafts --buildFuture --disableFastRender --port "$app_port" --config config/development/hugo.toml,hugo.toml &
    
    local hugo_pid=$!
    echo $hugo_pid > "$worktree_path/.hugo-dev.pid"
    
    echo -e "${GREEN}✓ Development server started for '$worktree'${NC}"
    echo -e "${BLUE}📍 URL: http://localhost:$app_port${NC}"
    echo -e "${BLUE}🔄 PID: $hugo_pid${NC}"
    echo -e "${BLUE}🛑 Stop: $0 stop $worktree${NC}"
}

# Stop development server for worktree
stop_worktree() {
    local worktree="$1"
    
    if [[ -z "$worktree" ]]; then
        echo -e "${RED}Error: Worktree name required${NC}"
        show_help
        exit 1
    fi
    
    local worktree_path="$WORKTREES_DIR/$worktree"
    local pid_file="$worktree_path/.hugo-dev.pid"
    
    echo -e "${YELLOW}Stopping development server for '$worktree'${NC}"
    
    if [[ -f "$pid_file" ]]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            echo -e "${GREEN}✓ Stopped Hugo server (PID: $pid)${NC}"
        else
            echo -e "${YELLOW}⚠ Hugo server not running (PID: $pid)${NC}"
        fi
        rm -f "$pid_file"
    else
        echo -e "${YELLOW}⚠ No PID file found for '$worktree'${NC}"
    fi
}

# Show status of all worktree servers
show_status() {
    echo -e "${BLUE}Worktree Development Servers Status:${NC}"
    echo ""
    
    if [[ -d "$WORKTREES_DIR" ]]; then
        for worktree in "$WORKTREES_DIR"/*; do
            if [[ -d "$worktree" ]]; then
                local name=$(basename "$worktree")
                local worktree_path="$WORKTREES_DIR/$name"
                local pid_file="$worktree_path/.hugo-dev.pid"
                local port=$(get_port_for_worktree "$name")
                
                if [[ -f "$pid_file" ]]; then
                    local pid=$(cat "$pid_file")
                    if kill -0 "$pid" 2>/dev/null; then
                        echo -e "  ${GREEN}●${NC} $name - Running on http://localhost:$port (PID: $pid)"
                    else
                        echo -e "  ${YELLOW}○${NC} $name - Stopped (port $port) - Stale PID file"
                        rm -f "$pid_file"
                    fi
                else
                    echo -e "  ${GRAY}○${NC} $name - Not running (port $port)"
                fi
            fi
        done
    else
        echo -e "${YELLOW}No worktrees directory found${NC}"
    fi
}

# Stop all worktree servers
stop_all() {
    echo -e "${YELLOW}Stopping all worktree development servers...${NC}"
    
    if [[ -d "$WORKTREES_DIR" ]]; then
        for worktree in "$WORKTREES_DIR"/*; do
            if [[ -d "$worktree" ]]; then
                local name=$(basename "$worktree")
                stop_worktree "$name"
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