/* eslint-disable @next/next/no-img-element */
import styles from "@/app/(app)/app.module.css";

export type TripMemberAvatar = {
  id: string;
  avatarUrl: string | null;
  name: string;
};

type TripMemberAvatarsProps = {
  members: TripMemberAvatar[];
};

const getInitial = (name: string) => name.trim().charAt(0).toUpperCase() || "D";

export default function TripMemberAvatars({ members }: TripMemberAvatarsProps) {
  const visibleMembers = members.slice(0, 4);
  const extraCount = Math.max(0, members.length - visibleMembers.length);

  if (!members.length) {
    return null;
  }

  return (
    <div className={styles.memberStack} aria-label={`${members.length} trip members`}>
      {visibleMembers.map((member) => (
        <span className={styles.memberAvatar} title={member.name} key={member.id}>
          {member.avatarUrl ? (
            <img alt="" className={styles.memberAvatarImage} src={member.avatarUrl} />
          ) : (
            getInitial(member.name)
          )}
        </span>
      ))}
      {extraCount ? <span className={styles.memberOverflow}>+{extraCount}</span> : null}
    </div>
  );
}
