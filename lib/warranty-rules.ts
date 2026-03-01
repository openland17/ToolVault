import { WarrantyPolicy } from "./types";

export const warrantyPolicies: Record<string, WarrantyPolicy> = {
  milwaukee: {
    brandId: "milwaukee",
    title: "Milwaukee 5-Year Limited Warranty",
    durationYears: 5,
    clauses: [
      {
        section: "Section 3.1 — Coverage",
        text: "Milwaukee warrants to the original purchaser that each power tool will be free from defects in material and workmanship for a period of five (5) years from date of purchase.",
      },
      {
        section: "Section 3.2 — Repair or Replacement",
        text: "Defects in materials or workmanship within the warranty period are covered for repair or replacement at manufacturer's discretion.",
      },
      {
        section: "Section 3.3 — Battery Warranty",
        text: "Milwaukee M18 and M12 REDLITHIUM batteries are covered for defects for a period of two (2) years from date of purchase.",
      },
      {
        section: "Section 4.1 — Proof of Purchase",
        text: "A valid proof of purchase (receipt or tax invoice) showing date of purchase and retailer is required for all warranty claims.",
      },
    ],
    exclusions: [
      "Damage resulting from misuse, abuse, neglect, or unauthorized modification",
      "Normal wear and tear including brushes, blades, bits, and other consumable parts",
      "Damage caused by use of non-Milwaukee accessories or attachments",
    ],
    commonIssues: [
      "Won't start",
      "Overheating",
      "Chuck/blade issue",
      "Battery problem",
      "Unusual noise",
      "Loss of power",
    ],
    australianConsumerLawNote:
      "This warranty is in addition to your rights under the Australian Consumer Law. Our goods come with guarantees that cannot be excluded under the Australian Consumer Law. You are entitled to a replacement or refund for a major failure and compensation for any other reasonably foreseeable loss or damage.",
  },
  makita: {
    brandId: "makita",
    title: "Makita 3-Year Warranty (Registered)",
    durationYears: 3,
    clauses: [
      {
        section: "Section 2.1 — Standard Coverage",
        text: "Makita Australia warrants this product against defects in material and workmanship for three (3) years from date of purchase when registered within 30 days, otherwise one (1) year.",
      },
      {
        section: "Section 2.2 — Scope of Warranty",
        text: "This warranty covers the repair or replacement of the product or any part found to be defective in material or workmanship under normal use.",
      },
      {
        section: "Section 2.3 — Warranty Service",
        text: "Warranty service must be carried out by a Makita Authorised Service Centre. The product must be presented with valid proof of purchase.",
      },
    ],
    exclusions: [
      "Damage caused by misuse, abuse, abnormal conditions, or unauthorized repair",
      "Normal wear of consumable parts such as carbon brushes, blades, and drill bits",
      "Products used for hire or commercial rental purposes beyond normal trade use",
    ],
    commonIssues: [
      "Won't start",
      "Overheating",
      "Chuck/blade issue",
      "Battery problem",
      "Unusual noise",
      "Loss of power",
    ],
    australianConsumerLawNote:
      "This warranty is provided in addition to statutory rights under the Australian Consumer Law. Makita Australia Pty Ltd guarantees this product against defects as required by law.",
  },
  husqvarna: {
    brandId: "husqvarna",
    title: "Husqvarna 2-Year Consumer Warranty",
    durationYears: 2,
    clauses: [
      {
        section: "Section 1.1 — Warranty Period",
        text: "Husqvarna warrants this product to the original purchaser for a period of two (2) years from date of purchase for domestic consumer use.",
      },
      {
        section: "Section 1.2 — Extended Registration",
        text: "The warranty may be extended up to five (5) years for eligible products when registered online within 30 days of purchase.",
      },
      {
        section: "Section 1.3 — Coverage",
        text: "This warranty covers defects in material and workmanship. Husqvarna will, at its discretion, repair or replace the defective product or component.",
      },
    ],
    exclusions: [
      "Damage resulting from improper maintenance, misuse, or unauthorized modification",
      "Normal wear on consumable items including chains, bars, spark plugs, and filters",
      "Products used for commercial or professional purposes beyond domestic use",
    ],
    commonIssues: [
      "Chain tension",
      "Starting issues",
      "Oil leak",
      "Bar wear",
      "Vibration",
      "Loss of power",
    ],
    australianConsumerLawNote:
      "This warranty does not exclude or limit the application of any condition or warranty implied by the Australian Consumer Law. You are entitled to a replacement or refund for a major failure.",
  },
  stihl: {
    brandId: "stihl",
    title: "Stihl 2-Year Domestic Warranty",
    durationYears: 2,
    clauses: [
      {
        section: "Section 1 — Warranty Coverage",
        text: "Stihl warrants to the original purchaser that this product will be free from defects in material and workmanship for a period of two (2) years for domestic consumer use.",
      },
      {
        section: "Section 2 — Warranty Claims",
        text: "All warranty claims must be submitted through an authorised Stihl dealer with valid proof of purchase showing date and place of purchase.",
      },
      {
        section: "Section 3 — Remedies",
        text: "Stihl will, at its sole discretion, repair or replace any product or component found to be defective under this warranty.",
      },
    ],
    exclusions: [
      "Damage caused by misuse, neglect, accident, or unauthorized modification or repair",
      "Normal wear and tear on consumable parts including chains, bars, spark plugs, air filters, and fuel filters",
      "Failure resulting from use of non-Stihl replacement parts or accessories",
    ],
    commonIssues: [
      "Chain tension",
      "Starting issues",
      "Oil leak",
      "Bar wear",
      "Vibration",
      "Loss of power",
    ],
    australianConsumerLawNote:
      "Stihl products come with guarantees that cannot be excluded under the Australian Consumer Law. You are entitled to a replacement or refund for a major failure and compensation for any other reasonably foreseeable loss.",
  },
  dewalt: {
    brandId: "dewalt",
    title: "DeWalt 3-Year Limited Warranty",
    durationYears: 3,
    clauses: [
      {
        section: "Section A — Coverage Period",
        text: "DeWalt will repair or replace, at DeWalt's option, any product that is defective in material or workmanship for a period of three (3) years from date of purchase.",
      },
      {
        section: "Section B — Free Service",
        text: "DeWalt will maintain the tool and replace worn parts caused by normal use, free of charge, for a period of one (1) year from date of purchase.",
      },
      {
        section: "Section C — Proof of Purchase",
        text: "Original proof of purchase (receipt or tax invoice) is required for all warranty claims. The product must be returned to a DeWalt authorised service centre.",
      },
    ],
    exclusions: [
      "Damage caused by misuse, abuse, negligence, or unauthorized modification",
      "Normal wear of consumable accessories and parts",
      "Products that have been used in rental or commercial hire operations",
    ],
    commonIssues: [
      "Won't start",
      "Overheating",
      "Chuck/blade issue",
      "Battery problem",
      "Unusual noise",
      "Loss of power",
    ],
    australianConsumerLawNote:
      "This warranty is in addition to rights and remedies available under the Australian Consumer Law. Our goods come with guarantees that cannot be excluded under the ACL.",
  },
  bosch: {
    brandId: "bosch",
    title: "Bosch 3-Year Professional Warranty",
    durationYears: 3,
    clauses: [
      {
        section: "Section 1 — Warranty",
        text: "Bosch warrants this professional power tool against defects in materials and workmanship for a period of three (3) years from the date of purchase.",
      },
      {
        section: "Section 2 — Service",
        text: "Warranty service is available through any Bosch Authorised Service Agent. Products must be accompanied by proof of purchase.",
      },
    ],
    exclusions: [
      "Damage from misuse, abuse, negligence, or failure to follow operating instructions",
      "Normal wear on consumable parts and accessories",
      "Unauthorized modification or repair by non-Bosch service agents",
    ],
    commonIssues: [
      "Won't start",
      "Overheating",
      "Chuck/blade issue",
      "Battery problem",
      "Unusual noise",
      "Loss of power",
    ],
    australianConsumerLawNote:
      "This warranty is provided in addition to your rights under the Australian Consumer Law. Robert Bosch (Australia) Pty Ltd guarantees its products as required by law.",
  },
};
