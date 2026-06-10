const scopeToTenant = (req, filter = {}) => {
  if (req.role === "superadmin") return filter;
  return { ...filter, tenantId: req.tenantId };
};

module.exports = { scopeToTenant };
