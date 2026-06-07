const Item = require('../models/Item');
const ExcelJS = require('exceljs');

const exportItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate('ownerId', 'name email');

    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'Circulapp';
    workbook.created = new Date();

    // HOJA RESUMEN

    const resumen = workbook.addWorksheet('Resumen');

    resumen.columns = [
      { width: 35 },
      { width: 20 },
      { width: 20 },
      { width: 20 }
    ];

    // Título principal
    resumen.mergeCells('A1:D2');

    const titulo = resumen.getCell('A1');

    titulo.value = 'CIRCULAPP\nReporte General de Materiales';

    titulo.font = {
      bold: true,
      size: 12,
      color: { argb: 'FFFFFF' }
    };

    titulo.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };

    titulo.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '2E7D32' }
    };

    // Fecha y hora
    resumen.getCell('A4').value = 'Fecha de generación';
    resumen.getCell('B4').value =
      new Date().toLocaleDateString('es-AR');

    resumen.getCell('A5').value = 'Hora de generación';
    resumen.getCell('B5').value =
      new Date().toLocaleTimeString('es-AR');

    // Estadísticas
    const total = items.length;

    const sinProcesar = items.filter(
      item => item.processingState === 'sin_procesar'
    ).length;

    const enProceso = items.filter(
      item => item.processingState === 'en_proceso'
    ).length;

    const fardado = items.filter(
      item => item.processingState === 'fardado'
    ).length;

    // Encabezado resumen
    resumen.mergeCells('A7:B7');

    const resumenHeader = resumen.getCell('A7');

    resumenHeader.value = 'RESUMEN GENERAL';

    resumenHeader.font = {
      bold: true,
      color: { argb: 'FFFFFF' }
    };

    resumenHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1565C0' }
    };

    const indicadores = [
      ['Total materiales', total],
      ['Sin procesar', sinProcesar],
      ['En proceso', enProceso],
      ['Fardados', fardado]
    ];

    indicadores.forEach((dato, index) => {
      const row = resumen.getRow(9 + index);

      row.getCell(1).value = dato[0];
      row.getCell(2).value = dato[1];

      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Categorías
    resumen.mergeCells('A15:B15');

    const categoriasHeader = resumen.getCell('A15');

    categoriasHeader.value = 'MATERIALES POR CATEGORÍA';

    categoriasHeader.font = {
      bold: true,
      color: { argb: 'FFFFFF' }
    };

    categoriasHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1565C0' }
    };

    resumen.getCell('A17').value = 'Categoría';
    resumen.getCell('B17').value = 'Cantidad';

    ['A17', 'B17'].forEach(celda => {
      resumen.getCell(celda).font = {
        bold: true,
        color: { argb: 'FFFFFF' }
      };

      resumen.getCell(celda).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '455A64' }
      };
    });

    const categorias = {};

    items.forEach(item => {
      categorias[item.category] =
        (categorias[item.category] || 0) + 1;
    });

    let fila = 18;

    Object.entries(categorias).forEach(
      ([categoria, cantidad]) => {

        resumen.getCell(`A${fila}`).value = categoria;
        resumen.getCell(`B${fila}`).value = cantidad;

        resumen.getRow(fila).eachCell(cell => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });

        fila++;
      }
    );

    // HOJA DETALLE

    const detalle = workbook.addWorksheet('Materiales');

    detalle.columns = [
      { header: 'Título', key: 'title', width: 30 },
      { header: 'Categoría', key: 'category', width: 20 },
      { header: 'Estado', key: 'processingState', width: 20 },
      { header: 'Dirección', key: 'location', width: 40 },
      { header: 'Propietario', key: 'owner', width: 25 },
      { header: 'Email', key: 'email', width: 30 }
    ];

    const headerRow = detalle.getRow(1);

    headerRow.font = {
      bold: true,
      color: { argb: 'FFFFFF' }
    };

    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '2E7D32' }
    };

    headerRow.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    items.forEach(item => {
      detalle.addRow({
        title: item.title,
        category: item.category,
        processingState: item.processingState,
        location: `${item.location?.lat || ''}, ${item.location?.lng || ''}`,
        owner: item.ownerId?.name || '',
        email: item.ownerId?.email || ''
      });
    });

    detalle.eachRow(row => {
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    detalle.autoFilter = {
      from: 'A1',
      to: 'F1'
    };

    detalle.views = [
      {
        state: 'frozen',
        ySplit: 1
      }
    ];

    // DESCARGA

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Reporte_Circulapp.xlsx'
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch (error) {
    console.error('Error exportando Excel:', error);

    res.status(500).json({
      msg: 'Error al exportar los materiales'
    });
  }
};

module.exports = { exportItems };