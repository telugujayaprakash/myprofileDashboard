export function formatDate(isoString) {
    const date = new Date(isoString)
    return date.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    })
}
