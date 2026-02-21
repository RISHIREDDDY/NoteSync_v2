/**
 * openNotePopup — opens a note as a real browser popup window.
 * The popup loads the same app at ?floatNote=noteId, which renders
 * a minimal NotePopup layout (no sidebar/navbar).
 */
export function openNotePopup(noteId) {
    const w = 360, h = 460
    const left = Math.round(window.screen.width / 2 - w / 2)
    const top = Math.round(window.screen.height / 2 - h / 2)
    const url = `${window.location.origin}${window.location.pathname}?floatNote=${noteId}`
    const win = window.open(
        url,
        `notesync-note-${noteId}`,
        `width=${w},height=${h},left=${left},top=${top},popup=yes,toolbar=no,menubar=no,location=no,status=no,scrollbars=no`
    )
    if (win) win.focus()
    return win
}

/**
 * openPiPWindow — opens a Document Picture-in-Picture window.
 * Returns the pip window object, or null if unsupported.
 * Copies all stylesheets and font links from the current page.
 */
export async function openPiPWindow(width = 360, height = 440) {
    if (!window.documentPictureInPicture) return null
    try {
        const pip = await window.documentPictureInPicture.requestWindow({ width, height })

            // Copy stylesheets
            ;[...document.styleSheets].forEach(ss => {
                try {
                    const style = pip.document.createElement('style')
                    style.textContent = [...ss.cssRules].map(r => r.cssText).join('\n')
                    pip.document.head.appendChild(style)
                } catch { /* cross-origin sheets — skip */ }
            })

            // Copy font links
            ;[...document.querySelectorAll('link[rel="stylesheet"]')].forEach(link => {
                pip.document.head.appendChild(link.cloneNode())
            })

        // Carry over dark mode class
        if (document.documentElement.classList.contains('dark')) {
            pip.document.documentElement.classList.add('dark')
        }

        // Base body styles
        Object.assign(pip.document.body.style, {
            margin: '0',
            padding: '0',
            overflow: 'hidden',
            height: '100vh',
        })

        return pip
    } catch (e) {
        console.warn('[NoteSync] Document PiP not available:', e)
        return null
    }
}
