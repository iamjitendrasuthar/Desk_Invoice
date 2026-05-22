const Settings = require("../models/Settings");

const generateInvoiceNumber = async () => {
  const settings = await Settings.findOneAndUpdate(
    {},
    {
      $inc: { invoiceCounter: 1 },
      $setOnInsert: { invoicePrefix: "INV" },
    },
    {
      new: false,
      upsert: true,
    },
  );

  const number = settings?.invoiceCounter ?? 1;
  const prefix = settings?.invoicePrefix || "INV";

  return `${prefix}-${String(number).padStart(4, "0")}`;
};

module.exports = generateInvoiceNumber;
