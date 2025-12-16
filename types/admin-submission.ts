export type SubmissionStatus =
  | "pending"
  | "in_review"
  | "approved"
  | "rejected";

export interface AdminTrack {
  id: string;
  title: string;
  genre?: string;
  bpm?: string;
  key?: string;
  duration?: string;
  storagePath: string; // Used to fetch signed URL
}

export interface AdminSubmission {
  id: string;
  artist: {
    name: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
    socials: {
      instagram?: string;
      soundcloud?: string;
      spotify?: string;
    };
  };
  status: SubmissionStatus;
  submittedAt: string;
  tracks: AdminTrack[];
  rating?: number; // 1-10
  internalNotes?: string;
  feedback?: string;
}

export const MOCK_SUBMISSIONS: AdminSubmission[] = [
  {
    id: "1",
    artist: {
      name: "Luna Ray",
      email: "luna@example.com",
      bio: "Electronic producer based in Berlin. Focusing on deep house and ambient textures.",
      socials: {
        instagram: "@lunaray_music",
        soundcloud: "soundcloud.com/lunaray",
      },
    },
    status: "pending",
    submittedAt: "2025-12-15T10:30:00Z",
    tracks: [
      {
        id: "t1",
        title: "Midnight City",
        genre: "Deep House",
        bpm: "124",
        key: "Am",
        storagePath: "mock/path/t1.mp3",
      },
      {
        id: "t2",
        title: "Solar Flare",
        genre: "Ambient",
        bpm: "90",
        key: "C",
        storagePath: "mock/path/t2.mp3",
      },
    ],
  },
  {
    id: "2",
    artist: {
      name: "The Midnight Echo",
      email: "contact@midnightecho.band",
      bio: "Indie rock trio from Seattle.",
      socials: {
        spotify: "open.spotify.com/artist/...",
      },
    },
    status: "in_review",
    submittedAt: "2025-12-14T15:45:00Z",
    tracks: [
      {
        id: "t3",
        title: "Neon Lights",
        genre: "Indie Rock",
        bpm: "140",
        key: "E",
        storagePath: "mock/path/t3.mp3",
      },
    ],
    rating: 7,
    internalNotes: "Strong vocals, production needs some work.",
  },
  {
    id: "3",
    artist: {
      name: "Dj K-oz",
      email: "koz@dj.com",
      bio: "",
      socials: {},
    },
    status: "rejected",
    submittedAt: "2025-12-10T09:00:00Z",
    tracks: [
      {
        id: "t4",
        title: "Banger 1",
        genre: "Dubstep",
        bpm: "150",
        key: "Fm",
        storagePath: "mock/path/t4.mp3",
      },
    ],
    feedback: "Not quite what we are looking for right now.",
  },
];
