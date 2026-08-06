function PlaceholderTabPage({ title, text }) {
  return (
    <main className="tab-page">
      <header className="tab-page-header">
        <p className="eyebrow">Projekt Pike</p>
        <h1>{title}</h1>
      </header>

      <section className="empty-state">
        <h2>Kommer snart</h2>
        <p>{text}</p>
      </section>
    </main>
  );
}

export default PlaceholderTabPage;
