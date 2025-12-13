# Design / Style Guide

## Vibe

Premium music label, minimal “studio” feel. Subtle glass UI, no neon/AI-gradient purple.

## Typography

- Font: Inter (everything)
- Scale:
  - H1: 40/44, 600
  - H2: 28/34, 600
  - H3: 20/28, 600
  - Body: 16/24, 400/500
  - Caption: 13/18, 400

## Spacing + Layout

- 8pt grid: 4 / 8 / 12 / 16 / 24 / 32 / 48
- Page padding: 24 (mobile), 32–48 (desktop)
- Max content width (public pages): ~1100–1200px

## Shape

- Pills: 9999
- Cards: 16–20
- Inputs/Buttons: 12

## Surfaces (Glass)

- Dark default background + subtle gradients
- Glass card:
  - Background: `rgba(255,255,255,0.06)`
  - Border: `rgba(255,255,255,0.12)`
  - Backdrop blur: 12–20px (use sparingly)

## Colors (Dark default)

- Background: `#0B0D0F`
- Text: `#F5F3EE`
- Muted: `#A8A29E`

### Accent (choose ONE)

- Electric Blue: `#2D7DFF`
- Acid Lime: `#B6F43B`
- Copper: `#C07A3A`

## Borders + Shadows

- Hairline borders only (1px)
- One soft shadow level, low opacity (no heavy drops)

## Interactions + States

- Hover: slight lift + border brighten
- Focus: visible focus ring always
- Feedback: toasts for success/error
- Loading: skeletons
- Empty: clear empty states

---

# Pages

- `/` Artist submission (upload + artist form + per-track metadata)
- `/submitted` Confirmation
- `/admin/login`
- `/admin/submissions` (responsive list → detail in one route)
- `/admin/templates` (template list + editor + preview)

---

# Core Components

- Layout shells (PublicLayout, AdminLayout)
- `GlassCard`, `GlassPill`
- `Button`, `IconButton`
- `Input`, `Textarea`, `Select`, `Switch`
- `FormField` (label/help/error)
- `DropzoneUploader`
- `UploadQueueItem` (progress, ETA, errors)
- `TrackMetaCard` (editable per track)
- `StatusPill` (Pending/In-Review/Approved/Rejected)
- `SearchBar`, `FilterBar`
- `SubmissionsListItem`
- `AudioPlayer` (WaveSurfer)
- `ReviewPanel` (grade, notes, feedback, status actions)
- `TemplateEditor` (TipTap) + `PreviewPane` + `VariableInsertMenu`
- `Toast` / Notifications
- `Modal` / ConfirmDialog
- `EmptyState`
- `LoadingSkeleton`
