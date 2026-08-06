function LakeHero({ lake }) {
  return (
    <section className="lake-hero">
      <div className="lake-hero-water" />

      <div className="lake-hero-content">
        <p>{lake.region}</p>
        <h1>{lake.name}</h1>
        <span>
          {lake.distance.kilometers} km · {lake.distance.travelTime}
        </span>
      </div>
    </section>
  );
}

export default LakeHero;
