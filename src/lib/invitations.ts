export function buildInvitationLink(token: string) {
  if (typeof window === 'undefined') {
    return `/invitations/${token}`
  }

  return `${window.location.origin}/invitations/${token}`
}
