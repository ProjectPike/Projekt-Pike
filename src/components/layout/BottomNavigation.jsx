const items = [
  { id: "map", label: "Karta" },
  { id: "saved", label: "Sparade" },
  { id: "journal", label: "Dagbok" },
  { id: "more", label: "Mer" },
];

function BottomNavigation({ activeTab, onChange }) {
  return (
    <nav className="bottom-navigation" aria-label="Huvudmeny">
      {items.map((item) => (
        <button
          key={item.id}
          className={`navigation-item ${
            activeTab === item.id ? "navigation-item-active" : ""
          }`}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export default BottomNavigation;
