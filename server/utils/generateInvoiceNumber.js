const Settings = require("../models/Settings");

const generateInvoiceNumber = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }

  const number = settings.invoiceCounter;
  const prefix = settings.invoicePrefix || "INV";
  const padded = String(number).padStart(4, "0");
  const invoiceNumber = `${prefix}-${padded}`;

  // Increment counter
  await Settings.findByIdAndUpdate(settings._id, { $inc: { invoiceCounter: 1 } });

  return invoiceNumber;
};

module.exports = generateInvoiceNumber;
