"use client";

import { useState } from "react";
import JoinTripModal from "../join/JoinTripModal";

type JoinTripButtonProps = {
  className?: string;
};

export default function JoinTripButton({ className }: JoinTripButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className={className} onClick={() => setIsOpen(true)} type="button">
        Join trip
      </button>
      <JoinTripModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
