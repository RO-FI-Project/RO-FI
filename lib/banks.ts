export type BankOption = {
  label: string;
  code: string;
  bin: string;
};

export const BANK_OPTIONS: BankOption[] = [
  { label: "Vietcombank", code: "VCB", bin: "970436" },
  { label: "Techcombank", code: "TCB", bin: "970407" },
  { label: "VietinBank", code: "CTG", bin: "970415" },
  { label: "BIDV", code: "BIDV", bin: "970418" },
  { label: "ACB", code: "ACB", bin: "970416" },
  { label: "MB Bank", code: "MBB", bin: "970422" },
  { label: "Sacombank", code: "STB", bin: "970403" },
  { label: "VPBank", code: "VPB", bin: "970432" },
  { label: "TPBank", code: "TPB", bin: "970423" },
  { label: "VIB", code: "VIB", bin: "970441" },
  { label: "SHB", code: "SHB", bin: "970443" },
];

export const OTHER_BANK_OPTION = "Khác";

export const normalizeBankValue = (value: string) => value.trim().toLowerCase().replace(/\s+/g, "");

export const findBankOption = (value?: string | null) => {
  if (!value) return undefined;
  const normalized = normalizeBankValue(value);
  return BANK_OPTIONS.find(
    (option) =>
      normalizeBankValue(option.label) === normalized ||
      normalizeBankValue(option.code) === normalized
  );
};
