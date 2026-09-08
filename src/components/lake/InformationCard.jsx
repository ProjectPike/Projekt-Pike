const statusColors = {
  unknown: "status-unknown",
  unverified: "status-warning",
  checking: "status-warning",
  verified: "status-supported",
  restricted: "status-warning",
  prohibited: "status-danger",
};

function InformationCard({ label, information }) {
  const color = statusColors[information.status] ?? "status-unknown";

  return (
    <article className="information-card">
      <span className={`information-card-line ${color}`} />
      <small>{label}</small>
      <strong>{information.label}</strong>
    </article>
  );
}

export default InformationCard;
