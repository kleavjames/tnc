const beliefs = [
  {
    question: "What does TNC believe about the Bible?",
    answer: [
      "We hold that the Scriptures, the 66 books of the Old and New Testaments (39 and 27 respectively), are the Word of God. They were given by divine inspiration, are without error in the original manuscripts, and are wholly trustworthy. Therefore, the Bible is the final authority for what we believe and how we live.",
    ],
  },
  {
    question: "What does TNC believe about God?",
    answer: [
      "We believe in one God who has eternally existed as three persons: the Father, the Son, and the Holy Spirit. He is the Maker of the heavens and the earth.",
    ],
  },
  {
    question: "What does TNC believe about Jesus Christ?",
    answer: [
      "We believe that Jesus Christ, God come in the flesh, is fully God and fully man. He was conceived by the Holy Spirit and born of the virgin Mary, and He lived without sin. He was crucified and died in our place, bearing the penalty our sins deserved. Through His shed blood, He offered Himself as the perfect, once-for-all sacrifice for sin, and on the third day He rose from the dead. He then ascended to the right hand of the Father, where He reigns as Head of the Church and intercedes for His people. We believe He will return to earth in bodily form, visible to all, to establish His Kingdom.",
    ],
  },
  {
    question: "What does TNC believe about the Holy Spirit?",
    answer: [
      "We believe the Holy Spirit is fully God, sharing all the attributes of deity. At the moment a person trusts in Jesus Christ as their only Savior and Lord, the Holy Spirit comes to dwell within them, baptizes them into Christ, and seals them as God’s own. He fills and empowers every true believer to live the Christian life as they obey Him, confess their sins, and surrender to His leading.",
    ],
  },
  {
    question: "What does TNC believe about how a person is saved?",
    answer: [
      "We believe that salvation, which brings the forgiveness of sins, a new nature, and eternal life, is God’s free gift to everyone who trusts in Jesus Christ as their only Savior and Lord. It is given purely by God’s grace and can never be earned through good works, baptism, church membership, or any other human effort (Ephesians 2:8–9).",
    ],
  },
  {
    question:
      "What does TNC teach about the role of good works in a Christian’s life?",
    answer: [
      "We believe that good works do not save us, but they are the natural fruit of a genuine faith in Christ. Every believer is called to pursue a life marked by good works, relying on the power of the Holy Spirit who lives within them.",
    ],
  },
  {
    question: "What does TNC teach about every Christian’s mission?",
    answer: [
      "We believe God calls and commands every Christian to actively share with others how they can know Him personally through faith in Jesus Christ, and to disciple those who receive this good news of salvation, in obedience to the Great Commission (Matthew 28:18–20).",
    ],
  },
  {
    question: "What does TNC teach about baptism?",
    answer: [
      "We believe that water baptism by immersion is a step of obedience to the command of Christ and a public declaration of one’s personal faith in Him (Matthew 28:19).",
    ],
  },
  {
    question: "What does TNC teach about what the church is?",
    answer: [
      "“We believe the universal Church is made up of all genuine believers who have placed their trust in Christ as Lord and Savior and are devoted to following Him. A local church is a community of believers in a particular place who have agreed to uphold that church’s Mission, Vision, Core Values, and Statement of Faith.",
    ],
  },
  {
    question: "What does TNC believe about marriage?",
    answer: [
      "We believe that marriage is the joining of one man and one woman, as determined by biological sex at birth, in an exclusive, lifelong union (Genesis 2:18–25). We believe God designed sexual intimacy to be expressed only between a husband and wife within marriage (1 Corinthians 6:18; 7:2–5; Hebrews 13:4).",
      "Since God established marriage and defined it as a covenant between a man, a woman, and Himself, TNC will recognize and officiate only marriages between a biological man and a biological woman who are committed to following Jesus Christ as their Lord and Savior.",
    ],
  },
  {
    question: "What is TNC’s view regarding today’s issues about gender?",
    answer: [
      "We believe God wonderfully and unchangeably creates every person as either biologically male or biologically female. Together, these two distinct and complementary sexes reflect God’s image and nature (Genesis 1:26–27). To reject one’s biological sex is to reject the image of God in that person.",
    ],
  },
  {
    question: "What is TNC’s view about the value of human life?",
    answer: [
      "We believe every human life is sacred, created by God and bearing His image. Each life has immeasurable value in every respect, including unborn children, the elderly, those with physical or mental disabilities, and people at every other stage or condition of life, from conception until natural death.",
    ],
  },
];

export default function StatementOfFaith() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-12 px-6 py-16 lg:px-8 lg:py-20">
      <h1 className="text-4xl leading-none font-extrabold tracking-tight uppercase lg:text-5xl">
        Our Statement of Faith
      </h1>

      <div className="flex flex-col gap-10">
        {beliefs.map((belief) => (
          <section key={belief.question} className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold tracking-[0.22em] text-primary uppercase">
              {belief.question}
            </h2>
            {belief.answer.map((paragraph) => (
              <p
                key={paragraph}
                className="text-lg leading-8 text-muted-foreground"
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>

      <p className="border-t pt-8 leading-7 text-muted-foreground">
        This Statement of Faith is not a complete list of everything we believe.
        The Bible, as the inspired and infallible Word of God and the final
        authority on truth, morality, and how people should live, is the only
        and ultimate source of our beliefs. Any questions about our doctrinal
        positions or church policies will be settled by the TNC Board of Elders,
        which holds final authority and oversight over the TNC Movement.
      </p>
    </main>
  );
}
