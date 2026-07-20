import { CircleUserRound, House, Plus } from "lucide-react";
import styles from "./Navigation.module.css";

export default function Navigation() {
  return (
    <nav className={styles.navigation} aria-label="App navigation">
      <a className={styles.item} href="/trips" aria-label="Home">
        <House aria-hidden="true" size={25} strokeWidth={2.4} />
      </a>

      <button className={styles.createButton} type="button" aria-label="Add">
        <Plus aria-hidden="true" size={31} strokeWidth={2.8} />
      </button>

      <a className={styles.item} href="#" aria-label="Profile">
        <CircleUserRound aria-hidden="true" size={25} strokeWidth={2.4} />
      </a>
    </nav>
  );
}
