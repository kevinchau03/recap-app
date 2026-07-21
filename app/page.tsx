import styles from "./page.module.css";

const features = [
  {
    number: "01",
    title: "One shared trip",
    description:
      "Create a space for your trip and invite everyone through one simple link.",
  },
  {
    number: "02",
    title: "Everyone contributes",
    description:
      "Friends upload their favourite photos without sending files through group chats.",
  },
  {
    number: "03",
    title: "Relive the story",
    description:
      "Browse the trip as a beautiful timeline organized by day and moment.",
  },
];

const moments = [
  {
    time: "10:24 AM",
    title: "Morning by the lake",
    count: "18 photos",
    emoji: "🌊",
  },
  {
    time: "2:16 PM",
    title: "Boat afternoon",
    count: "31 photos",
    emoji: "🚤",
  },
  {
    time: "8:42 PM",
    title: "Campfire",
    count: "24 photos",
    emoji: "🔥",
  },
];

export default function Home() {
  return (
    <main className={styles.landing}>
      <header className={styles.siteHeader}>
        <a href="#" className={styles.logo} aria-label="Home">
          <span className={styles.logoMark}>D</span>
          <span>DeMems</span>
        </a>

        <nav className={styles.desktopNav} aria-label="Primary navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </nav>

        <a href="/home" className={styles.navButton}>
          Open app
        </a>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            The shared album built for trips
          </div>

          <h1>
            Relive the trip,
            <br />
            <span>together.</span>
          </h1>

          <p className={styles.heroDescription}>
            Bring everyone&apos;s photos into one shared timeline and turn a
            scattered camera roll into a trip worth revisiting.
          </p>

          <div className={styles.heroActions}>
            <a href="#waitlist" className={styles.primaryButton}>
              Join the waitlist
              <span aria-hidden="true">→</span>
            </a>

            <a href="#how-it-works" className={styles.secondaryButton}>
              See how it works
            </a>
          </div>

          <div className={styles.heroNote}>
            <div className={styles.avatarStack} aria-hidden="true">
              <span>KC</span>
              <span>JL</span>
              <span>AM</span>
              <span>+4</span>
            </div>
            <p>Made for trips with the people you care about.</p>
          </div>
        </div>

        <div className={styles.heroVisual} aria-label="Trip timeline preview">
          <div className={`${styles.backgroundOrb} ${styles.orbOne}`} />
          <div className={`${styles.backgroundOrb} ${styles.orbTwo}`} />

          <div className={styles.phone}>
            <div className={styles.phoneIsland} />

            <div className={styles.phoneContent}>
              <div className={styles.phoneTopbar}>
                <button aria-label="Go back">‹</button>
                <span>•••</span>
              </div>

              <div className={styles.tripHeading}>
                <p>JULY 12–15, 2026</p>
                <h2>Muskoka Weekend</h2>

                <div className={styles.tripMembers}>
                  <div className={styles.miniAvatars}>
                    <span>K</span>
                    <span>J</span>
                    <span>A</span>
                  </div>
                  <p>7 friends · 186 photos</p>
                </div>
              </div>

              <div className={styles.coverPhoto}>
                <div className={styles.coverOverlay}>
                  <span>Saturday</span>
                  <strong>July 13</strong>
                </div>
              </div>

              <div className={styles.timeline}>
                {moments.map((moment) => (
                  <article className={styles.moment} key={moment.title}>
                    <div className={styles.momentTime}>{moment.time}</div>

                    <div className={styles.timelineMarker}>
                      <span />
                    </div>

                    <div className={styles.momentCard}>
                      <div className={styles.momentImage}>{moment.emoji}</div>
                      <div>
                        <h3>{moment.title}</h3>
                        <p>{moment.count}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className={styles.phoneNavigation}>
              <span className={styles.active}>Timeline</span>
              <span>Map</span>
              <span>Recap</span>
            </div>
          </div>

          <div className={`${styles.floatingCard} ${styles.floatingTop}`}>
            <span className={styles.floatingIcon}>✓</span>
            <div>
              <strong>24 photos added</strong>
              <p>by Alex and Jordan</p>
            </div>
          </div>

          <div className={`${styles.floatingCard} ${styles.floatingBottom}`}>
            <span className={styles.floatingIcon}>♥</span>
            <div>
              <strong>Your trip recap</strong>
              <p>is ready to revisit</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.howItWorks} id="how-it-works">
        <div className={styles.sectionHeading}>
          <p className={styles.sectionLabel}>How it works</p>
          <h2>From scattered photos to one shared story.</h2>
          <p>
            No complicated setup and no new way of taking photos. Just create,
            invite and share.
          </p>
        </div>

        <div className={styles.featureGrid}>
          {features.map((feature) => (
            <article className={styles.featureCard} key={feature.number}>
              <span className={styles.featureNumber}>{feature.number}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.productSection} id="features">
        <div className={styles.productCopy}>
          <p className={styles.sectionLabel}>Built for looking back</p>
          <h2>Your trip is more than a folder of photos.</h2>
          <p>
            DeMems automatically arranges everyone&apos;s photos into a shared
            chronological experience. Browse by day, discover moments you
            missed and return to the trip whenever you want.
          </p>

          <ul>
            <li>
              <span>✓</span> One album for the entire group
            </li>
            <li>
              <span>✓</span> Photos organized chronologically
            </li>
            <li>
              <span>✓</span> Beautiful mobile-first trip recaps
            </li>
            <li>
              <span>✓</span> Private by default
            </li>
          </ul>
        </div>

        <div className={styles.photoCollage} aria-hidden="true">
          <div className={`${styles.collagePhoto} ${styles.collageOne}`}>🏕️</div>
          <div className={`${styles.collagePhoto} ${styles.collageTwo}`}>🌅</div>
          <div className={`${styles.collagePhoto} ${styles.collageThree}`}>🚗</div>
          <div className={styles.collageCaption}>
            <span>186</span>
            shared memories
          </div>
        </div>
      </section>

      <section className={styles.waitlistSection} id="waitlist">
        <div>
          <p className={`${styles.sectionLabel} ${styles.lightLabel}`}>Coming soon</p>
          <h2>Your next trip deserves a better album.</h2>
          <p>
            Join the early-access list and be among the first groups to try
            DeMems.
          </p>
        </div>

        <form className={styles.waitlistForm}>
          <label className="sr-only" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />
          <button type="submit">Join waitlist</button>
        </form>
      </section>

      <footer className={styles.footer} id="about">
        <a href="#" className={styles.logo}>
          <span className={styles.logoMark}>D</span>
          <span>DeMems</span>
        </a>

        <p>Shared trips. Better memories.</p>

        <div className={styles.footerLinks}>
          <a href="#">Privacy</a>
          <a href="#">Instagram</a>
          <a href="mailto:hello@example.com">Contact</a>
        </div>
      </footer>
    </main>
  );
}
