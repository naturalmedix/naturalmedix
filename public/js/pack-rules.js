(() => {
  const PACK_SIZE = 12;
  const PACK_PRICE_COP = 130000;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  function groupInfo(product) {
    const current = (window.PRODUCTS || []).find(p => String(p.id) === String(product?.id)) || {};
    const line = String(current.line ?? product?.line ?? '').trim();
    const id = String(product?.id ?? current.id ?? product?.name ?? 'sin-id');
    const key = line ? 'line:' + line.toLocaleLowerCase('es-CO') : 'product:' + id;
    return { key, label: line || String(current.name ?? product?.name ?? id), packSize: PACK_SIZE };
  }

  function getPackGroupSummaries(items) {
    const groups = new Map();
    for (const item of (Array.isArray(items) ? items : [])) {
      const qty = Math.max(0, Math.floor(Number(item?.qty) || 0));
      if (!qty) continue;
      const info = groupInfo(item);
      const group = groups.get(info.key) || { ...info, quantity: 0 };
      group.quantity += qty;
      groups.set(info.key, group);
    }
    return [...groups.values()].map(group => {
      const remainder = group.quantity % group.packSize;
      const packs = Math.floor(group.quantity / group.packSize);
      return { ...group, remainder, packs, valid: group.quantity >= group.packSize && remainder === 0,
        total: packs * PACK_PRICE_COP, missing: remainder ? group.packSize - remainder : Math.max(0, group.packSize - group.quantity) };
    });
  }

  function getPackViolations(items) { return getPackGroupSummaries(items).filter(group => !group.valid); }
  function getPackCartTotal(items) { return getPackGroupSummaries(items).reduce((sum, group) => sum + group.total, 0); }

  function renderPackGroupSummary(items) {
    const groups = getPackGroupSummaries(items);
    if (!groups.length) return '';
    const money = value => '$' + Number(value).toLocaleString('es-CO') + ' COP';
    const rows = groups.map(group => {
      let detail;
      if (group.valid) detail = `${group.packs} ${group.packs === 1 ? 'paquete' : 'paquetes'} completos (${group.quantity} unidades): ${money(group.total)}.`;
      else if (group.quantity < group.packSize) detail = `${group.quantity}/${group.packSize} unidades; faltan ${group.missing} de la misma línea. Al completar: ${money(PACK_PRICE_COP)}.`;
      else detail = `${group.quantity} unidades: agrega ${group.missing} para el siguiente paquete o quita ${group.remainder} para completar ${group.quantity - group.remainder}. Paquetes completos: ${money(group.total)}.`;
      return '<li><strong>' + escapeHtml(group.label) + ':</strong> ' + escapeHtml(detail) + '</li>';
    }).join('');
    return '<div class="cart-pack-summary" style="margin:12px 0;padding:12px;border:1px solid #cbd5e1;border-radius:10px;background:#f8fafc"><strong>Paquetes de 12 unidades · $130.000 cada uno</strong><ul style="margin:6px 0 0;padding-left:20px">' + rows + '</ul></div>';
  }

  window.NATURALMEDIX_PACK_SIZE = PACK_SIZE;
  window.NATURALMEDIX_PACK_PRICE_COP = PACK_PRICE_COP;
  window.getPackGroupSummaries = getPackGroupSummaries;
  window.getPackViolations = getPackViolations;
  window.getPackCartTotal = getPackCartTotal;
  window.renderPackGroupSummary = renderPackGroupSummary;
})();
