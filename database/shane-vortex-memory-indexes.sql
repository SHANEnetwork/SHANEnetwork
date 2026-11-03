-- Vortex retrieval indexes. Apply only after shane-fractal-memory.sql to SHANE.
-- These indexes improve retrieval without changing or pruning original turns.
create index if not exists shane_memory_turns_owner_recent_idx
 on public.shane_memory_turns(owner_id,endeavor_id,turn_number desc);
create index if not exists shane_memory_chapters_owner_idx
 on public.shane_memory_chapters(owner_id,endeavor_id,chapter_number desc);
-- Chapter annotations can point back to the source turn numbers.
-- Summaries are optional derived metadata, never a substitute for raw turns.
comment on table public.shane_memory_turns is
 'Immutable original conversation turns. Never delete to satisfy a context-window or chapter limit.';
comment on table public.shane_memory_chapters is
 'Searchable derived annotations; original turns are authoritative.';
