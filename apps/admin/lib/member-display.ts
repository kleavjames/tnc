export function memberName(member: {
  firstName: string;
  lastName: string;
}): string {
  return `${member.firstName} ${member.lastName}`;
}

export function branchLabel(branch: { name: string; branch: string }): string {
  return `${branch.name}, ${branch.branch}`;
}

export function formatMemberDate(value: string): string {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(dateOnly ? `${value}T00:00:00.000Z` : value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: dateOnly ? "UTC" : undefined,
  }).format(date);
}

export function labelize(value: string): string {
  if (!value) {
    return "";
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}
