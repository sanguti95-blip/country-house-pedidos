const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const SUPABASE_URL = 'https://brjralkrguufpkzwnlhl.supabase.co';
const SUPABASE_ADMIN_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || 'sb_publishable_p61DQUM4Bg7ktnxLOo76DA_m5dzz5M1';

async function ejecutarSincronizacion(rutaArchivoManual) {
    console.log('🚀 Iniciando sincronización de Precios y Saldos...');

    let archivoExcel = rutaArchivoManual;
    if (!archivoExcel) {
        const descargasDir = 'C:\\Users\\pc\\Downloads';
        if (!fs.existsSync(descargasDir)) {
            throw new Error(`Directorio de descargas no encontrado: ${descargasDir}`);
        }

        const archivos = fs.readdirSync(descargasDir)
            .filter(f => f.toLowerCase().endsWith('.xlsx') && !f.startsWith('~$'))
            .map(f => {
                const fullPath = path.join(descargasDir, f);
                const stat = fs.statSync(fullPath);
                return { name: f, path: fullPath, time: stat.mtimeMs };
            })
            .sort((a, b) => b.time - a.time);

        if (archivos.length === 0) {
            throw new Error('No se encontraron archivos Excel (.xlsx) en Descargas.');
        }

        const libro1 = archivos.find(a => a.name.toLowerCase().startsWith('libro1'));
        archivoExcel = libro1 ? libro1.path : archivos[0].path;
    }

    console.log(`📂 Archivo Excel seleccionado: ${archivoExcel}`);

    const wb = XLSX.readFile(archivoExcel);
    const primerHoja = wb.SheetNames[0];
    const rawRows = XLSX.utils.sheet_to_json(wb.Sheets[primerHoja], { defval: '' });
    console.log(`📊 Filas leídas del archivo: ${rawRows.length}`);

    const excelMap = new Map();
    for (const row of rawRows) {
        const art = String(row.ARTICULO || row.Articulo || row.articulo || row.CODIGO || row.Codigo || '').trim();
        const desc = String(row.DESCRIPCION || row.Descripcion || row.descripcion || row.NOMBRE || '').trim();
        const saldoRaw = row.SALDO !== undefined ? row.SALDO : (row.Saldo !== undefined ? row.Saldo : row.saldo);
        const precioRaw = row.PRECIO !== undefined ? row.PRECIO : (row.Precio !== undefined ? row.Precio : row.precio);

        if (art) {
            excelMap.set(art, {
                art,
                desc,
                saldo: (saldoRaw !== '' && saldoRaw !== null && !isNaN(Number(saldoRaw))) ? Number(saldoRaw) : null,
                precio: (precioRaw !== '' && precioRaw !== null && !isNaN(Number(precioRaw))) ? Number(precioRaw) : null
            });
        }
    }

    const respProds = await fetch(`${SUPABASE_URL}/rest/v1/productos?select=*`, {
        headers: {
            'apikey': SUPABASE_ADMIN_KEY,
            'Authorization': `Bearer ${SUPABASE_ADMIN_KEY}`
        }
    });
    if (!respProds.ok) throw new Error(`Error consultando productos: ${respProds.statusText}`);
    const productosDb = await respProds.json();
    console.log(`📦 Productos registrados en Supabase: ${productosDb.length}`);

    let actualizados = 0;
    let conSaldo = 0;
    let sinSaldo = 0;
    let huevosForzados = 0;

    const updates = [];

    for (const prod of productosDb) {
        const itemExcel = excelMap.get(prod.id) || excelMap.get(prod.codigo_bodega);

        const esHuevo = (prod.nombre && prod.nombre.toUpperCase().includes('HUEVO')) ||
                        (prod.id && (prod.id.startsWith('H') || prod.id.startsWith('C2180'))) ||
                        (itemExcel && itemExcel.desc.toUpperCase().includes('HUEVO'));

        let nuevoPrecio = Math.round(Number(prod.precio || 0));
        let nuevoStock = 0;
        let nuevoActivo = false;

        if (esHuevo) {
            huevosForzados++;
            nuevoActivo = true;
            if (itemExcel && itemExcel.saldo !== null && itemExcel.saldo > 0) {
                nuevoStock = Math.max(1, Math.round(Number(itemExcel.saldo)));
            } else {
                nuevoStock = 999;
            }
            if (itemExcel && itemExcel.precio !== null && Number(itemExcel.precio) > 0) {
                nuevoPrecio = Math.round(Number(itemExcel.precio));
            }
            conSaldo++;
        } else if (itemExcel) {
            if (itemExcel.precio !== null && Number(itemExcel.precio) > 0) {
                nuevoPrecio = Math.round(Number(itemExcel.precio));
            }
            if (itemExcel.saldo !== null && Number(itemExcel.saldo) > 0) {
                nuevoStock = Math.max(1, Math.round(Number(itemExcel.saldo)));
                nuevoActivo = true;
                conSaldo++;
            } else {
                nuevoStock = 0;
                nuevoActivo = false;
                sinSaldo++;
            }
        } else {
            nuevoStock = 0;
            nuevoActivo = false;
            sinSaldo++;
        }

        updates.push({
            id: prod.id,
            patch: {
                precio: nuevoPrecio,
                stock_disponible: nuevoStock,
                activo: nuevoActivo
            }
        });
    }

    // Ejecutar en lotes de 25 en paralelo para máxima velocidad
    const chunkSize = 25;
    for (let i = 0; i < updates.length; i += chunkSize) {
        const chunk = updates.slice(i, i + chunkSize);
        await Promise.all(chunk.map(async u => {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/productos?id=eq.${encodeURIComponent(u.id)}`, {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_ADMIN_KEY,
                    'Authorization': `Bearer ${SUPABASE_ADMIN_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(u.patch)
            });
            if (res.ok) actualizados++;
        }));
    }

    console.log(`\n🎉 Sincronización completada exitosamente:`);
    console.log(`   ✅ Total productos actualizados en Supabase: ${actualizados}`);
    console.log(`   🟢 Productos con saldo activo: ${conSaldo}`);
    console.log(`   ⚪ Productos sin saldo (ocultos al cliente): ${sinSaldo}`);
    console.log(`   🥚 Huevos protegidos (siempre disponibles): ${huevosForzados}`);

    return { actualizados, conSaldo, sinSaldo, huevosForzados };
}

if (require.main === module) {
    ejecutarSincronizacion(process.argv[2]).catch(err => {
        console.error('❌ Error en sincronización:', err);
        process.exit(1);
    });
}

module.exports = { ejecutarSincronizacion };
