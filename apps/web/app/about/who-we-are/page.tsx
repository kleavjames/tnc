const coreValues = [
  {
    letter: "L",
    title: "Love God, Love People",
    description:
      "We make God our first priority and show His love through how we treat others.",
  },
  {
    letter: "O",
    title: "Obey God’s Word and Leaders",
    description:
      "We hold Scripture in high honor and respect the leaders God has appointed over us.",
  },
  {
    letter: "V",
    title: "Volunteer",
    description:
      "We serve gladly and eagerly, using the gifts God has given us to bless others.",
  },
  {
    letter: "E",
    title: "Engage Families",
    description:
      "We build up and support families, helping them grow together in their faith in Christ.",
  },
];

export default function WhoWeAre() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-16 px-6 py-16 lg:px-8 lg:py-20">
      <section className="flex flex-col gap-6">
        <h1 className="text-4xl leading-none font-extrabold tracking-tight uppercase lg:text-5xl">
          Who we are?
        </h1>
        <p className="text-lg leading-8 text-muted-foreground">
          True North Church is a movement of people transformed by Jesus and
          committed to follow Him. Empowered by the Holy Spirit, we exist to
          honor God, make disciples, and see lives and families changed for His
          glory.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-sm font-semibold tracking-[0.22em] text-primary uppercase">
          Vision
        </h2>
        <p className="text-2xl leading-9 font-semibold">
          To see a multitude passionately in love with Christ, making disciples
          through Christ-centered small groups.
        </p>
        <blockquote className="flex flex-col gap-2 border-l-2 border-primary pl-6">
          <p className="text-lg leading-8 text-muted-foreground italic">
            “Go and make disciples of all nations, baptizing them in the name of
            the Father and of the Son and of the Holy Spirit, and teaching them
            to obey everything I have commanded you.”
          </p>
          <cite className="text-sm font-semibold not-italic">
            Matthew 28:19-20
          </cite>
        </blockquote>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-sm font-semibold tracking-[0.22em] text-primary uppercase">
          Mission
        </h2>
        <p className="text-2xl leading-9 font-semibold">
          To honor God and make disciples who will disciple others.
        </p>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-sm font-semibold tracking-[0.22em] text-primary uppercase">
          L.O.V.E. Core Values
        </h2>
        <ul className="grid gap-8 sm:grid-cols-2">
          {coreValues.map((value) => (
            <li key={value.letter} className="flex gap-5">
              <span
                aria-hidden="true"
                className="text-5xl leading-none font-extrabold text-primary"
              >
                {value.letter}
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">{value.title}</h3>
                <p className="leading-7 text-muted-foreground">
                  {value.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
