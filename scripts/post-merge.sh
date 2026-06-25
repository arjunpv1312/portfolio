#!/bin/bash

uv sync
UV_EXIT=$?

if [ -z "$GITHUB_PAT" ]; then
    echo "GITHUB_PAT not set, skipping GitHub sync"
    exit $UV_EXIT
fi

# Add remote if it doesn't exist, otherwise update its URL
if git remote get-url github > /dev/null 2>&1; then
    git remote set-url github https://github.com/arjunpv1312/portfolio.git
else
    git remote add github https://github.com/arjunpv1312/portfolio.git
fi

git -c credential.helper='!f() { echo "username=arjunpv1312"; echo "password=${GITHUB_PAT}"; }; f' \
    push github HEAD:main --force

PUSH_EXIT=$?

if [ $UV_EXIT -ne 0 ]; then
    echo "Warning: uv sync failed (exit $UV_EXIT)"
    exit $UV_EXIT
fi

exit $PUSH_EXIT
