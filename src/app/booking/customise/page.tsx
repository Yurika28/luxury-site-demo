import { AddonsStep } from "@/components/booking/AddonsStep";

export default function Customise() {
  return (
    <AddonsStep
      step={2}
      label="Make it yours"
      back="/booking/choose"
      title="Make it yours"
      lede="Add what you like. Everything here is optional, and you can change it until you confirm."
      nextHref="/booking/guest"
    />
  );
}
