import { themes } from "../theme/themes";

function MorePage({ themeId, onThemeChange }) {
  return (
    <main className="tab-page more-page">
      <header className="tab-page-header">
        <p className="eyebrow">Projekt Pike</p>
        <h1>Mer</h1>
      </header>

      <section className="settings-section" aria-labelledby="appearance-heading">
        <h2 id="appearance-heading">Utseende</h2>
        <fieldset className="theme-options">
          <legend>Tema</legend>
          {themes.map((theme) => (
            <label key={theme.id} className="theme-option">
              <input
                type="radio"
                name="project-pike-theme"
                value={theme.id}
                checked={themeId === theme.id}
                onChange={() => onThemeChange(theme.id)}
              />
              <span className="theme-option-content">
                <span className="theme-option-title">
                  <strong>{theme.name}</strong>
                  {theme.isDefault ? <small>Standard</small> : null}
                </span>
                <span className="theme-swatches" aria-hidden="true">
                  {theme.swatches.map((color) => (
                    <span key={color} style={{ backgroundColor: color }} />
                  ))}
                </span>
              </span>
            </label>
          ))}
        </fieldset>
      </section>

      <section className="settings-section settings-section-muted">
        <h2>App</h2>
        <p>Fler inställningar kommer senare.</p>
      </section>
    </main>
  );
}

export default MorePage;