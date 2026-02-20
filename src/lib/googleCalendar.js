const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3'

/**
 * Get Google OAuth access token via popup flow
 */
export async function getGoogleAccessToken() {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    const redirectUri = window.location.origin
    const scope = 'https://www.googleapis.com/auth/calendar.events'

    return new Promise((resolve, reject) => {
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${clientId}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `response_type=token&` +
            `scope=${encodeURIComponent(scope)}&` +
            `prompt=consent`

        const width = 500
        const height = 600
        const left = window.screenX + (window.outerWidth - width) / 2
        const top = window.screenY + (window.outerHeight - height) / 2

        const popup = window.open(
            authUrl,
            'google-auth',
            `width=${width},height=${height},left=${left},top=${top}`
        )

        const interval = setInterval(() => {
            try {
                if (!popup || popup.closed) {
                    clearInterval(interval)
                    reject(new Error('Popup closed'))
                    return
                }

                const url = popup.location.href
                if (url.includes('access_token')) {
                    clearInterval(interval)
                    const hash = new URL(url).hash.substring(1)
                    const params = new URLSearchParams(hash)
                    const accessToken = params.get('access_token')
                    popup.close()
                    localStorage.setItem('gcal_access_token', accessToken)
                    resolve(accessToken)
                }
            } catch (e) {
                // Cross-origin error while popup is on Google's domain — ignore
            }
        }, 500)
    })
}

/**
 * Get stored access token or request new one
 */
export async function ensureGoogleToken() {
    let token = localStorage.getItem('gcal_access_token')
    if (token) {
        // Verify token is still valid
        try {
            const res = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + token)
            if (res.ok) return token
        } catch (e) { /* token expired */ }
    }
    return await getGoogleAccessToken()
}

/**
 * Create a Google Calendar event for a task
 */
export async function createCalendarEvent(task) {
    const token = await ensureGoogleToken()

    const startTime = new Date(task.due_at)
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000) // 30 min default

    const event = {
        summary: task.label,
        description: `NoteSync Task Reminder`,
        start: {
            dateTime: startTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
            dateTime: endTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'popup', minutes: 10 },
                { method: 'popup', minutes: 0 }
            ]
        }
    }

    const res = await fetch(`${GOOGLE_CALENDAR_API}/calendars/primary/events`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
    })

    if (!res.ok) throw new Error('Failed to create calendar event')
    return await res.json()
}

/**
 * Delete a Google Calendar event
 */
export async function deleteCalendarEvent(eventId) {
    const token = await ensureGoogleToken()

    const res = await fetch(
        `${GOOGLE_CALENDAR_API}/calendars/primary/events/${eventId}`,
        {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        }
    )

    if (!res.ok && res.status !== 404) {
        throw new Error('Failed to delete calendar event')
    }
}
