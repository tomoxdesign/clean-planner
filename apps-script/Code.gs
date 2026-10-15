/**
 * Backend pro Plánovač úklidu – Google Apps Script nad Google Tabulkou.
 *
 * List „data“ drží celý stav aplikace jako JSON (rozdělený po kouscích do sloupce A)
 * a číslo verze v buňce B1. List „Přehled“ je jen čitelná kopie pro lidi.
 *
 * Nasazení: Rozšíření → Apps Script → vložit tento soubor → Nasadit → Nové nasazení
 * → Webová aplikace, Spustit jako: Já, Přístup: Kdokoli.
 */

const DATA_SHEET = 'data';
const VIEW_SHEET = 'Přehled';
const CHUNK = 40000; // buňka unese max. 50 000 znaků

function doGet() {
  return json_(read_());
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const body = JSON.parse(e.postData.contents);
    const cur = read_();
    if (body.baseVersion !== cur.version) {
      return json_({ ok: false, conflict: true, version: cur.version, state: cur.state });
    }
    const version = cur.version + 1;
    write_(body.state, version);
    return json_({ ok: true, version: version });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function sheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function read_() {
  const sh = sheet_(DATA_SHEET);
  const version = Number(sh.getRange('B1').getValue()) || 0;
  const last = sh.getLastRow();
  let text = '';
  if (last >= 2) {
    // každý kousek začíná znakem „~“, aby ho Tabulky nepřevedly na číslo, datum nebo vzorec
    text = sh.getRange(2, 1, last - 1, 1).getValues().map(function (r) { return String(r[0]).slice(1); }).join('');
  }
  return { version: version, state: text ? JSON.parse(text) : null };
}

function write_(state, version) {
  const sh = sheet_(DATA_SHEET);
  const text = JSON.stringify(state);
  const rows = [];
  for (let i = 0; i < text.length; i += CHUNK) rows.push(['~' + text.slice(i, i + CHUNK)]);

  const last = sh.getLastRow();
  if (last >= 2) sh.getRange(2, 1, last - 1, 1).clearContent();
  sh.getRange('A1:B1').setValues([['verze', version]]);
  if (rows.length) {
    const range = sh.getRange(2, 1, rows.length, 1);
    range.setNumberFormat('@');
    range.setValues(rows);
  }
  writeView_(state);
}

function writeView_(state) {
  const sh = sheet_(VIEW_SHEET);
  const rows = [['Místnost', 'Úkol', 'Termín', 'Kdo', 'Opakování (dny)', 'Naposledy hotovo', 'Kdo naposledy']];
  (state.rooms || []).forEach(function (room) {
    (room.tasks || []).forEach(function (t) {
      const last = (t.history || []).reduce(function (a, h) { return !a || h.date > a.date ? h : a; }, null);
      rows.push([room.name, t.name, t.date || '', t.user || '', t.repeat || '', last ? last.date : '', last ? last.user || '' : '']);
    });
  });
  sh.clearContents();
  const range = sh.getRange(1, 1, rows.length, rows[0].length);
  range.setNumberFormat('@');
  range.setValues(rows);
  sh.getRange(1, 1, 1, rows[0].length).setFontWeight('bold');
  sh.setFrozenRows(1);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
