"use client";

import { Camera, ImagePlus } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import styles from "../../mobile.module.css";

const BUCKET = "trip-media";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

type TripPhotoUploadProps = {
  tripId: string;
};

const sanitizeFileName = (fileName: string) =>
  fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "photo";

async function readImageSize(file: File) {
  const url = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });

    return {
      width: image.naturalWidth || null,
      height: image.naturalHeight || null,
    };
  } catch {
    return {
      width: null,
      height: null,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function TripPhotoUpload({ tripId }: TripPhotoUploadProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function uploadFiles(files: FileList | null) {
    if (!files?.length || isUploading) {
      return;
    }

    setIsUploading(true);
    setMessage("");

    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("Please log in before uploading photos.");
      setIsUploading(false);
      return;
    }

    try {
      for (const file of Array.from(files)) {
        if (!IMAGE_TYPES.has(file.type)) {
          throw new Error("Upload JPEG, PNG, WebP, HEIC, or HEIF photos.");
        }

        if (file.size > MAX_FILE_SIZE) {
          throw new Error("Photos must be 10 MB or smaller.");
        }

        const mediaId = crypto.randomUUID();
        const storagePath = `${tripId}/${mediaId}-${sanitizeFileName(file.name)}`;
        const dimensions = await readImageSize(file);

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, file, {
            cacheControl: "31536000",
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Storage upload failed: ${uploadError.message}`);
        }

        const { error: insertError } = await supabase.from("trip_media").insert({
          id: mediaId,
          trip_id: tripId,
          uploaded_by: user.id,
          storage_bucket: BUCKET,
          storage_path: storagePath,
          media_type: "photo",
          mime_type: file.type,
          size_bytes: file.size,
          width: dimensions.width,
          height: dimensions.height,
          original_filename: file.name,
        });

        if (insertError) {
          await supabase.storage.from(BUCKET).remove([storagePath]);
          throw new Error(`Media record failed: ${insertError.message}`);
        }
      }

      setMessage(files.length === 1 ? "Photo uploaded." : "Photos uploaded.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Photo upload failed.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    }
  }

  return (
    <>
      <div className={styles.uploadActions}>
        <label className={`${styles.uploadAction} ${styles.uploadActionPrimary}`}>
          <ImagePlus aria-hidden="true" size={20} />
          <span>{isUploading ? "Uploading..." : "Add photos"}</span>
          <input
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            disabled={isUploading}
            multiple
            onChange={(event) => uploadFiles(event.currentTarget.files)}
            ref={fileInputRef}
            type="file"
          />
        </label>

        <label className={styles.uploadAction}>
          <Camera aria-hidden="true" size={20} />
          <span>Open camera</span>
          <input
            accept="image/*"
            capture="environment"
            disabled={isUploading}
            onChange={(event) => uploadFiles(event.currentTarget.files)}
            ref={cameraInputRef}
            type="file"
          />
        </label>
      </div>

      {message ? <p className={styles.uploadMessage}>{message}</p> : null}
    </>
  );
}
