"use client";

import { FileIcon, UploadIcon } from "./icons";

type Props = {
  packingList: File | null;
  photos: File[];
  photoUrls: string[];
  busy: boolean;
  onPackingList: (file: File | null) => void;
  onPhotos: (files: File[]) => void;
  onRun: () => void;
};

export function UploadPanel({
  packingList,
  photos,
  photoUrls,
  busy,
  onPackingList,
  onPhotos,
  onRun,
}: Props) {
  return (
    <aside className="upload-panel" aria-label="Delivery inputs">
      <div className="upload-section">
        <h2>Packing list</h2>
        <label className={`file-control ${packingList ? "has-file" : ""}`}>
          <input
            type="file"
            accept="application/pdf"
            onClick={(event) => {
              event.currentTarget.value = "";
            }}
            onChange={(event) => onPackingList(event.target.files?.[0] ?? null)}
          />
          <span className="file-icon"><FileIcon /></span>
          <span className="file-copy">
            <strong>{packingList?.name ?? "Upload one-page PDF"}</strong>
            <small>{packingList ? `${Math.ceil(packingList.size / 1024)} KB` : "Up to 8 MB · max 5 rows"}</small>
          </span>
        </label>
      </div>

      <div className="upload-section">
        <div className="section-heading">
          <h2>Delivery photos</h2>
          <span>{photos.length}/3</span>
        </div>
        {photos.length > 0 && (
          <div className="photo-grid">
            {photos.map((photo, index) => (
              <div className="photo-tile" key={`${photo.name}-${photo.lastModified}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrls[index]} alt={`Delivery photo ${index + 1}`} />
                <span>Photo {index + 1}</span>
              </div>
            ))}
          </div>
        )}
        <label className="photo-control">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onClick={(event) => {
              event.currentTarget.value = "";
            }}
            onChange={(event) => onPhotos(Array.from(event.target.files ?? []).slice(0, 3))}
          />
          <UploadIcon />
          <span>
            <strong>{photos.length ? "Replace photos" : "Add photos"}</strong>
            <small>1–3 JPG, PNG, WEBP or GIF</small>
          </span>
        </label>
      </div>

      <div className="capture-note">
        <strong>Capture convention</strong>
        <p>Keep one unique UNIT-XX label on every object and visible across overview and close-up photos.</p>
      </div>

      <button
        className="run-button"
        type="button"
        disabled={busy || !packingList || photos.length === 0}
        onClick={onRun}
      >
        {busy ? <span className="spinner" /> : null}
        {busy ? "Checking evidence…" : "Run verification"}
      </button>
    </aside>
  );
}
