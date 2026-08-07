"use client";

import { ImagePlus } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { updateAvatarUrl } from "./actions";
import styles from "../app.module.css";

const BUCKET = "avatars";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const sanitizeFileName = (fileName: string) =>
  fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "avatar";

export default function AvatarUpload() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function uploadAvatar(file: File | undefined) {
    if (!file || isUploading) {
      return;
    }

    setIsUploading(true);
    setMessage("");
    setIsError(false);

    const supabase = createClient();

    try {
      if (!IMAGE_TYPES.has(file.type)) {
        throw new Error("Upload a JPEG, PNG, or WebP image.");
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error("Profile pictures must be 5 MB or smaller.");
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Please log in before uploading a profile picture.");
      }

      const storagePath = `${user.id}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
      const result = await updateAvatarUrl(data.publicUrl);

      if (result.error) {
        await supabase.storage.from(BUCKET).remove([storagePath]);
        throw new Error(result.error);
      }

      setMessage("Profile picture updated.");
      router.refresh();
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Profile picture upload failed.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className={styles.avatarUpload}>
      <label className={styles.avatarUploadButton}>
        <ImagePlus aria-hidden="true" size={20} />
        <span>{isUploading ? "Uploading..." : "Upload profile picture"}</span>
        <input
          accept="image/jpeg,image/png,image/webp"
          disabled={isUploading}
          onChange={(event) => uploadAvatar(event.currentTarget.files?.[0])}
          ref={inputRef}
          type="file"
        />
      </label>

      {message ? (
        <p className={isError ? styles.avatarUploadError : styles.avatarUploadMessage}>{message}</p>
      ) : null}
    </div>
  );
}
