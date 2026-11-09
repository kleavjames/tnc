const communities = [
  {
    name: "NorthGen Kids",
    description:
      "NorthGen Kids exists to partner with families in the journey of discipleship by discovering, developing, and discipling young Christ-followers who will one day make Christ-followers.",
  },
  {
    name: "Young & Free",
    description:
      "Young & Free is a student movement helping young people know Jesus, grow in character and leadership, and live out their purpose. Through youth services and small-group discipleship, we raise Christ-committed students who impact their campuses and communities.",
  },
  {
    name: "LIFT",
    description:
      "LIFT (Living In Full Truth) is a community of singles discovering their identity, purpose, and joy in Christ. We gather to know Jesus more, grow in His Word, and live out the single life with passion and purpose. Together, we use our time, talents, and resources to honor God, build meaningful relationships, and make disciples.",
  },
  {
    name: "LOVE",
    description:
      "L.O.V.E. (Living One Vision Eternally) is a community of couples committed to building Christ-centered marriages. We grow together in God’s Word, strengthen our relationship through discipleship, and pursue God’s vision for our families. As couples, we honor God by loving well, serving faithfully, and helping others follow Jesus.",
  },
  {
    name: "Connect",
    description:
      "Connect Family Ministry exists to help families grow stronger in Christ and closer to one another. We equip parents and children to follow Jesus together through biblical teaching, family-centered gatherings, and discipleship support. Our heart is to build Christ-centered homes that love God, serve others, and make disciples as a family.",
  },
  {
    name: "ACTS Men",
    description:
      "ACTS Men is a community of men committed to following Jesus with strength, integrity, and purpose. We gather to grow in God’s Word, build authentic brotherhood, and live out our faith through service and discipleship. Our mission is to raise Christ-centered men who lead their families, impact their communities, and make disciples for God’s glory.",
  },
  {
    name: "SHINE",
    description:
      "SHINE is a community of women discovering their worth, purpose, and identity in Christ. We grow together through God’s Word, prayer, and authentic fellowship, becoming women who reflect Jesus in our homes, workplaces, and communities. Our desire is to raise Christ-centered women who shine His light and make disciples for God’s glory.",
  },
];

export default function TncCommunities() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-12 px-6 py-16 lg:px-8 lg:py-20">
      <h1 className="text-4xl leading-none font-extrabold tracking-tight uppercase lg:text-5xl">
        TNC Communities
      </h1>

      <div className="flex flex-col gap-10">
        {communities.map((community) => (
          <section key={community.name} className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold tracking-[0.22em] text-primary uppercase">
              {community.name}
            </h2>
            <p className="text-lg leading-8 text-muted-foreground">
              {community.description}
            </p>
          </section>
        ))}
      </div>
    </main>
  );
}
