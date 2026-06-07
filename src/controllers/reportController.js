const reportService = require('../services/reportService');

const exportItemsReport = async (req, res) => {
  try {
    await reportService.exportItems(req, res);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      msg: 'Error al generar el reporte'
    });
  }
};

module.exports = {
  exportItemsReport
};