const User = require('../models/User');
const Item = require('../models/Item');
const ExcelJS = require('exceljs');

// GET /api/admin/metrics
const getAdminMetrics = async (req, res) => {
  try {
    const totalItems = await Item.countDocuments();
    const validatedItems = await Item.countDocuments({ processingState: 'validado' });
    const totalUsers = await User.countDocuments();
    const activeGestores = await User.countDocuments({ role: 'gestor', active: true });

    // Simulación de CO2 y tasa (en MVP real, calcula con datos reales)
    const co2Saved = totalItems * 10; // 10 kg por ítem
    const recyclingRate = totalItems > 0 ? Math.round((validatedItems / totalItems) * 100) : 0;

    res.json({
      totalItems,
      validatedItems,
      co2Saved,
      recyclingRate,
      totalUsers,
      activeGestores
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener métricas.' });
  }
};

// GET /api/admin/users
const getAdminUsers = async (req, res) => {
  try {
    const pageNum = parseInt(req.query.page, 10) || 1;
    const limitNum = Math.min(parseInt(req.query.limit, 10) || 100, 200);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments();
    const totalPages = Math.ceil(total / limitNum) || 1;

    const users = await User.find()
      .select('name email role phone location bio active createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.set('X-Total-Count', total.toString());
    res.set('X-Total-Pages', totalPages.toString());
    res.set('X-Current-Page', pageNum.toString());

    if (req.query.format === 'paginated') {
      return res.json({ users, total, page: pageNum, totalPages, limit: limitNum });
    }

    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener usuarios.' });
  }
};

// GET /api/admin/items
const getAdminItems = async (req, res) => {
  try {
    const pageNum = parseInt(req.query.page, 10) || 1;
    const limitNum = Math.min(parseInt(req.query.limit, 10) || 100, 200);
    const skip = (pageNum - 1) * limitNum;

    const total = await Item.countDocuments();
    const totalPages = Math.ceil(total / limitNum) || 1;

    const items = await Item.find()
      .select('title category processingState address createdAt')
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.set('X-Total-Count', total.toString());
    res.set('X-Total-Pages', totalPages.toString());
    res.set('X-Current-Page', pageNum.toString());

    if (req.query.format === 'paginated') {
      return res.json({ items, total, page: pageNum, totalPages, limit: limitNum });
    }

    res.json(items);
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener ítems.' });
  }
};

// POST /api/admin/users/:id/promote
const promoteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado.' });
    
    const targetRole = req.body.role || (user.role === 'user' ? 'gestor' : user.role);
    if (!['user', 'gestor', 'admin'].includes(targetRole)) {
      return res.status(400).json({ msg: 'Rol no permitido para asignación administrativa.' });
    }
    user.role = targetRole;
    await user.save();
    res.json({ msg: `Rol del usuario actualizado a ${user.role}.`, user });
  } catch (err) {
    res.status(500).json({ msg: 'Error al cambiar rol del usuario.' });
  }
};

// PUT /api/admin/users/:id
const updateAdminUser = async (req, res) => {
  try {
    const { name, phone, role, location, active } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined && ['user', 'gestor', 'admin'].includes(role)) {
      updateData.role = role;
    }
    if (location !== undefined) updateData.location = location;
    if (active !== undefined) updateData.active = active;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).select('name email role phone location bio active createdAt');

    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Error al actualizar usuario.' });
  }
};

// GET /api/admin/reports/:type
const getAdminReport = async (req, res) => {
  try {
    const { type } = req.params;
    const format = (req.query.format || 'json').toLowerCase();
    const now = new Date();

    let reportData = {
      generatedAt: now.toISOString(),
      reportType: type,
      title: `Reporte de ${type.charAt(0).toUpperCase() + type.slice(1)}`
    };

    if (type === 'monthly') {
      const totalUsers = await User.countDocuments();
      const totalItems = await Item.countDocuments();
      const validatedItems = await Item.countDocuments({ processingState: 'validado' });
      const inProcessItems = await Item.countDocuments({ processingState: { $in: ['en_proceso', 'fardado'] } });
      const unprocessedItems = await Item.countDocuments({ processingState: 'sin_procesar' });
      const itemsByCategory = await Item.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      reportData = {
        ...reportData,
        title: 'Reporte Mensual de Actividad - Circulapp',
        period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
        metrics: {
          totalUsers,
          totalItems,
          validatedItems,
          inProcessItems,
          unprocessedItems,
          activityRate: totalItems > 0 ? ((validatedItems / totalItems) * 100).toFixed(1) + '%' : '0%'
        },
        itemsByCategory
      };

      if (format === 'xlsx' || format === 'excel') {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'CirculApp';
        workbook.created = now;

        const sheet = workbook.addWorksheet('Resumen Mensual');
        sheet.columns = [
          { width: 35 },
          { width: 25 },
          { width: 25 },
          { width: 25 }
        ];

        // Encabezado
        sheet.mergeCells('A1:D2');
        const hCell = sheet.getCell('A1');
        hCell.value = 'CIRCULAPP\nReporte Mensual de Actividad';
        hCell.font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
        hCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        hCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F6E56' } };

        sheet.getCell('A4').value = 'Fecha de generación:';
        sheet.getCell('B4').value = now.toLocaleDateString('es-AR') + ' ' + now.toLocaleTimeString('es-AR');
        sheet.getCell('A5').value = 'Período:';
        sheet.getCell('B5').value = reportData.period;

        // Métricas
        sheet.mergeCells('A7:B7');
        const kpiH = sheet.getCell('A7');
        kpiH.value = 'INDICADORES PRINCIPALES';
        kpiH.font = { bold: true, color: { argb: 'FFFFFF' } };
        kpiH.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '16A085' } };

        const kpis = [
          ['Total de Usuarios Registrados', totalUsers],
          ['Total de Materiales Publicados', totalItems],
          ['Materiales Validados / Certificados', validatedItems],
          ['Materiales en Proceso / Fardados', inProcessItems],
          ['Materiales Sin Procesar', unprocessedItems],
          ['Tasa de Reciclaje Efectiva', reportData.metrics.activityRate]
        ];

        kpis.forEach((row, i) => {
          const r = sheet.getRow(8 + i);
          r.getCell(1).value = row[0];
          r.getCell(2).value = row[1];
          r.eachCell(c => {
            c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          });
        });

        // Categorías
        const catStart = 16;
        sheet.mergeCells(`A${catStart}:B${catStart}`);
        const catH = sheet.getCell(`A${catStart}`);
        catH.value = 'DISTRIBUCIÓN POR CATEGORÍA';
        catH.font = { bold: true, color: { argb: 'FFFFFF' } };
        catH.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '16A085' } };

        sheet.getCell(`A${catStart + 1}`).value = 'Categoría';
        sheet.getCell(`B${catStart + 1}`).value = 'Cantidad';
        sheet.getCell(`A${catStart + 1}`).font = { bold: true };
        sheet.getCell(`B${catStart + 1}`).font = { bold: true };

        itemsByCategory.forEach((cat, idx) => {
          const r = sheet.getRow(catStart + 2 + idx);
          r.getCell(1).value = cat._id || 'Sin categoría';
          r.getCell(2).value = cat.count;
          r.eachCell(c => {
            c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          });
        });

        const filename = `reporte_mensual_${now.toISOString().slice(0, 10)}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        await workbook.xlsx.write(res);
        return res.end();
      }

    } else if (type === 'environmental') {
      const totalItems = await Item.countDocuments();
      const validatedItems = await Item.countDocuments({ processingState: 'validado' });
      const co2SavedKg = totalItems * 10; // 10 kg CO2 por ítem
      const treesEquivalent = (co2SavedKg / 22).toFixed(1);
      const waterSavedLiters = totalItems * 150; // Aprox 150L de agua ahorrados por ciclo circular

      const categoryImpact = await Item.aggregate([
        { $group: { _id: '$category', total: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ]);

      reportData = {
        ...reportData,
        title: 'Reporte de Impacto Ambiental - Circulapp',
        metrics: {
          co2SavedKg,
          treesEquivalent,
          waterSavedLiters,
          totalMaterialsRecycled: totalItems,
          validatedMaterials: validatedItems,
          cleanEnergyScore: 'A+'
        },
        categoryImpact
      };

      if (format === 'xlsx' || format === 'excel') {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'CirculApp';
        workbook.created = now;

        const sheet = workbook.addWorksheet('Impacto Ambiental');
        sheet.columns = [
          { width: 35 },
          { width: 25 },
          { width: 25 }
        ];

        sheet.mergeCells('A1:C2');
        const hCell = sheet.getCell('A1');
        hCell.value = 'CIRCULAPP\nReporte de Impacto Ambiental y Sustentabilidad';
        hCell.font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
        hCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        hCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F6E56' } };

        sheet.getCell('A4').value = 'Fecha:';
        sheet.getCell('B4').value = now.toLocaleDateString('es-AR') + ' ' + now.toLocaleTimeString('es-AR');

        sheet.mergeCells('A6:B6');
        sheet.getCell('A6').value = 'INDICADORES ECOLÓGICOS';
        sheet.getCell('A6').font = { bold: true, color: { argb: 'FFFFFF' } };
        sheet.getCell('A6').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '16A085' } };

        const eco = [
          ['CO₂ Evitado Estimado', `${co2SavedKg} kg`],
          ['Equivalente en Árboles Plantados', `${treesEquivalent} árboles`],
          ['Ahorro Hídrico Estimado', `${waterSavedLiters} Litros`],
          ['Materiales Reincorporados al Circuito', totalItems],
          ['Fardos Certificados Comunalmente', validatedItems],
          ['Calificación de Eficiencia Comunal', 'A+ (Excelente)']
        ];

        eco.forEach((row, i) => {
          const r = sheet.getRow(7 + i);
          r.getCell(1).value = row[0];
          r.getCell(2).value = row[1];
          r.eachCell(c => {
            c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          });
        });

        const filename = `reporte_ambiental_${now.toISOString().slice(0, 10)}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        await workbook.xlsx.write(res);
        return res.end();
      }

    } else if (type === 'validations') {
      const validatedItems = await Item.find({ processingState: 'validado' })
        .populate('ownerId', 'name email phone location')
        .populate('validatedBy', 'name email')
        .select('title category address validationDate validationChecklist validationObservations ownerId validatedBy createdAt')
        .sort({ updatedAt: -1 });

      reportData = {
        ...reportData,
        title: 'Reporte de Validaciones y Certificaciones Comunales',
        totalValidated: validatedItems.length,
        items: validatedItems
      };

      if (format === 'xlsx' || format === 'excel') {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'CirculApp';
        workbook.created = now;

        const sheet = workbook.addWorksheet('Validaciones');
        sheet.columns = [
          { header: 'ID Material', key: 'id', width: 15 },
          { header: 'Título', key: 'title', width: 30 },
          { header: 'Categoría', key: 'category', width: 18 },
          { header: 'Dirección / Acopio', key: 'address', width: 35 },
          { header: 'Ofertante', key: 'owner', width: 25 },
          { header: 'Validado Por', key: 'validator', width: 25 },
          { header: 'Fecha Validación', key: 'date', width: 20 },
          { header: 'Observaciones', key: 'notes', width: 40 }
        ];

        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F6E56' } };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

        validatedItems.forEach(item => {
          sheet.addRow({
            id: item._id.toString().slice(-6).toUpperCase(),
            title: item.title,
            category: item.category,
            address: item.address || 'Punto comunal',
            owner: item.ownerId?.name ? `${item.ownerId.name} (${item.ownerId.email || ''})` : '—',
            validator: item.validatedBy?.name || 'Gestor Comunal',
            date: item.validationDate ? new Date(item.validationDate).toLocaleDateString('es-AR') : new Date(item.updatedAt || item.createdAt).toLocaleDateString('es-AR'),
            notes: item.validationObservations || 'Validado conforme normas comunales'
          });
        });

        sheet.eachRow(row => {
          row.eachCell(cell => {
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          });
        });

        const filename = `reporte_validaciones_${now.toISOString().slice(0, 10)}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        await workbook.xlsx.write(res);
        return res.end();
      }

    } else {
      return res.status(400).json({ msg: 'Tipo de reporte no reconocido. Opciones: monthly, environmental, validations.' });
    }

    res.json(reportData);
  } catch (err) {
    console.error('Error al generar reporte administrativo:', err);
    res.status(500).json({ msg: 'Error al generar el reporte administrativo.' });
  }
};

module.exports = {
  getAdminMetrics,
  getAdminUsers,
  getAdminItems,
  promoteUser,
  updateAdminUser,
  getAdminReport
};