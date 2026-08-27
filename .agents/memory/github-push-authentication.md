---
name: GitHub push authentication
description: Safe recovery when the repository's stored GitHub credential is rejected during a push.
---

When the GitHub remote rejects its stored credential, push through a temporary `GIT_ASKPASS` helper that reads the workspace-managed GitHub secret without putting the token in the remote URL, shell output, or a persistent Git config.

**Why:** The repository can retain an expired or invalid credential even while a current workspace GitHub secret is available. Embedding a replacement token in a URL risks leaking it into shell history, logs, or Git configuration.

**How to apply:** Keep the remote URL credential-free, provide `x-access-token` as the username, read `GITHUB_PAT` (falling back to `GITHUB_TOKEN`) only inside the temporary askpass process, and remove the helper immediately after the push.