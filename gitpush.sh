#!/bin/bash

GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}Enter your commit message:${NC}"
read commit_msg

git add . && git commit -m "$commit_msg" && git push