const Settings = require("../models/Settings");

const generateInvoiceNumber = async () => {
  let settings = await Settings.findOne({});

  if (!settings) {
    settings = await Settings.create({
      invoiceCounter: 0,
      invoicePrefix: "INV",
    });
  }

  const newCount = (settings.invoiceCounter || 0) + 1;

  const prefix = "INV";

  await Settings.updateOne(
    { _id: settings._id },
    { $set: { invoiceCounter: newCount, invoicePrefix: prefix } },
  );

  return `${prefix}-${String(newCount).padStart(4, "0")}`;
};

module.exports = generateInvoiceNumber;
