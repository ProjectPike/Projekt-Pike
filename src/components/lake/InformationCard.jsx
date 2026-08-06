const statusColors = {
  unknown: "blue",
  unverified: "orange",
  checking: "orange",
  verified: "green",
  restricted: "red",
};

function InformationCard({ label, information }) {
  const color = statusColors[information.status] ?? "blue";

  return (
    <button className="information-card">
      <span className={`information-card-line ${color}`} />
      <small>{label}</small>
      <strong>{information.label}</strong>
    </button>
  );
}

export default InformationCard;
