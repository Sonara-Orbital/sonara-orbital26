import { createClient } from '@/utils/supabase/server' 
import { cookies } from 'next/headers'
import { redirect } from "next/navigation"

export default async function UserProfile() {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    
    const { data: { user}, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return <p>Not authenticated</p>;
    }

    if (!user) {
      redirect("/login")
    };
    
    const userId = user.id;
    

    //const userId = "3fde3f1d-1308-4f73-ad68-cf353cc37ee8";

    const { data: userProfile, error: dbError } = await supabase
    .from('Users')
    .select('id, username, display_name, avatar_url, created_at')
    .eq('id', userId)
    .single();

    if (dbError || !userProfile) {
        return <p>Profile not found</p>;
    }

    const joinDate = new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).format(new Date(userProfile.created_at));


  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Decorative background ring */}
        <div style={styles.ringOuter}>
          <div style={styles.ringInner} />
        </div>

        {/* Avatar circle */}
        <div style={styles.avatarWrapper}>
          <img
            src={userProfile.avatar_url}
            alt={`${userProfile.display_name}'s profile picture`}
            style={styles.avatar}
          />
        </div>

        {/* User info */}
        <div style={styles.info}>
          <p style={styles.username}>{userProfile.username}</p>
          <h1 style={styles.name}>{userProfile.display_name}</h1>
          <div style={styles.divider} />
          <p style={styles.joinDate}>
            <span style={styles.joinLabel}>Member since</span>
            <span style={styles.joinValue}>{joinDate}</span>
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .profile-card-inner { animation: fadeUp 0.55s ease both; }
        .avatar-img:hover   { transform: scale(1.04); }
      `}</style>
    </div>
  );
}

// ─── Inline styles ────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0d0d0f",
    fontFamily: "'DM Sans', sans-serif",
    padding: "2rem",
  },

  card: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "linear-gradient(160deg, #18181c 0%, #111113 100%)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "24px",
    padding: "3rem 3.5rem 2.5rem",
    width: "100%",
    maxWidth: "340px",
    boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
    overflow: "hidden",
    animation: "fadeUp 0.55s ease both",
  },

  ringOuter: {
    position: "absolute",
    top: "-60px",
    right: "-60px",
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    border: "1px solid rgba(210,180,140,0.12)",
    pointerEvents: "none",
  },

  ringInner: {
    position: "absolute",
    inset: "24px",
    borderRadius: "50%",
    border: "1px solid rgba(210,180,140,0.08)",
  },

  avatarWrapper: {
    width: "108px",
    height: "108px",
    borderRadius: "50%",
    padding: "3px",
    background: "linear-gradient(135deg, #901bad 0%, #d249d6 50%, #901bad 100%)",
    boxShadow: "0 8px 32px rgba(201,169,110,0.25)",
    marginBottom: "1.5rem",
    flexShrink: 0,
  },

  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
    display: "block",
    border: "3px solid #0d0d0f",
    transition: "transform 0.3s ease",
  },

  info: {
    textAlign: "center",
    width: "100%",
  },

  username: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.8rem",
    fontWeight: 400,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#c9a96e",
    margin: "0 0 0.4rem",
  },

  name: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "1.9rem",
    fontWeight: 600,
    color: "#f0ece4",
    margin: "0 0 1.25rem",
    lineHeight: 1.1,
    letterSpacing: "-0.01em",
  },

  divider: {
    width: "32px",
    height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(201,169,110,0.5), transparent)",
    margin: "0 auto 1.25rem",
  },

  joinDate: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
    margin: 0,
  },

  joinLabel: {
    fontSize: "0.7rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "rgba(240,236,228,0.35)",
    fontWeight: 400,
  },

  joinValue: {
    fontSize: "0.9rem",
    color: "rgba(240,236,228,0.7)",
    fontWeight: 300,
  },
};