
import { Address } from "@/types";

// Convert Address to DeliveryAddress format
export const convertToDeliveryAddress = (address: Address | null) => {
  if (!address) {
    return {
      fullName: "",
      phone: "",
      street: "",
      city: "",
      postalCode: "",
      instructions: "",
    };
  }
  
  return {
    fullName: "",
    phone: "",
    street: address.street,
    city: address.city,
    postalCode: address.zipCode,
    instructions: "",
  };
};
