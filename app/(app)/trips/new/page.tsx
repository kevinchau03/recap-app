import type { Metadata } from "next";
import TripCreationFlow from "./TripCreationFlow";

export const metadata: Metadata = {
  title: "Create a trip · DeMems",
  description: "Create a new shared trip.",
};

export default function NewTripPage() {
  return <TripCreationFlow />;
}
