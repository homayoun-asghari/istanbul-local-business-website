# studio-edit

## What a user can do when this is done

The operator opens `/studio`, signs in with one password, edits a business's Turkish
content in a form, publishes, and sees the change on the live demo.

## Acceptance criteria

- [ ] `/studio` and every route under it redirect to the sign-in page without a valid session
      cookie, and the public demo route stays reachable. — `vitest`
- [ ] The wrong password sets no session cookie; the right one sets an `HttpOnly`, `Secure`,
      `SameSite=Lax` cookie. The password is never compared with a plain `===`. — `vitest`
- [ ] The studio lists every site in the database with slug, pack, preset and status.
- [ ] Editing the business name, a service, an opening time or the WhatsApp message and
      pressing publish writes content that still validates against `SiteContentSchema`, and
      the demo page renders the new value. — `vitest`
- [ ] Content that fails validation is rejected with the offending field named, and nothing is
      written. — `vitest`
- [ ] Every publish appends the previous content to `site_versions`, so an edit can be undone.
      — `vitest`
- [ ] Sections carrying `placeholder: true` are badged in the studio as needing a real answer
      before handoff. — `vitest`
- [ ] `./scripts/check-boundary.sh` still exits 0 — the render layer never imports the studio.
- [ ] `./scripts/verify.sh` exits 0 with no database configured. — `./scripts/verify.sh`

## Out of scope

- Multi-user accounts, roles, password reset. One operator, one password.
- Creating a site from scratch — that arrives with `demo-from-lead`.
- Image upload. Images stay as URLs until eject downloads them.
- A rich text editor. Plain inputs and textareas.
