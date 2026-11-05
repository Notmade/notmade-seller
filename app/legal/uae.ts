// UAE legal pages. Wording comes from the backend UAE seller agreement (uae-local-v2), whose clause
// is noted on each section. Nothing here is new legal drafting: anything the agreement does not
// cover is a `review` note for the lawyer, shown on the page until it is replaced.

export interface LegalSection {
  heading: string;
  /** Agreement clause this text comes from. Empty for facts about the seller panel. */
  source: string;
  paras?: string[];
  items?: string[];
  /** Placeholder shown on the page, marked LAWYER REVIEW. */
  review?: string;
}

export interface LegalDoc {
  title: string;
  metaTitle: string;
  description: string;
  intro: string;
  sections: LegalSection[];
}

export const REVIEW_LABEL = "LAWYER REVIEW";

export const ENTITY = {
  name: "House of Notmade Studio FZE LLC",
  licence: "Licence No: 2628021907888",
  office: "Office No. BC-894509, 26th Floor, Amber Gem Tower, Sheikh Khalifa Street, Ajman, United Arab Emirates",
  email: "admin@notmade.in",
  phone: "+971557590282",
};

export const UAE_TERMS: LegalDoc = {
  title: "TERMS & CONDITIONS",
  metaTitle: "Seller Terms | NOTMADE UAE",
  description: "Seller terms for UAE businesses selling on NOTMADE.",
  intro: `These terms summarise your agreement with ${ENTITY.name}. Your signed seller agreement is the full contract.`,
  sections: [
    {
      heading: "AED SELLING PRICE", source: "Clause 3",
      paras: [
        "The Seller shall list a Selling Price in UAE Dirhams (AED) for each Product. The AED Selling Price is the price charged to the customer and is the basis for commission and settlement.",
        "The Seller is responsible for ensuring the AED Selling Price is inclusive of UAE VAT where the Seller is VAT registered.",
      ],
    },
    {
      heading: "COMMISSION", source: "Clause 4",
      paras: [
        "NOTMADE is entitled to commission on every confirmed and delivered order, at the rate set out in your signed seller agreement. The rate that applies to an order is the rate in force when the order is placed, and it is recorded against that order.",
        "NOTMADE may revise the commission rate by giving the Seller at least fourteen (14) days' written notice. Orders placed before the revised rate takes effect keep the rate recorded at the time of order.",
      ],
    },
    {
      heading: "SETTLEMENT", source: "Clause 5",
      paras: [
        "Settlement is made within seven (7) days of confirmed delivery and of the close of the return window, whichever is later, in AED by bank transfer to the IBAN registered with us.",
        "The Settlement Amount is the AED Selling Price less: the commission; VAT on the commission as applicable; and adjustments for returns, cancellations, refunds or chargebacks confirmed during the settlement period.",
        "NOTMADE provides a settlement statement showing the AED Selling Price, the commission rate and amount, and the amount remitted.",
      ],
    },
    {
      heading: "VAT AND TRN", source: "Clause 8",
      paras: ["Where VAT registered, the Seller shall provide a valid TRN and issue VAT-compliant tax invoices as required by UAE law."],
    },
    {
      heading: "SELLER OBLIGATIONS", source: "Clause 8",
      items: [
        "Hold a valid UAE trade licence for the whole term of the agreement and notify NOTMADE promptly of any change, suspension or expiry",
        "Supply genuine, authentic and legally compliant Products that conform to the descriptions, images and specifications provided on the Platform",
        "Comply with UAE consumer protection, labelling and product safety rules",
        "Maintain accurate stock levels on the Platform to avoid overselling or cancellations",
        "Notify NOTMADE immediately of any product recall, quality defect, regulatory issue or legal proceeding affecting the Products",
      ],
    },
    {
      heading: "INTELLECTUAL PROPERTY", source: "Clause 10",
      paras: ["The Seller grants NOTMADE a non-exclusive, royalty-free, worldwide licence to use, reproduce, display and distribute the Seller's product images, descriptions, brand names, logos and other content solely for listing, promoting and selling the Products on the Platform and affiliated partner channels. NOTMADE retains all intellectual property rights in the Platform and the NOTMADE brand."],
    },
    {
      heading: "TERM AND TERMINATION", source: "Clause 11",
      paras: [
        "The Seller may stop selling by giving fourteen (14) days' written notice to admin@notmade.in. Orders placed before that takes effect are fulfilled and settled under the agreement.",
        "NOTMADE may terminate immediately if the Seller: supplies counterfeit, prohibited or non-compliant Products; commits fraud or misrepresentation; repeatedly violates Platform policies; no longer holds a valid trade licence; or becomes insolvent or ceases business operations. On termination, pending settlements are paid within thirty (30) days after adjustment of any amounts owed to NOTMADE.",
      ],
    },
    {
      heading: "LIMITATION OF LIABILITY", source: "Clause 12",
      paras: ["NOTMADE's aggregate liability to the Seller shall not exceed the total commission earned from the Seller's Products in the three (3) months immediately preceding the event giving rise to the claim. NOTMADE shall not be liable for any indirect, consequential, special or punitive damages. The Seller shall indemnify NOTMADE against claims, losses, penalties or expenses arising out of the Seller's Products, the Seller's breach of the agreement or applicable law, or third-party intellectual property infringement by the Seller."],
    },
    {
      heading: "GOVERNING LAW AND DISPUTES", source: "Clause 13",
      paras: [
        "These terms are governed by the laws of the United Arab Emirates. Any dispute shall first be attempted to be resolved by mutual negotiation within thirty (30) days.",
      ],
      review: "Exact courts and venue for disputes to be confirmed.",
    },
    {
      heading: "CHANGES TO THESE TERMS", source: "",
      review: "How and when changes to these terms take effect to be confirmed.",
    },
  ],
};

export const UAE_REFUNDS: LegalDoc = {
  title: "REFUND POLICY",
  metaTitle: "Refund Policy | NOTMADE UAE",
  description: "How customer returns work for UAE sellers on NOTMADE.",
  intro: "How customer returns work for sellers in the UAE.",
  sections: [
    {
      heading: "RETURN WINDOW", source: "Clause 7",
      paras: ["A customer may raise a return or damage claim only within seven (7) days of delivery, and only with an unboxing video recorded at the time the parcel is opened."],
    },
    {
      heading: "REVIEW OF CLAIMS", source: "Clause 7",
      paras: ["NOTMADE reviews the unboxing video and decides the claim. The Seller may view the unboxing video for its own order through the Seller Panel. Claims raised after the seven-day window, or without an unboxing video, may be declined."],
    },
    {
      heading: "WHO BEARS THE COST", source: "Clause 7",
      paras: ["Where an approved claim arises from a product defect, misdescription or Seller error, the cost of the return and refund is borne by the Seller and may be adjusted against the Seller's settlements. Where it arises from transit damage or a Platform error, it is borne by NOTMADE."],
    },
    {
      heading: "CONSUMER RIGHTS", source: "",
      review: "Any statement required under UAE consumer protection rules to be confirmed.",
    },
  ],
};

export const UAE_PRIVACY: LegalDoc = {
  title: "PRIVACY POLICY",
  metaTitle: "Privacy Policy | NOTMADE UAE",
  description: "How NOTMADE handles the information of UAE sellers.",
  intro: "We keep it simple. Here's what we collect and why.",
  sections: [
    {
      heading: "WHAT WE COLLECT", source: "",
      paras: ["When you register to sell on NOTMADE, we collect:"],
      items: [
        "Your legal name, business name and contact person",
        "Your email address, mobile number and business address",
        "Your trade licence number, and your TRN if you are VAT registered",
        "Your identity document details (we store only the last 4 digits of an Emirates ID)",
        "Your IBAN for settlements",
        "The documents you upload during onboarding",
      ],
    },
    {
      heading: "HOW WE USE IT", source: "",
      items: [
        "To review your seller application",
        "To contact you about your application status",
        "To onboard approved sellers onto the platform",
        "To send settlement statements and operational updates",
      ],
    },
    {
      heading: "WHAT WE DON'T DO", source: "",
      items: [
        "We never sell your data to third parties",
        "We don't share your personal information with advertisers",
        "We don't use your data for anything outside running NOTMADE",
      ],
    },
    {
      heading: "DATA STORAGE", source: "",
      paras: ["Your application data is stored securely on our servers. We retain it as long as your account is active or as needed to operate the platform. If you want your data deleted, email us and we'll sort it out."],
    },
    {
      heading: "APPLICABLE DATA PROTECTION LAW", source: "",
      review: "Applicable UAE data protection law, data controller wording and any transfer of data outside the UAE to be confirmed.",
    },
    {
      heading: "CONTACT", source: "",
      paras: ["Questions about privacy? Email us: admin@notmade.in"],
    },
  ],
};
