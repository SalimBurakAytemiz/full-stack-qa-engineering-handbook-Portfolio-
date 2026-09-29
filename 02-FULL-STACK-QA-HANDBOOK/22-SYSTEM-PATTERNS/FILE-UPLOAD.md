# Pattern: File Upload

## How it works

A client sends binary/file content (an image, a document) to the
server, typically via `multipart/form-data`, and the server validates,
stores, and references it (directly, or via a pre-signed URL to
object storage).

## Why systems use it

Any feature involving user-provided media or documents — a profile
photo, a receipt, a product image — needs this pattern; it's a
different data shape and risk profile from a JSON API body.

## Status in this repository

**Not implemented.** `QA-DEMO-SYSTEM`'s API surface is entirely
JSON-in/JSON-out (verified against `QA-DEMO-SYSTEM/backend/src/app.js`'s
route registration) — no multipart/file-upload endpoint exists.
Product images, where referenced at all in the frontend, are static
assets, not user-uploaded content.

## QA risks (in a system that DOES implement it)

- **File-type validation bypass**: checking only the file *extension*
  (`.jpg`) rather than the actual content (magic bytes/MIME sniffing)
  lets a malicious file masquerade as an image — a real, common
  vulnerability class.
- **Size-limit enforcement**: an unbounded upload size is a
  denial-of-service vector (disk/memory exhaustion), the file-upload
  analog of `RATE-LIMITING.md`'s and `PAGINATION.md`'s unbounded-input
  risks.
- **Partial/interrupted upload handling**: does a connection drop
  mid-upload leave a corrupt, partially-written file the system later
  tries to serve?
- **Path traversal via filename**: a filename like `../../etc/passwd`
  reaching a naive file-save call is a real, severe vulnerability if
  the filename isn't sanitized before use in a filesystem path.
- **Virus/malware scanning gap**: user-uploaded content is a real
  attack vector for hosting malicious files that get served back to
  other users.

## Test Strategy

**Positive:** valid file, at/under size limit, correct type. **Negative:**
oversized file, wrong/spoofed file type (a `.exe` renamed to `.jpg`),
empty file, malformed multipart request. **Edge:** exactly-at-limit
file size, a filename containing path-traversal characters, concurrent
uploads to the same logical resource (does the second overwrite the
first, or is that rejected?).

## Security Implications

This is one of the highest-severity patterns in this list precisely
because it accepts arbitrary binary content from untrusted clients —
content-type validation, size limits, and storage isolation (uploaded
content should never be served from a path that could execute it) are
non-negotiable, not nice-to-haves.

## Performance Implications

Large-file upload/download needs streaming handling (not buffering the
entire file in memory) to avoid the same resource-exhaustion risk as
an unbounded search or list response.

## Related Domains

Insurance (claim document upload), Streaming (thumbnail/media asset
upload), Mobile/Multi-Country (profile photo, localized asset upload).
